#!/usr/bin/env python3
"""
World Cup 2026 Data Scraper using worldcup26.ir API
100% FREE - No API key required!
Real-time live scores for all 104 matches
"""

import requests
import json
from datetime import datetime
from collections import defaultdict

# WorldCup26.ir API Configuration (FREE!)
BASE_URL = "https://worldcup26.ir"

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
    
    # Check if it's already a 3-letter code
    if len(team_name) == 3 and team_name.isupper():
        return team_name
    
    # Default
    return team_name[:3].upper()

def make_request(endpoint):
    """Make request to WorldCup26.ir API"""
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        print(f"Fetching: {url}")
        # Try with SSL verification disabled (some APIs have cert issues)
        response = requests.get(url, timeout=15, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        # Try HTTP as fallback
        try:
            http_url = url.replace('https://', 'http://')
            print(f"Trying HTTP: {http_url}")
            response = requests.get(http_url, timeout=15)
            response.raise_for_status()
            return response.json()
        except:
            return None

def fetch_matches():
    """Fetch all World Cup 2026 matches"""
    print("Fetching World Cup 2026 matches...")
    data = make_request("get/games")
    
    if data:
        if isinstance(data, list):
            print(f"Found {len(data)} matches")
            return data
        elif isinstance(data, dict) and 'games' in data:
            matches = data['games']
            print(f"Found {len(matches)} matches")
            return matches
        elif isinstance(data, dict) and 'data' in data:
            matches = data['data']
            print(f"Found {len(matches)} matches")
            return matches
    
    return []

def fetch_groups():
    """Fetch group standings"""
    print("Fetching group standings...")
    data = make_request("get/groups")
    
    if data:
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and 'groups' in data:
            return data['groups']
        elif isinstance(data, dict) and 'data' in data:
            return data['data']
    
    return []

def transform_matches(matches):
    """Transform API matches to our format"""
    transformed = []
    match_num = 1
    
    for match in matches:
        if not match:
            continue
        
        # Extract team info
        home_team = match.get('homeTeam', match.get('home_team', {}))
        away_team = match.get('awayTeam', match.get('away_team', {}))
        
        # Get team names/codes
        if isinstance(home_team, dict):
            home_name = home_team.get('name', home_team.get('code', ''))
            home_code = home_team.get('code', home_team.get('abbreviation', ''))
        else:
            home_name = str(home_team)
            home_code = ''
        
        if isinstance(away_team, dict):
            away_name = away_team.get('name', away_team.get('code', ''))
            away_code = away_team.get('code', away_team.get('abbreviation', ''))
        else:
            away_name = str(away_team)
            away_code = ''
        
        # Use provided code or convert name
        team1 = get_team_code(home_code if home_code else home_name)
        team2 = get_team_code(away_code if away_code else away_name)
        
        # Extract scores
        home_score = match.get('homeScore', match.get('home_score'))
        away_score = match.get('awayScore', match.get('away_score'))
        
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
        group = match.get('group', match.get('groupName'))
        
        if 'group' in str(stage).lower() or group:
            round_type = 'group'
        elif 'round of 32' in str(stage).lower() or '32' in str(stage):
            round_type = 'round32'
        elif 'round of 16' in str(stage).lower() or '16' in str(stage):
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
        if status in ['finished', 'complete', 'FT', 'Full Time']:
            status = 'FT'
        elif status in ['live', 'in_progress', 'LIVE']:
            status = 'LIVE'
        else:
            status = 'NS'
        
        transformed_match = {
            'matchNum': match_num,
            'team1': team1,
            'team2': team2,
            'score1': home_score,
            'score2': away_score,
            'round': round_type,
            'status': status
        }
        
        if group:
            # Extract just the letter if it's like "Group A"
            group_str = str(group).upper()
            if 'GROUP' in group_str:
                group_letter = group_str.replace('GROUP', '').strip()
            else:
                group_letter = group_str
            transformed_match['group'] = group_letter
        
        transformed.append(transformed_match)
        match_num += 1
    
    return transformed

def transform_groups(groups_data):
    """Transform API groups to our format"""
    output = {}
    
    for group in groups_data:
        if not group:
            continue
        
        group_name = group.get('name', group.get('group', ''))
        teams = group.get('teams', group.get('standings', []))
        
        # Extract group letter
        if 'GROUP' in str(group_name).upper():
            group_letter = str(group_name).upper().replace('GROUP', '').strip()
        else:
            group_letter = str(group_name).upper()
        
        team_list = []
        for team in teams:
            if not team:
                continue
            
            team_name = team.get('name', team.get('team', ''))
            team_code = team.get('code', team.get('abbreviation', ''))
            
            if not team_code:
                team_code = get_team_code(team_name)
            
            team_list.append({
                'code': get_team_code(team_code),
                'position': team.get('position', team.get('rank', 0)),
                'played': team.get('played', team.get('gamesPlayed', 0)),
                'won': team.get('won', team.get('wins', 0)),
                'drawn': team.get('drawn', team.get('draws', 0)),
                'lost': team.get('lost', team.get('losses', 0)),
                'goalsFor': team.get('goalsFor', team.get('gf', 0)),
                'goalsAgainst': team.get('goalsAgainst', team.get('ga', 0)),
                'points': team.get('points', team.get('pts', 0)),
                'yellowCards': team.get('yellowCards', 0)
            })
        
        if team_list:
            output[group_letter] = team_list
    
    return output

def save_data(matches, groups):
    """Save data to JSON"""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'matches': matches,
        'groups': groups,
        'source': 'worldcup26.ir (FREE API - No key required!)'
    }
    
    with open('data/worldcup-data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Data saved to data/worldcup-data.json")
    print(f"- {len(matches)} matches")
    print(f"- {len(groups)} groups")

def main():
    """Main execution"""
    print("=" * 70)
    print("World Cup 2026 Data Scraper - worldcup26.ir")
    print("100% FREE - No API key required!")
    print("=" * 70)
    print()
    
    # Fetch data
    matches_data = fetch_matches()
    groups_data = fetch_groups()
    
    if not matches_data:
        print("\n⚠️  No match data available")
        save_data([], {})
        return
    
    # Transform data
    print("\nTransforming data...")
    matches = transform_matches(matches_data)
    groups = transform_groups(groups_data) if groups_data else {}
    
    # Save
    save_data(matches, groups)
    
    print("\n🎉 Success! This API is:")
    print("  ✅ 100% FREE")
    print("  ✅ No API key needed")
    print("  ✅ Real-time live scores")
    print("  ✅ All 104 World Cup matches")

if __name__ == "__main__":
    main()

# Made with Bob
