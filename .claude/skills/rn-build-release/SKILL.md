---
name: rn-build-release
description: Build e publicação do SuperLista com EAS (Expo Application Services) em PowerShell. Use ao gerar APK/AAB, preview builds ou submeter às lojas.
---

# Build e release (EAS)

Pré-requisitos: conta Expo; `npm install -g eas-cli`; `eas login` (interativo: peça ao usuário rodar com `! eas login`).

```powershell
npx expo-doctor                                   # checa saúde do projeto
eas build:configure                               # cria eas.json (primeira vez)
eas build --platform android --profile preview    # APK interno
eas build --platform android --profile production # AAB para a Play Store
eas submit --platform android                     # envia para a loja
eas update --branch production --message "texto"  # OTA update
```

Notas:
- iOS exige conta Apple Developer e build na nuvem (EAS); não é possível buildar localmente no Windows.
- Versão em `app.json` (`expo.version`); `android.package`/`ios.bundleIdentifier` = `com.superlista.app`.
- Nunca commite keystores ou segredos; use `eas secret`.
- Antes de release: `.\scripts\check.ps1`.
