from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
import joblib
import requests
from dotenv import load_dotenv

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
    predict_strength,
    estimate_crack_time
)

app = Flask(__name__)
CORS(app)

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'Model', 'sample_model.joblib')
model_pipeline = joblib.load(MODEL_PATH)

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
       
        # If JSON ends without final }, try fixing it manually
        if start_idx is not None:
            candidate = text[start_idx:].strip()
            if not candidate.endswith('}'):
                candidate += '}'
            return json.loads(candidate)

        raise ValueError("No valid JSON block found")
    except Exception as e:
        print(f"Robust JSON extraction failed: {e}")
        return None

def get_ai_analysis(password):
    prompt = f"""
I am a responsible and expert password generator tasked with analyzing the password: "{password}". My goal is to identify vulnerabilities, provide improvement suggestions, and suggest a significantly stronger password that retains the core theme or meaning of the original password but maximizes security for real-world use. Follow these steps:

1. Analyze the password for specific vulnerabilities or weaknesses according to the password give realtime issues or suggestions in the passoword. Do not list generic issues unless they genuinely apply.
2. Provide actionable suggestions to improve the password based on the identified vulnerabilities.
3. Suggest a stronger version of the password that:
   - Retains the core theme or meaning of the original password and the new generated password should be more stronger than older one.
   - Must be at least 16 characters long to ensure maximum entropy.
   - Must include at least two uppercase letters, two lowercase letters, two numbers, and two special characters (e.g., !@#$%^&*?~).
   - Must avoid predictable patterns (e.g., keyboard sequences like "qwerty", consecutive characters like "aaa", or common substitutions like "password -> p@ssw0rd").
   - Must not use dictionary words without significant modification (e.g., combine with numbers and symbols or alter significantly).
   - Must incorporate randomization to increase complexity (e.g., random insertion of special characters or numbers within the theme).
   - Must be highly resistant to common attacks (dictionary, brute force, rainbow table).
   - Must not repeat characters more than twice consecutively.
   - Must ensure a mix of character types distributed throughout the password, not just at the start or end.

Respond ONLY in pure JSON format like this:
{{
  "vulnerabilities_detected": ["..."],
  "improvement_suggestions": ["..."],
  "suggested_password": "..."
}}

If there are no vulnerabilities, clearly return an empty list for "vulnerabilities_detected".
Do not include explanations, comments, or markdown. Return pure JSON.
""".strip()

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.6,  # Slightly increased for more creative suggestions
                    "num_predict": 600   # Increased to handle longer responses
                }
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        output = result.get("response", "")

        parsed = extract_json_block(output)
        if parsed:
            if not isinstance(parsed.get("suggested_password"), str):
                raise ValueError("Suggested password is not a string")
            return parsed
        else:
            raise ValueError("No valid JSON block extracted from AI response")

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return {
            "vulnerabilities_detected": ["Ollama communication failed"],
            "improvement_suggestions": [],
            "suggested_password": None
        }
    except Exception as e:
        print(f"Error in AI analysis: {e}")
        return {
            "vulnerabilities_detected": ["AI analysis failed"],
            "improvement_suggestions": [],
            "suggested_password": None
        }

@app.route('/analyse', methods=['POST'])
def analyse_password():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.json
    password = data.get("password", "")

    if not password or not isinstance(password, str):
        return jsonify({"error": "Please provide a valid password string"}), 400

    try:
        # ML model predictions
        strength = predict_strength(password, model_pipeline)
        time_to_crack = estimate_crack_time(password)
        # Direct Ollama-based AI insights (single attempt)
        ai_results = get_ai_analysis(password)
        if ai_results["suggested_password"] is None:
            raise ValueError("AI failed to suggest a password")

        new_time_to_crack = estimate_crack_time(ai_results['suggested_password'])
        new_strength = predict_strength(ai_results['suggested_password'], model_pipeline)
        print({
            "original_password": password,
            "strength": strength,
            "time_to_crack": time_to_crack,
            **ai_results,
            "new_time_to_crack": new_time_to_crack,
            "new_strength": new_strength
        })
        return jsonify({
            "original_password": password,
            "strength": strength,
            "time_to_crack": time_to_crack,
            **ai_results,
            "new_time_to_crack": new_time_to_crack,
            "new_strength": new_strength
        })

    except Exception as e:
        print(f"Error in password analysis: {e}")
        return jsonify({"error": f"Error analyzing password: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)