# Fase 9 — Release

**Branch:** `chore/release-1-0` · **Depende de:** fase 7 (fase 8 opcional para a v1.0) · Skill: `rn-build-release`

## Tarefas
1. **Identidade**: ícone adaptativo (fundo `#00A86B`, logo), splash, nome "SuperLista", `bundleIdentifier`/`package` = `com.superlista.app`, versão `1.0.0` em `app.json`.
2. **Qualidade final**: `npx expo-doctor`, `.\scripts\check.ps1`, teste manual em Android físico seguindo o roteiro do PRD (criar lista → informar preços → marcar itens → conferir total e meta, em modo avião).
3. **EAS**: `eas build:configure`; perfil `preview` (APK interno) e `production` (AAB); segredos via `eas secret`, nada sensível no repositório.
4. **Loja (Google Play)**: ficha (descrição pt-BR, capturas de tela geradas do app real), política de privacidade (o app é local/offline; informar se houver câmera/sync), classificação etária.
5. **Atualizações OTA**: `eas update` por canal (`production`); política de migração de banco compatível entre versões (nunca editar migração publicada).
6. **Tag e registro**: `git tag v1.0.0` na `main`; `docs/memory/` com o resumo do release e pendências para v1.1.

## Critérios de aceite
APK `preview` instala e roda 100% offline; AAB `production` gerado; checklist da Play Store concluído.
