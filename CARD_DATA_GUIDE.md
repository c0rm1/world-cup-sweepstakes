# World Cup 2026 Yellow Card Data Collection Guide

## Current Status

✅ **Card data source found:** Wikipedia group pages have detailed match information including yellow and red cards with timestamps!

✅ **Initial data collected:** 15 cards from 2 matches (Netherlands vs Japan, Sweden vs Tunisia)

## Data Location

- **CSV File:** `data/worldcup-cards.csv`
- **Format:** match, date, team, player, card_type, minute

## Where to Find Card Data

Wikipedia has detailed match pages for each group with complete card information:

### Group Pages (All 12 Groups)
- Group A: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A
- Group B: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_B
- Group C: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_C
- Group D: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_D
- Group E: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_E
- Group F: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_F ✅ (Data collected)
- Group G: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_G
- Group H: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_H
- Group I: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_I
- Group J: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_J
- Group K: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_K
- Group L: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_L

## How to Identify Cards on Wikipedia

On each group page, scroll down to the "Matches" section. For each match, you'll see:

1. **Match header:** "Team A vs Team B"
2. **Match details:** Date, time, score
3. **Lineup diagram:** Shows both teams' formations
4. **Player lists:** With symbols next to names:
   - **▼** = Yellow card (with minute, e.g., "75'")
   - **■** = Red card (with minute)
   - **▼ ▼** = Two yellow cards (second yellow = red)

### Example from Sweden vs Tunisia:

```
Sweden lineup:
- Jesper Karlström ▼ 84'
- Gabriel Gudmundsson ▼ 65'
- Alexander Isak ▼ 90+1'

Tunisia lineup:
- Rani Khedira ■ 54' ▼ 84' (yellow at 54', red at 84')
- Yan Valery ▼ 72'
- Ellyes Skhiri ▼ 72'
```

## Manual Data Entry Process

1. Open a group page (e.g., Group A)
2. Scroll to "Matches" section
3. For each finished match:
   - Note the match name and date
   - Look through both team lineups
   - Find players with ▼ or ■ symbols
   - Record: match, date, team, player name, card type, minute
4. Add rows to `data/worldcup-cards.csv`

## CSV Format

```csv
match,date,team,player,card_type,minute
Netherlands vs Japan,June 14 2026,Japan,Tsuyoshi Watanabe,Yellow,75
Sweden vs Tunisia,June 14 2026,Tunisia,Rani Khedira,Red,84
```

## Current Data Summary

**From 2 matches (12 total matches played):**
- Total cards: 15
- Yellow cards: 14
- Red cards: 1
- Matches with data: 2/12 (16.7%)

## Next Steps

### Option 1: Manual Collection (Recommended for now)
- Visit each group page
- Copy card data from finished matches
- Add to CSV file
- Takes ~5-10 minutes per group

### Option 2: Automated Scraping (Complex)
- Wikipedia's HTML structure is complex
- Card symbols may be rendered as images or special entities
- Would require advanced HTML parsing
- May need to use Selenium/browser automation

### Option 3: Wait for Better API
- Check if worldcup26.ir adds card data later
- Monitor for other free APIs with card statistics

## Integration with Website

Once you have more card data, you can:

1. **Display card counts in group tables**
   - Add yellow card column to standings
   - Show total cards per team

2. **Create card leaderboard**
   - Most yellow cards by player
   - Most cards by team
   - Fair play rankings

3. **Match details**
   - Show cards in match summaries
   - Timeline of cards during match

## Tips

- Wikipedia updates quickly after matches
- Data is usually accurate within hours of match completion
- Check "View history" on Wikipedia to see when data was last updated
- Some matches may not have complete card data immediately

## Files

- `data/worldcup-cards.csv` - Card data storage
- `scrape-wikipedia-cards.py` - Automated scraper (needs improvement)
- This guide - `CARD_DATA_GUIDE.md`