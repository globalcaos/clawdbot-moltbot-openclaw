import sys
import os
import json
from linkedin_api import Linkedin

def get_messages(limit=10):
    username = os.getenv("LINKEDIN_USERNAME")
    password = os.getenv("LINKEDIN_PASSWORD")
    if not username or not password:
        print("Error: LINKEDIN_USERNAME or LINKEDIN_PASSWORD not set.")
        return

    try:
        api = Linkedin(username, password)
        messages = api.get_conversations(limit=limit)
        print(json.dumps(messages, indent=2))
    except Exception as e:
        print(f"Error getting messages: {e}")

if __name__ == "__main__":
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    get_messages(limit)
