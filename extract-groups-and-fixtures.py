#!/usr/bin/env python3
"""
Extract correct group assignments and all fixtures from World Cup 2026 schedule.
This will generate the proper groups and match data for the website.
"""

import json
from collections import defaultdict

# Load the schedule
with open('worldcup2026-schedule.json', 'r') as f:
    data = json.load(f)

# Extract groups and teams
groups = defaultdict(set)
all_matches = []

print("=" * 80)
print("EXTRACTING WORLD CUP 2026 GROUPS AND FIXTURES")
print("=" * 80)

# Process all group stage matches
for game in data['games']:
    if game['type'] == 'group' and game['group'] in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']:
        group = game['group']
        home_team = game.get('home_team_name_en', '')
        away_team = game.get('away_team_name_en', '')
        
        if home_team and away_team:
            groups[group].add(home_team)
            groups[group].add(away_team)
            
            # Store match info
            match_info = {
                'id': game['id'],
                'group': group,
                'matchday': game['matchday'],
                'home': home_team,
                'away': away_team,
                'date': game['local_date'],
                'home_score': game['home_score'] if game['home_score'] != '0' or game['finished'] == 'TRUE' else None,
                'away_score': game['away_score'] if game['away_score'] != '0' or game['finished'] == 'TRUE' else None,
                'finished': game['finished'] == 'TRUE',
                'home_scorers': game.get('home_scorers', 'null'),
                'away_scorers': game.get('away_scorers', 'null')
            }
            all_matches.append(match_info)

# Convert sets to sorted lists
groups_dict = {k: sorted(list(v)) for k, v in sorted(groups.items())}

print("\n📋 GROUP ASSIGNMENTS:")
print("-" * 80)
for group, teams in groups_dict.items():
    print(f"Group {group}: {', '.join(teams)}")

print(f"\n📊 Total: {len(groups_dict)} groups, {sum(len(teams) for teams in groups_dict.values())} teams")
print(f"📅 Total group stage matches: {len(all_matches)}")

# Generate JavaScript code for groups
print("\n" + "=" * 80)
print("JAVASCRIPT CODE FOR script.js")
print("=" * 80)
print("\n// REPLACE the 'const groups' section with this:\n")
print("const groups = {")
for group, teams in groups_dict.items():
    # Convert team names to 3-letter codes (you'll need to map these)
    print(f"    '{group}': {teams},")
print("};")

# Save detailed fixture list
fixtures_output = {
    'groups': groups_dict,
    'matches': all_matches,
    'lastUpdated': '2026-06-15T14:00:00Z'
}

with open('worldcup2026-fixtures.json', 'w') as f:
    json.dump(fixtures_output, f, indent=2)

print("\n✅ Saved detailed fixtures to: worldcup2026-fixtures.json")

# Show some sample matches
print("\n📅 SAMPLE MATCHES:")
print("-" * 80)
for match in all_matches[:10]:
    status = "✓" if match['finished'] else "○"
    score = f"{match['home_score']}-{match['away_score']}" if match['finished'] else "vs"
    print(f"{status} Group {match['group']}, MD{match['matchday']}: {match['home']} {score} {match['away']} ({match['date']})")

print("\n" + "=" * 80)
print("NEXT STEPS:")
print("=" * 80)
print("1. Review the groups above - these are the ACTUAL World Cup 2026 groups")
print("2. Update script.js with the correct group assignments")
print("3. Create a team code mapping (full name → 3-letter code)")
print("4. Update the scraper to populate teamStandings from live data")

# Made with Bob
