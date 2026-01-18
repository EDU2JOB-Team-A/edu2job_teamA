import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu2job_backend.settings')
django.setup()

from users.models import User

# User provided credentials
username = "admin_user" # using a different username to avoid conflict with 'admin'
email = "admin@gmail.com"
password = "admin123"

try:
    if User.objects.filter(email=email).exists():
        print(f"User with email '{email}' already exists.")
        user = User.objects.get(email=email)
        user.set_password(password)
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Updated user '{user.username}' to be an admin with new password.")
    elif User.objects.filter(username=username).exists():
        # Fallback if username taken but email not
        print(f"User '{username}' exists. Creating specific admin username.")
        username = "admin_user_2"
        user = User.objects.create_user(username=username, email=email, password=password)
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Created new admin user: {username}")
    else:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Created new admin user: {username}")

    print(f"\nNew Admin Credentials:")
    print(f"Username: {user.username}")
    print(f"Email: {email}")
    print(f"Password: {password}")

except Exception as e:
    print(f"Error creating admin: {e}")
