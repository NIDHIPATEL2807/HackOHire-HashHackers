import time

import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeRegressor
import math
import string
import requests, re, random

class LenTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["len"] = X["password"].apply(lambda x: self._lenTransform(x))
        transformed_X = X["len"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _lenTransform(self, text: str) -> int:
        return len(text)
class AlphaUCTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["alphaUC"] = X["password"].apply(lambda x: self._alphaUCTransform(x))
        transformed_X = X["alphaUC"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _alphaUCTransform(self, text: str) -> int:
        return sum(1 for a in text if a.isupper())
class AlphaLCTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["alphaLC"] = X["password"].apply(lambda x: self._alphaLCTransform(x))
        transformed_X = X["alphaLC"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _alphaLCTransform(self, text: str) -> int:
        return sum(1 for a in text if a.islower())
class NumberTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["number"] = X["password"].apply(lambda x: self._numberTransform(x))
        transformed_X = X["number"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _numberTransform(self, text: str) -> int:
        return sum(1 for a in text if a.isdecimal())
class SymbolTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["symbol"] = X["password"].apply(lambda x: self._symbolTransform(x))
        transformed_X = X["symbol"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _symbolTransform(self, text: str) -> int:
        return sum(a in set("!@#$%^&*") for a in text)
class MidCharTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["midChar"] = X["password"].apply(lambda x: self._midCharTransform(x))
        transformed_X = X["midChar"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _midCharTransform(self, text: str) -> int:
        return sum(
            bool(
                (a.isdecimal() or (a in set("!@#$%^&*")))
                and ix > 0
                and ix < len(text) - 1
            )
            for ix, a in enumerate(text)
        )
class RepCharTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["repChar"] = X["password"].apply(lambda x: self._repCharTransform(x))
        transformed_X = X["repChar"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _repCharTransform(self, text: str) -> int:
        return len(text) - len(list(set(text)))
class UniqueCharTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["uniqueChar"] = X["password"].apply(lambda x: self._uniqueCharTransform(x))
        transformed_X = X["uniqueChar"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _uniqueCharTransform(self, text: str) -> int:
        return len(list(set(text)))
class ConsecAlphaUCTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["consecAlphaUC"] = X["password"].apply(
            lambda x: self._consecAlphaUCTransform(x)
        )
        transformed_X = X["consecAlphaUC"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _consecAlphaUCTransform(self, text: str) -> int:
        temp = ""
        nConsecAlphaUC = 0
        for a in text:
            if a.isupper():
                if temp and temp[-1] == a:
                    nConsecAlphaUC += 1
                temp = a
        return nConsecAlphaUC
class ConsecAlphaLCTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["consecAlphaLC"] = X["password"].apply(
            lambda x: self._consecAlphaLCTransform(x)
        )
        transformed_X = X["consecAlphaLC"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _consecAlphaLCTransform(self, text: str) -> int:
        temp = ""
        nConsecAlphaLC = 0
        for a in text:
            if a.islower():
                if temp and temp[-1] == a:
                    nConsecAlphaLC += 1
                temp = a
        return nConsecAlphaLC
class ConsecNumberTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["consecNumber"] = X["password"].apply(
            lambda x: self._consecNumberTransform(x)
        )
        transformed_X = X["consecNumber"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _consecNumberTransform(self, text: str) -> int:
        temp = ""
        nConsecNumber = 0
        for a in text:
            if a.isdecimal():
                if temp and temp[-1] == a:
                    nConsecNumber += 1
                temp = a
        return nConsecNumber
class ConsecSymbolTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["consecSymbol"] = X["password"].apply(
            lambda x: self._consecSymbolTransform(x)
        )
        transformed_X = X["consecSymbol"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _consecSymbolTransform(self, text: str) -> int:
        temp = ""
        nConsecSymbol = 0
        for a in text:
            if a in set("!@#$%^&*"):
                if temp and temp[-1] == a:
                    nConsecSymbol += 1
                temp = a
        return nConsecSymbol
class SeqAlphaTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["seqAlpha"] = X["password"].apply(lambda x: self._seqAlphaTransform(x))
        transformed_X = X["seqAlpha"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _seqAlphaTransform(self, text: str) -> int:
        sAlphas = "abcdefghijklmnopqrstuvwxyz"
        nSeqAlpha = 0
        for s in range(len(sAlphas) - 2):
            sFwd = sAlphas[s : s + 3]
            sRev = sFwd[::-1]
            if sFwd in text.lower() or sRev in text.lower():
                nSeqAlpha += 1
        return nSeqAlpha
class SeqNumberTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["seqNumber"] = X["password"].apply(lambda x: self._seqNumberTransform(x))
        transformed_X = X["seqNumber"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _seqNumberTransform(self, text: str) -> int:
        sNumerics = "01234567890"
        nSeqNumber = 0
        for s in range(len(sNumerics) - 2):
            sFwd = sNumerics[s : s + 3]
            sRev = sFwd[::-1]
            if sFwd in text.lower() or sRev in text.lower():
                nSeqNumber += 1
        return nSeqNumber
class SeqKeyboardTransform(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X["seqKeyboard"] = X["password"].apply(lambda x: self._seqKeyboardTransform(x))
        transformed_X = X["seqKeyboard"].to_numpy()
        return np.array(transformed_X).reshape(-1, 1)

    def _seqKeyboardTransform(self, text: str) -> int:
        sTopRow = "qwertyuiop"
        sHomeRow = "asdfghjkl"
        sBottomRow = "zxcvbnm"
        nKeyboard = 0
        sRows = [sTopRow, sHomeRow, sBottomRow]

        for sRow in sRows:
            for s in range(len(sRow) - 2):
                sFwd = sRow[s : s + 3]
                sRev = sFwd[::-1]
                if sFwd in text.lower() or sRev in text.lower():
                    nKeyboard += 1

        return nKeyboard
    
def predict_strength(password: str, model_pipeline) -> float:
    # Create a DataFrame with the input password
    input_df = pd.DataFrame({"password": [password]})
    
    # Predict the strength
    predicted_strength = model_pipeline.predict(input_df)[0]
    
    # Check for complexity issues
    complexity_issues = []
    if not re.search(r'[A-Z]', password):
        complexity_issues.append("uppercase letter")
    if not re.search(r'[a-z]', password):
        complexity_issues.append("lowercase letter")
    if not re.search(r'\d', password):
        complexity_issues.append("number")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        complexity_issues.append("special character")
    
    # If prediction > 0.7 and complexity issues exist
    if predicted_strength > 0.7 and complexity_issues:
        predicted_strength = round(random.uniform(0.3, 0.6), 2)
    
    return predicted_strength

def estimate_entropy(password):
    charset = 0
    if any(c in string.ascii_lowercase for c in password):
        charset += 26
    if any(c in string.ascii_uppercase for c in password):
        charset += 26
    if any(c in string.digits for c in password):
        charset += 10
    if any(c in string.punctuation for c in password):
        charset += len(string.punctuation)
    if any(c.isspace() for c in password):
        charset += 1
    if charset == 0:
        charset = 1
    entropy = len(password) * math.log2(charset)
    return entropy

def format_time(seconds):
    years = seconds / (60 * 60 * 24 * 365)

    if seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours"
    elif seconds < 31536000:
        return f"{int(seconds // 86400)} days"
    elif years < 100:
        return f"{math.ceil(years)} years"
    elif years < 1000:
        centuries = years / 100
        return f"{math.ceil(centuries)} centuries"
    else:
        millennia = years / 1000
        return f"{math.ceil(millennia)} millennias"



def hashcat_speed(hash_type='bcrypt'):
    """
    Simulated Hashcat speeds for common hash types (on a modern GPU like RTX 4090).
    Speeds are approximate in guesses per second.
    """
    speeds = {
        'bcrypt': 200000,           # mode 3200
        'sha1': 50600000000,     # mode 100
        'md5': 162700000000,      # mode 0
        'sha256': 22000000000,    # mode 1400
    }
    return speeds.get(hash_type.lower(), 1000000)


def estimate_crack_time(password):
    url = "http://127.0.0.1:5004/crack_time"
    try:
        response = requests.post(url, json={"password": password})
        response.raise_for_status()  # Raises an HTTPError if the response was unsuccessful
        return response.json()  # Assuming the server returns JSON
    except requests.RequestException as e:
        print(f"An error occurred: {e}")
        return None