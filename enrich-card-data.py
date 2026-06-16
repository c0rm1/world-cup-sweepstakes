#!/usr/bin/env python3
"""
Enrich card data with team and match information
Uses match data to match players to teams
"""

import json
import csv
from pathlib import Path

MATCH_DATA_CANDIDATES = [
    Path('data/worldcup-data.json'),
    Path('data/games.json')
]

def load_match_data():
    for path in MATCH_DATA_CANDIDATES:
        if not path.exists():
            continue

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if path.name == 'games.json':
            games = data.get('games', [])
            normalized_matches = []
            for game in games:
                normalized_matches.append({
                    'team1': game.get('home_team_code') or game.get('home_team_name_en') or game.get('home_team_label'),
                    'team2': game.get('away_team_code') or game.get('away_team_name_en') or game.get('away_team_label'),
                    'home_scorers': game.get('home_scorers', ''),
                    'away_scorers': game.get('away_scorers', ''),
                    'status': 'FT' if game.get('finished') == 'TRUE' else game.get('time_elapsed'),
                    'date': game.get('local_date', '')
                })
            return {'matches': normalized_matches}

        return data

    raise FileNotFoundError('No supported match data file found')

match_data = load_match_data()

cards = []
with open('data/worldcup-cards.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    cards = list(reader)

player_team_map = {}

for match in match_data['matches']:
    team1 = match['team1']
    team2 = match['team2']

    for scorer_field, team in [(match.get('home_scorers', ''), team1), (match.get('away_scorers', ''), team2)]:
        if scorer_field and scorer_field != 'null':
            scorer_field = scorer_field.replace('{', '').replace('}', '').replace('"', '')
            scorers = scorer_field.split(',')
            for scorer in scorers:
                name_match = scorer.strip().split("'")[0].strip()
                if name_match:
                    parts = name_match.split()
                    if len(parts) > 0:
                        last_name = parts[-1]
                        player_team_map[last_name.lower()] = team

print(f"Built player-team map with {len(player_team_map)} entries")

known_players = {
    'montes': 'MEX',
    'gutiérrez': 'MEX',
    'sibisi': 'RSA',
    'sithole': 'RSA',
    'mokoena': 'RSA',
    'zwane': 'RSA',
    'gi-hyuk': 'KOR',
    'lee': 'KOR',
    'johnston': 'CAN',
    'katić': 'BIH',
    'demirović': 'BIH',
    'lukić': 'BIH',
    'abunada': 'QAT',
    'gaber': 'QAT',
    'zakaria': 'SUI',
    'ibañez': 'BRA',
    'casemiro': 'BRA',
    'bellegarde': 'HAI',
    'hickey': 'SCO',
    'mclean': 'SCO',
    'curtis': 'SCO',
    'fougerolles': 'CAN',
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
    'van': 'NED',
    'ven': 'NED',
    'summerville': 'NED',
    'depay': 'NED',
    'khedira': 'TUN',
}

enriched_cards = []
seen = set()

for card in cards:
    player = card['player']
    card_key = f"{player}_{card['card_type']}_{card['minute']}"
    if card_key in seen:
        continue
    seen.add(card_key)

    team = card['team']
    if not team:
        parts = player.split()
        if parts:
            last_name = parts[-1].lower()
            if last_name in known_players:
                team = known_players[last_name]
            elif last_name in player_team_map:
                team = player_team_map[last_name]

    match_name = card['match']
    match_date = card['date']

    if not match_name and team:
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
        'minute': card['minute'],
        'discipline_score': card.get('discipline_score', 0)
    })

with open('data/worldcup-cards-enriched.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['match', 'date', 'team', 'player', 'card_type', 'minute', 'discipline_score'])
    writer.writeheader()
    writer.writerows(enriched_cards)

print(f"\n✅ Saved {len(enriched_cards)} enriched cards (removed {len(cards) - len(enriched_cards)} duplicates)")
print(f"   Cards with team info: {sum(1 for c in enriched_cards if c['team'])}")
print(f"   Cards with match info: {sum(1 for c in enriched_cards if c['match'])}")

print("\nSample enriched data:")
for card in enriched_cards[:10]:
    print(f"  {card['match'] or 'Unknown'} - {card['team'] or '?'}: {card['player']} ({card['card_type']} {card['minute']}')")

# Made with Bob
