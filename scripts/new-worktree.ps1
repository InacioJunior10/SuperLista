# Cria uma worktree + branch em ..\SuperLista-worktrees\<branch-com-hifen> e instala dependências.
# Uso: .\scripts\new-worktree.ps1 -Branch feat/modal-preco [-Base main] [-SkipInstall]
param(
    [Parameter(Mandatory = $true)][string]$Branch,
    [string]$Base = "main",
    [switch]$SkipInstall
)
$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$root = Join-Path (Split-Path -Parent $repo) "SuperLista-worktrees"
$folder = $Branch -replace "[/\\]", "-"
$path = Join-Path $root $folder

if ($Branch -notmatch "^(feat|fix|chore|docs|refactor|test)/[a-z0-9][a-z0-9-]*$") {
    throw "Branch '$Branch' fora da convenção <tipo>/<slug> (feat|fix|chore|docs|refactor|test)."
}
if (Test-Path $path) { throw "Já existe: $path" }

New-Item -ItemType Directory -Force $root | Out-Null
git -C $repo worktree add -b $Branch $path $Base
if ($LASTEXITCODE -ne 0) { throw "git worktree add falhou" }

if (-not $SkipInstall) {
    Push-Location $path
    try { npm install } finally { Pop-Location }
}
Write-Host "Worktree pronta: $path" -ForegroundColor Green
