# LAUNCHER - 8 Stream Claude Code paralleli
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " ARMERIA PALMETTO - 8 STREAM PARALLELI" -ForegroundColor Cyan
Write-Host " 106 Task totali" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"

Write-Host "`n[FASE 1] Avvio Stream A (Database) e G (SEO/Email)..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream A - Database"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_A.md. You are Stream A. Execute ALL 16 tasks A01-A16 sequentially. Only modify files in the File Ownership section. After each task verify tsc compiles. After all tasks run tests. Create todos/TODO_A_DONE.md when complete."'
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream G - SEO Email"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_G.md. You are Stream G. Execute ALL 14 tasks G01-G14 sequentially. Only modify files in File Ownership. For G01 run npm install resend first. After each task verify tsc compiles. Create todos/TODO_G_DONE.md when complete."'
Start-Sleep -Seconds 3

Write-Host "[FASE 2] Avvio Stream B, C, D, E, F, H..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream B - Homepage"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_B.md. You are Stream B. Execute ALL 16 tasks B01-B16 sequentially. Only modify files in File Ownership. After each task verify tsc compiles. Create todos/TODO_B_DONE.md when complete."'
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream C - Catalogo"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_C.md. You are Stream C. Execute ALL 16 tasks C01-C16 sequentially. Only modify files in File Ownership. After each task verify tsc compiles. Create todos/TODO_C_DONE.md when complete."'
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream D - Checkout"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_D.md. You are Stream D. Execute ALL 12 tasks D01-D12 sequentially. Only modify files in File Ownership. After each task verify tsc compiles. Create todos/TODO_D_DONE.md when complete."'
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream E - Account"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_E.md. You are Stream E. Execute ALL 10 tasks E01-E10 sequentially. Only modify files in File Ownership. After each task verify tsc compiles. Create todos/TODO_E_DONE.md when complete."'
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream F - Blog"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_F.md. You are Stream F. Execute ALL 10 tasks F01-F10 sequentially. Only modify files in File Ownership. After each task verify tsc compiles. Create todos/TODO_F_DONE.md when complete."'
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"; $host.UI.RawUI.WindowTitle = "Stream H - Admin"; claude --dangerously-skip-permissions -p "Read the file todos/TODO_H.md. You are Stream H. Execute ALL 12 tasks H01-H12 sequentially. Only modify files in File Ownership. For H01 run npm install recharts if needed. After each task verify tsc compiles. Create todos/TODO_H_DONE.md when complete."'

Write-Host "`n============================================" -ForegroundColor Green
Write-Host " 8 stream avviati!" -ForegroundColor Green
Write-Host " Controlla le 8 finestre PowerShell." -ForegroundColor Green
Write-Host " TODO_X_DONE.md appariranno in todos/" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
