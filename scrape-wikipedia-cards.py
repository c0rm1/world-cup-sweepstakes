#!/usr/bin/env python3
"""
World Cup 2026 Card Data Scraper from Wikipedia
Extracts yellow and red card information from match pages
"""

import requests
from bs4 import BeautifulSoup
import csv
import re
from datetime import datetime

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

def extract_cards_from_page(soup):
    """Extract card data from Wikipedia page"""
    cards = []
    
    # Find all tables with lineup data
    tables = soup.find_all('table')
    
    for table in tables:
        # Find all rows with player data
        rows = table.find_all('tr')
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            
            # Look for player name cell (has <a> link)
            player_name = None
            player_cell_idx = None
            
            for idx, cell in enumerate(cells):
                player_link = cell.find('a', href=re.compile(r'/wiki/'))
                if player_link:
                    player_text = player_link.get_text().strip()
                    # Filter out non-player links
                    if player_text and len(player_text) > 2 and not player_text.isdigit():
                        player_name = player_text
                        player_cell_idx = idx
                        break
            
            if not player_name or player_cell_idx is None:
                continue
            
            # Check next cell for card image
            if player_cell_idx + 1 < len(cells):
                card_cell = cells[player_cell_idx + 1]
                
                # Look for card images
                card_imgs = card_cell.find_all('img', alt=re.compile(r'(Yellow card|Red card|Yellow-red card)'))
                
                for img in card_imgs:
                    card_type_alt = img.get('alt', '')
                    
                    # Determine card type
                    if 'Yellow-red' in card_type_alt:
                        card_type = 'Red'
                    elif 'Red' in card_type_alt:
                        card_type = 'Red'
                    else:
                        card_type = 'Yellow'
                    
                    # Extract minute from same cell
                    cell_text = card_cell.get_text()
                    time_match = re.search(r"(\d+(?:\+\d+)?)'", cell_text)
                    if not time_match:
                        continue
                    minute = time_match.group(1)
                    
                    # Try to find match context
                    match_name = ''
                    match_date = ''
                    team_name = ''
                    
                    # Search backwards for match header
                    current = table
                    for _ in range(10):
                        current = current.find_previous_sibling()
                        if not current:
                            break
                        if current.name in ['h3', 'h4']:
                            header_text = current.get_text()
                            if ' vs ' in header_text or ' v ' in header_text:
                                match_name = re.sub(r'\[edit\]', '', header_text).strip()
                                break
                    
                    # Try to find date
                    if match_name:
                        current = table
                        for _ in range(5):
                            current = current.find_previous_sibling()
                            if not current:
                                break
                            date_match = re.search(r'(June|July)\s+\d+,?\s+\d{4}', current.get_text())
                            if date_match:
                                match_date = date_match.group(0)
                                break
                    
                    # Try to determine team from table context
                    if match_name:
                        teams = re.split(r'\s+vs?\s+', match_name, flags=re.IGNORECASE)
                        if len(teams) == 2:
                            team1 = teams[0].strip()
                            team2 = teams[1].strip()
                            
                            # Look for team name in table caption or nearby headers
                            caption = table.find('caption')
                            if caption:
                                caption_text = caption.get_text()
                                if team1 in caption_text:
                                    team_name = team1
                                elif team2 in caption_text:
                                    team_name = team2
                            
                            # If not found, check table class or id
                            if not team_name:
                                table_str = str(table)
                                if team1.lower().replace(' ', '') in table_str.lower():
                                    team_name = team1
                                elif team2.lower().replace(' ', '') in table_str.lower():
                                    team_name = team2
                            
                            # Last resort: check which side of page (left=team1, right=team2)
                            if not team_name:
                                # Check if table has style indicating position
                                style = table.get('style', '')
                                if 'float:left' in style or 'float: left' in style:
                                    team_name = team1
                                elif 'float:right' in style or 'float: right' in style:
                                    team_name = team2
                                else:
                                    # Default to checking previous tables
                                    prev_table = table.find_previous('table')
                                    if prev_table:
                                        team_name = team2  # This is likely second team
                                    else:
                                        team_name = team1  # This is likely first team
                    
                    cards.append({
                        'match': match_name,
                        'date': match_date,
                        'team': team_name,
                        'player': player_name,
                        'card_type': card_type,
                        'minute': minute
                    })
    
    return cards

def save_to_csv(all_cards, filename='data/worldcup-cards.csv'):
    """Save card data to CSV"""
    import os
    os.makedirs('data', exist_ok=True)
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['match', 'date', 'team', 'player', 'card_type', 'minute'])
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
    
    for url in GROUP_PAGES:
        group_name = url.split('_')[-1]
        print(f"\nProcessing {group_name}...")
        
        soup = fetch_page(url)
        if soup:
            cards = extract_cards_from_page(soup)
            all_cards.extend(cards)
            print(f"  Found {len(cards)} cards in {group_name}")
    
    # Save to CSV
    if all_cards:
        save_to_csv(all_cards)
        
        # Print summary
        print("\n" + "=" * 70)
        print("SUMMARY")
        print("=" * 70)
        print(f"Total cards: {len(all_cards)}")
        yellow_cards = sum(1 for c in all_cards if c['card_type'] == 'Yellow')
        red_cards = sum(1 for c in all_cards if c['card_type'] == 'Red')
        print(f"Yellow cards: {yellow_cards}")
        print(f"Red cards: {red_cards}")
        
        # Show sample
        print("\nSample data:")
        for card in all_cards[:10]:
            print(f"  {card['match']} - {card['team']}: {card['player']} ({card['card_type']} {card['minute']}')")
    else:
        print("\n⚠️  No card data found")

if __name__ == "__main__":
    main()

# Made with Bob
