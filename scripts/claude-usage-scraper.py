#!/usr/bin/env python3
"""
Claude Usage Scraper
Attempts multiple methods to get Claude Max subscription usage:
1. Parse /usage output from claude CLI
2. Scrape console.anthropic.com (requires auth cookies)
3. Check response headers from API calls
"""

import json
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

USAGE_FILE = Path.home() / ".openclaw/workspace/memory/claude-usage.json"


def try_claude_cli_usage():
    """Try to get usage from Claude CLI /usage command"""
    try:
        # Try claude CLI with /usage
        result = subprocess.run(
            ["claude", "-p", "/usage"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0 and result.stdout:
            output = result.stdout.strip()
            print(f"Claude CLI output:\n{output}")
            
            # Parse the output - format varies but typically shows:
            # - Messages remaining
            # - Reset time
            # - Percentage used
            
            usage_data = {
                "source": "claude_cli",
                "raw_output": output,
                "timestamp": datetime.now().isoformat(),
                "mode": "subscription"
            }
            
            # Try to extract numbers from output
            import re
            
            # Look for percentage patterns
            pct_match = re.search(r'(\d+(?:\.\d+)?)\s*%', output)
            if pct_match:
                usage_data["used_percent"] = float(pct_match.group(1))
            
            # Look for "X remaining" or "X left"
            remaining_match = re.search(r'(\d+)\s*(?:remaining|left|messages)', output, re.I)
            if remaining_match:
                usage_data["remaining"] = int(remaining_match.group(1))
            
            # Look for reset time
            reset_match = re.search(r'resets?\s*(?:in\s*)?(\d+)\s*(hour|minute|h|m)', output, re.I)
            if reset_match:
                value = int(reset_match.group(1))
                unit = reset_match.group(2).lower()
                if unit.startswith('h'):
                    usage_data["reset_minutes"] = value * 60
                else:
                    usage_data["reset_minutes"] = value
            
            return usage_data
            
    except subprocess.TimeoutExpired:
        print("Claude CLI timed out", file=sys.stderr)
    except FileNotFoundError:
        print("Claude CLI not found", file=sys.stderr)
    except Exception as e:
        print(f"Claude CLI error: {e}", file=sys.stderr)
    
    return None


def try_claude_code_status():
    """Try claude-code /status command"""
    try:
        result = subprocess.run(
            ["claude", "/status"],
            capture_output=True,
            text=True,
            timeout=15,
            input=""
        )
        
        if result.stdout:
            return {
                "source": "claude_status",
                "raw_output": result.stdout.strip(),
                "timestamp": datetime.now().isoformat(),
                "mode": "subscription"
            }
    except Exception as e:
        print(f"Claude status error: {e}", file=sys.stderr)
    
    return None


def try_api_headers():
    """
    Make a minimal API call and check rate limit headers.
    Note: This only works for API credits, not subscription.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("No ANTHROPIC_API_KEY set", file=sys.stderr)
        return None
    
    try:
        import urllib.request
        import urllib.error
        
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1,
                "messages": [{"role": "user", "content": "hi"}]
            }).encode(),
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01"
            }
        )
        
        with urllib.request.urlopen(req) as response:
            headers = dict(response.headers)
            
            # Extract rate limit headers
            rate_info = {}
            for key, value in headers.items():
                if 'ratelimit' in key.lower():
                    rate_info[key] = value
            
            if rate_info:
                return {
                    "source": "api_headers",
                    "headers": rate_info,
                    "timestamp": datetime.now().isoformat(),
                    "mode": "api"  # This is API, not subscription
                }
                
    except urllib.error.HTTPError as e:
        # Even on error, we might get rate limit headers
        headers = dict(e.headers) if e.headers else {}
        rate_info = {k: v for k, v in headers.items() if 'ratelimit' in k.lower()}
        if rate_info:
            return {
                "source": "api_headers_error",
                "headers": rate_info,
                "http_status": e.code,
                "timestamp": datetime.now().isoformat(),
                "mode": "api"
            }
    except Exception as e:
        print(f"API headers error: {e}", file=sys.stderr)
    
    return None


def save_usage(data):
    """Save usage data to JSON file"""
    USAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Load existing data to preserve history
    existing = {}
    if USAGE_FILE.exists():
        try:
            existing = json.loads(USAGE_FILE.read_text())
        except:
            pass
    
    # Update with new data
    existing.update(data)
    existing["last_updated"] = datetime.now().isoformat()
    
    USAGE_FILE.write_text(json.dumps(existing, indent=2))
    print(f"Saved to {USAGE_FILE}")
    return existing


def main():
    print("=" * 50)
    print("Claude Usage Scraper")
    print("=" * 50)
    
    results = {}
    
    # Try each method
    print("\n[1] Trying Claude CLI /usage...")
    cli_data = try_claude_cli_usage()
    if cli_data:
        results["cli"] = cli_data
        print(f"  ✓ Got CLI data")
    else:
        print(f"  ✗ CLI failed")
    
    print("\n[2] Trying Claude /status...")
    status_data = try_claude_code_status()
    if status_data:
        results["status"] = status_data
        print(f"  ✓ Got status data")
    else:
        print(f"  ✗ Status failed")
    
    print("\n[3] Trying API headers...")
    api_data = try_api_headers()
    if api_data:
        results["api"] = api_data
        print(f"  ✓ Got API headers")
    else:
        print(f"  ✗ API headers failed")
    
    # Save results
    if results:
        saved = save_usage(results)
        print("\n" + "=" * 50)
        print("RESULTS:")
        print(json.dumps(saved, indent=2))
    else:
        print("\n✗ All methods failed. Manual tracking required.")
        
        # Create a template file
        template = {
            "mode": "subscription",
            "tier": "max_20x",
            "note": "Manual tracking - update via /usage in Claude Code",
            "last_updated": datetime.now().isoformat()
        }
        save_usage(template)


if __name__ == "__main__":
    main()
