from flask import Flask, request, jsonify
from flask_cors import CORS
import os
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

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'Model', 'sample_model.joblib')
model_pipeline = joblib.load(MODEL_PATH)

# Function to generate passphrase using local Ollama API
def generate_passphrase_with_ollama(phrases):
    prompt = f"""
You are a secure passphrase generator that creates meaningful, sentence-like passphrases.
The passphrases should feel like short, vivid stories or diary entries that blend the user’s input naturally.
Your response must ONLY include the final passphrase — no explanation or extra text.

Based on the following personal phrases:
{', '.join(phrases)}

Generate a **secure, sentence-like passphrase** that:
    1. Blends most of the input phrases into a logical, vivid sentence structure.
    2. Is **15 to 20 characters** long.
    3. Try to make a sense of the phrases, but it should not be a direct copy of any of them.
    4. Includes at least **2 uppercase letters**, **1-2 numbers**, and **1-2 special characters** (only if they fit naturally).
    5. **Avoids gibberish, random characters**, or excessive symbol use.
    6. Do use simple substitutions like 'a' → '@'.
    7. Should be **easy to remember for someone familiar with the phrases**, but still hard to guess for others.
    8. Don't include spaces in the passphrase.
    Output only the final passphrase.
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )
        data = response.json()
        return data.get("response", "").strip().strip('"\'')
    except Exception as e:
        print(f"Ollama request error: {e}")
        return None

@app.route('/generate-passphrase', methods=['POST'])
def generate_passphrase():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.json
    phrases = data.get('phrases', [])

    if not phrases or not isinstance(phrases, list):
        return jsonify({"error": "Please provide at least one phrase"}), 400

    valid_phrases = [p for p in phrases if p and p.strip()]

    if not valid_phrases:
        return jsonify({"error": "Please provide at least one non-empty phrase"}), 400

    try:
        passphrase = generate_passphrase_with_ollama(valid_phrases)

        if not passphrase:
            return jsonify({"error": "Could not generate passphrase meeting requirements"}), 500

        # Predict strength
        strength = predict_strength(passphrase, model_pipeline)
        time_to_cracks = estimate_crack_time(passphrase)

        return jsonify({
            "passphrase": passphrase,
            "strength": strength,
            "time_to_crack": time_to_cracks,
        })

    except Exception as e:
        return jsonify({"error": f"Error generating passphrase: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)