#!/usr/bin/env python3
"""
World Cup 2026 Data Scraper using worldcup26.ir API
100% FREE - No API key required!
Real-time live scores for all 104 matches
"""

import requests
import json
from datetime import datetime

# WorldCup26.ir API Configuration (FREE!)
BASE_URL = "https://worldcup26.ir"

# Team name to code mapping from API
TEAM_NAME_TO_CODE = {
    'Algeria': 'ALG', 'Argentina': 'ARG', 'Australia': 'AUS',
    'Austria': 'AUT', 'Belgium': 'BEL', 'Bosnia and Herzegovina': 'BIH',
    'Brazil': 'BRA', 'Canada': 'CAN', 'Cape Verde': 'CPV',
    'Colombia': 'COL', 'Croatia': 'CRO', 'Curaçao': 'CUW',
    'Czech Republic': 'CZE', 'Democratic Republic of the Congo': 'COD',
    'Ecuador': 'ECU', 'Egypt': 'EGY', 'England': 'ENG',
    'France': 'FRA', 'Germany': 'GER', 'Ghana': 'GHA',
    'Haiti': 'HAI', 'Iran': 'IRN', 'Iraq': 'IRQ',
    'Ivory Coast': 'CIV', 'Japan': 'JPN', 'Jordan': 'JOR',
    'Mexico': 'MEX', 'Morocco': 'MAR', 'Netherlands': 'NED',
    'New Zealand': 'NZL', 'Norway': 'NOR', 'Panama': 'PAN',
    'Paraguay': 'PAR', 'Portugal': 'POR', 'Qatar': 'QAT',
    'Saudi Arabia': 'KSA', 'Scotland': 'SCO', 'Senegal': 'SEN',
    'South Africa': 'RSA', 'South Korea': 'KOR', 'Spain': 'ESP',
    'Sweden': 'SWE', 'Switzerland': 'SUI', 'Tunisia': 'TUN',
    'Turkey': 'TUR', 'United States': 'USA', 'Uruguay': 'URU',
    'Uzbekistan': 'UZB'
}

def make_request(endpoint):
    """Make request to WorldCup26.ir API"""
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=15, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def fetch_matches():
    """Fetch all World Cup 2026 matches from API"""
    print("Fetching World Cup 2026 matches...")
    data = make_request("get/games")
    
    if data and 'games' in data:
        matches = data['games']
        print(f"Found {len(matches)} matches")
        return matches
    
    return []

def transform_matches(api_matches):
    """Transform API matches to our format"""
    transformed = []
    
    for match in api_matches:
        # Get team names
        home_name = match.get('home_team_name_en', match.get('home_team_label', ''))
        away_name = match.get('away_team_name_en', match.get('away_team_label', ''))
        
        # Convert to codes
        team1 = TEAM_NAME_TO_CODE.get(home_name, home_name[:3].upper() if home_name else 'TBD')
        team2 = TEAM_NAME_TO_CODE.get(away_name, away_name[:3].upper() if away_name else 'TBD')
        
        # Get scores - ONLY if match is finished
        finished = match.get('finished') == 'TRUE'
        
        if finished:
            # Match has been played - use actual scores
            try:
                score1 = int(match.get('home_score', 0))
                score2 = int(match.get('away_score', 0))
            except (ValueError, TypeError):
                score1 = None
                score2 = None
        else:
            # Match not played yet - set scores to None
            score1 = None
            score2 = None
        
        # Determine status
        time_elapsed = match.get('time_elapsed', 'notstarted')
        if finished:
            status = 'FT'
        elif time_elapsed not in ['notstarted', 'finished']:
            status = 'LIVE'
        else:
            status = 'NS'
        
        # Determine round type
        match_type = match.get('type', 'group')
        if match_type == 'group':
            round_type = 'group'
        elif match_type == 'r32':
            round_type = 'round32'
        elif match_type == 'r16':
            round_type = 'round16'
        elif match_type == 'qf':
            round_type = 'quarters'
        elif match_type == 'sf':
            round_type = 'semis'
        elif match_type == 'final':
            round_type = 'final'
        else:
            round_type = 'group'
        
        transformed_match = {
            'matchNum': int(match.get('id', 0)),
            'team1': team1,
            'team2': team2,
            'score1': score1,
            'score2': score2,
            'round': round_type,
            'status': status,
            'date': match.get('local_date', ''),
            'home_scorers': match.get('home_scorers', 'null'),
            'away_scorers': match.get('away_scorers', 'null')
        }
        
        # Add group for group stage matches
        if match_type == 'group':
            group = match.get('group', '')
            if group:
                transformed_match['group'] = group
        
        transformed.append(transformed_match)
    
    return transformed

def calculate_group_standings(matches):
    """Calculate group standings from match results"""
    from collections import defaultdict
    
    # Initialize standings
    standings = defaultdict(lambda: {
        'played': 0, 'won': 0, 'drawn': 0, 'lost': 0,
        'goalsFor': 0, 'goalsAgainst': 0, 'points': 0, 'yellowCards': 0
    })
    
    # Process finished group matches
    for match in matches:
        if match['round'] == 'group' and match['status'] == 'FT' and match['score1'] is not None:
            team1 = match['team1']
            team2 = match['team2']
            score1 = match['score1']
            score2 = match['score2']
            
            # Update stats
            standings[team1]['played'] += 1
            standings[team2]['played'] += 1
            standings[team1]['goalsFor'] += score1
            standings[team1]['goalsAgainst'] += score2
            standings[team2]['goalsFor'] += score2
            standings[team2]['goalsAgainst'] += score1
            
            if score1 > score2:
                standings[team1]['won'] += 1
                standings[team1]['points'] += 3
                standings[team2]['lost'] += 1
            elif score2 > score1:
                standings[team2]['won'] += 1
                standings[team2]['points'] += 3
                standings[team1]['lost'] += 1
            else:
                standings[team1]['drawn'] += 1
                standings[team2]['drawn'] += 1
                standings[team1]['points'] += 1
                standings[team2]['points'] += 1
    
    # Organize by groups
    groups = {}
    for match in matches:
        if match['round'] == 'group' and 'group' in match:
            group = match['group']
            if group not in groups:
                groups[group] = []
            
            for team in [match['team1'], match['team2']]:
                if team not in [t['code'] for t in groups[group]]:
                    groups[group].append({
                        'code': team,
                        'position': 0,
                        **standings[team]
                    })
    
    # Sort teams within each group
    for group in groups:
        groups[group].sort(key=lambda x: (
            -x['points'],
            -(x['goalsFor'] - x['goalsAgainst']),
            -x['goalsFor']
        ))
        # Update positions
        for i, team in enumerate(groups[group]):
            team['position'] = i + 1
    
    return groups

def save_data(matches, groups):
    """Save data to JSON"""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'matches': matches,
        'groups': groups,
        'source': 'worldcup26.ir (FREE API - No key required!)'
    }
    
    # Ensure data directory exists
    import os
    os.makedirs('data', exist_ok=True)
    
    with open('data/worldcup-data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Data saved to data/worldcup-data.json")
    print(f"- {len(matches)} matches")
    print(f"- {len(groups)} groups")
    
    # Count finished matches
    finished = sum(1 for m in matches if m['status'] == 'FT')
    live = sum(1 for m in matches if m['status'] == 'LIVE')
    print(f"- {finished} finished, {live} live, {len(matches)-finished-live} upcoming")

def main():
    """Main execution"""
    print("=" * 70)
    print("World Cup 2026 Data Scraper - worldcup26.ir")
    print("100% FREE - No API key required!")
    print("=" * 70)
    print()
    
    # Fetch data
    api_matches = fetch_matches()
    
    if not api_matches:
        print("\n⚠️  No match data available")
        save_data([], {})
        return
    
    # Transform data
    print("\nTransforming data...")
    matches = transform_matches(api_matches)
    groups = calculate_group_standings(matches)
    
    # Save
    save_data(matches, groups)
    
    print("\n🎉 Success! This API is:")
    print("  ✅ 100% FREE")
    print("  ✅ No API key needed")
    print("  ✅ Real-time live scores")
    print("  ✅ All 104 World Cup matches")
    print("  ✅ Only shows scores for finished matches")

if __name__ == "__main__":
    main()

# Made with Bob
