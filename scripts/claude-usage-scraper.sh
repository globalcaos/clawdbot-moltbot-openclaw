#!/bin/bash
# Claude Usage Scraper - Shell version
# Tries to get usage from Claude CLI without hanging

USAGE_FILE="$HOME/.openclaw/workspace/memory/claude-usage.json"
TIMESTAMP=$(date -Iseconds)

echo "Claude Usage Scraper"
echo "===================="

# Method 1: Try claude --version to check if CLI exists
if command -v claude &> /dev/null; then
    echo "✓ Claude CLI found"
    
    # Try to get usage - use timeout to prevent hanging
    echo "Attempting to get usage (timeout 10s)..."
    USAGE_OUTPUT=$(timeout 10s claude -p "/usage" 2>&1 || echo "TIMEOUT_OR_ERROR")
    
    if [[ "$USAGE_OUTPUT" != "TIMEOUT_OR_ERROR" && -n "$USAGE_OUTPUT" ]]; then
        echo "✓ Got usage output:"
        echo "$USAGE_OUTPUT"
        
        # Save to JSON
        cat > "$USAGE_FILE" << EOF
{
  "mode": "subscription",
  "tier": "max_20x",
  "source": "claude_cli",
  "raw_output": $(echo "$USAGE_OUTPUT" | jq -Rs .),
  "last_updated": "$TIMESTAMP"
}
EOF
        echo "✓ Saved to $USAGE_FILE"
    else
        echo "✗ CLI timed out or errored"
    fi
else
    echo "✗ Claude CLI not found"
fi

# Method 2: Check if we have the session key for potential scraping
if [[ -n "$CLAUDE_AI_SESSION_KEY" ]]; then
    echo "✓ CLAUDE_AI_SESSION_KEY is set (can attempt console scraping)"
else
    echo "✗ No session key for console scraping"
fi

# Create/update usage file with subscription info
if [[ ! -f "$USAGE_FILE" ]]; then
    cat > "$USAGE_FILE" << EOF
{
  "mode": "subscription",
  "tier": "max_20x",
  "note": "Claude Max subscription - check /usage in Claude Code for current limits",
  "window_hours": 5,
  "last_updated": "$TIMESTAMP"
}
EOF
    echo "Created template at $USAGE_FILE"
fi

echo ""
echo "Current usage file:"
cat "$USAGE_FILE" 2>/dev/null || echo "(file not found)"
