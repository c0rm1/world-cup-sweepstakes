# DNS Configuration Guide for cormisworldcupsweeps.com

## Step 1: CNAME File (✅ DONE)
The CNAME file has been added to your repository and pushed to GitHub.

## Step 2: Configure DNS with Your Domain Registrar

You need to add DNS records with whoever you bought the domain from (e.g., GoDaddy, Namecheap, Google Domains, etc.).

### Option A: Using an Apex Domain (cormisworldcupsweeps.com)

Add these **A records**:
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### Option B: Using www subdomain (www.cormisworldcupsweeps.com)

Add this **CNAME record**:
```
Type: CNAME
Name: www
Value: c0rm1.github.io
```

### Recommended: Add both!

For best results, add all 4 A records above AND the CNAME record. This way both `cormisworldcupsweeps.com` and `www.cormisworldcupsweeps.com` will work.

## Step 3: Wait for DNS Propagation

- DNS changes can take 24-48 hours to fully propagate
- Usually works within 1-2 hours
- You can check status at: https://www.whatsmydns.net/

## Step 4: Enable HTTPS in GitHub

1. Go to your repository: https://github.com/c0rm1/world-cup-sweepstakes
2. Click **Settings**
3. Scroll to **Pages** section
4. Once DNS is working, check **Enforce HTTPS**

## Troubleshooting

If the domain doesn't work after 24 hours:
1. Verify DNS records are correct in your registrar's dashboard
2. Make sure there are no conflicting records
3. Check GitHub Pages settings show your custom domain
4. Try clearing your browser cache

## Where to Add DNS Records

Common registrars and where to find DNS settings:

- **GoDaddy**: My Products → Domain → DNS Management
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Google Domains**: My Domains → DNS
- **Cloudflare**: DNS → Records

Need help? Let me know which registrar you're using!