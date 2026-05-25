@echo off
echo ============================================
echo         Starting AdaptFit Application
echo ============================================
echo.

echo [1/3] Starting Backend (Spring Boot)...
start "AdaptFit Backend" cmd /k "cd /d "C:\Users\Aman Choudhary\Downloads\AdaptFit\AdaptFit" && mvn spring-boot:run"

echo [2/3] Waiting for backend to load (20 seconds)...
timeout /t 20 /nobreak > nul

echo [3/3] Starting New Frontend (Vite)...
start "AdaptFit Frontend" cmd /k "cd /d "C:\Users\Aman Choudhary\Downloads\AdaptFit\AdaptFit\adaptfit-ui" && npm run dev"

echo Waiting for frontend...
timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo  Opening AdaptFit in browser...
echo ============================================
start http://localhost:5173

echo Done! You can close this window.
