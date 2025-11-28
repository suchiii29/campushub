# api/models.py - COMPLETE VERSION

from django.db import models
from django.contrib.auth.models import User

# ============================================
# USER MODELS
# ============================================

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firebase_uid = models.CharField(max_length=128, unique=True)
    student_id = models.CharField(max_length=20, unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_id} - {self.user.username}"


class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firebase_uid = models.CharField(max_length=128, unique=True)
    driver_id = models.CharField(max_length=20, unique=True)
    license_number = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)
    is_available = models.BooleanField(default=True)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.driver_id} - {self.user.username}"


# ============================================
# BUS & ROUTE MODELS
# ============================================

class Bus(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Maintenance'),
        ('inactive', 'Inactive'),
    ]
    
    bus_number = models.CharField(max_length=20, unique=True)
    capacity = models.IntegerField(default=50)
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_buses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bus {self.bus_number}"

    class Meta:
        verbose_name_plural = "Buses"


class Route(models.Model):
    name = models.CharField(max_length=100)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    stops = models.JSONField(default=list)  # List of stop names
    estimated_duration = models.IntegerField(help_text="Duration in minutes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}: {self.source} → {self.destination}"


# ============================================
# LOCATION TRACKING
# ============================================

class BusLocation(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='locations')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed = models.FloatField(default=0.0, help_text="Speed in km/h")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bus {self.bus.bus_number} at ({self.latitude}, {self.longitude})"

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['bus', '-timestamp']),
        ]


# ============================================
# BOOKING & TRIP MANAGEMENT
# ============================================

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='bookings')
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    pickup_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.student.student_id}: {self.source} → {self.destination}"

    class Meta:
        ordering = ['-created_at']


class Trip(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='trips')
    bookings = models.ManyToManyField(Booking, related_name='trips', blank=True)
    scheduled_time = models.DateTimeField()
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    passenger_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip #{self.id} - {self.bus.bus_number} on {self.route.name}"

    class Meta:
        ordering = ['-scheduled_time']