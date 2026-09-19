# Remove a worktree de uma branch (recusa se houver alterações não commitadas).
# Uso: .\scripts\remove-worktree.ps1 -Branch feat/modal-preco [-DeleteBranch]
param(
    [Parameter(Mandatory = $true)][string]$Branch,
    [switch]$DeleteBranch
)
$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$root = Join-Path (Split-Path -Parent $repo) "SuperLista-worktrees"
$path = Join-Path $root ($Branch -replace "[/\\]", "-")

if (-not (Test-Path $path)) { throw "Worktree não encontrada: $path" }
if (git -C $path status --porcelain) { throw "Há alterações não commitadas em $path. Commite ou descarte antes." }

git -C $repo worktree remove $path
if ($LASTEXITCODE -ne 0) { throw "git worktree remove falhou" }

if ($DeleteBranch) {
    git -C $repo branch -d $Branch   # -d: só apaga se já estiver mesclada
}
git -C $repo worktree prune
Write-Host "Worktree removida: $path" -ForegroundColor Green
