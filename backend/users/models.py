from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='banners/', blank=True, null=True)
    is_flagged = models.BooleanField(default=False)


class Education(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    start_year = models.IntegerField()
    end_year = models.IntegerField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    cgpa = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.degree} at {self.institution}"

class JobHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_history')
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.role} at {self.company}"

class Skill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=50, blank=True) # e.g., Beginner, Intermediate, Expert

    def __str__(self):
        return self.name

class Certification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=255, blank=True)
    credential_url = models.URLField(blank=True)

    def __str__(self):
        return self.name

class CareerPrediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='career_predictions')
    predicted_role = models.CharField(max_length=255)
    match_percentage = models.FloatField()
    missing_skills = models.TextField(blank=True) # Comma-separated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_flagged = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.user.username} - {self.predicted_role}"

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback')
    message = models.TextField()
    rating = models.IntegerField(default=5) # 1-5 stars
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.user.username}"

class SupportTicket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=255)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"

class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin_reply = models.BooleanField(default=False) # Helper to distinguish UI styling easily
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message in #{self.ticket.id} by {self.sender.username}"
