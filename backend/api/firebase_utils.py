import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore
import os

# Initialize Firebase Admin SDK (only once)
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def verify_id_token(id_token):
    try:
        return firebase_auth.verify_id_token(id_token)
    except Exception as e:
        print("Token verification failed:", e)
        return None
