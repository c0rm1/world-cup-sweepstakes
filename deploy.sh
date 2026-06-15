#!/bin/bash

# World Cup Sweepstakes - GitHub Deployment Script
# This script will help you deploy your site to GitHub Pages

echo "🏆 World Cup Sweepstakes - GitHub Deployment 🏆"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   Mac: brew install git"
    echo "   Windows: Download from https://git-scm.com"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " github_username

if [ -z "$github_username" ]; then
    echo "❌ Username cannot be empty"
    exit 1
fi

echo ""
echo "📝 Repository will be created at:"
echo "   https://github.com/$github_username/world-cup-sweepstakes"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://$github_username.github.io/world-cup-sweepstakes/"
echo ""

read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📁 Adding files..."
git add index.html script.js styles.css README.md DEPLOYMENT.md

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit - World Cup 2026 Sweepstakes Tracker"

# Rename branch to main
echo "🔄 Setting up main branch..."
git branch -M main

# Add remote
echo "🔗 Connecting to GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$github_username/world-cup-sweepstakes.git

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Go to GitHub and create a new repository:"
echo "   https://github.com/new"
echo ""
echo "2. Repository settings:"
echo "   - Name: world-cup-sweepstakes"
echo "   - Public repository"
echo "   - DON'T initialize with README"
echo ""
echo "3. After creating the repository, run this command:"
echo "   git push -u origin main"
echo ""
echo "4. Enable GitHub Pages:"
echo "   - Go to repository Settings → Pages"
echo "   - Source: Deploy from branch 'main'"
echo "   - Click Save"
echo ""
echo "5. Your site will be live in 1-2 minutes at:"
echo "   https://$github_username.github.io/world-cup-sweepstakes/"
echo ""
echo "Need help? Check DEPLOYMENT.md for detailed instructions!"

# Made with Bob
