# Deployment Guide - World Cup Sweepstakes Tracker

This guide explains how to host your sweepstakes website on various platforms.

## Quick Start - Free Hosting Options

### Option 1: GitHub Pages (Recommended - Free & Easy)

**Steps:**

1. **Create a GitHub account** (if you don't have one)
   - Go to https://github.com
   - Sign up for free

2. **Create a new repository**
   - Click the "+" icon → "New repository"
   - Name it: `world-cup-sweepstakes`
   - Make it Public
   - Click "Create repository"

3. **Upload your files**
   - Click "uploading an existing file"
   - Drag and drop these files:
     - `index.html`
     - `script.js`
     - `styles.css`
     - `README.md`
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://YOUR-USERNAME.github.io/world-cup-sweepstakes/`

**Time to deploy:** 5 minutes  
**Cost:** Free  
**Custom domain:** Yes (optional)

---

### Option 2: Netlify (Free & Drag-and-Drop)

**Steps:**

1. **Go to Netlify**
   - Visit https://www.netlify.com
   - Sign up for free (use GitHub, Google, or email)

2. **Deploy your site**
   - Click "Add new site" → "Deploy manually"
   - Drag and drop your project folder (containing all 3 files)
   - Wait 30 seconds for deployment

3. **Your site is live!**
   - Netlify gives you a URL like: `https://random-name-12345.netlify.app`
   - You can customize the name in Site settings

**Time to deploy:** 2 minutes  
**Cost:** Free  
**Custom domain:** Yes (optional)  
**Auto-deploy:** Yes (connect to GitHub for automatic updates)

---

### Option 3: Vercel (Free & Fast)

**Steps:**

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import your project**
   - Click "Add New" → "Project"
   - Import from GitHub (or upload files)
   - Click "Deploy"

3. **Your site is live!**
   - URL: `https://your-project.vercel.app`

**Time to deploy:** 2 minutes  
**Cost:** Free  
**Custom domain:** Yes (optional)

---

### Option 4: Simple HTTP Server (Local Testing)

If you just want to test locally without CORS issues:

**Using Python (Mac/Linux/Windows):**

```bash
# Navigate to your project folder
cd /Users/cormac/sweepstakes

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

**Using Node.js:**

```bash
# Install http-server globally
npm install -g http-server

# Run in your project folder
cd /Users/cormac/sweepstakes
http-server

# Or specify port
http-server -p 8000
```

Then open: `http://localhost:8000`

**Using VS Code:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## Detailed GitHub Pages Setup

### Step-by-Step with Screenshots

1. **Prepare your files**
   ```
   sweepstakes/
   ├── index.html
   ├── script.js
   ├── styles.css
   └── README.md
   ```

2. **Create GitHub repository**
   - Repository name: `world-cup-sweepstakes`
   - Description: "World Cup 2026 Sweepstakes Tracker"
   - Public repository
   - Don't initialize with README (you already have one)

3. **Upload via GitHub website**
   - Click "uploading an existing file"
   - Select all 4 files
   - Commit message: "Initial commit"
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Save

5. **Wait 1-2 minutes**
   - GitHub will build your site
   - Visit: `https://YOUR-USERNAME.github.io/world-cup-sweepstakes/`

### Using Git Command Line (Advanced)

```bash
# Navigate to your project
cd /Users/cormac/sweepstakes

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/world-cup-sweepstakes.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then enable GitHub Pages in repository settings.

---

## Custom Domain Setup

### For GitHub Pages:

1. **Buy a domain** (optional)
   - Namecheap, Google Domains, GoDaddy, etc.
   - Example: `worldcupsweeps.com`

2. **Configure DNS**
   - Add CNAME record pointing to: `YOUR-USERNAME.github.io`
   - Or A records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Update GitHub Pages settings**
   - Settings → Pages
   - Custom domain: `worldcupsweeps.com`
   - Save
   - Enable "Enforce HTTPS"

---

## Troubleshooting

### CORS Issues

If you see CORS errors:

1. **Host on a web server** (not file://)
   - Use any of the hosting options above
   - This solves 99% of CORS issues

2. **Use a CORS proxy** (temporary solution)
   ```javascript
   // In script.js, update API_CONFIG:
   baseUrl: 'https://cors-anywhere.herokuapp.com/https://worldcupjson.net/matches'
   ```

3. **Wait for World Cup 2026**
   - The API might not have data yet
   - Site will work with mock data until then

### Site Not Updating

1. **Clear browser cache**
   - Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private mode

2. **Check GitHub Pages status**
   - Settings → Pages
   - Look for green checkmark
   - May take 1-2 minutes after pushing changes

3. **Verify files uploaded correctly**
   - Check repository has all 3 files
   - File names are correct (case-sensitive)

---

## Updating Your Site

### Via GitHub Website:
1. Go to your repository
2. Click on the file you want to edit
3. Click the pencil icon (Edit)
4. Make changes
5. Commit changes
6. Wait 1-2 minutes for deployment

### Via Git Command Line:
```bash
# Make your changes to files
# Then:
git add .
git commit -m "Update standings"
git push
```

---

## Sharing Your Site

Once deployed, share your URL with friends:

**GitHub Pages:**
```
https://YOUR-USERNAME.github.io/world-cup-sweepstakes/
```

**Netlify:**
```
https://your-site-name.netlify.app
```

**Vercel:**
```
https://your-project.vercel.app
```

You can also:
- Create a QR code for easy mobile access
- Share on social media
- Add to group chat
- Bookmark on everyone's phones

---

## Recommended: GitHub Pages

**Why GitHub Pages?**
- ✅ Completely free
- ✅ No credit card required
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Easy to update
- ✅ Version control included
- ✅ No server maintenance
- ✅ Fast global CDN

**Perfect for:**
- Personal projects
- Small group sweepstakes
- Long-term hosting
- Learning web development

---

## Need Help?

1. **GitHub Pages Documentation**
   - https://pages.github.com

2. **Netlify Documentation**
   - https://docs.netlify.com

3. **Vercel Documentation**
   - https://vercel.com/docs

4. **Common Issues**
   - Check the browser console (F12) for errors
   - Verify all files are uploaded
   - Ensure file names match exactly
   - Wait a few minutes after deployment

---

## Next Steps

After deployment:
1. Test the site on mobile devices
2. Share the URL with your sweepstakes group
3. Bookmark it for easy access
4. Wait for World Cup 2026 to start!
5. The standings will update automatically once matches begin

Good luck with your sweepstakes! 🏆⚽