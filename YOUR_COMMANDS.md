# Your Personal Deployment Commands

Hi Cormac! Here are the exact commands for YOUR GitHub account (c0rm1).

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `world-cup-sweepstakes`
3. Make it **Public**
4. **DO NOT** check "Add a README file"
5. Click "Create repository"

## Step 2: Run These Commands

Copy and paste these commands into your Terminal:

```bash
cd /Users/cormac/sweepstakes

git remote add origin https://github.com/c0rm1/world-cup-sweepstakes.git

git push -u origin main
```

GitHub will ask for authentication:
- Username: `c0rm1`
- Password: Your GitHub password (or Personal Access Token)

## Step 3: Enable GitHub Pages

1. Go to: https://github.com/c0rm1/world-cup-sweepstakes/settings/pages
2. Under "Source", select "main" branch
3. Click "Save"

## Your Site Will Be Live At:

```
https://c0rm1.github.io/world-cup-sweepstakes/
```

Wait 1-2 minutes after enabling Pages, then visit the URL above!

---

## If You Get Authentication Errors

GitHub may require a Personal Access Token instead of your password:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Sweepstakes Deploy"
4. Check the "repo" scope
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. Use this token as your password when pushing

---

## Quick Check

After pushing, verify your files are on GitHub:
https://github.com/c0rm1/world-cup-sweepstakes

You should see all 8 files:
- index.html
- script.js
- styles.css
- README.md
- DEPLOYMENT.md
- QUICK_START.md
- deploy.sh
- deploy.bat

---

## Share Your Site

Once live, share this URL with your friends:
```
https://c0rm1.github.io/world-cup-sweepstakes/
```

Good luck with the sweepstakes! 🏆⚽