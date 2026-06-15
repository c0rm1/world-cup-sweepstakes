# World Cup 2026 Sweepstakes Tracker

Live sweepstakes tracker for FIFA World Cup 2026 with real-time scores, group standings, and knockout bracket.

🌐 **Live Site**: https://c0rm1.github.io/world-cup-sweepstakes/

## Features

- ✅ **Live Scores**: Real-time match results from worldcup26.ir API
- ✅ **Group Standings**: Automatic calculation of points, goal difference, and rankings
- ✅ **Knockout Bracket**: Dynamic bracket that updates as teams advance
- ✅ **Player Tracking**: See which teams each player owns
- ✅ **Smart Updates**: Data refreshes every 5 minutes during match times only
- ✅ **100% Free**: No API keys or authentication required

## How It Works

### Data Source
- **API**: [worldcup26.ir](https://worldcup26.ir) - Free, no authentication
- **Coverage**: All 104 World Cup 2026 matches
- **Updates**: Automated via GitHub Actions during match times

### Automation
- **Smart Scheduling**: Updates every 5 minutes from kickoff until 2 hours after each match
- **Workflow**: `.github/workflows/update-worldcup26-smart.yml`
- **Data Storage**: `data/worldcup-data.json`

### Technology Stack
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python scraper (`scrape-worldcup26.py`)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Project Structure

```
├── index.html              # Main page
├── styles.css              # Styling
├── script.js               # Frontend logic
├── scrape-worldcup26.py    # Data scraper
├── data/
│   └── worldcup-data.json  # Live match data
├── .github/workflows/
│   └── update-worldcup26-smart.yml  # Automation
└── worldcup2026-*.json     # Reference data
```

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/c0rm1/world-cup-sweepstakes.git
   cd world-cup-sweepstakes
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the scraper manually** (optional)
   ```bash
   python3 scrape-worldcup26.py
   ```

4. **View locally**
   - Open `index.html` in a browser
   - Or use a local server: `python3 -m http.server 8000`

## Data Files

- `worldcup2026-schedule.json` - Complete match schedule (104 matches)
- `worldcup2026-teams.json` - All 48 teams with FIFA codes and groups
- `worldcup2026-complete.json` - Combined data with fixtures and groups
- `data/worldcup-data.json` - Live data updated by GitHub Actions

## Scripts

- `scrape-worldcup26.py` - Main scraper for live data
- `build-correct-groups.py` - Generate group assignments from API
- `generate-smart-schedule.py` - Create optimized update schedule

## Contributing

This is a personal project, but feel free to fork and adapt for your own sweepstakes!

## License

See `license.txt` for details.

## Credits

- **API**: [worldcup26.ir](https://worldcup26.ir) - Free World Cup 2026 data
- **Font**: FIFA 26 OTF
- **Built with**: Bob (AI coding assistant)

---

Made for World Cup 2026 🏆