from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User
from backend_project.firebase_config import verify_firebase_token
from .models import Student, Driver


class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that verifies Firebase tokens
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
        
        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise exceptions.AuthenticationFailed('Invalid token format')
        
        # Verify Firebase token
        decoded_token = verify_firebase_token(token)
        
        if not decoded_token:
            raise exceptions.AuthenticationFailed('Invalid or expired token')
        
        # Get Firebase UID and email
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email', '')
        
        # Get or create Django user
        user, created = User.objects.get_or_create(
            username=firebase_uid,
            defaults={'email': email}
        )
        
        # Attach Firebase data to user object for later use
        user.firebase_uid = firebase_uid
        user.firebase_data = decoded_token
        
        return (user, None)