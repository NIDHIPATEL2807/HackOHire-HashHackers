from flask import Flask, request, send_from_directory, jsonify
import pandas as pd
import os
import uuid
import joblib
from utils import (
    LenTransform,
    AlphaUCTransform,
    AlphaLCTransform,
    NumberTransform,
    SymbolTransform,
    MidCharTransform,
    RepCharTransform,
    UniqueCharTransform,
    ConsecAlphaUCTransform,
    ConsecAlphaLCTransform,
    ConsecNumberTransform,
    ConsecSymbolTransform,
    SeqAlphaTransform,
    SeqNumberTransform,
    SeqKeyboardTransform,
    predict_strength
)
from flask_cors import CORS
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
import re
from charset_normalizer import from_path
import time
import json
import random
import string
import requests

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for CORS
UPLOAD_FOLDER = 'Uploads'
RESULT_FOLDER = 'results'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'Model', 'sample_model.joblib')

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Load the strength prediction model
try:
    model_pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    raise

def detect_file_encoding(file_path):
    try:
        results = from_path(file_path)
        best_guess = results.best()
        if best_guess is None:
            return 'latin1'
        encoding = best_guess.encoding
        if not encoding or best_guess.raw is None:
            return 'latin1'
        if encoding.lower() in ['ascii', 'utf-8', 'utf-16', 'utf-32']:
            return encoding
        if encoding.lower().startswith('windows'):
            return 'latin1'
        return encoding
    except Exception:
        return 'latin1'

# Function to generate a fallback strong password by enhancing the input password
def generate_fallback_password(input_password, target_length=14):
    password = list(input_password)
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = any(c in string.punctuation for c in password)
    if not has_upper:
        password.append(random.choice(string.ascii_uppercase))
    if not has_lower:
        password.append(random.choice(string.ascii_lowercase))
    if not has_digit:
        password.append(random.choice(string.digits))
    if not has_symbol:
        password.append(random.choice(string.punctuation))
    remaining_length = target_length - len(password)
    if remaining_length > 0:
        characters = string.ascii_uppercase + string.ascii_lowercase + string.digits + string.punctuation
        password.extend([random.choice(characters) for _ in range(remaining_length)])
    if len(password) > 16:
        password = password[:16]
    original_prefix = list(input_password)[:min(len(input_password), 8)]
    rest = password[len(original_prefix):]
    random.shuffle(rest)
    final_password = original_prefix + rest
    return ''.join(final_password)

# Function to extract JSON block from Ollama response
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
        return None

# Fallback function to parse non-JSON response
def parse_non_json_response(text, password):
    issues = []
    suggested_password = None
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('- '):
            issue = line[2:].strip()
            if issue:
                issues.append(issue)
        elif line.startswith('Suggested Password: '):
            suggested_password = line[len('Suggested Password: '):].strip()
    issues = issues[:2]
    if not issues:
        issues = ["Unable to identify specific issues"]
    if not suggested_password:
        suggested_password = generate_fallback_password(password)
    return issues, suggested_password

# Function to check if Ollama is running
def check_ollama_availability():
    try:
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        return response.status_code == 200
    except requests.ConnectionError:
        return False

# Function to generate issues and a stronger password suggestion using Ollama
def generate_issues_with_ollama(password, strength, max_retries=3):
    if strength > 0.9:
        return ["No issues detected"], password

    # Check if Ollama is running
    if not check_ollama_availability():
        print("Ollama server not running")
        return ["Error: Ollama server not running"], generate_fallback_password(password)

    # Define the prompt as a plain string
    prompt = (
        f"Analyze the password '{password}' with a strength score of {int(strength * 100)}% (out of 100%). "
        f"Identify the two most critical weaknesses that make this password weak and suggest a stronger version of this password by modifying it to resolve these weaknesses. "
        f"Rules:\n"
        f"- Return exactly 2 issues, each starting with '- '.\n"
        f"- Each issue should be a short, clear sentence describing a significant weakness (e.g., 'Password is too short', 'Lacks special characters').\n"
        f"- If fewer than 2 weaknesses are found, return only the identified issues or an empty list if none.\n"
        f"- If strength ≤ 90%, assume the password has weaknesses and identify the two most critical ones.\n"
        f"- Suggest a stronger password by modifying the input password '{password}' to address the two identified issues, starting with 'Suggested Password: '.\n"
        f"- The suggested password must retain recognizable elements of the original password (e.g., keep the first few characters or a core part of the password) but make necessary changes to fix the issues.\n"
        f"- The suggested password must be 12-16 characters long, include uppercase letters, lowercase letters, numbers, and symbols, and avoid common patterns or sequences.\n"
        f"- Ensure the suggested password resolves the specific issues listed (e.g., if an issue is 'Lacks special characters', add special characters to the original password).\n"
        f"Output format:\n- Issue 1\n- Issue 2\nSuggested Password: [new_password]\n"
    )

    retries = 0
    while retries < max_retries:
        try:
            # Make direct HTTP POST request to Ollama's /api/chat endpoint
            response = requests.post(
                'http://localhost:11434/api/chat',
                json={
                    "model": "llama3",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 150  # Equivalent to max_tokens
                    }
                },
                timeout=30
            )
            response.raise_for_status()
            raw_output = response.json()['message']['content']

            # Try parsing as JSON
            parsed = extract_json_block(raw_output)
            if parsed:
                suggestions = parsed.get("issues", [])
                suggested_password = parsed.get("suggested_password", None)
                suggestions = [f"- {s}" if not s.startswith("- ") else s for s in suggestions if isinstance(s, str)]
                if strength <= 0.9 and "No issues detected" in suggestions:
                    suggestions.remove("No issues detected")
                suggestions = suggestions[:2]
            else:
                # Fallback to non-JSON parsing
                suggestions, suggested_password = parse_non_json_response(raw_output, password)

            # Validate suggested password
            if not suggested_password or len(suggested_password) < 12 or len(suggested_password) > 16:
                suggested_password = generate_fallback_password(password)
            else:
                has_upper = any(c.isupper() for c in suggested_password)
                has_lower = any(c.islower() for c in suggested_password)
                has_digit = any(c.isdigit() for c in suggested_password)
                has_symbol = any(c in string.punctuation for c in suggested_password)
                if not (has_upper and has_lower and has_digit and has_symbol):
                    suggested_password = generate_fallback_password(password)

            return suggestions, suggested_password

        except Exception as e:
            print(f"Error for password '{password}': {e}")
            retries += 1
            time.sleep(2 * (retries + 1))
            continue

    print(f"Max retries exceeded for password '{password}'")
    return [f"Error: Max retries exceeded after {max_retries} attempts"], generate_fallback_password(password)

# Batch process passwords to generate issues and suggested passwords
def batch_generate_issues(passwords, strengths, batch_size=5):
    issues_list = []
    suggested_passwords = []
   
    for i in range(0, len(passwords), batch_size):
        batch_passwords = passwords[i:i + batch_size]
        batch_strengths = strengths[i:i + batch_size]
        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            batch_results = list(executor.map(lambda p: generate_issues_with_ollama(p[0], p[1]), zip(batch_passwords, batch_strengths)))
        batch_issues, batch_suggested = zip(*batch_results)
        issues_list.extend(batch_issues)
        suggested_passwords.extend(batch_suggested)
        time.sleep(1)
   
    return issues_list, suggested_passwords

@app.route('/bulk', methods=['POST'])
def bulk_strength():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_ext = file.filename.rsplit('.', 1)[-1].lower()
    file_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.{file_ext}")
    file.save(file_path)

    try:
        if file_ext in ['csv']:
            encoding = detect_file_encoding(file_path)
            try:
                df = pd.read_csv(file_path, header=None, encoding=encoding)
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, header=None, encoding='latin1')  # Fixed syntax error
            except Exception as e:
                return jsonify({"error": f"Failed to read CSV file: {str(e)}"}), 400
        elif file_ext in ['xls', 'xlsx']:
            try:
                df = pd.read_excel(file_path, header=None)
            except Exception as e:
                return jsonify({"error": f"Failed to read Excel file: {str(e)}"}), 400
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        if not df[0].str.contains(r'[a-zA-Z]', regex=True).any():
            passwords = df[0].astype(str)
        else:
            passwords = df.iloc[:, 0].astype(str)

        weak_count = 0
        moderate_count = 0
        strong_count = 0
        strengths = []

        for pwd in passwords:
            strength = predict_strength(pwd, model_pipeline)
            strengths.append(strength)
            if strength <= 0.3:
                weak_count += 1
            elif 0.3 < strength <= 0.85:
                moderate_count += 1
            else:
                strong_count += 1

        issues_list, suggested_passwords = batch_generate_issues(passwords, strengths)

        formatted_issues_csv = [", ".join(issues) for issues in issues_list]
        formatted_issues_json = ["\n".join(issues) for issues in issues_list]

        result_df = pd.DataFrame({
            "password": passwords,
            "strength": [f"{int(s * 100)}" for s in strengths],
            "issues": formatted_issues_csv,
            "suggested_password": suggested_passwords
        })

        result_filename = f"{uuid.uuid4()}.csv"
        result_path = os.path.join(RESULT_FOLDER, result_filename)
        result_df.to_csv(result_path, index=False, encoding='utf-8')

        return jsonify({
            "download_link": f"/download/{result_filename}",
            "total_passwords_analyzed": len(passwords),
            "weak_passwords": weak_count,
            "moderate_passwords": moderate_count,
            "strong_passwords": strong_count,
            "password_details": [
                {
                    "password": pwd,
                    "strength": f"{strength}",
                    "issues": f_issues,
                    "suggested_password": s_pwd
                }
                for pwd, strength, f_issues, s_pwd in zip(passwords, strengths, formatted_issues_json, suggested_passwords)
            ][:10]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing file {file_path}: {e}")

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(RESULT_FOLDER, filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"File not found: {str(e)}"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)