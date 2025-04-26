import kagglehub
import shutil
import os

def download_and_move(dataset_id, destination_folder):
    # Download
    path = kagglehub.dataset_download(dataset_id)
    
    # Create folder if not exist
    os.makedirs(destination_folder, exist_ok=True)

    # Move files
    for filename in os.listdir(path):
        full_file_name = os.path.join(path, filename)
        if os.path.isfile(full_file_name):
            shutil.move(full_file_name, os.path.join(destination_folder, filename))

    print(f"✅ Dataset '{dataset_id}' moved to '{destination_folder}'")

# --- Download datasets ---

# 1. Name + Date of Birth dataset
download_and_move("ekamk08/namedate-of-birth", "datasets/namedate_of_birth")

# 2. Personal Information Dataset
download_and_move("mazenalattar/personal-information-dataset", "datasets/personal_information_dataset")
