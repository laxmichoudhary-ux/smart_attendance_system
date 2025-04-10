import sys
import os
import cv2

# Paths and arguments
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_name = sys.argv[1]
uploaded_image_path = sys.argv[2]
dataset_path = os.path.join(BASE_DIR, '../datasets', dataset_name)

# Ensure dataset directory exists
if not os.path.exists(dataset_path):
    os.makedirs(dataset_path)

haar_file = 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + haar_file)
(width, height) = (130, 110)

# Load and process the image
img = cv2.imread(uploaded_image_path)
if img is None:
    print("Error: Uploaded image could not be loaded.")
    sys.exit(1)

grayImg = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# faces = face_cascade.detectMultiScale(grayImg, 1.3, 4)
faces = face_cascade.detectMultiScale(grayImg, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

if len(faces) == 0:
    print("No face detected.")
    sys.exit(1)

for count, (x, y, w, h) in enumerate(faces, start=1):
    face = grayImg[y:y + h, x:x + w]
    face_resize = cv2.resize(face, (width, height))
    image_path = os.path.join(dataset_path, f'{count}.png')
    cv2.imwrite(image_path, face_resize)
    print(f"Saved: {image_path}")
