#!/usr/bin/env python3
"""
Enrich card data with team and match information
Uses worldcup-data.json to match players to teams
"""

import json
import csv
from difflib import get_close_matches

# Load match data
with open('data/worldcup-data.json', 'r') as f:
    match_data = json.load(f)

# Load card data
cards = []
with open('data/worldcup-cards.csv', 'r') as f:
    reader = csv.DictReader(f)
    cards = list(reader)

# Build player-to-team mapping from match scorers
player_team_map = {}

for match in match_data['matches']:
    team1 = match['team1']
    team2 = match['team2']
    
    # Extract player names from scorers
    for scorer_field, team in [(match.get('home_scorers', ''), team1), 
                                (match.get('away_scorers', ''), team2)]:
        if scorer_field and scorer_field != 'null':
            # Parse scorer strings like '{"Nestory Irankunda 27'","C. Metcalfe 75'"}'
            scorer_field = scorer_field.replace('{', '').replace('}', '').replace('"', '')
            scorers = scorer_field.split(',')
            for scorer in scorers:
                # Extract name (before the minute)
                name_match = scorer.strip().split("'")[0].strip()
                if name_match:
                    # Get last name for matching
                    parts = name_match.split()
                    if len(parts) > 0:
                        last_name = parts[-1]
                        player_team_map[last_name.lower()] = team

print(f"Built player-team map with {len(player_team_map)} entries")

# Common player last names to team mapping (from known World Cup squads)
# This helps with players who haven't scored
known_players = {
    # Group A - Mexico, South Africa, South Korea, Czech Republic
    'montes': 'MEX',
    'gutiérrez': 'MEX',
    'sibisi': 'RSA',
    'sithole': 'RSA',
    'mokoena': 'RSA',
    'zwane': 'RSA',
    'gi-hyuk': 'KOR',
    'lee': 'KOR',
    
    # Group B - Canada, Bosnia, Qatar, Switzerland
    'johnston': 'CAN',
    'katić': 'BIH',
    'demirović': 'BIH',
    'lukić': 'BIH',
    'abunada': 'QAT',
    'gaber': 'QAT',
    'zakaria': 'SUI',
    
    # Group C - Brazil, Morocco, Haiti, Scotland
    'ibañez': 'BRA',
    'casemiro': 'BRA',
    'bellegarde': 'HAI',
    'hickey': 'SCO',
    'mclean': 'SCO',
    'curtis': 'SCO',
    
    # Group D - Australia, Turkey, Germany, Curaçao
    'fougerolles': 'CUW',
    
    # Group E - USA, Paraguay, Ivory Coast, Ecuador
    'adams': 'USA',
    'cáceres': 'PAR',
    'alonso': 'PAR',
    'gómez': 'PAR',
    'almirón': 'PAR',
    'arce': 'PAR',
    'akgün': 'TUR',
    'doué': 'CIV',
    'kessié': 'CIV',
    'fofana': 'CIV',
    'porozo': 'ECU',
    
    # Group F - Netherlands, Japan, Sweden, Tunisia
    'van de ven': 'NED',
    'ven': 'NED',
    'summerville': 'NED',
    'depay': 'NED',
    'khedira': 'TUN',
}

# Enrich cards
enriched_cards = []
seen = set()  # Track duplicates

for card in cards:
    player = card['player']
    
    # Skip if we've seen this exact card
    card_key = f"{player}_{card['card_type']}_{card['minute']}"
    if card_key in seen:
        continue
    seen.add(card_key)
    
    # Try to find team
    team = card['team']
    if not team:
        # Try last name matching
        parts = player.split()
        if parts:
            last_name = parts[-1].lower()
            
            # Check known players first
            if last_name in known_players:
                team = known_players[last_name]
            # Then check scorer map
            elif last_name in player_team_map:
                team = player_team_map[last_name]
    
    # Try to find match
    match_name = card['match']
    match_date = card['date']
    
    if not match_name and team:
        # Find matches involving this team
        for match in match_data['matches']:
            if match['status'] == 'FT' and (match['team1'] == team or match['team2'] == team):
                match_name = f"{match['team1']} vs {match['team2']}"
                match_date = match.get('date', '')
                break
    
    enriched_cards.append({
        'match': match_name,
        'date': match_date,
        'team': team,
        'player': player,
        'card_type': card['card_type'],
        'minute': card['minute']
    })

# Save enriched data
with open('data/worldcup-cards-enriched.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['match', 'date', 'team', 'player', 'card_type', 'minute'])
    writer.writeheader()
    writer.writerows(enriched_cards)

print(f"\n✅ Saved {len(enriched_cards)} enriched cards (removed {len(cards) - len(enriched_cards)} duplicates)")
print(f"   Cards with team info: {sum(1 for c in enriched_cards if c['team'])}")
print(f"   Cards with match info: {sum(1 for c in enriched_cards if c['match'])}")

# Show sample
print("\nSample enriched data:")
for card in enriched_cards[:10]:
    print(f"  {card['match'] or 'Unknown'} - {card['team'] or '?'}: {card['player']} ({card['card_type']} {card['minute']}')")

# Made with Bob
