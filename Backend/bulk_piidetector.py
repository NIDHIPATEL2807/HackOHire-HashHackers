import pandas as pd
import re
from fuzzywuzzy import fuzz

def check_pii_matching(row):
    """
    Check if the generated password contains any PII from the same row.
    Returns "Matched" if PII is found, "Not-matched" otherwise.
    """
    # Convert gen_pass to lowercase for case-insensitive matching
    gen_pass = str(row['gen_pass']).lower()
    matches = []
    
    # Fuzzy matching threshold (set it to a reasonable number, e.g., 80%)
    match_threshold = 50  # This means 80% similarity will be considered a match

    # Check for personal information in password using fuzzy matching

    # Name checks (using fuzzy matching)
    if fuzz.partial_ratio(str(row['GivenName']).lower(), gen_pass) > match_threshold or fuzz.partial_ratio(str(row['Surname']).lower(), gen_pass) > match_threshold:
        matches.append("Name")

    # Middle initial check (using fuzzy matching)
    if fuzz.partial_ratio(str(row['MiddleInitial']).lower(), gen_pass) > match_threshold:
        matches.append("Middle Initial")
    
    # Address check - looking for full or partial matches using fuzzy matching
    address_parts = str(row['StreetAddress']).lower().split()
    for part in address_parts:
        if len(part) > 2 and fuzz.partial_ratio(part, gen_pass) > match_threshold:  # Ignore very short words
            matches.append("Address")
            break
    
    # City check (using fuzzy matching)
    if fuzz.partial_ratio(str(row['City']).lower(), gen_pass) > match_threshold:
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
    if fuzz.partial_ratio(str(row['Vehicle']).lower(), gen_pass) > match_threshold:
        matches.append("Vehicle")
    
    # Vehicle color check (using fuzzy matching)
    if fuzz.partial_ratio(str(row['Vehicle color']).lower(), gen_pass) > match_threshold:
        matches.append("Vehicle color")
    
    # Phone number check - remove spaces and other separators (using fuzzy matching)
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
    if fuzz.partial_ratio(str(row['MothersMaiden']).lower(), gen_pass) > match_threshold:
        matches.append("Mother's maiden name")
    
    # Zodiac sign check (using fuzzy matching)
    if fuzz.partial_ratio(str(row['TropicalZodiac']).lower(), gen_pass) > match_threshold:
        matches.append("Zodiac sign")
    
    if matches:
        return f"matched"
    else:
        return "not-matched"

def process_csv(input_file, output_file):
    """
    Process the input CSV file, check for PII in the generated passwords,
    and save the results to an output CSV file.
    """
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(input_file)

    # Apply the PII check to each row
    df['PII_Matched'] = df.apply(check_pii_matching, axis=1)

    # Save the result to a new CSV file
    df.to_csv(output_file, index=False)
    print(f"Processed CSV saved to {output_file}")

# Example usage
input_csv = 'input_file.csv'  # Replace with your input CSV file path
output_csv = 'output_with_pii_detection.csv'  # Replace with your desired output CSV file path

process_csv(input_csv, output_csv)
