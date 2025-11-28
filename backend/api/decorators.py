from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .firebase_utils import verify_id_token

def firebase_login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header.startswith("Bearer "):
            return Response({"detail": "Missing or invalid token"},
                            status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(" ")[1]
        decoded = verify_id_token(token)

        if not decoded:
            return Response({"detail": "Invalid or expired token"},
                            status=status.HTTP_401_UNAUTHORIZED)

        request.firebase_user = decoded
        return view_func(request, *args, **kwargs)

    return wrapper
