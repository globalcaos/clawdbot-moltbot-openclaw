import os
from linkedin_api import Linkedin

username = os.getenv("LINKEDIN_USERNAME")
password = os.getenv("LINKEDIN_PASSWORD")

if not username or not password:
    print("Error: LINKEDIN_USERNAME or LINKEDIN_PASSWORD not set in environment.")
    exit(1)

try:
    api = Linkedin(username, password)
    profile = api.get_user_profile()
    print(f"Successfully connected! User: {profile.get('firstName', 'Unknown')} {profile.get('lastName', 'Unknown')}")
except Exception as e:
    print(f"Failed to connect: {e}")
