# World Cup Sweepstakes 2026

A live tracking dashboard for World Cup 2026 sweepstakes with real-time match updates, group standings, knockout brackets, and leaderboards.

## 🌐 Live Demo

Visit the live site: [https://c0rm1.github.io/world-cup-sweepstakes/](https://c0rm1.github.io/world-cup-sweepstakes/)

## 📋 Features

- **Live Match Updates**: Real-time scores and match statistics
- **Group Stage Tracking**: View all groups with team standings
- **Knockout Brackets**: Follow the tournament progression
- **Leaderboard**: Track sweepstakes participants' performance
- **Third Place Rankings**: Special tracking for third-place teams
- **Fixtures Schedule**: Complete match schedule with venues

## 🚀 GitHub Pages Deployment

This repository is configured for GitHub Pages deployment.

### Setup Instructions

1. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select the branch you want to deploy (usually `main` or `master`)
   - Select the root folder `/` as the source
   - Click "Save"

2. **Access Your Site**:
   - Your site will be available at: `https://c0rm1.github.io/world-cup-sweepstakes/`
   - It may take a few minutes for the initial deployment

3. **Custom Domain (Optional)**:
   - In the Pages settings, you can add a custom domain
   - Follow GitHub's instructions for DNS configuration

### Automatic Updates

The repository includes a GitHub Actions workflow (`.github/workflows/update-cards.yml`) that can automatically update data. Make sure GitHub Actions is enabled in your repository settings.

## 📁 Project Structure

```
sweepstakes/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── script.js               # Main JavaScript logic
├── load-api-data.js        # API data loading
├── data/                   # Data files
│   ├── matches.csv         # Match results
│   ├── teams.json          # Team information
│   ├── groups.json         # Group data
│   ├── stadiums.json       # Stadium information
│   └── worldcup-cards-enriched.csv  # Card data
├── _config.yml             # GitHub Pages configuration
└── .nojekyll               # Bypass Jekyll processing
```

## 🛠️ Local Development

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/c0rm1/world-cup-sweepstakes.git
   cd world-cup-sweepstakes
   ```

2. Serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Python 2
   python -m SimpleHTTPServer 8000
   
   # Or using Node.js
   npx http-server
   ```

3. Open your browser to `http://localhost:8000`

## 📊 Data Management

### Updating Match Data

Match data is stored in `data/matches.csv`. Update this file to reflect current match results.

### Card Data

Player card assignments are in `data/worldcup-cards-enriched.csv`.

## 🔧 Configuration

- **_config.yml**: GitHub Pages Jekyll configuration
- **.nojekyll**: Ensures GitHub Pages serves files without Jekyll processing
- **.gitignore**: Excludes Python cache, environment files, and IDE settings

## 📝 Notes

- All file paths are relative and work both locally and on GitHub Pages
- The `.nojekyll` file ensures that files starting with underscores are served correctly
- CSS and JavaScript files use cache-busting query parameters (`?v=4`)

## 🤝 Contributing

Feel free to submit issues or pull requests to improve the dashboard.

## 📄 License

This project is open source and available for personal use.