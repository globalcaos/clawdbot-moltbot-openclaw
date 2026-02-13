import sys
import os
import json
from linkedin_api import Linkedin

def check_profile():
    username = os.getenv("LINKEDIN_USERNAME")
    password = os.getenv("LINKEDIN_PASSWORD")
    if not username or not password:
        print("Error: LINKEDIN_USERNAME or LINKEDIN_PASSWORD not set.")
        return

    try:
        api = Linkedin(username, password)
        profile = api.get_user_profile()
        print(json.dumps(profile, indent=2))
    except Exception as e:
        print(f"Error checking profile: {e}")

if __name__ == "__main__":
    check_profile()
