# api/views.py - COMPLETE VERSION

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from django.utils import timezone
from .models import Student, Driver, BusLocation, Bus, Booking

# ============================================
# TEST ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """Simple test endpoint to check if backend is working"""
    return Response({
        'message': '🎉 Backend is connected successfully!',
        'status': 'success',
        'timestamp': datetime.now().isoformat(),
        'django_version': 'Django 5.2.8',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_test(request):
    """Test endpoint that requires authentication"""
    user = request.user
    firebase_uid = getattr(user, 'firebase_uid', None)
    
    return Response({
        'message': '🔒 You are authenticated!',
        'user': {
            'username': user.username,
            'email': user.email,
            'firebase_uid': firebase_uid,
        },
        'timestamp': datetime.now().isoformat(),
    })


# ============================================
# STUDENT ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_student(request):
    """Register a new student with their Firebase UID"""
    user = request.user
    firebase_uid = getattr(user, 'firebase_uid', None)
    
    student_id = request.data.get('student_id')
    phone = request.data.get('phone')
    address = request.data.get('address')
    
    if not all([student_id, phone, address]):
        return Response({
            'error': 'Missing required fields: student_id, phone, address'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if Student.objects.filter(firebase_uid=firebase_uid).exists():
        return Response({
            'error': 'Student already registered'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    student = Student.objects.create(
        user=user,
        firebase_uid=firebase_uid,
        student_id=student_id,
        phone=phone,
        address=address
    )
    
    return Response({
        'message': 'Student registered successfully',
        'student': {
            'student_id': student.student_id,
            'phone': student.phone,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """Create a new bus booking request"""
    user = request.user
    
    print(f"📝 Booking request from user: {user.username} ({user.email})")
    
    try:
        student = Student.objects.get(user=user)
        print(f"✅ Student found: {student.student_id}")
    except Student.DoesNotExist:
        print(f"❌ Student not found for user: {user.username}")
        return Response({
            'error': 'User is not registered as a student. Please complete student registration first.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    source = request.data.get('source')
    destination = request.data.get('destination')
    pickup_time = request.data.get('pickup_time')  # ISO format datetime
    
    print(f"📍 Booking details: {source} → {destination} at {pickup_time}")
    
    if not all([source, destination, pickup_time]):
        return Response({
            'error': 'Missing required fields: source, destination, pickup_time'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Convert string to datetime
    try:
        pickup_datetime = datetime.fromisoformat(pickup_time.replace('Z', '+00:00'))
    except ValueError:
        return Response({
            'error': 'Invalid pickup_time format. Use ISO format.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    booking = Booking.objects.create(
        student=student,
        source=source,
        destination=destination,
        pickup_time=pickup_datetime,
        status='pending'
    )
    
    print(f"✅ Booking created: #{booking.id}")
    
    return Response({
        'message': 'Booking created successfully',
        'booking': {
            'id': booking.id,
            'source': booking.source,
            'destination': booking.destination,
            'pickup_time': booking.pickup_time.isoformat(),
            'status': booking.status,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_bookings(request):
    """Get all bookings for the current student"""
    user = request.user
    
    try:
        student = Student.objects.get(user=user)
    except Student.DoesNotExist:
        return Response({
            'error': 'User is not registered as a student'
        }, status=status.HTTP_403_FORBIDDEN)
    
    bookings = Booking.objects.filter(student=student).order_by('-created_at')
    
    bookings_data = [{
        'id': b.id,
        'source': b.source,
        'destination': b.destination,
        'pickup_time': b.pickup_time.isoformat(),
        'status': b.status,
        'created_at': b.created_at.isoformat(),
    } for b in bookings]
    
    return Response({
        'bookings': bookings_data,
        'count': len(bookings_data)
    })


# ============================================
# DRIVER ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_driver_location(request):
    """Receive and store driver's GPS location (AUTHENTICATED)"""
    user = request.user
    
    # Check if user is a driver
    try:
        driver = Driver.objects.get(user=user)
    except Driver.DoesNotExist:
        return Response({
            'error': 'User is not registered as a driver'
        }, status=status.HTTP_403_FORBIDDEN)
    
    latitude = request.data.get('lat')
    longitude = request.data.get('lng')
    speed = request.data.get('speed', 0)
    
    if not all([latitude, longitude]):
        return Response({
            'error': 'Missing latitude or longitude'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Update driver's current location
    driver.current_latitude = latitude
    driver.current_longitude = longitude
    driver.last_location_update = timezone.now()
    driver.save()
    
    # Get driver's assigned bus
    try:
        bus = Bus.objects.get(driver=driver, is_active=True)
        
        # Save location history
        location = BusLocation.objects.create(
            bus=bus,
            latitude=latitude,
            longitude=longitude,
            speed=speed
        )
        
        print(f"📍 Location saved: Bus {bus.bus_number} at ({latitude}, {longitude})")
        
        return Response({
            'message': 'Location updated successfully',
            'data': {
                'bus_number': bus.bus_number,
                'latitude': str(location.latitude),
                'longitude': str(location.longitude),
                'timestamp': location.timestamp.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Bus.DoesNotExist:
        # If no bus assigned, still save driver location
        print(f"📍 Driver location updated (no bus assigned): ({latitude}, {longitude})")
        return Response({
            'message': 'Driver location updated (no bus assigned)',
            'data': {
                'latitude': str(latitude),
                'longitude': str(longitude),
            }
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_location_public(request):
    """PUBLIC endpoint for testing location tracking without auth"""
    driver_id = request.data.get('driverId')
    lat = request.data.get('lat')
    lng = request.data.get('lng')
    
    print(f"📍 PUBLIC: Received location from driver {driver_id}: ({lat}, {lng})")
    
    return Response({
        'message': '✅ Location received successfully',
        'data': {
            'driverId': driver_id,
            'latitude': lat,
            'longitude': lng,
            'timestamp': datetime.now().isoformat()
        }
    }, status=status.HTTP_201_CREATED)


# ============================================
# ADMIN ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_bus_locations(request):
    """Get latest location of all active buses"""
    buses = Bus.objects.filter(is_active=True)
    
    locations_data = []
    for bus in buses:
        latest_location = BusLocation.objects.filter(bus=bus).order_by('-timestamp').first()
        
        if latest_location:
            locations_data.append({
                'bus_number': bus.bus_number,
                'latitude': str(latest_location.latitude),
                'longitude': str(latest_location.longitude),
                'speed': latest_location.speed,
                'timestamp': latest_location.timestamp.isoformat(),
                'driver': bus.driver.driver_id if bus.driver else None,
            })
    
    return Response({
        'buses': locations_data,
        'count': len(locations_data),
        'timestamp': datetime.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pending_bookings(request):
    """Get all pending bookings (for admin to assign)"""
    bookings = Booking.objects.filter(status='pending').order_by('pickup_time')
    
    bookings_data = [{
        'id': b.id,
        'student_id': b.student.student_id,
        'source': b.source,
        'destination': b.destination,
        'pickup_time': b.pickup_time.isoformat(),
        'created_at': b.created_at.isoformat(),
    } for b in bookings]
    
    return Response({
        'bookings': bookings_data,
        'count': len(bookings_data)
    })