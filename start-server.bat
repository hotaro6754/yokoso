@echo off
echo ========================================================
echo   Zodeck Zero-Slop Environment Startup Script
echo ========================================================
echo.

:: Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js is not recognized. 
    echo Please install it from https://nodejs.org/ first.
    echo Press any key to exit...
    pause >nul
    exit /b
)

echo [OK] Node.js is installed.
echo.

:: Check if node_modules exists
IF NOT EXIST "node_modules\" (
    echo [*] Installing dependencies for the first time...
    call npm install
) ELSE (
    echo [OK] Dependencies are already installed.
)

echo.
echo [*] Starting the Next.js Live Development Server...
echo [*] You can view the app at http://localhost:3000
echo.
call npm run dev
pause
