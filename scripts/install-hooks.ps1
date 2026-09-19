# Ativa os hooks versionados em .githooks (prepare-commit-msg e commit-msg) neste repositório.
# Vale para todas as worktrees do repositório (core.hooksPath fica na configuração compartilhada).
# Uso: .\scripts\install-hooks.ps1            # instala
#      .\scripts\install-hooks.ps1 -Remove    # desinstala
param([switch]$Remove)
$ErrorActionPreference = "Stop"

$common = git -C $PSScriptRoot rev-parse --path-format=absolute --git-common-dir
$repo = Split-Path -Parent $common

if ($Remove) {
    git -C $repo config --unset core.hooksPath
    Write-Host "Hooks desativados (core.hooksPath removido)." -ForegroundColor Yellow
    return
}

if (-not (Get-Command pwsh -ErrorAction SilentlyContinue) -and -not (Get-Command powershell.exe -ErrorAction SilentlyContinue)) {
    throw "PowerShell não encontrado no PATH."
}
git -C $repo config core.hooksPath .githooks
Write-Host "Hooks ativados: core.hooksPath = .githooks" -ForegroundColor Green
Write-Host "  prepare-commit-msg: sugere 'tipo(escopo): descrição' ao rodar 'git commit' sem -m"
Write-Host "  commit-msg:         valida Conventional Commits em português"
