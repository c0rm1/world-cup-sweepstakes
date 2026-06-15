@echo off
REM World Cup Sweepstakes - GitHub Deployment Script (Windows)
REM This script will help you deploy your site to GitHub Pages

echo.
echo ========================================
echo   World Cup Sweepstakes Deployment
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed!
    echo Please download and install Git from: https://git-scm.com
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Get GitHub username
set /p github_username="Enter your GitHub username: "

if "%github_username%"=="" (
    echo [ERROR] Username cannot be empty
    pause
    exit /b 1
)

echo.
echo Repository will be created at:
echo   https://github.com/%github_username%/world-cup-sweepstakes
echo.
echo Your site will be live at:
echo   https://%github_username%.github.io/world-cup-sweepstakes/
echo.

set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Starting deployment...
echo.

REM Initialize git if not already initialized
if not exist .git (
    echo [1/5] Initializing Git repository...
    git init
    echo [OK] Git initialized
) else (
    echo [OK] Git repository already exists
)

REM Add all files
echo [2/5] Adding files...
git add index.html script.js styles.css README.md DEPLOYMENT.md deploy.sh deploy.bat

REM Commit
echo [3/5] Creating commit...
git commit -m "Initial commit - World Cup 2026 Sweepstakes Tracker"

REM Rename branch to main
echo [4/5] Setting up main branch...
git branch -M main

REM Add remote
echo [5/5] Connecting to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/%github_username%/world-cup-sweepstakes.git

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Go to GitHub and create a new repository:
echo    https://github.com/new
echo.
echo 2. Repository settings:
echo    - Name: world-cup-sweepstakes
echo    - Public repository
echo    - DON'T initialize with README
echo.
echo 3. After creating the repository, run:
echo    git push -u origin main
echo.
echo 4. Enable GitHub Pages:
echo    - Go to Settings -^> Pages
echo    - Source: Deploy from branch 'main'
echo    - Click Save
echo.
echo 5. Your site will be live in 1-2 minutes at:
echo    https://%github_username%.github.io/world-cup-sweepstakes/
echo.
echo Need help? Check DEPLOYMENT.md for details!
echo.
pause

@REM Made with Bob
