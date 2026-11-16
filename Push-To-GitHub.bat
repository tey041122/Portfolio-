@echo off
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"
cd /d "%~dp0"
echo ======================================================================
echo   Updating Portfolio on GitHub: https://github.com/tey041122/portfolio_boss
echo ======================================================================
echo.
echo 1. Staging any new changes...
git add .
echo.
echo 2. Committing changes...
git commit -m "Update website content and assets"
echo.
echo 3. Pushing to GitHub...
git push -u origin main
echo.
echo ======================================================================
echo Done! Your live website will automatically update in 1 to 2 minutes.
pause
