import sys
import os
import json
from linkedin_api import Linkedin

def search_people(keywords, limit=5):
    username = os.getenv("LINKEDIN_USERNAME")
    password = os.getenv("LINKEDIN_PASSWORD")
    if not username or not password:
        print("Error: LINKEDIN_USERNAME or LINKEDIN_PASSWORD not set.")
        return

    try:
        api = Linkedin(username, password)
        results = api.search_people(keywords=keywords, limit=limit)
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"Error searching people: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 search_people.py <keywords> [limit]")
        sys.exit(1)
    
    keywords = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    search_people(keywords, limit)
