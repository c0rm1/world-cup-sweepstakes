#!/usr/bin/env python3
"""
World Cup 2026 Data Scraper using API-Football
Fetches match data and transforms it for the sweepstakes tracker
"""

import requests
import json
from datetime import datetime
from collections import defaultdict

# API-Football Configuration
API_KEY = "5277ded000da51d02dc7a22ef3b8ccb4"  # API-Football key
API_HOST = "v3.football.api-sports.io"
BASE_URL = f"https://{API_HOST}"

# World Cup Configuration
WORLD_CUP_LEAGUE_ID = 1  # World Cup league ID
SEASON = 2026  # World Cup 2026

# Team code mapping (API-Football uses full names, we use 3-letter codes)
TEAM_CODE_MAP = {
    'United States': 'USA',
    'Mexico': 'MEX',
    'Canada': 'CAN',
    'Cape Verde': 'CPV',
    'Brazil': 'BRA',
    'Argentina': 'ARG',
    'Uruguay': 'URU',
    'Colombia': 'COL',
    'Germany': 'GER',
    'Spain': 'ESP',
    'Netherlands': 'NED',
    'Switzerland': 'SUI',
    'France': 'FRA',
    'England': 'ENG',
    'Belgium': 'BEL',
    'Portugal': 'POR',
    'Croatia': 'CRO',
    'Sweden': 'SWE',
    'Algeria': 'ALG',
    'Senegal': 'SEN',
    'Morocco': 'MAR',
    'Egypt': 'EGY',
    'Tunisia': 'TUN',
    'Iran': 'IRN',
    'Japan': 'JPN',
    'South Korea': 'KOR',
    'Australia': 'AUS',
    'Qatar': 'QAT',
    'Ivory Coast': 'CIV',
    'Ghana': 'GHA',
    'DR Congo': 'COD',
    'South Africa': 'RSA',
    'Paraguay': 'PAR',
    'Norway': 'NOR',
    'Haiti': 'HAI',
    'Panama': 'PAN',
    'Saudi Arabia': 'KSA',
    'Scotland': 'SCO',
    'Austria': 'AUT',
    'Uzbekistan': 'UZB',
    'Ecuador': 'ECU',
    'New Zealand': 'NZL',
    'Jordan': 'JOR',
    'Curacao': 'CUW',
    'Turkey': 'TUR',
    'Czech Republic': 'CZE',
    'Iraq': 'IRQ',
    'Bosnia': 'BIH'
}

def get_team_code(team_name):
    """Convert team name to 3-letter code"""
    return TEAM_CODE_MAP.get(team_name, team_name[:3].upper())

def make_api_request(endpoint, params=None):
    """Make request to API-Football"""
    headers = {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
    }
    
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Debug output
        if data.get('errors'):
            print(f"API Errors: {data['errors']}")
        if data.get('results') == 0:
            print(f"No results found for {endpoint} with params {params}")
            
        return data
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return None

def fetch_fixtures():
    """Fetch all World Cup 2026 fixtures"""
    print("Fetching fixtures...")
    params = {
        'league': WORLD_CUP_LEAGUE_ID,
        'season': SEASON
    }
    
    data = make_api_request('fixtures', params)
    
    if data and data.get('response'):
        print(f"Found {len(data['response'])} fixtures")
        return data['response']
    
    return []

def fetch_standings():
    """Fetch World Cup 2026 standings"""
    print("Fetching standings...")
    params = {
        'league': WORLD_CUP_LEAGUE_ID,
        'season': SEASON
    }
    
    data = make_api_request('standings', params)
    
    if data and data.get('response'):
        return data['response']
    
    return []

def transform_fixtures(fixtures):
    """Transform API fixtures to our format"""
    matches = []
    match_num = 1
    
    for fixture in fixtures:
        # Extract match data
        home_team = get_team_code(fixture['teams']['home']['name'])
        away_team = get_team_code(fixture['teams']['away']['name'])
        
        # Get scores (None if not played yet)
        home_score = fixture['goals']['home']
        away_score = fixture['goals']['away']
        
        # Determine round
        round_name = fixture['league']['round']
        if 'Group' in round_name:
            round_type = 'group'
            group = round_name.split()[-1] if 'Group' in round_name else None
        elif 'Round of 32' in round_name:
            round_type = 'round32'
            group = None
        elif 'Round of 16' in round_name:
            round_type = 'round16'
            group = None
        elif 'Quarter' in round_name:
            round_type = 'quarters'
            group = None
        elif 'Semi' in round_name:
            round_type = 'semis'
            group = None
        elif 'Final' in round_name and 'Third' not in round_name:
            round_type = 'final'
            group = None
        else:
            round_type = 'group'
            group = None
        
        match = {
            'matchNum': match_num,
            'team1': home_team,
            'team2': away_team,
            'score1': home_score,
            'score2': away_score,
            'round': round_type,
            'status': fixture['fixture']['status']['short']
        }
        
        if group:
            match['group'] = group
        
        matches.append(match)
        match_num += 1
    
    return matches

def transform_standings(standings_data):
    """Transform API standings to our groups format"""
    groups = {}
    
    for league_data in standings_data:
        if 'league' not in league_data:
            continue
            
        standings = league_data['league'].get('standings', [])
        
        for group_standings in standings:
            for team_data in group_standings:
                # Extract group (e.g., "Group A" -> "A")
                group_name = team_data.get('group', '')
                if 'Group' in group_name:
                    group_letter = group_name.split()[-1]
                else:
                    continue
                
                if group_letter not in groups:
                    groups[group_letter] = []
                
                team_code = get_team_code(team_data['team']['name'])
                
                team_info = {
                    'code': team_code,
                    'position': team_data['rank'],
                    'played': team_data['all']['played'],
                    'won': team_data['all']['win'],
                    'drawn': team_data['all']['draw'],
                    'lost': team_data['all']['lose'],
                    'goalsFor': team_data['all']['goals']['for'],
                    'goalsAgainst': team_data['all']['goals']['against'],
                    'points': team_data['points'],
                    'yellowCards': 0  # API-Football doesn't provide this in standings
                }
                
                groups[group_letter].append(team_info)
    
    return groups

def save_data(matches, groups):
    """Save transformed data to JSON file"""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'matches': matches,
        'groups': groups
    }
    
    with open('data/worldcup-data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Data saved to data/worldcup-data.json")
    print(f"- {len(matches)} matches")
    print(f"- {len(groups)} groups")

def main():
    """Main execution"""
    print("=" * 50)
    print("World Cup 2026 Data Scraper")
    print("=" * 50)
    
    if API_KEY == "YOUR_API_KEY_HERE":
        print("\n⚠️  ERROR: Please set your API key in the script!")
        print("Get your free API key from: https://www.api-football.com/")
        return
    
    # Fetch data
    fixtures = fetch_fixtures()
    standings_data = fetch_standings()
    
    # Transform data
    matches = transform_fixtures(fixtures)
    groups = transform_standings(standings_data)
    
    # Save to file
    save_data(matches, groups)
    
    print("\n✅ Data update complete!")

if __name__ == "__main__":
    main()

# Made with Bob
