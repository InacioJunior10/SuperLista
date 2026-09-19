# Hook prepare-commit-msg: sugere uma mensagem de commit no padrão Conventional Commits (semantic git),
# em português, a partir dos arquivos em stage. Só age em `git commit` sem -m/-F (mensagem vazia).
# Uso (pelo git): prepare-commit-msg.ps1 <arquivo-da-mensagem> [origem] [sha]
param(
    [Parameter(Mandatory = $true)][string]$MessageFile,
    [string]$Source = "",
    [string]$Sha = ""
)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

# Respeita mensagem já informada (-m, -F, merge, squash, amend/commit -c).
if ($Source -and $Source -ne "template") { exit 0 }
$existing = if (Test-Path -LiteralPath $MessageFile) { Get-Content -LiteralPath $MessageFile -Raw -Encoding UTF8 } else { "" }
$hasText = ($existing -split "`r?`n") | Where-Object { $_.Trim() -and -not $_.StartsWith("#") }
if ($hasText) { exit 0 }

$raw = git diff --cached --name-status --find-renames
if (-not $raw) { exit 0 }

# --- Arquivos em stage -------------------------------------------------------
$files = foreach ($line in ($raw -split "`r?`n" | Where-Object { $_ })) {
    $cols = $line -split "`t"
    $status = $cols[0].Substring(0, 1)
    [pscustomobject]@{ Status = $status; Path = ($cols[-1] -replace "\\", "/") }
}

# --- Tipo ---------------------------------------------------------------------
function Get-CommitType($files) {
    $paths = $files.Path
    $all = { param($pattern) -not ($paths | Where-Object { $_ -notmatch $pattern }) }
    if (& $all '^docs/|\.md$') { return "docs" }
    if (& $all '^(__tests__|test-utils)/|\.test\.') { return "test" }
    if (& $all '^(package(-lock)?\.json|app\.json|eas\.json|tsconfig\.json|eslint\.config\.js|\.prettierrc|\.gitignore|\.gitattributes|jest\.setup\.tsx|\.githooks/|\.vscode/|\.claude/|scripts/)') { return "chore" }
    $source = $files | Where-Object { $_.Path -match '^(src|app)/' }
    if ($source | Where-Object { $_.Status -eq "A" }) { return "feat" }
    if ($source -and -not ($source | Where-Object { $_.Status -ne "D" })) { return "refactor" }
    if ($source) { return "fix" }
    return "chore"
}

# --- Escopo (só quando todos os arquivos de código compartilham um) ---------------
function Get-Scope($files) {
    $scopes = $files | ForEach-Object {
        $p = $_.Path
        if ($p -match '^src/features/([^/]+)/') { $Matches[1] }
        elseif ($p -match '^src/(db|components|theme|utils|hooks|services|types)/') { $Matches[1] }
        elseif ($p -match '^app/') { "app" }
        elseif ($p -match '^scripts/') { "scripts" }
        elseif ($p -match '^\.githooks/') { "hooks" }
        elseif ($p -match '^docs/') { $null }
        else { $null }
    } | Where-Object { $_ } | Select-Object -Unique
    if (@($scopes).Count -eq 1) { return @($scopes)[0] }
    return $null
}

# --- Descrição em português --------------------------------------------------------
$verbs = [ordered]@{ A = "adiciona"; M = "atualiza"; D = "remove"; R = "renomeia"; C = "copia"; T = "atualiza" }

function Get-Description($files, $verbs) {
    $groups = foreach ($verb in $verbs.Keys) {
        $set = @($files | Where-Object { $_.Status -eq $verb })
        if ($set.Count -gt 0) { [pscustomobject]@{ Verb = $verbs[$verb]; Files = $set } }
    }
    $merged = $groups | Group-Object Verb | ForEach-Object {
        [pscustomobject]@{ Verb = $_.Name; Files = @($_.Group.Files) }
    }
    $parts = foreach ($g in $merged) {
        $names = @($g.Files | ForEach-Object { Split-Path $_.Path -Leaf })
        $shown = $names | Select-Object -First 2
        $extra = $names.Count - $shown.Count
        $text = "$($g.Verb) $($shown -join ', ')"
        if ($extra -gt 0) { $text += " e mais $extra" }
        $text
    }
    $desc = $parts -join " e "
    if ($desc.Length -gt 60) {
        $parts = foreach ($g in $merged) { "$($g.Verb) $($g.Files.Count)" }
        $total = $files.Count
        $desc = ($parts -join " e ") + $(if ($total -eq 1) { " arquivo" } else { " arquivos" })
    }
    return $desc
}

$type = Get-CommitType $files
$scope = Get-Scope $files
$prefix = if ($scope) { "${type}(${scope}): " } else { "${type}: " }
$subject = $prefix + (Get-Description $files $verbs)
if ($subject.Length -gt 72) { $subject = $subject.Substring(0, 72).TrimEnd() }

$body = ($files | Select-Object -First 15 | ForEach-Object { "- $($verbs[$_.Status]) $($_.Path)" }) -join "`n"
if ($files.Count -gt 15) { $body += "`n- ... e mais $($files.Count - 15) arquivos" }

$help = @"
# Mensagem sugerida automaticamente (Conventional Commits, em português).
# Ajuste a primeira linha para descrever o que mudou e por quê. Formato:
#   tipo(escopo): descrição em minúsculas, no presente, sem ponto final, até 72 caracteres
# Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
# Para pular a validação (evite): git commit --no-verify
"@

$text = "$subject`n`n$body`n`n$help`n$existing"
[System.IO.File]::WriteAllText($MessageFile, ($text -replace "`r`n", "`n"), [System.Text.UTF8Encoding]::new($false))
exit 0
