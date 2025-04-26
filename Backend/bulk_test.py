from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
import joblib
import io
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
)  # Importing predict_strength from your utils module

app = Flask(__name__)
CORS(app)

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'Model', 'sample_model.joblib')
RESULT_FOLDER = os.path.join(BASE_DIR, 'results')

# Create 'results' folder if it doesn't exist
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Load the model
try:
    model_pipeline = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

@app.route('/process_csv', methods=['POST'])
def process_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "File must be a CSV"}), 400

    try:
        df = pd.read_csv(file)
        print(f"CSV file loaded successfully with {len(df)} rows")

        if "password" not in df.columns:
            return jsonify({"error": "CSV file must contain a 'password' column"}), 400

        # Predict strength
        df['strength'] = df['password'].apply(lambda x: predict_strength(str(x), model_pipeline))
        print("Strength calculated for all passwords")

        # Add 'class' column based on strength
        def classify_strength(score):
            if score >= 0.85:
                return "very strong"
            elif score >= 0.65:
                return "strong"
            elif score >= 0.3:
                return "moderate"
            else:
                return "weak"

        df['class'] = df['strength'].apply(classify_strength)
        print("Class column added based on strength")

        # Save to 'results' folder
        filename = 'passwords_with_strength.csv'
        file_path = os.path.join(RESULT_FOLDER, filename)
        df.to_csv(file_path, index=False)

        print(f"Processed CSV saved at {file_path}")

        return jsonify({
            "message": "File processed successfully",
            "download_url": f"/download/{filename}"
        })

    except Exception as e:
        print(f"Error processing CSV: {e}")
        return jsonify({"error": f"Error processing CSV: {str(e)}"}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(RESULT_FOLDER, filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"File not found: {str(e)}"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
