# 🎯 API-Sports Widgets - Easiest Solution!

## Why Widgets Are Better

Instead of writing Python scrapers and handling API calls, **API-Sports Widgets** give you ready-to-use components that:

✅ **No coding required** - Just copy/paste HTML  
✅ **Auto-refresh** - Updates every 15 seconds automatically  
✅ **Beautiful UI** - Professional design out of the box  
✅ **Interactive** - Click matches to see details, standings, players  
✅ **Free tier available** - Same API key as API-Football  

## Quick Setup (5 minutes)

### Step 1: Get Your API Key

Same as before - get your free key from https://www.api-football.com/

### Step 2: Choose Integration Method

You have **two options**:

#### Option A: Replace Your Entire Site (Simplest)
Use the pre-built widget page that handles everything

#### Option B: Embed Widgets in Your Current Site
Keep your design, add widgets for live data

---

## Option A: Complete Widget Page (Recommended)

This gives you a full World Cup page with schedule, standings, and match details.

### Create `worldcup-widgets.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>World Cup 2026 Sweepstakes</title>
  
  <!-- Bootstrap for layout -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"></script>
  
  <!-- API-Sports Widgets -->
  <script type="module" crossorigin src="https://widgets.api-sports.io/3.1.0/widgets.js"></script>
  
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .card {
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    api-sports-widget {
      --primary-font-size: 0.9rem;
      --secondary-font-size: 0.85rem;
      --button-font-size: 0.85rem;
      --title-font-size: 1rem;
      height: 75vh;
    }
    
    .modal-widget {
      width: 90%;
      max-width: 800px;
    }
    
    .modal-widget-content {
      padding: 0;
      height: 70vh;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>⚽ World Cup 2026 Sweepstakes</h1>
    <p>Live scores, standings, and match details</p>
  </div>

  <div class="container-fluid">
    <div class="row g-3">
      
      <!-- Left: Match Schedule -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">📅 Match Schedule</h5>
          </div>
          <div class="card-body p-0">
            <api-sports-widget data-type="league"></api-sports-widget>
          </div>
        </div>
      </div>
      
      <!-- Middle: Match Details -->
      <div class="col-lg-4">
        <div id="game-content" class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">🎮 Match Details</h5>
          </div>
          <div class="card-body p-0">
            <!-- Default match shown, updates when you click a match -->
            <api-sports-widget data-type="game" data-game-id="1489369"></api-sports-widget>
          </div>
        </div>
      </div>
      
      <!-- Right: Standings -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">🏆 Standings</h5>
          </div>
          <div class="card-body p-0">
            <api-sports-widget data-type="standings"></api-sports-widget>
          </div>
        </div>
      </div>
      
    </div>
  </div>

  <!-- Global Configuration Widget -->
  <api-sports-widget
    data-type="config"
    data-key="YOUR_API_KEY_HERE"
    data-sport="football"
    data-lang="en"
    data-theme="white"
    data-show-errors="true"
    data-show-logos="true"
    data-refresh="15"
    data-player-injuries="true"
    data-team-squad="true"
    data-team-statistics="true"
    data-player-statistics="true"
    data-game-tab="statistics"
    data-standings="true"
    data-target-standings="true"
    data-target-game="#game-content .card-body"
    data-target-player="modal"
    data-target-team="modal"
    data-tab="results"
    data-league="1"
    data-season="2026"
  ></api-sports-widget>

</body>
</html>
```

**Just replace `YOUR_API_KEY_HERE` with your actual API key!**

---

## Option B: Embed in Your Current Site

Add widgets to your existing [`index.html`](index.html:1) while keeping your player assignments and design.

### 1. Add Widget Script to Your `<head>`:

```html
<script type="module" crossorigin src="https://widgets.api-sports.io/3.1.0/widgets.js"></script>
```

### 2. Add a "Live Data" Tab to Your Sidebar:

```html
<button class="nav-item" onclick="showPage('live-data')">
  <span>🔴 Live Data</span>
</button>
```

### 3. Add Live Data Page Section:

```html
<!-- LIVE DATA PAGE -->
<div id="live-data-page" class="page">
  <div class="row">
    <div class="col-md-6">
      <div class="content-card">
        <h2>Live Matches</h2>
        <api-sports-widget data-type="league"></api-sports-widget>
      </div>
    </div>
    <div class="col-md-6">
      <div class="content-card">
        <h2>Current Standings</h2>
        <api-sports-widget data-type="standings"></api-sports-widget>
      </div>
    </div>
  </div>
</div>
```

### 4. Add Config Widget Before `</body>`:

```html
<api-sports-widget
  data-type="config"
  data-key="YOUR_API_KEY_HERE"
  data-sport="football"
  data-lang="en"
  data-theme="dark"
  data-league="1"
  data-season="2026"
  data-refresh="30"
></api-sports-widget>
```

---

## Widget Configuration Options

### Available Themes
```html
data-theme="white"   <!-- Light theme -->
data-theme="grey"    <!-- Grey theme -->
data-theme="dark"    <!-- Dark theme -->
data-theme="blue"    <!-- Blue theme -->
```

### Refresh Rate
```html
data-refresh="15"     <!-- Every 15 seconds (default) -->
data-refresh="30"     <!-- Every 30 seconds -->
data-refresh="60"     <!-- Every minute -->
data-refresh="false"  <!-- Disable auto-refresh -->
```

### Available Widget Types
```html
<api-sports-widget data-type="league"></api-sports-widget>      <!-- Match schedule -->
<api-sports-widget data-type="standings"></api-sports-widget>   <!-- League table -->
<api-sports-widget data-type="game" data-game-id="123"></api-sports-widget>  <!-- Single match -->
<api-sports-widget data-type="player" data-player-id="456"></api-sports-widget>  <!-- Player profile -->
```

---

## Customization

### Change Font Sizes
```css
api-sports-widget {
  --primary-font-size: 1rem;
  --secondary-font-size: 0.9rem;
  --button-font-size: 0.9rem;
  --title-font-size: 1.1rem;
}
```

### Change Widget Height
```css
api-sports-widget {
  height: 600px;  /* Fixed height */
  height: 80vh;   /* Viewport-relative */
}
```

### Match Your Site Colors
Create a custom theme - see [Widget Documentation](https://www.api-sports.io/documentation/widgets/v3)

---

## Comparison: Widgets vs Python Scraper

| Feature | Widgets | Python Scraper |
|---------|---------|----------------|
| Setup Time | 5 minutes | 30 minutes |
| Coding Required | None | Python knowledge |
| Auto-refresh | Built-in (15s) | Manual setup |
| UI Design | Professional | DIY |
| Maintenance | Zero | Updates needed |
| Interactivity | Click to expand | Custom code |
| Mobile Friendly | Yes | Depends |

## Recommendation

**For your sweepstakes site:**

1. **Use Option B** - Keep your current design with player assignments
2. **Add a "Live Data" tab** with the league and standings widgets
3. **Keep your existing pages** for the sweepstakes leaderboard
4. **Best of both worlds** - Your custom features + live official data

---

## Next Steps

1. ✅ Get API key from https://www.api-football.com/
2. ✅ Choose Option A (full widget page) or Option B (embed in current site)
3. ✅ Replace `YOUR_API_KEY_HERE` with your actual key
4. ✅ Test locally or deploy to GitHub Pages
5. ✅ Enjoy automatic live updates!

## Resources

- 📖 **Widget Builder**: https://dashboard.api-sports.io/widgets
- 📚 **Widget Docs**: https://www.api-sports.io/documentation/widgets/v3
- 🎨 **Custom Themes**: https://www.api-sports.io/documentation/widgets/v3#custom-theme
- 💬 **Support**: support@api-sports.io

---

**Want me to implement Option B and integrate widgets into your current site?** Just say the word! 🚀