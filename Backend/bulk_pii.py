import os
import pandas as pd
import re
from fuzzywuzzy import fuzz
from flask import Flask, request, jsonify, send_file, url_for
from werkzeug.utils import secure_filename
import uuid
import time

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'csv'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def check_pii_matching(row):
    """
    Check if the generated password contains any PII from the same row.
    Returns "matched" if PII is found, "not-matched" otherwise.
    """
    # Convert gen_pass to lowercase for case-insensitive matching
    gen_pass = str(row['gen_pass']).lower()
    matches = []
    
    # Fuzzy matching threshold
    match_threshold = 50  # 50% similarity will be considered a match

    # Check for personal information in password using fuzzy matching

    # Name checks (using fuzzy matching)
    if fuzz.partial_ratio(str(row['GivenName']).lower(), gen_pass) > match_threshold or fuzz.partial_ratio(str(row['Surname']).lower(), gen_pass) > match_threshold:
        matches.append("Name")

    # Middle initial check (using fuzzy matching)
    if 'MiddleInitial' in row and fuzz.partial_ratio(str(row['MiddleInitial']).lower(), gen_pass) > match_threshold:
        matches.append("Middle Initial")
    
    # Address check - looking for full or partial matches using fuzzy matching
    if 'StreetAddress' in row:
        address_parts = str(row['StreetAddress']).lower().split()
        for part in address_parts:
            if len(part) > 2 and fuzz.partial_ratio(part, gen_pass) > match_threshold:  # Ignore very short words
                matches.append("Address")
                break
    
    # City check (using fuzzy matching)
    if 'City' in row and fuzz.partial_ratio(str(row['City']).lower(), gen_pass) > match_threshold:
        matches.append("City")
    
    # Birth date check (looking for patterns like MM/DD/YYYY, MM-DD-YYYY, etc.)
    if 'Birthday' in row and pd.notna(row['Birthday']):
        try:
            # Try to parse the date
            date_str = str(row['Birthday'])
            
            # Extract year, month, day as individual components
            date_parts = re.findall(r'\d+', date_str)
            if date_parts:
                # Check for year in password
                if len(date_parts) >= 3:
                    year = date_parts[2] if len(date_parts[2]) == 4 else None
                    if year and fuzz.partial_ratio(year, gen_pass) > match_threshold:
                        matches.append("Birth year")
                
                # Check for full date in different formats in password
                if date_str.replace('/', '').replace('-', '') in gen_pass:
                    matches.append("Full birthdate")
                
                # Check for month and day separately in password
                if len(date_parts) >= 2:
                    month_day = date_parts[0] + date_parts[1]  # MMDD format
                    if fuzz.partial_ratio(month_day, gen_pass) > match_threshold:
                        matches.append("Month and Day")
        except:
            pass
    
    # Vehicle check (using fuzzy matching)
    if 'Vehicle' in row and fuzz.partial_ratio(str(row['Vehicle']).lower(), gen_pass) > match_threshold:
        matches.append("Vehicle")
    
    # Vehicle color check (using fuzzy matching)
    if 'Vehicle color' in row and fuzz.partial_ratio(str(row['Vehicle color']).lower(), gen_pass) > match_threshold:
        matches.append("Vehicle color")
    
    # Phone number check - remove spaces and other separators (using fuzzy matching)
    if 'TelephoneNumber' in row:
        phone = re.sub(r'\D', '', str(row['TelephoneNumber']))
        if phone and len(phone) >= 4:
            # Check for sequences of at least 4 digits from phone number
            for i in range(len(phone) - 3):
                if fuzz.partial_ratio(phone[i:i+4], gen_pass) > match_threshold:
                    matches.append("Phone number")
                    break
            # Check for the entire phone number (using fuzzy matching)
            if fuzz.partial_ratio(phone, gen_pass) > match_threshold:
                matches.append("Full phone number")
    
    # Mother's maiden name check (using fuzzy matching)
    if 'MothersMaiden' in row and fuzz.partial_ratio(str(row['MothersMaiden']).lower(), gen_pass) > match_threshold:
        matches.append("Mother's maiden name")
    
    # Zodiac sign check (using fuzzy matching)
    if 'TropicalZodiac' in row and fuzz.partial_ratio(str(row['TropicalZodiac']).lower(), gen_pass) > match_threshold:
        matches.append("Zodiac sign")
    
    if matches:
        return "matched"
    else:
        return "not-matched"

def process_csv(input_file_path):
    """
    Process the input CSV file, check for PII in the generated passwords,
    and return the processed DataFrame and statistics.
    """
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(input_file_path)

    # Apply the PII check to each row
    df['PII_Matched'] = df.apply(check_pii_matching, axis=1)

    # Calculate statistics
    total_passwords = len(df)
    matched_passwords = len(df[df['PII_Matched'] == 'matched'])
    not_matched_passwords = total_passwords - matched_passwords
    
    stats = {
        'total_passwords': total_passwords,
        'matched_passwords': matched_passwords,
        'not_matched_passwords': not_matched_passwords
    }

    return df, stats

@app.route('/bulk_pii', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        # Save the uploaded file
        filename = secure_filename(file.filename)
        base_filename = os.path.splitext(filename)[0]
        input_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{base_filename}_{unique_id}_{timestamp}.csv")
        file.save(input_filepath)
        
        try:
            # Process the file
            df, stats = process_csv(input_filepath)
            
            # Save the result
            result_filename = f"{base_filename}_processed_{unique_id}_{timestamp}.csv"
            result_filepath = os.path.join(app.config['RESULT_FOLDER'], result_filename)
            df.to_csv(result_filepath, index=False)
            
            # Generate download URL
            download_url = url_for('download_file', filename=result_filename, _external=True)
            
            # Return the result with stats
            return jsonify({
                'message': 'File processed successfully',
                'download_url': download_url,
                'statistics': stats
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    
    return jsonify({'error': 'File type not allowed. Please upload a CSV file.'}), 400

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_file(os.path.join(app.config['RESULT_FOLDER'], filename),
                        mimetype='text/csv',
                        as_attachment=True,
                        download_name=filename)
    except Exception as e:
        return jsonify({'error': f'Error downloading file: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5006)