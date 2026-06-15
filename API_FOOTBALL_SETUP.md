# API-Football Setup Guide

## Quick Start

### 1. Get Your Free API Key

1. Go to [API-Football](https://www.api-football.com/)
2. Click "Get Started" or "Sign Up"
3. Choose the **FREE plan** (100 requests/day)
4. Verify your email
5. Copy your API key from the dashboard

### 2. Configure the Script

Open [`scrape-worldcup.py`](scrape-worldcup.py:13) and replace:
```python
API_KEY = "YOUR_API_KEY_HERE"
```

With your actual API key:
```python
API_KEY = "abc123your-actual-api-key-here"
```

### 3. Install Dependencies

```bash
pip install requests
```

Or if you don't have pip:
```bash
python3 -m pip install requests
```

### 4. Run the Script

```bash
python3 scrape-worldcup.py
```

This will:
- Fetch all World Cup 2026 fixtures
- Fetch current standings
- Transform data to match your site's format
- Save to `data/worldcup-data.json`

### 5. Update Your Website

The script automatically creates/updates `data/worldcup-data.json`. Now update your [`script.js`](script.js:1) to load this data:

Add this function at the top of your script.js:

```javascript
// Load live data from JSON file
async function loadLiveData() {
    try {
        const response = await fetch('data/worldcup-data.json');
        const data = await response.json();
        
        console.log('Data last updated:', data.lastUpdated);
        
        // Update matches if available
        if (data.matches && data.matches.length > 0) {
            // Merge with existing match data
            updateMatchResults(data.matches);
        }
        
        // Update group standings if available
        if (data.groups && Object.keys(data.groups).length > 0) {
            updateGroupStandings(data.groups);
        }
        
        return true;
    } catch (error) {
        console.warn('Could not load live data, using static data:', error);
        return false;
    }
}

// Update match results from API data
function updateMatchResults(apiMatches) {
    apiMatches.forEach(apiMatch => {
        // Find corresponding match in your data
        const match = matches.find(m => 
            m.matchNum === apiMatch.matchNum ||
            (m.team1 === apiMatch.team1 && m.team2 === apiMatch.team2)
        );
        
        if (match && apiMatch.score1 !== null && apiMatch.score2 !== null) {
            match.score1 = apiMatch.score1;
            match.score2 = apiMatch.score2;
            match.status = apiMatch.status;
        }
    });
}

// Update group standings from API data
function updateGroupStandings(apiGroups) {
    Object.keys(apiGroups).forEach(groupLetter => {
        const apiTeams = apiGroups[groupLetter];
        
        apiTeams.forEach(apiTeam => {
            // Find team in your groups data
            if (groups[groupLetter]) {
                const teamIndex = groups[groupLetter].findIndex(t => t === apiTeam.code);
                if (teamIndex !== -1) {
                    // Update team stats (you'll need to expand your data structure)
                    // For now, this shows the concept
                    console.log(`${apiTeam.code}: ${apiTeam.points} pts`);
                }
            }
        });
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadLiveData();
    // Your existing initialization code...
});
```

## Automation Options

### Option A: Manual Updates (Simplest)

Run the script whenever you want to update data:
```bash
python3 scrape-worldcup.py
```

Then commit and push:
```bash
git add data/worldcup-data.json
git commit -m "Update World Cup data"
git push
```

### Option B: Scheduled Script (Mac/Linux)

Add to your crontab to run every 30 minutes during matches:
```bash
crontab -e
```

Add this line:
```
*/30 * * * * cd /Users/cormac/sweepstakes && python3 scrape-worldcup.py
```

### Option C: GitHub Actions (Recommended)

Create `.github/workflows/update-data.yml`:

```yaml
name: Update World Cup Data

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install requests
      
      - name: Update data
        env:
          API_KEY: ${{ secrets.API_FOOTBALL_KEY }}
        run: |
          # Replace API key in script
          sed -i "s/YOUR_API_KEY_HERE/$API_KEY/" scrape-worldcup.py
          python3 scrape-worldcup.py
      
      - name: Commit and push if changed
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/worldcup-data.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "🔄 Update World Cup data [automated]" && git push)
```

Then add your API key as a GitHub secret:
1. Go to your repo Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `API_FOOTBALL_KEY`
4. Value: Your API key
5. Click "Add secret"

## API Limits

**Free Plan:**
- ✅ 100 requests per day
- ✅ All endpoints
- ✅ World Cup data included

**Usage Tips:**
- Each script run uses ~2 requests (fixtures + standings)
- Running every 30 minutes = 48 requests/day ✅
- Running every 15 minutes = 96 requests/day ✅
- Running every 10 minutes = 144 requests/day ❌ (exceeds limit)

**Recommended Schedule:**
- **During matches:** Every 15-30 minutes
- **Between match days:** Every 2-4 hours
- **Off-season:** Once per day

## Testing

Test the script without affecting your site:

```bash
# Dry run - see what data would be fetched
python3 scrape-worldcup.py

# Check the output
cat data/worldcup-data.json | python3 -m json.tool
```

## Troubleshooting

### "API request failed"
- Check your API key is correct
- Verify you haven't exceeded daily limit (100 requests)
- Check your internet connection

### "No fixtures found"
- World Cup 2026 data might not be available yet in API
- Try with a past World Cup for testing:
  ```python
  SEASON = 2022  # Use 2022 World Cup for testing
  ```

### "Module not found: requests"
```bash
pip install requests
# or
python3 -m pip install requests
```

## Data Structure

The script creates `data/worldcup-data.json` with this structure:

```json
{
  "lastUpdated": "2026-06-15T12:00:00Z",
  "matches": [
    {
      "matchNum": 1,
      "team1": "USA",
      "team2": "MEX",
      "score1": 2,
      "score2": 1,
      "round": "group",
      "group": "A",
      "status": "FT"
    }
  ],
  "groups": {
    "A": [
      {
        "code": "USA",
        "position": 1,
        "played": 3,
        "won": 2,
        "drawn": 1,
        "lost": 0,
        "goalsFor": 5,
        "goalsAgainst": 2,
        "points": 7,
        "yellowCards": 0
      }
    ]
  }
}
```

## Next Steps

1. ✅ Get API key from API-Football
2. ✅ Update `scrape-worldcup.py` with your key
3. ✅ Run script to test: `python3 scrape-worldcup.py`
4. ✅ Update `script.js` to load the JSON data
5. ✅ Set up automation (GitHub Actions recommended)
6. ✅ Test on your live site

## Support

- API-Football Docs: https://www.api-football.com/documentation-v3
- API-Football Support: support@api-football.com
- Free plan details: https://www.api-football.com/pricing

Need help? Just ask!