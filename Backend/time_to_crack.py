from flask import Flask, request, jsonify
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

def get_crack_times(password):
    # Stricter prompt from a responsible red hat hacker perspective
    prompt = f"""
I am a responsible red hat hacker tasked with analyzing the password: '{password}'. Using my expertise, I will calculate the realistic time to crack this password based on its complexity (length, character set, patterns) and standard attack methods. I will use the following benchmarks: rainbow table attack (assuming precomputed tables for common patterns), offline brute force attack (10 billion hashes/second with a high-end GPU cluster), pure brute force attack (1 million attempts/second with a standard PC), and dictionary attack (1 million-word dictionary with common variations). I will provide honest, clean estimates in days and minutes only, avoiding exaggerated or gibberish values. Return the results in pure JSON format as follows:
{{
  "password": "{password}",
  "crack_times": {{
    "rainbow_table": {{"days": number, "minutes": number}},
    "offline_brute_force": {{"days": number, "minutes": number}},
    "dictionary_attack": {{"days": number, "minutes": number}}
  }}
}}
Do not include seconds, explanations, comments, or markdown. Return pure JSON with precise numerical values based on realistic hacker calculations.
"""

    # Ollama API endpoint (assumes local instance)
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3",  # Replace with your preferred model
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.3,  # Lowered for more consistent output
            "num_predict": 500
        }
    }

    try:
        # Send request to Ollama
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        response_data = response.json()
        raw_output = response_data.get("response", "")

        parsed = extract_json_block(raw_output)
        if not parsed or "crack_times" not in parsed:
            raise ValueError("Invalid or missing crack times in Ollama response")

        # Validate numerical values and structure
        for method in ["rainbow_table", "offline_brute_force", "dictionary_attack"]:
            times = parsed["crack_times"][method]
            if not all(isinstance(times[key], (int, float)) for key in ["days", "minutes"]):
                raise ValueError(f"Non-numerical values found in {method} crack times")

        return parsed

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return {
            "password": password,
            "crack_times": {
                "rainbow_table": {"days": 0, "minutes": 0},
                "offline_brute_force": {"days": 0, "minutes": 0},
                "dictionary_attack": {"days": 0, "minutes": 0}
            }
        }
    except Exception as e:
        print(f"Error processing Ollama output: {e}")
        return {
            "password": password,
            "crack_times": {
                "rainbow_table": {"days": 0, "minutes": 0},
                "offline_brute_force": {"days": 0, "minutes": 0},
                "dictionary_attack": {"days": 0, "minutes": 0}
            }
        }

@app.route('/crack_time', methods=['POST'])
def calculate_crack_time():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.json
        password = data.get("password", "")

        if not password or not isinstance(password, str):
            return jsonify({"error": "Please provide a valid password string"}), 400

        crack_times = get_crack_times(password)
        return jsonify(crack_times)

    except Exception as e:
        return jsonify({"error": f"Error calculating crack time: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004)

