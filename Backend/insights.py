from flask import Flask, jsonify
from flask_cors import CORS
import json
import requests

app = Flask(__name__)
CORS(app)

def extract_json_block(text):
    try:
        brace_stack = []
        start_idx = None
        for i, char in enumerate(text):
            if char == '{':
                if not brace_stack:
                    start_idx = i
                brace_stack.append('{')
            elif char == '}':
                if brace_stack:
                    brace_stack.pop()
                    if not brace_stack and start_idx is not None:
                        candidate = text[start_idx:i + 1]
                        return json.loads(candidate)
        if start_idx is not None:
            candidate = text[start_idx:].strip()
            if not candidate.endswith('}'):
                candidate += '}'
            return json.loads(candidate)
        raise ValueError("No valid JSON block found")
    except Exception as e:
        print(f"Robust JSON extraction failed: {e}")
        return None

def get_insights():
    # Define the prompt for Ollama
    prompt = """
You are a strong cybersecurity educator tasked with providing six concise, one-liner insights about password security. 
Focus on protecting passwords, increasing their strength, and being responsible with them. 
Each insight must have a header and a short, firm quote. 
Ensure all six insights are completely unique, addressing distinct aspects of password security without repeating or rephrasing the same advice (e.g., do not suggest 'use complex passwords' and 'combine letters and numbers' as they overlap). 
Return exactly sixs insights in pure JSON format as follows:
{
  "insights": [
    {"header": "string", "quote": "string"},
    ...
  ]
}
Do not include explanations, comments, or markdown. Return pure JSON.
Generate sixs unique insights about password security as specified.
"""

    # Ollama API endpoint (assumes local instance)
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3",  # Replace with your preferred model
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.7,
            "num_predict": 300
        }
    }

    try:

        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        response_data = response.json()
        raw_output = response_data.get("response", "")

        parsed = extract_json_block(raw_output)
        if not parsed or "insights" not in parsed or len(parsed["insights"]) != 6:
            raise ValueError("Invalid or incorrect number of insights in Ollama response")

        return parsed

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return {
            "insights": [
                {"header": "Error", "quote": "Failed to generate insights"}
            ]
        }
    except Exception as e:
        print(f"Error processing Ollama output: {e}")
        return {
            "insights": [
                {"header": "Error", "quote": "Failed to generate insights"}
            ]
        }

@app.route('/generate_insights', methods=['GET'])
def generate_insights():
    try:
        insights_data = get_insights()
        return jsonify(insights_data)

    except Exception as e:
        return jsonify({"error": f"Error generating insights: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003,debug=True)