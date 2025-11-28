import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
import os

# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    os.path.join(settings.BASE_DIR, 'serviceAccountKey.json')
)

try:
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin SDK initialized successfully")
except ValueError:
    # Already initialized
    pass


def verify_firebase_token(id_token):
    """
    Verify Firebase ID token and return decoded token or None
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"❌ Firebase token verification failed: {e}")
        return None


def get_firebase_user(uid):
    """
    Get Firebase user by UID
    """
    try:
        user = auth.get_user(uid)
        return user
    except Exception as e:
        print(f"❌ Failed to get Firebase user: {e}")
        return None