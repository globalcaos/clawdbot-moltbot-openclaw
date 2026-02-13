import sys
import os
import json
from linkedin_api import Linkedin

def send_message(recipient_urn, message):
    username = os.getenv("LINKEDIN_USERNAME")
    password = os.getenv("LINKEDIN_PASSWORD")
    if not username or not password:
        print("Error: LINKEDIN_USERNAME or LINKEDIN_PASSWORD not set.")
        return

    try:
        api = Linkedin(username, password)
        result = api.send_message(message_body=message, recipient_urn_id=recipient_urn)
        print(f"Message sent to {recipient_urn}. Status: {result}")
    except Exception as e:
        print(f"Error sending message: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 send_message.py <recipient_urn> <message>")
        sys.exit(1)
    
    recipient_urn = sys.argv[1]
    message = sys.argv[2]
    send_message(recipient_urn, message)
