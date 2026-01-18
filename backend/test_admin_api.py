import urllib.request
import urllib.parse
import json
import base64

BASE_URL = "http://localhost:8000/api"
USERNAME = "admin_user"
PASSWORD = "admin123"

def test_admin_api():
    # 1. Login
    print(f"Logging in as {USERNAME}...")
    login_url = f"{BASE_URL}/login/"
    data = json.dumps({"username": USERNAME, "password": PASSWORD}).encode('utf-8')
    
    req = urllib.request.Request(login_url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode('utf-8')
            tokens = json.loads(resp_body)
            access_token = tokens['access']
            print("Login successful. Got access token.")
    except urllib.error.HTTPError as e:
        print(f"Login failed: {e.code} {e.read().decode()}")
        return
    except Exception as e:
        print(f"Login error: {e}")
        return

    # 2. Fetch Users
    print("Fetching users...")
    users_url = f"{BASE_URL}/users/"
    req = urllib.request.Request(users_url, headers={'Authorization': f'Bearer {access_token}'})
    
    try:
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode('utf-8')
            users = json.loads(resp_body)
            print(f"Success! Found {len(users)} users.")
            print(json.dumps(users, indent=2))
    except urllib.error.HTTPError as e:
        print(f"Fetch failed: {e.code} {e.read().decode()}")
    except Exception as e:
        print(f"Fetch error: {e}")

if __name__ == "__main__":
    test_admin_api()
