@echo off
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"
cd /d "%~dp0"
echo ======================================================================
echo   Pushing Portfolio to GitHub: https://github.com/tey041122/portfolio_boss
echo ======================================================================
echo.
echo If GitHub asks you to sign in, please complete the browser login prompt.
echo.
git push -u origin main
echo.
echo ======================================================================
echo Push complete! Press any key to close this window.
pause
