# Remove a worktree de uma branch (recusa se houver alterações não commitadas).
# Pode ser executado de qualquer worktree, exceto da que está sendo removida.
# Uso: .\scripts\remove-worktree.ps1 -Branch feature/modal-preco [-DeleteBranch]
param(
    [Parameter(Mandatory = $true)][string]$Branch,
    [switch]$DeleteBranch
)
$ErrorActionPreference = "Stop"

$common = git -C $PSScriptRoot rev-parse --path-format=absolute --git-common-dir
$repo = Split-Path -Parent $common
$root = Join-Path (Split-Path -Parent $repo) "SuperLista-worktrees"
$path = Join-Path $root ($Branch -replace "[/\\]", "-")

if (-not (Test-Path $path)) { throw "Worktree não encontrada: $path" }
if ((Resolve-Path $PSScriptRoot).Path.StartsWith((Resolve-Path $path).Path, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Você está executando o script de dentro da worktree que será removida. Rode-o a partir da worktree principal."
}
if (git -C $path status --porcelain) { throw "Há alterações não commitadas em $path. Commite ou descarte antes." }

git -C $repo worktree remove $path
if ($LASTEXITCODE -ne 0) {
    # Windows: "Filename too long" (node_modules profundo) deixa a pasta pela metade. Apaga com prefixo \\?\ e segue.
    Write-Host "git worktree remove falhou; tentando apagar com caminho longo..." -ForegroundColor Yellow
    Remove-Item -LiteralPath "\\?\$path" -Recurse -Force
    if (Test-Path -LiteralPath $path) { throw "Não foi possível apagar $path" }
}

if ($DeleteBranch) {
    git -C $repo branch -d $Branch   # -d: só apaga se já estiver mesclada
}
git -C $repo worktree prune
Write-Host "Worktree removida: $path" -ForegroundColor Green
