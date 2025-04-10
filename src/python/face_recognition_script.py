import sys
import os
from face_recognition import load_image_file, face_encodings, compare_faces

dataset_name = sys.argv[1]
uploaded_image_path = sys.argv[2]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(BASE_DIR, '../datasets', dataset_name)
print(dataset_path)

if not os.path.exists(dataset_path):
    print("Error: Dataset folder does not exist.")
    sys.exit(1)

# Load the uploaded image
try:
    captured_image = load_image_file(uploaded_image_path)
    captured_encoding = face_encodings(captured_image)[0]
except IndexError:
    print("No face detected in the uploaded image.")
    sys.exit(1)

# Load known faces
known_faces = []
for filename in os.listdir(dataset_path):
    if filename.endswith(".png") or filename.endswith(".jpg"):
        known_image = load_image_file(os.path.join(dataset_path, filename))
        try:
            known_encoding = face_encodings(known_image)[0]
            known_faces.append(known_encoding)
        except IndexError:
            continue

# Compare faces
matches = compare_faces(known_faces, captured_encoding)
if True in matches:
    print("Face match: True")
else:
    print("Face match: False")
