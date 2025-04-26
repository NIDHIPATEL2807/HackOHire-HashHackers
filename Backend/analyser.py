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
        print("Robust JSON extraction failed:", e)
        return None


def get_ai_analysis(password):
    prompt = f"""
Analyze the following password:

"{password}"

Return the following:
1. A list of vulnerabilities or weaknesses *you genuinely detect* in this specific password (do not include generic or obvious ones unless they truly apply).
2. Suggestions to improve this password based on your findings.
3. A stronger version of this password that maintains its general style or meaning but significantly improves its security.

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
                "stream": False
            }
        )
        result = response.json()
        output = result.get("response", "")

        parsed = extract_json_block(output)
        if parsed:
            return parsed
        else:
            raise ValueError("No valid JSON block extracted from AI response")

    except Exception as e:
        print("Error in AI analysis:", e)
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

        # Direct Ollama-based AI insights
        ai_results = get_ai_analysis(password)
        new_time_to_crack = estimate_crack_time(ai_results['suggested_password'])
        new_strength = predict_strength(ai_results['suggested_password'], model_pipeline)
        while (new_strength<0.85):
            ai_results = get_ai_analysis(password)
            new_time_to_crack = estimate_crack_time(ai_results['suggested_password'])
            new_strength = predict_strength(ai_results['suggested_password'], model_pipeline)
        
        
        return jsonify({
            "original_password": password,
            "strength": strength,
            "time_to_crack": time_to_crack,
            **ai_results,
            "new_time_to_crack":new_time_to_crack,
            "new_strength": new_strength
        })

    except Exception as e:
        return jsonify({"error": f"Error analyzing password: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
