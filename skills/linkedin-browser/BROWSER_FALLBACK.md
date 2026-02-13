# LinkedIn Browser Automation (Fallback)

If the API method fails (e.g., due to 2FA or CAPTCHA), use this browser-based approach.

## Setup

1.  **Open Browser**:
    Launch the OpenClaw browser and navigate to LinkedIn manually to log in.

    ```bash
    openclaw browser open https://www.linkedin.com/messaging/
    ```

2.  **Verify Login**:
    Ensure you are logged in and can see your messages.

## Usage

Use OpenClaw's `browser` tool to interact with LinkedIn directly.

### 1. Check Inbox

Navigate to messaging and snapshot the page.

```bash
openclaw browser navigate https://www.linkedin.com/messaging/
openclaw browser snapshot
```

### 2. Read Conversation

Click on a conversation to read messages.

```bash
openclaw browser act click "conversation_selector"
openclaw browser snapshot
```

### 3. Draft Reply

Type a reply into the message box.

```bash
openclaw browser act type "message_box_selector" "Hello!"
```

_(Note: sending messages via browser automation is risky; draft only unless approved)_
