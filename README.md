# FortiPhrase - Password Strength Analyzer & Passphrase Generator

FortiPhrase is a local, offline tool designed to help users assess the strength of their passwords, generate secure passphrases, and perform bulk password analysis. By using Generative AI (GenAI) and Machine Learning (ML) techniques, the tool goes beyond basic password metrics (e.g., length, special characters) to evaluate overall password strength and predict vulnerabilities to common attack methods. All analysis is done locally without storing or transmitting any data.

## Features

### 1. Password Strength Analyzer & Suggester
- **Evaluates Strength**: Analyzes password strength using 15 features (e.g., length, symbols, character variety, etc.) and a decision tree regressor.
- **Strength Score**: Provides a strength score ranging from 0 to 1.
- **Time-to-Crack Estimates**: Estimates the time required to crack a password using dictionary, rainbow table, or brute force methods.
- **AI Suggestions**: Local AI (using Ollama and LLaMA3 models) suggests improvements to make passwords stronger.

### 2. Passphrase Generation
- **Generates Secure Passphrases**: Creates strong passphrases based on personal keywords.
- **Personalized Suggestions**: Tailored to avoid password reuse while remaining memorable and secure.

### 3. Bulk Password Analysis
- **Multiple Password Analysis**: Analyze several passwords simultaneously for strength and vulnerability.
- **Strength and Crack-Time Estimates**: Provides the strength score and time-to-crack estimates for each password.
- **Strong Suggestions**: Flags weak passwords and provides stronger alternatives.

### 4. Bulk Password Analyzer with PII Matching
- **Detects Sensitive Data**: Scans passwords for Personally Identifiable Information (PII).
- **CSV File Support**: Processes passwords from CSV files and flags any that contain sensitive data.


## ML Model used
Our model is a **Decision Tree Regressor** that predicts password strength based on 15 password characteristics namely:

| Feature         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| len             | Total number of characters in the password.                                 |
| alphaUC         | Count of uppercase letters.                                                  |
| alphaLC         | Count of lowercase letters.                                                  |
| number          | Count of digits.                                                             |
| symbol          | Count of special characters (!@#$%^&*).                                      |
| midChar         | Count of digits or special characters in the middle of the password.        |
| repChar         | Number of repeating characters (length minus unique characters).            |
| uniqueChar      | Number of distinct characters.                                               |
| consecAlphaUC   | Number of consecutive uppercase letters.                                     |
| consecAlphaLC   | Number of consecutive lowercase letters.                                     |
| consecNumber    | Number of consecutive digits.                                                |
| consecSymbol    | Number of consecutive special characters.                                    |
| seqAlpha        | Number of sequential letter patterns (e.g., "abc" or "cba").                 |
| seqNumber       | Number of sequential digit patterns (e.g., "123" or "321").                  |
| seqKeyboard     | Number of sequential keyboard patterns (e.g., "qwe" or "ewq").               |





## Setup

## Clone the Repository
```bash
git clone https://github.com/Saur-Deshmukh/HackOHire-HashHackers.git
```
## Ollama

1. Install Ollama from [here](https://ollama.com/)
2. Pull llama3 onto your system:
   ```bash
   ollama pull llama3
   ```
3. Run Ollama:
   ```bash
   ollama run llama3
   ```

### Frontend (Next.js)
1. Change Directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```

2. Start the development server:
    ```bash
    npm run dev
    ```

### Backend (Flask)
1. Setup Virtual Environment:
   ```bash
   python -m venv myenv
   myenv\Scripts\activate
   ```
2. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3. Change Directory:
   ```bash
   cd Backend
   ```
4. Start the servers:
   ```bash
   python analyze.py
   python bulk_pii.py
   python bulk.py
   python insights.py
   python passphrase.py
   python time_to_crack.py
   ```
## Services and Ports

| Service | File | Localhost Port |
|:--------|:-----|:--------------|
| Bulk Operations | `bulk.py` | [http://localhost:5000](http://localhost:5000) |
| PassPhrase Generator | `passphrase.py` | [http://localhost:5001](http://localhost:5001) |
| Password Strength Analyzer | `analyser.py` | [http://localhost:5002](http://localhost:5002) |
| Security Insights and Reports | `insights.py` | [http://localhost:5003](http://localhost:5003) |
| Time to Crack Estimator | `time_to_crack.py` | [http://localhost:5004](http://localhost:5004) |
| Bulk PII Handler | `bulk_pii.py` | [http://localhost:5006](http://localhost:5006) |



## Privacy
- **Offline Processing**: All password analysis is done locally on your machine. No data is stored or transmitted.
- **Local AI Models**: Uses Ollama and LLaMA3 AI models for password strength analysis and suggestions, ensuring complete privacy.

## Technologies Used
- **Frontend**: Next.js
- **Backend**: Python, Flask
- **AI Models**: Ollama, LLaMA3
- **Machine Learning Techniques**: Decision tree regressor
- **Additional Libraries**: CSV processing, PII detection


## Acknowledgments
The FortiPhrase tool uses the Ollama and LLaMA3 AI models for offline password strength analysis and suggestions.


