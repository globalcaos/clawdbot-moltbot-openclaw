# New chat

**ID:** 698439cc-0ce0-8392-be90-2f04a996419c
**Created:** 2026-02-05T06:33:54

---

## You

How to configure brave api key

---

## ChatGPT

Here's the **exact, minimal path** to configure a **Brave API key** (for **Brave Search API**) and start using it.

---

## 1. Create a Brave Search API key

1. Go to **Brave Search API dashboard**  
   https://api.search.brave.com/

2. Sign in with a Brave account (or create one).

3. In the dashboard, **create a new API key**.
   - You'll get a string like:  
     `BSA-xxxxxxxxxxxxxxxxxxxx`

4. Copy the key — you won't want to regenerate it unless needed.

---

## 2. Understand the limits (important)

Brave Search API uses **request-based quotas**, not tokens.

Typical tiers (may vary):
- **Free**: ~2,000 requests/month
- **Paid**: higher monthly limits + higher RPM

Each HTTP request = **1 query**, regardless of result size.

---

## 3. Configure the API key (system-wide)

### Option A — Environment variable (recommended)

```bash
export BRAVE_API_KEY="BSA-xxxxxxxxxxxxxxxx"
```

Persist it:
```bash
echo 'export BRAVE_API_KEY="BSA-xxxxxxxxxxxxxxxx"' >> ~/.bashrc
source ~/.bashrc
```

---

### Option B — `.env` file (projects)

```env
BRAVE_API_KEY=BSA-xxxxxxxxxxxxxxxx
```

Then load it in your app.

---

## 4. Make a test request (curl)

```bash
curl -X GET "https://api.search.brave.com/res/v1/web/search?q=robotics+AGV" \
  -H "Accept: application/json" \
  -H "X-Subscription-Token: $BRAVE_API_KEY"
```

If it works, you'll receive JSON with:
- `web.results`
- `news`
- `videos`
- `discussions`

---

## 5. Minimal Python example

```python
import os
import requests

API_KEY = os.getenv("BRAVE_API_KEY")

url = "https://api.search.brave.com/res/v1/web/search"
params = {
    "q": "industrial AGV safety standards",
    "count": 5
}

headers = {
    "Accept": "application/json",
    "X-Subscription-Token": API_KEY
}

r = requests.get(url, params=params, headers=headers)
r.raise_for_status()
print(r.json())
```

---

## 6. Usage monitoring (what you **can't** do)

Brave currently:
- ❌ No public **usage/remaining quota API**
- ❌ No per-key usage endpoint

**Best practice**:
- Track requests client-side
- Add a rolling counter (per day / per month)
- Hard-stop when approaching your quota
