#!/usr/bin/env python3
"""
World Cup 2026 Data Scraper using TheSportsDB (FREE!)
No API key required - completely free forever
"""

import requests
import json
from datetime import datetime
from collections import defaultdict

# TheSportsDB Configuration (FREE - No API key needed!)
BASE_URL = "https://www.thesportsdb.com/api/v1/json/3"

# World Cup 2026 League ID in TheSportsDB
WORLD_CUP_LEAGUE_ID = "4429"  # FIFA World Cup

# Team code mapping
TEAM_CODE_MAP = {
    'United States': 'USA',
    'USA': 'USA',
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
    'Korea Republic': 'KOR',
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
    'Bosnia': 'BIH',
    'Wales': 'WAL',
    'Poland': 'POL',
    'Denmark': 'DEN',
    'Serbia': 'SRB',
    'Costa Rica': 'CRC'
}

def get_team_code(team_name):
    """Convert team name to 3-letter code"""
    if not team_name:
        return 'TBD'
    return TEAM_CODE_MAP.get(team_name, team_name[:3].upper())

def make_request(endpoint):
    """Make request to TheSportsDB"""
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def fetch_world_cup_events():
    """Fetch World Cup events"""
    print("Fetching World Cup 2026 events...")
    
    # Try current season events
    data = make_request(f"eventsseason.php?id={WORLD_CUP_LEAGUE_ID}&s=2026")
    
    if data and data.get('events'):
        print(f"Found {len(data['events'])} events for 2026")
        return data['events']
    
    # Try next 25 events
    print("Trying next events endpoint...")
    data = make_request(f"eventsnextleague.php?id={WORLD_CUP_LEAGUE_ID}")
    
    if data and data.get('events'):
        print(f"Found {len(data['events'])} upcoming events")
        return data['events']
    
    # Try past events
    print("Trying past events endpoint...")
    data = make_request(f"eventspastleague.php?id={WORLD_CUP_LEAGUE_ID}")
    
    if data and data.get('events'):
        print(f"Found {len(data['events'])} past events")
        return data['events']
    
    print("No events found")
    return []

def transform_events(events):
    """Transform TheSportsDB events to our format"""
    matches = []
    match_num = 1
    
    for event in events:
        if not event:
            continue
            
        home_team = get_team_code(event.get('strHomeTeam', ''))
        away_team = get_team_code(event.get('strAwayTeam', ''))
        
        # Get scores
        home_score = event.get('intHomeScore')
        away_score = event.get('intAwayScore')
        
        # Convert to int if not None
        if home_score is not None:
            home_score = int(home_score)
        if away_score is not None:
            away_score = int(away_score)
        
        # Determine round from event name or round field
        round_name = event.get('strEvent', '')
        event_round = event.get('intRound', 1)
        
        # Convert event_round to int if it's a string
        try:
            event_round = int(event_round) if event_round else 1
        except (ValueError, TypeError):
            event_round = 1
        
        if 'Group' in round_name or event_round <= 3:
            round_type = 'group'
            # Try to extract group letter
            group = None
            if 'Group' in round_name:
                parts = round_name.split('Group')
                if len(parts) > 1:
                    group_part = parts[1].strip().split()[0]
                    if group_part.isalpha():
                        group = group_part
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
        
        # Determine status
        status = event.get('strStatus', 'NS')
        if status == 'Match Finished':
            status = 'FT'
        elif status == 'Not Started':
            status = 'NS'
        
        match = {
            'matchNum': match_num,
            'team1': home_team,
            'team2': away_team,
            'score1': home_score,
            'score2': away_score,
            'round': round_type,
            'status': status,
            'date': event.get('dateEvent', ''),
            'time': event.get('strTime', '')
        }
        
        if group:
            match['group'] = group
        
        matches.append(match)
        match_num += 1
    
    return matches

def calculate_standings(matches):
    """Calculate group standings from match results"""
    groups = defaultdict(lambda: defaultdict(lambda: {
        'played': 0,
        'won': 0,
        'drawn': 0,
        'lost': 0,
        'goalsFor': 0,
        'goalsAgainst': 0,
        'points': 0
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
        
        # Update team1 stats
        groups[group][team1]['played'] += 1
        groups[group][team1]['goalsFor'] += score1
        groups[group][team1]['goalsAgainst'] += score2
        
        # Update team2 stats
        groups[group][team2]['played'] += 1
        groups[group][team2]['goalsFor'] += score2
        groups[group][team2]['goalsAgainst'] += score1
        
        # Determine result
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
    
    # Convert to output format
    output_groups = {}
    for group, teams in groups.items():
        team_list = []
        position = 1
        for team_code, stats in sorted(teams.items(), key=lambda x: x[1]['points'], reverse=True):
            team_list.append({
                'code': team_code,
                'position': position,
                'played': stats['played'],
                'won': stats['won'],
                'drawn': stats['drawn'],
                'lost': stats['lost'],
                'goalsFor': stats['goalsFor'],
                'goalsAgainst': stats['goalsAgainst'],
                'points': stats['points'],
                'yellowCards': 0
            })
            position += 1
        output_groups[group] = team_list
    
    return output_groups

def save_data(matches, groups):
    """Save transformed data to JSON file"""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'matches': matches,
        'groups': groups,
        'source': 'TheSportsDB (Free API)'
    }
    
    with open('data/worldcup-data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Data saved to data/worldcup-data.json")
    print(f"- {len(matches)} matches")
    print(f"- {len(groups)} groups")

def main():
    """Main execution"""
    print("=" * 60)
    print("World Cup 2026 Data Scraper - TheSportsDB (FREE!)")
    print("=" * 60)
    print()
    
    # Fetch events
    events = fetch_world_cup_events()
    
    if not events:
        print("\n⚠️  No World Cup 2026 data available yet")
        print("The API will have data once the tournament starts")
        # Save empty data
        save_data([], {})
        return
    
    # Transform data
    print("\nTransforming data...")
    matches = transform_events(events)
    groups = calculate_standings(matches)
    
    # Save to file
    save_data(matches, groups)
    
    print("\n✅ Data update complete!")
    print("\n💡 This API is completely FREE - no limits!")

if __name__ == "__main__":
    main()

# Made with Bob
