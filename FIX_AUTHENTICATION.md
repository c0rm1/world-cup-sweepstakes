# Fix: Password Authentication Not Allowed

GitHub no longer accepts passwords for Git commands. You need to create a Personal Access Token.

## Quick Fix (5 minutes):

### Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens

2. Click "Generate new token" → "Generate new token (classic)"

3. Settings:
   - Note: `Sweepstakes Deploy`
   - Expiration: `90 days` (or longer)
   - Check these scopes:
     - ✅ **repo** (all repo permissions)

4. Click "Generate token" at the bottom

5. **IMPORTANT:** Copy the token NOW (it looks like: `ghp_xxxxxxxxxxxx`)
   - You won't be able to see it again!
   - Save it somewhere safe

### Step 2: Use Token to Push

Run this command in Terminal:

```bash
cd /Users/cormac/sweepstakes && git push -u origin main
```

When prompted:
- **Username:** `c0rm1`
- **Password:** Paste your token (ghp_xxxxxxxxxxxx)

The token acts as your password!

### Step 3: Enable GitHub Pages

After successful push:

1. Go to: https://github.com/c0rm1/world-cup-sweepstakes/settings/pages
2. Source: main branch
3. Save

Your site: https://c0rm1.github.io/world-cup-sweepstakes/

---

## Alternative: Use SSH (No Token Needed)

If you prefer SSH authentication:

### 1. Generate SSH Key (if you don't have one):
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
Press Enter 3 times (accept defaults)

### 2. Copy your public key:
```bash
cat ~/.ssh/id_ed25519.pub
```

### 3. Add to GitHub:
- Go to: https://github.com/settings/keys
- Click "New SSH key"
- Paste your public key
- Save

### 4. Change remote to SSH:
```bash
cd /Users/cormac/sweepstakes
git remote set-url origin git@github.com:c0rm1/world-cup-sweepstakes.git
git push -u origin main
```

No password needed!

---

## Troubleshooting

**"Token doesn't work"**
- Make sure you checked the "repo" scope when creating it
- Make sure you copied the entire token (starts with ghp_)

**"Still asking for password"**
- You might have an old credential cached
- Run: `git credential-osxkeychain erase`
- Then try pushing again

**"Permission denied"**
- Make sure the repository exists: https://github.com/c0rm1/world-cup-sweepstakes
- Make sure you're logged into the correct GitHub account

---

## Quick Summary

1. Create token: https://github.com/settings/tokens
2. Check "repo" scope
3. Copy token
4. Run: `git push -u origin main`
5. Use token as password
6. Enable Pages
7. Done!