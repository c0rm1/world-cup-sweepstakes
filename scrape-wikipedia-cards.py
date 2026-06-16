#!/usr/bin/env python3
"""
World Cup 2026 Card Data Scraper from Wikipedia
Extracts yellow and red card information from match pages
Tracks earliest card per game and uses discipline table for team totals
"""

import requests
from bs4 import BeautifulSoup
import csv
import re

# Wikipedia group pages
GROUP_PAGES = [
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_B',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_C',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_D',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_E',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_F',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_G',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_H',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_I',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_J',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_K',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_L'
]

# Mapping of full team names to 3-letter codes
TEAM_NAME_TO_CODE = {
    'mexico': 'MEX',
    'south africa': 'RSA',
    'south korea': 'KOR',
    'korea republic': 'KOR',
    'czech republic': 'CZE',
    'canada': 'CAN',
    'curaçao': 'CUW',
    'curacao': 'CUW',
    'bosnia and herzegovina': 'BIH',
    'qatar': 'QAT',
    'switzerland': 'SUI',
    'brazil': 'BRA',
    'haiti': 'HAI',
    'scotland': 'SCO',
    'united states': 'USA',
    'paraguay': 'PAR',
    'turkey': 'TUR',
    'türkiye': 'TUR',
    'ivory coast': 'CIV',
    "côte d'ivoire": 'CIV',
    'cote d\'ivoire': 'CIV',
    'ecuador': 'ECU',
    'netherlands': 'NED',
    'tunisia': 'TUN',
    'belgium': 'BEL',
    'egypt': 'EGY',
    'iran': 'IRN',
    'spain': 'ESP',
    'cape verde': 'CPV',
    'saudi arabia': 'KSA',
}

def get_team_code(team_name):
    """Convert full team name to 3-letter code"""
    if not team_name:
        return ''
    team_lower = team_name.lower().strip()
    return TEAM_NAME_TO_CODE.get(team_lower, team_name.upper()[:3])

def parse_minute(minute_str):
    """Parse minute string to integer for comparison (e.g., '45+2' -> 47)"""
    if not minute_str:
        return 999
    match = re.match(r'(\d+)(?:\+(\d+))?', str(minute_str))
    if match:
        base = int(match.group(1))
        extra = int(match.group(2)) if match.group(2) else 0
        return base + extra
    return 999

def fetch_page(url):
    """Fetch Wikipedia page"""
    try:
        print(f"Fetching: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_discipline_table(soup):
    """Extract team discipline totals from the discipline table at the bottom of the page"""
    discipline_data = {}
    
    # Find all tables on the page
    tables = soup.find_all('table')
    
    for table in tables:
        # Look for the discipline table by checking previous heading
        prev_heading = table.find_previous(['h2', 'h3', 'h4'])
        if not prev_heading or 'discipline' not in prev_heading.get_text().lower():
            continue
        
        # This is the discipline table
        rows = table.find_all('tr')
        
        # Skip first two header rows
        for row in rows[2:]:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 2:
                continue
            
            # Extract team name (first cell)
            team_cell = cells[0]
            team_link = team_cell.find('a')
            if team_link:
                team_name = team_link.get_text().strip()
                team_code = get_team_code(team_name)
            else:
                team_text = team_cell.get_text().strip()
                team_code = get_team_code(team_text)
            
            if not team_code:
                continue
            
            # The last cell (or last th) contains the Score
            # Look for the rightmost cell with a number (could be negative)
            discipline_score = 0
            for cell in reversed(cells):
                cell_text = cell.get_text().strip()
                # Check if this is a score (number, possibly negative)
                if cell_text and (cell_text.lstrip('−-').isdigit() or cell_text == '0'):
                    # Convert − (minus sign) to - (hyphen) for parsing
                    cell_text = cell_text.replace('−', '-')
                    try:
                        discipline_score = int(cell_text)
                        break
                    except ValueError:
                        continue
            
            discipline_data[team_code] = {
                'discipline_score': discipline_score
            }
    
    return discipline_data

def extract_cards_from_page(soup, earliest_minute_global):
    """
    Extract card data from Wikipedia page by finding card images in match lineup tables.
    Returns cards and the earliest minute found in this page.
    Only includes games where the first card is earlier than earliest_minute_global.
    """
    cards = []
    games_data = {}  # Track cards per game
    
    # Find all tables on the page
    tables = soup.find_all('table')
    
    for table in tables:
        # Skip the discipline table - it doesn't have player names or minutes
        prev_heading = table.find_previous(['h2', 'h3', 'h4'])
        if prev_heading and 'discipline' in prev_heading.get_text().lower():
            continue
        
        # Extract match information by looking at previous siblings
        match_name = ''
        match_date = ''
        team1_full = ''
        team2_full = ''
        
        current = table
        for _ in range(20):
            current = current.find_previous_sibling()
            if not current:
                break
            text = current.get_text(" ", strip=True)
            
            # Look for match heading (e.g., "Mexico vs South Africa")
            if not match_name:
                match_match = re.search(r'([A-Za-z\s]+?)\s+vs?\s+([A-Za-z\s]+?)(?:\s|$)', text, re.IGNORECASE)
                if match_match:
                    team1_full = match_match.group(1).strip()
                    team2_full = match_match.group(2).strip()
            
            # Look for score line (e.g., "Mexico 2–0 South Africa")
            if not match_date:
                date_match = re.search(r'(June|July)\s+\d+,?\s+\d{4}', text)
                if date_match:
                    match_date = date_match.group(0)
                    # Extract team names from score line - handle multi-word team names
                    # Look for pattern: "TeamName 2–0 TeamName" followed by scorer (name + minute)
                    # Skip UTC timezone info
                    score_match = re.search(r'UTC[−+-]\d+\s+(\w+(?:\s+\w+)*)\s+(\d+)[–-](\d+)\s+(\w+(?:\s+\w+)*?)(?=\s+\w+\s+\d+\')', text)
                    if score_match:
                        team1_full = score_match.group(1).strip()
                        team2_full = score_match.group(4).strip()  # Group 4, not 2 (groups 2 and 3 are the scores)
                        # Convert to 3-letter codes
                        team1_code = get_team_code(team1_full)
                        team2_code = get_team_code(team2_full)
                        match_name = f"{team1_code} vs {team2_code}"
            
            if match_name and match_date:
                break
        
        # If we didn't find 3-letter codes, try to map full names to codes
        if not match_name and team1_full and team2_full:
            # Try to find team codes by looking for them in nearby text
            current = table
            for _ in range(10):
                current = current.find_previous_sibling()
                if not current:
                    break
                text = current.get_text(" ", strip=True)
                # Look for pattern like "MEX" or "RSA" near the team names
                code_match = re.search(r'\b([A-Z]{3})\b', text)
                if code_match:
                    # This is a simplified approach - in reality we'd need better mapping
                    pass
        
        # Determine team name for this table
        team_name = ''
        if match_name:
            teams = re.split(r'\s+vs?\s+', match_name, flags=re.IGNORECASE)
            if len(teams) == 2:
                team1 = teams[0].strip()
                team2 = teams[1].strip()
                
                # Check which team this table belongs to
                # Look at previous sibling divs to see team name
                current_check = table
                for _ in range(3):
                    prev_sib = current_check.find_previous_sibling()
                    if not prev_sib:
                        break
                    prev_text = prev_sib.get_text(" ", strip=True)
                    # Check for team codes or full names
                    if team1 in prev_text or (team1_full and team1_full.lower() in prev_text.lower()):
                        team_name = team1
                        break
                    elif team2 in prev_text or (team2_full and team2_full.lower() in prev_text.lower()):
                        team_name = team2
                        break
                    current_check = prev_sib
                
                # Fallback: check table position (left=team1, right=team2)
                if not team_name:
                    style = table.get('style', '')
                    if 'float:left' in style or 'float: left' in style:
                        team_name = team1
                    elif 'float:right' in style or 'float: right' in style:
                        team_name = team2
                    else:
                        # Check if there's a previous table (means this is the second one)
                        prev_table = table.find_previous_sibling('table')
                        if prev_table:
                            team_name = team2
                        else:
                            team_name = team1
        
        # Find all card images in this table
        card_imgs = table.find_all('img', alt=re.compile(r'(Yellow card|Red card|Yellow-red card)'))
        
        for img in card_imgs:
            # Determine card type from image alt text
            card_type_alt = img.get('alt', '')
            if 'Yellow-red' in card_type_alt:
                card_type = 'Red'
            elif 'Red' in card_type_alt:
                card_type = 'Red'
            else:
                card_type = 'Yellow'
            
            # Find the cell containing this card image
            card_cell = img.find_parent(['td', 'th'])
            if not card_cell:
                continue
            
            # Extract minute from the cell text
            cell_text = card_cell.get_text()
            time_match = re.search(r"(\d+(?:\+\d+)?)'", cell_text)
            if not time_match:
                continue
            minute = time_match.group(1)
            
            # Find the player name in the previous cell
            row = card_cell.find_parent('tr')
            if not row:
                continue
            
            cells = row.find_all(['td', 'th'])
            card_cell_idx = cells.index(card_cell) if card_cell in cells else -1
            
            player_name = None
            if card_cell_idx > 0:
                # Check previous cell for player name
                player_cell = cells[card_cell_idx - 1]
                player_link = player_cell.find('a', href=re.compile(r'/wiki/'))
                if player_link:
                    player_text = player_link.get_text().strip()
                    if player_text and len(player_text) > 2 and not player_text.isdigit():
                        player_name = player_text
            
            if not player_name:
                continue
            
            card_data = {
                'match': match_name,
                'date': match_date,
                'team': team_name,
                'player': player_name,
                'card_type': card_type,
                'minute': minute
            }
            
            # Track cards per game
            if match_name not in games_data:
                games_data[match_name] = []
            games_data[match_name].append(card_data)
    
    # Now filter games based on earliest card
    new_earliest_minute = earliest_minute_global
    
    for match_name, match_cards in games_data.items():
        if not match_cards:
            continue
        
        # Find the earliest card in this game
        earliest_card_minute = min(parse_minute(card['minute']) for card in match_cards)
        
        # Only include this game if its earliest card is earlier than the global earliest
        if earliest_card_minute < earliest_minute_global:
            cards.extend(match_cards)
            new_earliest_minute = min(new_earliest_minute, earliest_card_minute)
            print(f"  ✓ Including {match_name} (earliest card at {earliest_card_minute}')")
        else:
            print(f"  ✗ Discarding {match_name} (earliest card at {earliest_card_minute}' >= {earliest_minute_global}')")
    
    return cards, new_earliest_minute

def save_to_csv(all_cards, discipline_data, filename='data/worldcup-cards.csv'):
    """Save card data to CSV with discipline scores"""
    import os
    os.makedirs('data', exist_ok=True)

    # Add discipline scores to cards
    for card in all_cards:
        team_code = card['team']
        if team_code in discipline_data:
            card['discipline_score'] = discipline_data[team_code]['discipline_score']
        else:
            card['discipline_score'] = 0

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['match', 'date', 'team', 'player', 'card_type', 'minute', 'discipline_score'])
        writer.writeheader()
        writer.writerows(all_cards)

    print(f"\n✅ Saved {len(all_cards)} cards to {filename}")

def main():
    """Main execution"""
    print("=" * 70)
    print("World Cup 2026 Card Data Scraper - Wikipedia")
    print("=" * 70)
    print()

    all_cards = []
    all_discipline_data = {}
    earliest_minute_global = 999  # Start with a very high number

    for url in GROUP_PAGES:
        group_name = url.split('_')[-1]
        print(f"\nProcessing {group_name}...")

        soup = fetch_page(url)
        if soup:
            # Extract discipline table data
            discipline_data = extract_discipline_table(soup)
            all_discipline_data.update(discipline_data)
            
            # Extract cards with filtering
            cards, new_earliest = extract_cards_from_page(soup, earliest_minute_global)
            all_cards.extend(cards)
            
            # Update global earliest minute
            if new_earliest < earliest_minute_global:
                earliest_minute_global = new_earliest
                print(f"  New earliest card found: {earliest_minute_global}'")
            
            print(f"  Found {len(cards)} cards in {group_name}")

    if all_cards:
        save_to_csv(all_cards, all_discipline_data)

        print("\n" + "=" * 70)
        print("SUMMARY")
        print("=" * 70)
        print(f"Total cards: {len(all_cards)}")
        print(f"Earliest card in tournament: {earliest_minute_global}'")
        yellow_cards = sum(1 for c in all_cards if c['card_type'] == 'Yellow')
        red_cards = sum(1 for c in all_cards if c['card_type'] == 'Red')
        print(f"Yellow cards: {yellow_cards}")
        print(f"Red cards: {red_cards}")
        
        print("\nTeam Discipline Scores:")
        for team_code, data in sorted(all_discipline_data.items()):
            print(f"  {team_code}: {data['discipline_score']} points")

        print("\nSample data:")
        for card in all_cards[:10]:
            print(f"  {card['match']} - {card['team']}: {card['player']} ({card['card_type']} {card['minute']}') [Discipline: {card.get('discipline_score', 0)}]")
    else:
        print("\n⚠️  No card data found")

if __name__ == "__main__":
    main()

# Made with Bob
