# Sessão 13 — 2026-09-19 — Geração do APK local no Windows

Branch: `chore/script-apk`. Pedido: gerar o APK na máquina do usuário para copiar e instalar no celular.

## Resultado
APK `com.superlista.app` 1.0.0 (versionCode 1), minSdk 24, arm64-v8a, 51,2 MB, assinado (v2) com a chave de debug do template — só para teste. Gerado em `android/app/build/outputs/apk/release/app-release.apk` e copiado para `%USERPROFILE%\Downloads\SuperLista-1.0.0-arm64.apk` (e `...-arm64-v8a.apk` pelo script; idênticos).

## Caminho (para reproduzir)
1. Ambiente: Android SDK presente; `JAVA_HOME` apontava para o JDK 11 (insuficiente: Gradle 9.3.1 exige 17+); usado o **JBR do Android Studio (Java 25)**. Java 25 exige `--enable-native-access=ALL-UNNAMED` (senão o passo do CMake falha com "A restricted method in java.lang.System has been called").
2. **Avast Web/Mail Shield** intercepta HTTPS: o Java (JBR e JDK 11) recusava o certificado (`PKIX path building failed`) ao baixar o Gradle. O Windows confia na raiz do Avast (thumbprint `5500BA0F5D6BF09BC523BB0983DB520993F09AD2`); o JBR não tem o módulo `Windows-ROOT`. Solução: truststore **privado** `%USERPROFILE%\.superlista-build\cacerts` (cópia do cacerts do Java + a raiz do Avast) apontado por `JAVA_TOOL_OPTIONS`; o Java do sistema não foi alterado e a verificação de certificados continua ligada.
3. `npx expo prebuild --platform android --no-install` cria `android/` (ignorada pelo git) mas reescreve os scripts `android`/`ios` do `package.json`: o script preserva o arquivo original.
4. `gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` (primeira vez ~5 min + downloads de plataforma 36 e NDK 27; depois ~30 s).

## Entregas
- `scripts/build-apk.ps1` (`-Install`, `-Arch`, `-TrustThumbprint`, `-Clean`, `-ProjectRoot`): detecta JDK 17+, usa o truststore privado se existir, gera `android/` se faltar, roda o Gradle e copia o APK para Downloads; testado (build incremental 28 s).
- `docs/RELEASE.md` (seção "APK local") e `CLAUDE.md` (tabela de comandos).

## Pendências
- O APK de teste é arm64; para emulador x86_64 use `-Arch "arm64-v8a,x86_64"`.
- Para publicar na Play Store: AAB de produção assinado com chave própria (EAS ou keystore local) — não coberto aqui.
- O `expo prebuild` avisa que `userInterfaceStyle: light` precisa de `expo-system-ui` para valer no Android (efeito visual apenas em modo escuro do sistema; instalar depois se necessário).
