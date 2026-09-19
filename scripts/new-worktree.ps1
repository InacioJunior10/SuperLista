# Cria uma worktree em ..\SuperLista-worktrees\<branch-com-hifen> e instala dependências.
# Se a branch ainda não existe, ela é criada a partir de -Base; se já existe, é apenas usada.
# Pode ser executado de qualquer worktree: os caminhos partem sempre do repositório principal.
# Uso: .\scripts\new-worktree.ps1 -Branch feature/tela-lista [-Base main] [-SkipInstall]
param(
    [Parameter(Mandatory = $true)][string]$Branch,
    [string]$Base = "main",
    [switch]$SkipInstall
)
$ErrorActionPreference = "Stop"

# Repositório principal = pasta que contém o .git comum (mesmo dentro de uma worktree).
$common = git -C $PSScriptRoot rev-parse --path-format=absolute --git-common-dir
$repo = Split-Path -Parent $common
$root = Join-Path (Split-Path -Parent $repo) "SuperLista-worktrees"
$path = Join-Path $root ($Branch -replace "[/\\]", "-")

if ($Branch -notmatch "^(feat|feature|fix|chore|docs|refactor|test)/[a-z0-9][a-z0-9-]*$") {
    throw "Branch '$Branch' fora da convenção <tipo>/<slug> (feat|feature|fix|chore|docs|refactor|test)."
}
if (Test-Path $path) { throw "Já existe: $path" }

# O git recusa duas worktrees na mesma branch: avise antes com uma mensagem clara.
$inUse = git -C $repo worktree list --porcelain | Where-Object { $_ -eq "branch refs/heads/$Branch" }
if ($inUse) {
    throw "'$Branch' já está com checkout em outra worktree (veja 'git worktree list'). Se for a principal, rode 'git switch main' nela."
}

git -C $repo show-ref --verify --quiet "refs/heads/$Branch"
$exists = ($LASTEXITCODE -eq 0)

New-Item -ItemType Directory -Force $root | Out-Null
if ($exists) {
    git -C $repo worktree add $path $Branch
} else {
    git -C $repo worktree add -b $Branch $path $Base
}
if ($LASTEXITCODE -ne 0) { throw "git worktree add falhou" }

if (-not $SkipInstall) {
    Push-Location $path
    try { npm install } finally { Pop-Location }
}
Write-Host "Worktree pronta: $path" -ForegroundColor Green
