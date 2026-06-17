#!/usr/bin/env python3
"""Debug script to find all Canada cards on Wikipedia"""

import requests
from bs4 import BeautifulSoup
import re

url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A'
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.content, 'html.parser')

print("=" * 70)
print("Searching for all card images on the page...")
print("=" * 70)

# Find all card images
card_imgs = soup.find_all('img', alt=re.compile(r'(Yellow card|Red card|Yellow-red card)'))
print(f"\nTotal card images found: {len(card_imgs)}")

# Check each card image for context
for idx, img in enumerate(card_imgs, 1):
    card_type = img.get('alt', '')
    
    # Get the cell containing the card
    card_cell = img.find_parent(['td', 'th'])
    if not card_cell:
        continue
    
    # Get the row
    row = card_cell.find_parent('tr')
    if not row:
        continue
    
    # Get all cells in the row
    cells = row.find_all(['td', 'th'])
    
    # Try to find player name
    card_cell_idx = cells.index(card_cell) if card_cell in cells else -1
    player_name = "Unknown"
    
    if card_cell_idx > 0:
        player_cell = cells[card_cell_idx - 1]
        player_link = player_cell.find('a', href=re.compile(r'/wiki/'))
        if player_link:
            player_name = player_link.get_text().strip()
    
    # Get minute
    cell_text = card_cell.get_text()
    time_match = re.search(r"(\d+(?:\+\d+)?)'", cell_text)
    minute = time_match.group(1) if time_match else "?"
    
    # Try to find table context
    table = row.find_parent('table')
    match_info = "Unknown match"
    
    if table:
        # Look for match heading
        current = table
        for _ in range(8):
            current = current.find_previous()
            if not current:
                break
            text = current.get_text(" ", strip=True)
            match_match = re.search(r'([A-Z]{3})\s+v(?:s)?\.?\s+([A-Z]{3})', text, re.IGNORECASE)
            if match_match:
                match_info = f"{match_match.group(1)} vs {match_match.group(2)}"
                break
    
    # Check if this might be related to Canada
    row_text = row.get_text().lower()
    table_text = str(table).lower() if table else ""
    
    is_canada_related = 'canada' in row_text or 'canada' in table_text or 'can' in match_info.lower()
    
    if is_canada_related or 'johnston' in player_name.lower():
        print(f"\n{'*' * 70}")
        print(f"Card #{idx} - CANADA RELATED")
        print(f"{'*' * 70}")
        print(f"Player: {player_name}")
        print(f"Card Type: {card_type}")
        print(f"Minute: {minute}")
        print(f"Match: {match_info}")
        print(f"Row text: {row.get_text()[:200]}")
    else:
        print(f"\nCard #{idx}: {player_name} ({card_type}, {minute}') - {match_info}")

print("\n" + "=" * 70)
print("Checking Discipline table...")
print("=" * 70)

# Find discipline table
for heading in soup.find_all(['h2', 'h3', 'h4']):
    if 'discipline' in heading.get_text().lower():
        print(f"\nFound Discipline heading: {heading.get_text()}")
        
        # Find the table after this heading
        current = heading
        for _ in range(10):
            current = current.find_next_sibling()
            if not current:
                break
            if current.name == 'table':
                print("\nFound Discipline table!")
                
                # Find Canada row
                rows = current.find_all('tr')
                for row in rows:
                    row_text = row.get_text()
                    if 'canada' in row_text.lower():
                        print(f"\nCanada row found:")
                        print(row_text)
                        
                        # Count card images in this row
                        canada_cards = row.find_all('img', alt=re.compile(r'(Yellow card|Red card|Yellow-red card)'))
                        print(f"\nTotal cards in Canada row: {len(canada_cards)}")
                        for card in canada_cards:
                            print(f"  - {card.get('alt')}")
                break
        break

# Made with Bob
