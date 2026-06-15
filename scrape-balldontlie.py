#!/usr/bin/env python3
"""
World Cup 2026 Data Scraper using balldontlie.io FIFA API
FREE API with complete World Cup data!
"""

import requests
import json
from datetime import datetime
from collections import defaultdict

# BallDontLie FIFA API Configuration (FREE!)
BASE_URL = "https://fifa.balldontlie.io/api/v1"

# Team code mapping
TEAM_CODE_MAP = {
    'United States': 'USA', 'USA': 'USA',
    'Mexico': 'MEX', 'Canada': 'CAN',
    'Cape Verde': 'CPV', 'Brazil': 'BRA',
    'Argentina': 'ARG', 'Uruguay': 'URU',
    'Colombia': 'COL', 'Germany': 'GER',
    'Spain': 'ESP', 'Netherlands': 'NED',
    'Switzerland': 'SUI', 'France': 'FRA',
    'England': 'ENG', 'Belgium': 'BEL',
    'Portugal': 'POR', 'Croatia': 'CRO',
    'Sweden': 'SWE', 'Algeria': 'ALG',
    'Senegal': 'SEN', 'Morocco': 'MAR',
    'Egypt': 'EGY', 'Tunisia': 'TUN',
    'Iran': 'IRN', 'Japan': 'JPN',
    'South Korea': 'KOR', 'Korea Republic': 'KOR',
    'Australia': 'AUS', 'Qatar': 'QAT',
    'Ivory Coast': 'CIV', "Côte d'Ivoire": 'CIV',
    'Ghana': 'GHA', 'DR Congo': 'COD',
    'South Africa': 'RSA', 'Paraguay': 'PAR',
    'Norway': 'NOR', 'Haiti': 'HAI',
    'Panama': 'PAN', 'Saudi Arabia': 'KSA',
    'Scotland': 'SCO', 'Austria': 'AUT',
    'Uzbekistan': 'UZB', 'Ecuador': 'ECU',
    'New Zealand': 'NZL', 'Jordan': 'JOR',
    'Curaçao': 'CUW', 'Curacao': 'CUW',
    'Turkey': 'TUR', 'Türkiye': 'TUR',
    'Czech Republic': 'CZE', 'Czechia': 'CZE',
    'Iraq': 'IRQ', 'Bosnia': 'BIH',
    'Bosnia and Herzegovina': 'BIH',
    'Wales': 'WAL', 'Poland': 'POL',
    'Denmark': 'DEN', 'Serbia': 'SRB',
    'Costa Rica': 'CRC'
}

def get_team_code(team_name):
    """Convert team name to 3-letter code"""
    if not team_name:
        return 'TBD'
    
    team_name = team_name.strip()
    
    # Try exact match
    if team_name in TEAM_CODE_MAP:
        return TEAM_CODE_MAP[team_name]
    
    # Try case-insensitive
    for key, value in TEAM_CODE_MAP.items():
        if key.lower() == team_name.lower():
            return value
    
    # Default
    return team_name[:3].upper()

def make_request(endpoint):
    """Make request to BallDontLie FIFA API"""
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def fetch_world_cup_matches():
    """Fetch World Cup 2026 matches"""
    print("Fetching World Cup 2026 matches from balldontlie.io...")
    
    # Try to get matches for 2026 World Cup
    data = make_request("matches?tournament=world_cup&year=2026")
    
    if data and isinstance(data, dict):
        matches = data.get('data', [])
        if matches:
            print(f"Found {len(matches)} matches")
            return matches
    
    # Try alternative endpoint
    print("Trying alternative endpoint...")
    data = make_request("world_cup/2026/matches")
    
    if data:
        if isinstance(data, list):
            print(f"Found {len(data)} matches")
            return data
        elif isinstance(data, dict) and 'matches' in data:
            matches = data['matches']
            print(f"Found {len(matches)} matches")
            return matches
    
    print("No matches found")
    return []

def transform_matches(matches):
    """Transform API matches to our format"""
    transformed = []
    match_num = 1
    
    for match in matches:
        if not match:
            continue
        
        # Extract team names
        home_team = match.get('home_team', {})
        away_team = match.get('away_team', {})
        
        if isinstance(home_team, dict):
            home_name = home_team.get('name', home_team.get('country', ''))
        else:
            home_name = str(home_team)
        
        if isinstance(away_team, dict):
            away_name = away_team.get('name', away_team.get('country', ''))
        else:
            away_name = str(away_team)
        
        home_code = get_team_code(home_name)
        away_code = get_team_code(away_name)
        
        # Extract scores
        home_score = match.get('home_score')
        away_score = match.get('away_score')
        
        # Convert to int if not None
        if home_score is not None:
            try:
                home_score = int(home_score)
            except (ValueError, TypeError):
                home_score = None
        
        if away_score is not None:
            try:
                away_score = int(away_score)
            except (ValueError, TypeError):
                away_score = None
        
        # Determine round and group
        stage = match.get('stage', match.get('round', 'group'))
        group = match.get('group')
        
        if 'group' in str(stage).lower() or group:
            round_type = 'group'
        elif 'round of 32' in str(stage).lower():
            round_type = 'round32'
        elif 'round of 16' in str(stage).lower():
            round_type = 'round16'
        elif 'quarter' in str(stage).lower():
            round_type = 'quarters'
        elif 'semi' in str(stage).lower():
            round_type = 'semis'
        elif 'final' in str(stage).lower() and 'third' not in str(stage).lower():
            round_type = 'final'
        else:
            round_type = 'group'
        
        # Status
        status = match.get('status', 'NS')
        if status in ['finished', 'complete', 'FT']:
            status = 'FT'
        elif status in ['live', 'in_progress']:
            status = 'LIVE'
        else:
            status = 'NS'
        
        transformed_match = {
            'matchNum': match_num,
            'team1': home_code,
            'team2': away_code,
            'score1': home_score,
            'score2': away_score,
            'round': round_type,
            'status': status
        }
        
        if group:
            transformed_match['group'] = str(group).upper()
        
        transformed.append(transformed_match)
        match_num += 1
    
    return transformed

def calculate_standings(matches):
    """Calculate group standings from matches"""
    groups = defaultdict(lambda: defaultdict(lambda: {
        'played': 0, 'won': 0, 'drawn': 0, 'lost': 0,
        'goalsFor': 0, 'goalsAgainst': 0, 'points': 0
    }))
    
    for match in matches:
        if match['round'] != 'group' or not match.get('group'):
            continue
        
        if match['score1'] is None or match['score2'] is None:
            continue
        
        group = match['group']
        team1 = match['team1']
        team2 = match['team2']
        score1 = match['score1']
        score2 = match['score2']
        
        # Update stats
        groups[group][team1]['played'] += 1
        groups[group][team1]['goalsFor'] += score1
        groups[group][team1]['goalsAgainst'] += score2
        
        groups[group][team2]['played'] += 1
        groups[group][team2]['goalsFor'] += score2
        groups[group][team2]['goalsAgainst'] += score1
        
        # Points
        if score1 > score2:
            groups[group][team1]['won'] += 1
            groups[group][team1]['points'] += 3
            groups[group][team2]['lost'] += 1
        elif score2 > score1:
            groups[group][team2]['won'] += 1
            groups[group][team2]['points'] += 3
            groups[group][team1]['lost'] += 1
        else:
            groups[group][team1]['drawn'] += 1
            groups[group][team1]['points'] += 1
            groups[group][team2]['drawn'] += 1
            groups[group][team2]['points'] += 1
    
    # Format output
    output = {}
    for group, teams in groups.items():
        team_list = []
        position = 1
        for team_code, stats in sorted(teams.items(), key=lambda x: x[1]['points'], reverse=True):
            team_list.append({
                'code': team_code,
                'position': position,
                **stats,
                'yellowCards': 0
            })
            position += 1
        output[group] = team_list
    
    return output

def save_data(matches, groups):
    """Save data to JSON"""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'matches': matches,
        'groups': groups,
        'source': 'balldontlie.io FIFA API (FREE!)'
    }
    
    with open('data/worldcup-data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Data saved to data/worldcup-data.json")
    print(f"- {len(matches)} matches")
    print(f"- {len(groups)} groups")

def main():
    """Main execution"""
    print("=" * 60)
    print("World Cup 2026 - balldontlie.io API (FREE!)")
    print("=" * 60)
    print()
    
    matches_data = fetch_world_cup_matches()
    
    if not matches_data:
        print("\n⚠️  No data available yet")
        save_data([], {})
        return
    
    print("\nTransforming data...")
    matches = transform_matches(matches_data)
    groups = calculate_standings(matches)
    
    save_data(matches, groups)
    print("\n✅ Complete! This API is FREE with no limits!")

if __name__ == "__main__":
    main()

# Made with Bob
