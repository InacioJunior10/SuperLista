# Verificação completa: typecheck, lint e testes.
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$steps = @(
    @{ Name = "Typecheck"; Cmd = { npm run typecheck } },
    @{ Name = "Lint";      Cmd = { npm run lint } },
    @{ Name = "Testes";    Cmd = { npm test } }
)

foreach ($step in $steps) {
    Write-Host "==> $($step.Name)" -ForegroundColor Cyan
    & $step.Cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Falhou: $($step.Name)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
Write-Host "Tudo certo." -ForegroundColor Green

