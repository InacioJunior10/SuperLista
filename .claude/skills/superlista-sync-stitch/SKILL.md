---
name: superlista-sync-stitch
description: Baixa novamente PRD, design system, telas (HTML/PNG) e logo do projeto Google Stitch "Lista de Compras Inteligente" para docs/stitch e atualiza os tokens de src/theme. Use quando o design ou o PRD mudarem no Stitch.
---

# Sincronizar com o Google Stitch

Projeto Stitch: **Lista de Compras Inteligente** — `projects/7386463549503504126`. Design system: `assets/15a5877cfec642dc8ccdb21005e7cc28` (Fresh Market Grotesk). O MCP `stitch` já está configurado (`claude mcp list`).

Passos (use PowerShell, nunca bash):

1. `mcp__stitch__get_project` (name `projects/7386463549503504126`): o campo `designTheme.designMd` contém o design system em Markdown/YAML -> sobrescreva `docs/stitch/DESIGN.md`.
2. `mcp__stitch__list_screens` (projectId `7386463549503504126`): cada tela traz `htmlCode.downloadUrl` e `screenshot.downloadUrl`.
   - A tela "PRD - SuperLista Supermercado" é o PRD (Markdown) -> `docs/stitch/PRD.md`.
   - "SuperLista Logo" (SVG) -> `docs/stitch/assets/logo.svg` e `assets/logo.svg`.
   - Demais telas -> `docs/stitch/screens/<slug>.html` e `.png`.
3. Baixe com `Invoke-WebRequest -Uri <url> -OutFile <caminho> -UseBasicParsing`.
4. Se DESIGN.md mudou, atualize `src/theme/colors.ts`, `typography.ts` e `layout.ts` (mantendo os nomes dos tokens) e rode `.\scripts\check.ps1`.
5. Resuma ao usuário o que mudou (diff dos arquivos em `docs/stitch`).

Não coloque chaves de API em arquivos do repositório.
