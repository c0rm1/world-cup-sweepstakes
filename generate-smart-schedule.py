#!/usr/bin/env python3
"""
Generate a smart GitHub Actions schedule that only runs during match times.
Updates every 5 minutes from match start until 2 hours after kickoff.
"""

import json
from datetime import datetime, timedelta
from collections import defaultdict

# Load the schedule
with open('worldcup2026-schedule.json', 'r') as f:
    data = json.load(f)

# Parse all match times and group by date
matches_by_date = defaultdict(list)

for game in data['games']:
    if game['finished'] == 'FALSE':  # Only future matches
        # Parse date: "06/13/2026 21:00"
        date_str = game['local_date']
        try:
            match_time = datetime.strptime(date_str, "%m/%d/%Y %H:%M")
            date_key = match_time.strftime("%Y-%m-%d")
            matches_by_date[date_key].append({
                'time': match_time,
                'home': game.get('home_team_name_en', game.get('home_team_label', 'TBD')),
                'away': game.get('away_team_name_en', game.get('away_team_label', 'TBD')),
                'group': game['group']
            })
        except:
            pass

# Sort dates
sorted_dates = sorted(matches_by_date.keys())

print("=" * 80)
print("WORLD CUP 2026 - SMART UPDATE SCHEDULE")
print("=" * 80)
print(f"\nTotal match days: {len(sorted_dates)}")
print(f"Date range: {sorted_dates[0]} to {sorted_dates[-1]}")

# Generate time windows for each day
schedule_windows = []

for date in sorted_dates:
    matches = sorted(matches_by_date[date], key=lambda x: x['time'])
    
    if not matches:
        continue
    
    # Find earliest and latest match times for the day
    first_match = matches[0]['time']
    last_match = matches[-1]['time']
    
    # Add 2 hours buffer after last match
    end_time = last_match + timedelta(hours=2)
    
    # Create window
    window = {
        'date': date,
        'start': first_match,
        'end': end_time,
        'matches': matches
    }
    schedule_windows.append(window)
    
    print(f"\n{date} ({len(matches)} matches)")
    print(f"  Active window: {first_match.strftime('%H:%M')} - {end_time.strftime('%H:%M')}")
    for match in matches:
        print(f"    {match['time'].strftime('%H:%M')} - {match['home']} vs {match['away']} (Group {match['group']})")

# Generate GitHub Actions cron expressions
print("\n" + "=" * 80)
print("GITHUB ACTIONS CRON SCHEDULE")
print("=" * 80)
print("\nRuns every 5 minutes during match windows:")

cron_expressions = []
for window in schedule_windows:
    start_hour = window['start'].hour
    end_hour = window['end'].hour
    
    # If window spans midnight, split into two cron expressions
    if end_hour < start_hour:
        # Before midnight
        cron1 = f"  - cron: '*/5 {start_hour}-23 {window['start'].day} {window['start'].month} *'  # {window['date']} part 1"
        # After midnight
        cron2 = f"  - cron: '*/5 0-{end_hour} {window['end'].day} {window['end'].month} *'  # {window['date']} part 2"
        cron_expressions.append(cron1)
        cron_expressions.append(cron2)
        print(cron1)
        print(cron2)
    else:
        cron = f"  - cron: '*/5 {start_hour}-{end_hour} {window['start'].day} {window['start'].month} *'  # {window['date']}"
        cron_expressions.append(cron)
        print(cron)

# Generate the complete workflow file
workflow_content = f"""name: Update World Cup Data (Smart Schedule)

on:
  schedule:
    # Runs every 5 minutes during match windows (from kickoff until 2 hours after)
{chr(10).join(cron_expressions)}
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-data:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          token: ${{{{ secrets.GITHUB_TOKEN }}}}
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      
      - name: Install dependencies
        run: |
          pip install requests
      
      - name: Run scraper
        run: |
          python scrape-worldcup26.py
      
      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Actions Bot'
          git config --global user.email 'actions@github.com'
          git add data/worldcup-data.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "Update World Cup data [automated]" && git push)
"""

# Save the workflow
with open('.github/workflows/update-worldcup26-smart.yml', 'w') as f:
    f.write(workflow_content)

print("\n" + "=" * 80)
print("WORKFLOW FILE GENERATED")
print("=" * 80)
print("\nSaved to: .github/workflows/update-worldcup26-smart.yml")
print("\nThis workflow will:")
print("  ✓ Run every 5 minutes during match times")
print("  ✓ Continue for 2 hours after each match ends")
print("  ✓ Only activate on days with scheduled matches")
print("  ✓ Automatically commit and push updates")
print("\nTo activate: Push this file to your GitHub repository")

# Made with Bob
