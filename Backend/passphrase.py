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
You are an advanced passphrase generator that creates highly secure, meaningful, and memorable passphrases.

Your response must ONLY include the final passphrase — no explanation or extra text.

Based on the following personal phrases:
{', '.join(phrases)}

Generate a **secure, sentence-like passphrase** that:
1. Weaves most input phrases into a coherent, vivid sentence-like structure that feels personal and meaningful.
2. Is **15 to 20 characters** long.
3. Forms a logical, memorable narrative inspired by the phrases, not a direct copy.
4. Includes at least **2 uppercase letters**, **2 numbers**, and **2 special characters** (integrated naturally, e.g., '@' for 'a', '!' for emphasis).
5. Avoids random characters, gibberish, or excessive symbols to maintain memorability.
6. Uses subtle substitutions (e.g., 'a' → '@', 's' → '$') only when they enhance meaning or security.
7. Is **easy to recall** for someone familiar with the phrases but **extremely hard to guess** for others.
8. Excludes spaces to ensure compatibility with password fields.
9. Prioritizes **high entropy** by balancing randomness with meaningful structure.
10. Strictly add random 2-3 numbers to enhance the quality.

Output only the final passphrase.
"""
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7
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
            "strength": strength
        })

    except Exception as e:
        return jsonify({"error": f"Error generating passphrase: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
