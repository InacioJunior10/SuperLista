# Guia de release — SuperLista 1.0

Todos os comandos em PowerShell, na raiz do projeto.

## 1. Pré-requisitos
1. Conta em https://expo.dev.
2. `npm install -g eas-cli`
3. `eas login` (interativo). No Claude Code, rode como `! eas login`.
4. `eas build:configure` já está resolvido: o `eas.json` do repositório define os perfis. Na primeira build, o EAS pode pedir para vincular o projeto (`eas init`).

Nenhum segredo/credencial vai para o repositório (keystore fica no EAS; chave de serviço do Play fica fora do repo).

## 2. Teste no emulador / aparelho (sem EAS)
- Emulador Android aberto (ou aparelho com depuração USB): `npm run android`.
- Expo Go: `npm start`, escaneie o QR code no Expo Go (limitações: módulos nativos podem exigir development build).

### APK local (Windows, sem EAS)

```powershell
.\scripts\build-apk.ps1            # gera o APK e copia para %USERPROFILE%\Downloads\SuperLista-<versão>-arm64-v8a.apk
.\scripts\build-apk.ps1 -Install   # também instala no celular por USB (adb)
```

Requisitos: Android SDK (`ANDROID_HOME`) e JDK 17+ (o script usa o JBR do Android Studio se achar; ou defina `SUPERLISTA_JAVA_HOME`). A primeira vez baixa o Gradle, a plataforma 36 e o NDK 27 (vários minutos); as seguintes levam ~30 s a poucos minutos. A pasta `android/` é gerada (`expo prebuild`) e ignorada pelo git. O APK é assinado com a chave de debug do template: serve para teste, não para a Play Store.

Instalar no celular: `adb install -r "<caminho do apk>"` (depuração USB autorizada) ou copie o arquivo e abra-o no aparelho (permitir "instalar apps desconhecidos").

**Antivírus que intercepta HTTPS (ex.: Avast "Web/Mail Shield")**: o Java não confia no certificado dele e o Gradle falha com `PKIX path building failed`. Descubra o thumbprint da raiz do antivírus no repositório de certificados do Windows e rode uma vez `.\scripts\build-apk.ps1 -TrustThumbprint <sha1>`: o script cria um truststore PRIVADO em `%USERPROFILE%\.superlista-build\cacerts` (cópia do Java + essa raiz) e o reutiliza nos builds seguintes, sem alterar o Java do sistema. Alternativa: desativar o escaneamento HTTPS no antivírus.

Outros arquiteturas (ex.: emulador x86_64): `-Arch "arm64-v8a,x86_64"`. Recomeçar do zero: `-Clean`.

## 3. Builds
- APK de teste (instalável direto): `eas build --platform android --profile preview`
- AAB de produção (Play Store): `eas build --platform android --profile production`
- Development build (opcional): `eas build --platform android --profile development`

Instalar o APK: baixe pelo link/QR do EAS e abra no aparelho, ou no emulador arraste o arquivo, ou `adb install caminho\superlista.apk`.

## 4. Versionamento
- `version` em `app.json` (ex.: 1.0.0) é o nome visível; altere manualmente a cada release.
- `versionCode`/`buildNumber` são incrementados automaticamente no perfil `production` (`autoIncrement` + `appVersionSource: remote`).
- Nunca edite migrações de banco já publicadas; crie novas.

## 5. Submissão
`eas submit --platform android --profile production`
Exige conta Google Play Console (taxa única) e uma chave de serviço JSON criada no Play Console, guardada FORA do repositório (informe o caminho quando solicitado). A primeira publicação normalmente precisa ser feita manualmente no console, enviando o AAB.

## 6. Roteiro de teste manual (ative o modo avião antes)
1. Criar uma lista.
2. Adicionar itens.
3. Tocar no item e informar preço e quantidade.
4. Conferir o total no topo.
5. Marcar itens como comprados; conferir o total.
6. Definir meta e verificar o alerta ao ultrapassá-la.
7. Finalizar a compra.
8. Conferir o histórico.
9. Fechar e reabrir o app: dados preservados.

## 7. Checklist da Play Store
- [ ] Ficha: nome, descrição curta e completa (pt-BR), ícone 512x512, gráfico de recursos 1024x500
- [ ] Capturas de tela do app real (mín. 2 de celular)
- [ ] Política de privacidade publicada em URL pública (base: `docs/privacy-policy.md`, preencher [e-mail de contato] e [data])
- [ ] Formulário Segurança dos dados: nenhum dado coletado; câmera usada localmente
- [ ] Classificação etária (questionário IARC)
- [ ] Público-alvo: adultos / público geral (não infantil)
- [ ] Declaração de anúncios: sem anúncios
- [ ] País/categoria (Compras ou Produtividade) e contato
- [ ] Teste interno antes da produção
