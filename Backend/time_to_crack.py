from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import math

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

def estimate_crack_times_fallback(password):
    """
    Fallback method to estimate crack times if the model fails.
    Returns times in hours based on password complexity.
    """
    length = len(password)
    charset_size = 0
    if any(c.islower() for c in password):
        charset_size += 26
    if any(c.isupper() for c in password):
        charset_size += 26
    if any(c.isdigit() for c in password):
        charset_size += 10
    if any(not c.isalnum() for c in password):
        charset_size += 32

    if charset_size == 0:
        charset_size = 26  # Default to lowercase if no characters detected

    # Total possible combinations
    combinations = charset_size ** length

    # Attack speeds (guesses per second)
    rainbow_table_speed = 1_000_000_000  # 1 billion guesses/sec
    brute_force_speed = 100_000_000_000  # 100 billion guesses/sec
    dictionary_speed = 10_000_000  # 10 million guesses/sec

    # Dictionary attack: Assume password is in a 10M-word dictionary with variations
    dictionary_combinations = 10_000_000 * 100  # 10M words with 100 variations each
    dictionary_hours = (dictionary_combinations / dictionary_speed) / 3600

    # Adjust dictionary attack if password looks complex (not just a dictionary word)
    if length > 8 and charset_size > 36:
        dictionary_hours *= 10  # Increase time for complex passwords

    # Brute force and rainbow table calculations
    brute_force_hours = (combinations / brute_force_speed) / 3600
    rainbow_table_hours = min((combinations / rainbow_table_speed) / 3600, brute_force_hours * 0.8)

    return {
        "password": password,
        "crack_times": {
            "rainbow_table": {"hours": max(0.01, round(rainbow_table_hours, 2))},
            "offline_brute_force": {"hours": max(0.01, round(brute_force_hours, 2))},
            "dictionary_attack": {"hours": max(0.01, round(dictionary_hours, 2))}
        }
    }

def get_crack_times(password):
    # Updated prompt for black hat hacker with precise hour-based calculations
    prompt = f"""
I am a skilled black hat hacker tasked with analyzing the password: '{password}'. Using my expertise, I will calculate the precise time to crack this password based on its complexity (length, character set, patternsa and other crucial factors which a hacker considers) and advanced attack methods. I will use the following benchmarks: rainbow table attack (assuming precomputed tables optimized for common and custom patterns), offline brute force attack (100 billion hashes/second with a top-tier GPU cluster), and dictionary attack (10 million-word dictionary with extensive variations). I will provide exact crack times in hours only, with rigorous checks and realistic calculations based on password strength and password.As you are a strong black hat hacker it should be easy for you to hack weak and moderate passwords while may take a bit time in stronger ones and older password can never be high in crack time compared to newer one as it is weaker many times and be fast and as quick as possible while cracking the password. Return the results in pure JSON format as follows:
{{
  "password": "{password}",
  "crack_times": {{
    "rainbow_table": {{"hours": number}},
    "offline_brute_force": {{"hours": number}},
    "dictionary_attack": {{"hours": number}}
  }}
}}
Do not include days, minutes, explanations, comments, or markdown. Return pure JSON with precise numerical values based on advanced hacker techniques and be smart and responsible while hacking and do it with accuracy.
"""

    # Ollama API endpoint (assumes local instance)
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3",  # Replace with your preferred model
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1,  # Lowered for more consistent output
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
            if not isinstance(times["hours"], (int, float)) or times["hours"] < 0:
                raise ValueError(f"Invalid hours value in {method} crack times")

        return parsed

    except (requests.exceptions.RequestException, ValueError, KeyError) as e:
        print(f"Error with Ollama response, using fallback: {e}")
        return estimate_crack_times_fallback(password)

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
    app.run(host='0.0.0.0', port=5004,debug=True)