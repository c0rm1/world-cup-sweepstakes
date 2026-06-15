# Yellow Card Data Scraping System

## Overview

Automated system to scrape yellow and red card data from Wikipedia and enrich it with team/match information from the World Cup API.

## Files

### Scrapers
- **`scrape-wikipedia-cards.py`** - Scrapes card data from Wikipedia group pages
- **`enrich-card-data.py`** - Enriches scraped data with team and match information

### Data Files
- **`data/worldcup-cards.csv`** - Raw scraped data (player, card type, minute)
- **`data/worldcup-cards-enriched.csv`** - Final enriched data (match, date, team, player, card type, minute)

### Automation
- **`.github/workflows/update-cards.yml`** - GitHub Actions workflow for automatic updates

## How It Works

### 1. Wikipedia Scraping
The scraper searches for card images in Wikipedia's HTML:
- `<img alt="Yellow card">` for yellow cards
- `<img alt="Red card">` for red cards
- `<img alt="Yellow-red card">` for second yellow (red)

It extracts:
- Player name (from table cell with `<a>` link)
- Card minute (from same cell as card image)
- Card type (Yellow/Red)

### 2. Data Enrichment
The enrichment script adds:
- **Team code** - Matches player last names to known player database
- **Match name** - Finds matches involving that team
- **Match date** - From worldcup-data.json

### 3. Automatic Updates
GitHub Actions runs every 6 hours:
- 00:00 UTC (1:00 AM Dublin)
- 06:00 UTC (7:00 AM Dublin)
- 12:00 UTC (1:00 PM Dublin)
- 18:00 UTC (7:00 PM Dublin)

## Manual Usage

### Scrape Latest Cards
```bash
python3 scrape-wikipedia-cards.py
```

### Enrich with Team/Match Info
```bash
python3 enrich-card-data.py
```

### Run Both
```bash
python3 scrape-wikipedia-cards.py && python3 enrich-card-data.py
```

## Current Data

**36 cards** from **12 matches**:
- 30 yellow cards
- 6 red cards
- 100% enriched with team and match information

## Adding New Players

When new players appear who aren't in the database, add them to `enrich-card-data.py`:

```python
known_players = {
    'player_last_name': 'TEAM_CODE',
    # Example:
    'messi': 'ARG',
    'ronaldo': 'POR',
}
```

## GitHub Actions Setup

The workflow automatically:
1. Scrapes Wikipedia every 6 hours
2. Enriches the data
3. Commits changes if new cards found
4. Pushes to repository

### Manual Trigger
You can also trigger manually:
1. Go to Actions tab in GitHub
2. Select "Update Card Data"
3. Click "Run workflow"

## Data Format

### worldcup-cards-enriched.csv
```csv
match,date,team,player,card_type,minute
MEX vs RSA,06/11/2026 13:00,MEX,César Montes,Red,90+2
MEX vs RSA,06/11/2026 13:00,RSA,Teboho Mokoena,Yellow,17
CAN vs BIH,06/12/2026 15:00,CAN,Alistair Johnston,Yellow,11
```

## Integration with Website

### Display Card Counts in Group Tables
```javascript
// Load card data
fetch('data/worldcup-cards-enriched.csv')
  .then(response => response.text())
  .then(csv => {
    // Parse CSV and count cards per team
    const cardCounts = {};
    // Add to group standings display
  });
```

### Show Cards in Match Details
```javascript
// Filter cards for specific match
const matchCards = cards.filter(c => 
  c.match === 'MEX vs RSA'
);
```

## Troubleshooting

### No cards found
- Check if Wikipedia pages have been updated
- Verify card images are present in HTML
- Check network connectivity

### Missing team information
- Add player to `known_players` dictionary in `enrich-card-data.py`
- Player last names must match exactly (case-insensitive)

### Duplicates
- Enrichment script automatically removes duplicates
- Based on player name + card type + minute

## Dependencies

```bash
pip install requests beautifulsoup4
```

## Future Enhancements

- [ ] Add red card tracking separately
- [ ] Calculate fair play rankings
- [ ] Show card timeline in match view
- [ ] Add player card history
- [ ] Export to JSON format
- [ ] Add card statistics dashboard

## Credits

Data sources:
- Wikipedia (card data)
- worldcup26.ir API (match data)