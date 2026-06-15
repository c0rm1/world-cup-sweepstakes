# World Cup 2026 Sweepstakes Tracker

A real-time World Cup sweepstakes tracking website with live group standings, league tables, knockout brackets, and statistics.

## Features

- **Live Group Standings**: Automatically updates every 60 seconds from World Cup API
- **League Table**: Track player points based on team performance (3 points for win, 1 for draw)
- **Knockout Bracket**: Projected matchups based on current group standings
- **Statistics**: Track fastest goals, fastest cards, most goals conceded, and card totals

## Setup

1. Open `index.html` in a web browser
2. The site will automatically attempt to fetch live data from the World Cup API

## API Configuration

The site is configured to use the World Cup JSON API. To customize the data source:

1. Open `script.js`
2. Find the `API_CONFIG` object (around line 75)
3. Update the `baseUrl` to your preferred API endpoint
4. Adjust `updateInterval` to change refresh frequency (in milliseconds)

### Supported APIs

The site works with any API that returns match data in the following format:

```json
[
  {
    "status": "completed",
    "home_team": {
      "name": "Brazil",
      "goals": 2
    },
    "away_team": {
      "name": "Argentina", 
      "goals": 1
    }
  }
]
```

### Popular World Cup APIs

- **World Cup JSON**: `https://worldcupjson.net/matches`
- **FIFA Official API**: Contact FIFA for access
- **Custom API**: You can create your own API endpoint

## Manual Data Entry

If no API is available, the site will use mock data. You can manually update team standings by:

1. Opening the browser console (F12)
2. Modifying the `teamStandings` object
3. Calling `renderGroups()` to refresh the display

Example:
```javascript
teamStandings['BRA'].played = 3;
teamStandings['BRA'].won = 2;
teamStandings['BRA'].drawn = 1;
teamStandings['BRA'].points = 7;
renderGroups();
```

## Player Teams

| Player | Teams |
|--------|-------|
| Adam Mc | POR, PAR, NOR, HAI |
| Darragh | BRA, CIV, ALG, IRN |
| Simon | GER, PAN, RSA, QAT |
| Ben | MEX, KSA, SCO, AUT |
| Josie | FRA, JPN, UZB, ARG |
| Cormac | BEL, COL, EGY, NED |
| Cole | ENG, ECU, TUN, NZL |
| Liam | ESP, CRO, GHA, JOR |
| Willie | CAN, KOR, CUW, CPV |
| Danny | USA, URU, COD, SWE |
| Laura | AUS, SEN, TUR, CZE |
| Adam K | SUI, MAR, IRQ, BIH |

## Troubleshooting

### Data Not Updating

1. Check browser console for API errors
2. Verify API endpoint is accessible
3. Check CORS settings if using external API
4. Use the "Refresh Now" button to manually trigger an update

### CORS Issues

If you encounter CORS errors when accessing external APIs:

1. Use a CORS proxy service
2. Host the API on the same domain
3. Configure the API server to allow CORS requests
4. Use a browser extension to disable CORS (development only)

## Customization

### Change Update Frequency

Edit `API_CONFIG.updateInterval` in `script.js`:
```javascript
updateInterval: 30000 // Update every 30 seconds
```

### Add More Statistics

Extend the `statistics` object in `script.js` to track additional metrics.

### Modify Styling

Edit `styles.css` to customize colors, fonts, and layout.

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## License

Free to use for personal sweepstakes tracking.