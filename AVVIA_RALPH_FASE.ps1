#!/usr/bin/env pwsh
# AVVIA_RALPH_FASE.ps1
# Usa questo script per avviare Ralph su una singola fase specifica.
# Utile per riprendere da dove ti sei fermato o per rifare una fase.
#
# USO: .\AVVIA_RALPH_FASE.ps1 -Fase L2
# oppure: .\AVVIA_RALPH_FASE.ps1 -Fase L2 -Task L2.4

param(
    [Parameter(Mandatory=$true)]
    [string]$Fase,

    [Parameter(Mandatory=$false)]
    [string]$Task = ""
)

Set-Location "C:\Users\cresc\Projects\my-ecommerce-v2"

if ($Task -ne "") {
    $Istruzione = "Leggi TODO_LIVE.md e completa SOLO la task $Task della fase $Fase. Segui le stesse regole operative del file. Segna la task con [x] quando completata."
} else {
    $Istruzione = "Leggi TODO_LIVE.md e completa SOLO la fase $Fase (tutte le sue task). Segui le stesse regole operative del file. Segna le task con [x] man mano che le completi. Alla fine esegui: npx tsc --noEmit && npm run build"
}

claude --dangerously-skip-permissions -p $Istruzione
