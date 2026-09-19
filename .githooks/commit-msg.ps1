# Hook commit-msg: valida que a mensagem segue Conventional Commits (semantic git) e está em português.
# Formato:  tipo(escopo)!: descrição   (escopo e "!" opcionais; até 72 caracteres; sem ponto final)
# Uso (pelo git): commit-msg.ps1 <arquivo-da-mensagem>
param([Parameter(Mandatory = $true)][string]$MessageFile)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$lines = Get-Content -LiteralPath $MessageFile -Encoding UTF8
$subject = ($lines | Where-Object { $_.Trim() -and -not $_.StartsWith("#") } | Select-Object -First 1)

function Fail([string]$reason) {
    [Console]::Error.WriteLine("")
    [Console]::Error.WriteLine("Mensagem de commit inválida: $reason")
    [Console]::Error.WriteLine("")
    [Console]::Error.WriteLine("  Formato: tipo(escopo): descrição em português")
    [Console]::Error.WriteLine("  Tipos:   feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert")
    [Console]::Error.WriteLine("  Regras:  até 72 caracteres, sem ponto final, escopo opcional em minúsculas")
    [Console]::Error.WriteLine("  Exemplos:")
    [Console]::Error.WriteLine("    feat(lists): adiciona filtro por categoria")
    [Console]::Error.WriteLine("    fix(db): corrige total ao remover item")
    [Console]::Error.WriteLine("    docs: atualiza o plano de execução")
    [Console]::Error.WriteLine("")
    [Console]::Error.WriteLine("  (para ignorar esta validação: git commit --no-verify)")
    exit 1
}

if (-not $subject) { Fail "a mensagem está vazia." }

# Isentos: merges, reverts automáticos e commits de fixup/squash.
if ($subject -match '^(Merge |Revert "|fixup! |squash! |amend! )') { exit 0 }

$types = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"
$regex = "^(?<type>$types)(\((?<scope>[a-z0-9][a-z0-9_/-]*)\))?(?<breaking>!)?: (?<desc>\S.*)$"
if ($subject -notmatch $regex) { Fail "use 'tipo(escopo): descrição' (recebido: '$subject')." }
$desc = $Matches["desc"]

if ($subject.Length -gt 72) { Fail "a primeira linha tem $($subject.Length) caracteres (máximo 72)." }
if ($desc.TrimEnd().EndsWith(".")) { Fail "não termine a descrição com ponto final." }

# Heurística de idioma: rejeita descrições que começam com verbo comum em inglês.
$firstWord = ($desc -split "\s+")[0].ToLowerInvariant()
$english = "add", "adds", "added", "fix", "fixes", "fixed", "update", "updates", "updated", "remove", "removes",
    "removed", "implement", "implements", "implemented", "create", "creates", "created", "change", "changes",
    "changed", "refactor", "refactors", "improve", "improves", "improved", "delete", "deletes", "initial", "init", "wip"
if ($english -contains $firstWord) { Fail "escreva a descrição em português (começa com '$firstWord')." }

exit 0
