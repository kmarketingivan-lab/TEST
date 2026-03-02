@echo off
echo ============================================
echo  ARMERIA PALMETTO - LAUNCHER 8 STREAM
echo  106 Task in 8 Claude Code paralleli
echo ============================================
echo.

cd /d C:\Users\cresc\Projects\my-ecommerce-v2

echo [FASE 1] Avvio Stream A (Database) e G (Email/SEO)...
start "Stream A - Database" cmd /c todos\run_A.bat
timeout /t 3 /nobreak >nul
start "Stream G - SEO Email" cmd /c todos\run_G.bat
timeout /t 3 /nobreak >nul

echo [FASE 2] Avvio Stream B, C, D, E, F, H...
start "Stream B - Homepage" cmd /c todos\run_B.bat
timeout /t 2 /nobreak >nul
start "Stream C - Catalogo" cmd /c todos\run_C.bat
timeout /t 2 /nobreak >nul
start "Stream D - Checkout" cmd /c todos\run_D.bat
timeout /t 2 /nobreak >nul
start "Stream E - Account" cmd /c todos\run_E.bat
timeout /t 2 /nobreak >nul
start "Stream F - Blog" cmd /c todos\run_F.bat
timeout /t 2 /nobreak >nul
start "Stream H - Admin" cmd /c todos\run_H.bat

echo.
echo ============================================
echo  8 stream avviati! Controlla le finestre.
echo  I file TODO_X_DONE.md verranno creati
echo  in todos/ man mano che completano.
echo ============================================
pause
