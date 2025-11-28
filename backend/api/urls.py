# api/urls.py - COMPLETE VERSION

from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # TEST ENDPOINTS
    # ============================================
    path('test/', views.test_endpoint, name='test'),
    path('protected-test/', views.protected_test, name='protected_test'),
    
    # ============================================
    # STUDENT ENDPOINTS
    # ============================================
    path('student/register/', views.register_student, name='register_student'),
    path('student/booking/create/', views.create_booking, name='create_booking'),
    path('student/bookings/', views.get_student_bookings, name='get_student_bookings'),
    
    # ============================================
    # DRIVER ENDPOINTS
    # ============================================
    path('driver/location/update/', views.update_driver_location, name='update_driver_location'),
    path('driver/location/', views.driver_location_public, name='driver_location_public'),  # For testing
    
    # ============================================
    # ADMIN ENDPOINTS
    # ============================================
    path('admin/buses/locations/', views.get_all_bus_locations, name='get_all_bus_locations'),
    path('admin/bookings/pending/', views.get_pending_bookings, name='get_pending_bookings'),
]