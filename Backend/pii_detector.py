import os
import re
import pandas as pd
from presidio_analyzer import AnalyzerEngine

analyzer = AnalyzerEngine()

# Regex patterns for PII types
regex_patterns = {
    "EMAIL_ADDRESS": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'),
    "PHONE_NUMBER": re.compile(r'\b(\+?\d{1,3}[- ]?)?\d{10}\b'),
    "DATE": re.compile(r'\b(?:\d{1,2}[/-])?\d{1,2}[/-]\d{2,4}\b'),
    "AADHAAR_NUMBER": re.compile(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}\b'),
    "SOCIAL_HANDLE": re.compile(r'@[\w\d_]{3,30}'),
    "VEHICLE_NUMBER": re.compile(r'\b[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}\b'),
    "ADDRESS": re.compile(r'\b(?:road|street|lane|sector|colony|nagar|marg|vihar|basti|puram|market|avenue|circle|chowk)\b', re.IGNORECASE),
}

def load_all_datasets(folder_path='datasets'):
    datasets = []
    if not os.path.exists(folder_path):
        return datasets
    
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(filepath)
        else:
            continue

        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
        datasets.append(df)
    return datasets

def is_gender_column(column_series):
    unique_values = column_series.dropna().astype(str).str.upper().unique()
    gender_labels = {'M', 'F', 'MALE', 'FEMALE', 'OTHER'}
    return all(val in gender_labels for val in unique_values) and len(unique_values) <= 5

def search_in_datasets(password, datasets):
    remarks = []
    seen = set()
    password_lower = password.lower()
    
    for df in datasets:
        for col in df.columns:
            column_data = df[col]
            if column_data.isnull().all():
                continue

            if is_gender_column(column_data):
                continue

            for value in column_data.dropna().astype(str):
                value_lower = value.lower()
                if password_lower == value_lower or value_lower in password_lower or password_lower in value_lower:
                    key = (col.lower(), value_lower)
                    if key not in seen:
                        remarks.append({'type': col, 'value': value})
                        seen.add(key)

    return remarks if remarks else None

def split_camel_case(text):
    return re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', text)

def detect_pii_regex(password):
    remarks = []
    seen = set()
    for label, pattern in regex_patterns.items():
        matches = pattern.findall(password)
        for match in matches:
            if isinstance(match, tuple):
                match = match[0]
            match_lower = str(match).lower()
            key = (label.lower(), match_lower)
            if key not in seen:
                remarks.append({'type': label, 'value': match})
                seen.add(key)
    return remarks if remarks else None

def detect_pii_presidio(password):
    processed_password = split_camel_case(password)
    
    results = analyzer.analyze(text=processed_password, entities=[], language='en')
    pii_remarks = []
    seen = set()

    for result in results:
        entity_text = processed_password[result.start:result.end]
        key = (result.entity_type.lower(), entity_text.lower())
        if key not in seen:
            pii_remarks.append({
                'type': result.entity_type,
                'value': entity_text
            })
            seen.add(key)
    return pii_remarks if pii_remarks else None

def analyze_password(password):
    datasets = load_all_datasets()

    regex_remarks = detect_pii_regex(password)
    dataset_remarks = search_in_datasets(password, datasets)
    presidio_remarks = None

    # Presidio only if no regex or dataset match
    if not regex_remarks and not dataset_remarks:
        presidio_remarks = detect_pii_presidio(password)

    combined_remarks = []
    if regex_remarks:
        combined_remarks.extend(regex_remarks)
    if dataset_remarks:
        combined_remarks.extend(dataset_remarks)
    if presidio_remarks:
        combined_remarks.extend(presidio_remarks)

    return {'remark': combined_remarks if combined_remarks else None}

# --- Example usage ---
if __name__ == "__main__":
    test_passwords = [
        "JohnSmith2024",
        "nidhispatel",
        "mydogBella",
        "SuperSecureM",
        "+919876543210",
        "passwordF123",
        "user@example.com",
        "@john_doe",
        "MH12AB1234",
        "1234-5678-9012",
        "login8.8.8.8server",
        "ServerIP192.168.1.1"
    ]
    
    for pwd in test_passwords:
        result = analyze_password(pwd)
        print(f"Password: {pwd}\nResult: {result}\n---")
