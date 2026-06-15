#!/usr/bin/env python3
"""
World Cup 2026 Data Scraper - Direct from FIFA.com
Scrapes official FIFA website for complete match data
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

# FIFA World Cup 2026 URLs
FIFA_BASE_URL = "https://www.fifa.com"
FIXTURES_URL = f"{FIFA_BASE_URL}/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"

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
    'Wales': 'WAL', 'Poland': 'POL',
    'Denmark': 'DEN', 'Serbia': 'SRB',
    'Costa Rica': 'CRC', 'Peru': 'PER',
    'Chile': 'CHI', 'Bolivia': 'BOL',
    'Venezuela': 'VEN', 'Honduras': 'HON',
    'Jamaica': 'JAM', 'El Salvador': 'SLV',
    'Guatemala': 'GUA', 'Nicaragua': 'NCA',
    'Belize': 'BLZ', 'Suriname': 'SUR',
    'Guyana': 'GUY', 'Trinidad and Tobago': 'TRI',
    'Barbados': 'BRB', 'Grenada': 'GRN',
    'Saint Lucia': 'LCA', 'Dominica': 'DMA',
    'Saint Vincent and the Grenadines': 'VIN',
    'Antigua and Barbuda': 'ATG',
    'Saint Kitts and Nevis': 'SKN',
    'Montserrat': 'MSR', 'Anguilla': 'AIA',
    'Bermuda': 'BER', 'Cayman Islands': 'CAY',
    'British Virgin Islands': 'VGB',
    'Turks and Caicos Islands': 'TCA',
    'Bahamas': 'BAH', 'Aruba': 'ARU',
    'Bonaire': 'BOE', 'Sint Maarten': 'SXM',
    'US Virgin Islands': 'VIR',
    'Puerto Rico': 'PUR', 'Cuba': 'CUB',
    'Dominican Republic': 'DOM',
    'Bosnia and Herzegovina': 'BIH'
}

def get_team_code(team_name):
    """Convert team name to 3-letter code"""
    if not team_name:
        return 'TBD'
    
    # Clean up team name
    team_name = team_name.strip()
    
    # Try exact match first
    if team_name in TEAM_CODE_MAP:
        return TEAM_CODE_MAP[team_name]
    
    # Try case-insensitive match
    for key, value in TEAM_CODE_MAP.items():
        if key.lower() == team_name.lower():
            return value
    
    # Default to first 3 letters uppercase
    return team_name[:3].upper()

def scrape_fifa_data():
    """Scrape match data from FIFA.com"""
    print("Scraping FIFA.com for World Cup 2026 data...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        # Try the fixtures/results page
        fixtures_url = f"{FIFA_BASE_URL}/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums"
        print(f"Fetching: {fixtures_url}")
        
        response = requests.get(fixtures_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for match data in various possible formats
        matches = []
        
        # Try to find match containers
        match_elements = soup.find_all(['div', 'article'], class_=re.compile(r'match|fixture|game', re.I))
        
        print(f"Found {len(match_elements)} potential match elements")
        
        # If no matches found, try alternative approach
        if len(match_elements) == 0:
            print("No match elements found via class names, trying alternative methods...")
            
            # Look for score patterns in text
            text_content = soup.get_text()
            
            # Pattern: TEAM1 X-Y TEAM2
            score_pattern = r'([A-Z]{3})\s+(\d+)\s*-\s*(\d+)\s+([A-Z]{3})'
            score_matches = re.findall(score_pattern, text_content)
            
            if score_matches:
                print(f"Found {len(score_matches)} matches via regex")
                match_num = 1
                for team1, score1, score2, team2 in score_matches:
                    matches.append({
                        'matchNum': match_num,
                        'team1': team1,
                        'team2': team2,
                        'score1': int(score1),
                        'score2': int(score2),
                        'round': 'group',
                        'status': 'FT'
                    })
                    match_num += 1
        
        return matches
        
    except Exception as e:
        print(f"Error scraping FIFA.com: {e}")
        return []

def save_data(matches):
    """Save data to JSON file"""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'matches': matches,
        'groups': {},
        'source': 'FIFA.com (Web Scraping)'
    }
    
    with open('data/worldcup-data.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Data saved to data/worldcup-data.json")
    print(f"- {len(matches)} matches")

def main():
    """Main execution"""
    print("=" * 60)
    print("World Cup 2026 Data Scraper - FIFA.com")
    print("=" * 60)
    print()
    
    matches = scrape_fifa_data()
    
    if not matches:
        print("\n⚠️  Could not scrape data from FIFA.com")
        print("The website structure may have changed")
        print("\nTrying alternative: football-data.org API...")
        
        # Try football-data.org as backup
        try:
            response = requests.get(
                'https://api.football-data.org/v4/competitions/WC/matches',
                headers={'X-Auth-Token': 'YOUR_TOKEN_HERE'},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                print(f"Found {len(data.get('matches', []))} matches from football-data.org")
        except:
            pass
        
        save_data([])
        return
    
    save_data(matches)
    print("\n✅ Scraping complete!")

if __name__ == "__main__":
    main()

# Made with Bob
