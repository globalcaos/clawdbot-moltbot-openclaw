# LinkedIn Skill (API-based)

This skill allows you to interact with LinkedIn programmatically using the `linkedin-api` Python library. It provides commands for searching profiles, sending connection requests, and retrieving messages.

## Setup

1.  **Install Dependencies**:
    The skill relies on `linkedin-api` (Python).

    ```bash
    pip install linkedin-api
    ```

2.  **Authentication**:
    You must provide your LinkedIn credentials in a `.env` file in the workspace root.
    Create `.env` if it doesn't exist and add:
    ```bash
    LINKEDIN_USERNAME=your_email@example.com
    LINKEDIN_PASSWORD=your_password
    ```
    _(Note: Use an app password if you have 2FA enabled, or disable 2FA temporarily for initial setup if needed, though the library supports 2FA via manual intervention in some cases.)_

## Usage

Run the provided Python scripts to perform actions.

### 1. Check Profile

Retrieves basic profile information to verify connection.

```bash
python3 skills/linkedin-browser/check_profile.py
```

### 2. Search People

Search for people by keywords.

```bash
python3 skills/linkedin-browser/search_people.py "software engineer" --limit 5
```

### 3. Send Message

Send a direct message to a connection.

```bash
python3 skills/linkedin-browser/send_message.py "recipient_urn_id" "Hello there!"
```

### 4. Get Messages

Retrieve recent conversation history.

```bash
python3 skills/linkedin-browser/get_messages.py --limit 10
```

## Rate Limiting

- Avoid aggressive scraping.
- Limit searches to ~50 per day to stay safe.
- Add delays between actions in scripts (built-in where possible).

## Troubleshooting

- If login fails with a challenge, try logging in manually in a browser first to clear security checks.
- Check `linkedin_api` documentation for advanced usage.
