#!/usr/bin/env python3
"""
Build correct group assignments and fixtures from worldcup26.ir API data.
This will generate the proper JavaScript code for script.js
"""

import json
from collections import defaultdict

# Load teams data
with open('worldcup2026-teams.json', 'r') as f:
    teams_data = json.load(f)

# Load schedule data
with open('worldcup2026-schedule.json', 'r') as f:
    schedule_data = json.load(f)

print("=" * 80)
print("BUILDING CORRECT WORLD CUP 2026 GROUPS")
print("=" * 80)

# Build groups from teams data
groups = defaultdict(list)
team_codes = {}  # Map full name to FIFA code

for team in teams_data['teams']:
    group = team['groups']
    fifa_code = team['fifa_code']
    full_name = team['name_en']
    
    groups[group].append(fifa_code)
    team_codes[full_name] = fifa_code

# Sort groups
groups = dict(sorted(groups.items()))

print("\n📋 CORRECT GROUP ASSIGNMENTS:")
print("-" * 80)
for group, teams in groups.items():
    print(f"Group {group}: {', '.join(teams)}")

print(f"\n📊 Total: {len(groups)} groups, {sum(len(t) for t in groups.values())} teams")

# Generate JavaScript for groups
print("\n" + "=" * 80)
print("JAVASCRIPT CODE - REPLACE IN script.js (line ~140)")
print("=" * 80)
print("\n// Group assignments (World Cup 2026 - CORRECT from API)")
print("const groups = {")
for group, teams in groups.items():
    teams_str = "', '".join(teams)
    print(f"    '{group}': ['{teams_str}'],")
print("};")

# Build all fixtures with team codes
print("\n" + "=" * 80)
print("ALL FIXTURES WITH TEAM CODES")
print("=" * 80)

fixtures = []
for game in schedule_data['games']:
    home_name = game.get('home_team_name_en', game.get('home_team_label', ''))
    away_name = game.get('away_team_name_en', game.get('away_team_label', ''))
    
    home_code = team_codes.get(home_name, home_name)
    away_code = team_codes.get(away_name, away_name)
    
    fixture = {
        'id': game['id'],
        'group': game['group'],
        'type': game['type'],
        'matchday': game['matchday'],
        'home': home_code,
        'away': away_code,
        'home_full': home_name,
        'away_full': away_name,
        'date': game['local_date'],
        'home_score': game['home_score'],
        'away_score': game['away_score'],
        'finished': game['finished'] == 'TRUE',
        'home_scorers': game.get('home_scorers', 'null'),
        'away_scorers': game.get('away_scorers', 'null')
    }
    fixtures.append(fixture)

# Show sample fixtures
print("\n📅 SAMPLE GROUP STAGE FIXTURES:")
print("-" * 80)
group_fixtures = [f for f in fixtures if f['type'] == 'group'][:15]
for f in group_fixtures:
    status = "✓" if f['finished'] else "○"
    score = f"{f['home_score']}-{f['away_score']}" if f['finished'] else "vs"
    print(f"{status} Group {f['group']}, MD{f['matchday']}: {f['home']} {score} {f['away']} ({f['date']})")

# Save complete data
output = {
    'groups': groups,
    'team_codes': team_codes,
    'fixtures': fixtures,
    'lastUpdated': '2026-06-15T14:00:00Z'
}

with open('worldcup2026-complete.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n✅ Saved complete data to: worldcup2026-complete.json")
print(f"   - {len(groups)} groups")
print(f"   - {len(team_codes)} teams")
print(f"   - {len(fixtures)} total fixtures")

# Generate team name to code mapping for JavaScript
print("\n" + "=" * 80)
print("TEAM NAME TO CODE MAPPING (for reference)")
print("=" * 80)
print("\nconst teamNameToCode = {")
for full_name, code in sorted(team_codes.items()):
    print(f"    '{full_name}': '{code}',")
print("};")

print("\n" + "=" * 80)
print("NEXT STEPS:")
print("=" * 80)
print("1. ✅ Groups extracted from API")
print("2. ✅ Team codes mapped (FIFA 3-letter codes)")
print("3. ✅ All fixtures processed with codes")
print("4. 📝 Update script.js with the correct groups (see JavaScript code above)")
print("5. 📝 Update scraper to use team codes instead of full names")
print("6. 📝 Update website to display groups correctly")

# Made with Bob
