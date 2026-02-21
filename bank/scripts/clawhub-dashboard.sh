#!/usr/bin/env bash
# ClawHub Skills Dashboard - Fast programmatic scrape
# Usage: ./clawhub-dashboard.sh
# Outputs: TSV table with all skill stats
# Scan verdicts require browser (not available via API)

set -euo pipefail

SKILLS=(
  jarvis-voice
  whatsapp-ultimate
  youtube-ultimate
  agent-memory-ultimate
  chatgpt-exporter-ultimate
  agent-boundaries-ultimate
  token-panel-ultimate
  shell-security-ultimate
  ai-humor-ultimate
  outlook-hack
  token-efficiency-guide
  fork-and-skill-scanner-ultimate
  memory-pioneer
)

# Humor grades (Marketia, Feb 21 2026)
declare -A HUMOR=(
  [jarvis-voice]=7
  [whatsapp-ultimate]=9
  [youtube-ultimate]=7  # boosted from 5
  [agent-memory-ultimate]=7
  [chatgpt-exporter-ultimate]=7  # boosted from 3
  [agent-boundaries-ultimate]=7
  [token-panel-ultimate]=5
  [shell-security-ultimate]=6
  [ai-humor-ultimate]=8
  [outlook-hack]=8
  [token-efficiency-guide]=6
  [fork-and-skill-scanner-ultimate]=6
  [memory-pioneer]=6  # boosted from 4
)

echo ""
printf "%-28s %8s %6s %6s %6s %5s %5s\n" "Skill" "Version" "Views" "Inst" "Stars" "Humor" "Cmts"
printf "%-28s %8s %6s %6s %6s %5s %5s\n" "----------------------------" "--------" "------" "------" "------" "-----" "-----"

total_views=0
total_inst=0
total_stars=0

for slug in "${SKILLS[@]}"; do
  json=$(clawhub inspect "$slug" --json 2>/dev/null || echo '{}')
  
  version=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('latestVersion',{}).get('version','?'))" 2>/dev/null || echo "?")
  downloads=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('skill',{}).get('stats',{}).get('downloads',0))" 2>/dev/null || echo "0")
  installs=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('skill',{}).get('stats',{}).get('installsAllTime',0))" 2>/dev/null || echo "0")
  stars=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('skill',{}).get('stats',{}).get('stars',0))" 2>/dev/null || echo "0")
  comments=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('skill',{}).get('stats',{}).get('comments',0))" 2>/dev/null || echo "0")
  humor=${HUMOR[$slug]:-"?"}
  
  total_views=$((total_views + downloads))
  total_inst=$((total_inst + installs))
  total_stars=$((total_stars + stars))
  
  printf "%-28s %8s %6s %6s %6s %5s %5s\n" "$slug" "$version" "$downloads" "$installs" "$stars" "$humor" "$comments"
done

echo ""
printf "%-28s %8s %6s %6s %6s\n" "TOTALS" "" "$total_views" "$total_inst" "$total_stars"
echo ""
echo "Note: VT/OC scan verdicts require browser scraping (not available via API)"
echo "Run: bank/scripts/clawhub-scan-browser.js for scan data"
