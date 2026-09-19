# Gera o APK de release localmente (Windows) e copia para a pasta Downloads.
# Requisitos: Android SDK (ANDROID_HOME) e um JDK 17+ (o script usa o JBR do Android Studio se achar).
# Uso:
#   .\scripts\build-apk.ps1                    # gera e copia para Downloads
#   .\scripts\build-apk.ps1 -Install           # também instala no celular por USB (adb)
#   .\scripts\build-apk.ps1 -Arch "arm64-v8a,x86_64"   # mais arquiteturas (ex.: emulador x86_64)
#   .\scripts\build-apk.ps1 -TrustThumbprint <sha1>    # confia numa CA do Windows (ex.: antivírus que
#                                                     # intercepta HTTPS) num truststore PRIVADO do build
# O APK sai assinado com a chave de debug do template: serve para testes, não para a Play Store.
param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$Arch = "arm64-v8a",
    [string]$TrustThumbprint,
    [switch]$Install,
    [switch]$Clean
)
$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

# --- JDK 17+ --------------------------------------------------------------------------
function Get-JavaMajor([string]$javaHome) {
    $exe = Join-Path $javaHome "bin\java.exe"
    if (-not (Test-Path $exe)) { return 0 }
    $line = (& $exe -version 2>&1 | Select-Object -First 1).ToString()
    if ($line -match '"(\d+)(\.(\d+))?') { if ($Matches[1] -eq "1") { return [int]$Matches[3] } else { return [int]$Matches[1] } }
    return 0
}
$candidates = @($env:SUPERLISTA_JAVA_HOME, "C:\Program Files\Android\Android Studio\jbr", "$env:LOCALAPPDATA\Programs\Android Studio\jbr", $env:JAVA_HOME) | Where-Object { $_ }
$javaHome = $candidates | Where-Object { (Get-JavaMajor $_) -ge 17 } | Select-Object -First 1
if (-not $javaHome) { throw "JDK 17+ não encontrado. Instale um JDK 17+ ou o Android Studio, ou defina SUPERLISTA_JAVA_HOME." }
if (-not $env:ANDROID_HOME) { throw "ANDROID_HOME não definido (instale o Android SDK)." }
$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$env:Path"
Write-Host "JDK: $javaHome (Java $(Get-JavaMajor $javaHome))" -ForegroundColor Cyan

# --- Truststore privado (só para este build; o Java do sistema não é alterado) ------------
$buildDir = Join-Path $env:USERPROFILE ".superlista-build"
$trust = Join-Path $buildDir "cacerts"
if ($TrustThumbprint) {
    New-Item -ItemType Directory -Force $buildDir | Out-Null
    $cert = Get-ChildItem Cert:\LocalMachine\Root, Cert:\CurrentUser\Root -ErrorAction SilentlyContinue |
        Where-Object { $_.Thumbprint -eq $TrustThumbprint } | Select-Object -First 1
    if (-not $cert) { throw "Certificado $TrustThumbprint não encontrado no repositório de raízes do Windows." }
    $cer = Join-Path $buildDir "extra-root.cer"
    Export-Certificate -Cert $cert -FilePath $cer -Force | Out-Null
    Copy-Item (Join-Path $javaHome "lib\security\cacerts") $trust -Force
    & "$javaHome\bin\keytool.exe" -importcert -noprompt -trustcacerts -alias superlista-extra-root -file $cer -keystore $trust -storepass changeit | Out-Null
    Write-Host "Truststore privado criado com: $($cert.Subject)" -ForegroundColor Cyan
}
$opts = @("--enable-native-access=ALL-UNNAMED")   # evita o aviso do JDK 24+ que derruba o passo do CMake
if (Test-Path $trust) {
    $opts += "-Djavax.net.ssl.trustStore=$($trust -replace '\\','/')", "-Djavax.net.ssl.trustStorePassword=changeit"
    Write-Host "Usando truststore privado: $trust" -ForegroundColor Cyan
}
$env:JAVA_TOOL_OPTIONS = $opts -join " "

# --- Projeto nativo (android/ é gerado e ignorado pelo git) ---------------------------------
if ($Clean -and (Test-Path android)) { Remove-Item -Recurse -Force android }
if (-not (Test-Path android)) {
    Write-Host "Gerando o projeto Android (expo prebuild)..." -ForegroundColor Cyan
    # o prebuild reescreve os scripts android/ios do package.json: preserva o arquivo original
    $pkg = [System.IO.File]::ReadAllBytes((Join-Path $ProjectRoot "package.json"))
    npx expo prebuild --platform android --no-install
    if ($LASTEXITCODE -ne 0) { throw "expo prebuild falhou" }
    [System.IO.File]::WriteAllBytes((Join-Path $ProjectRoot "package.json"), $pkg)
}

# --- Build ------------------------------------------------------------------------------------
Push-Location android
try {
    .\gradlew.bat assembleRelease "-PreactNativeArchitectures=$Arch"
    if ($LASTEXITCODE -ne 0) { throw "O build do Gradle falhou (veja o log acima)." }
} finally { Pop-Location }

# --- Saída ------------------------------------------------------------------------------------
$apk = Join-Path $ProjectRoot "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) { throw "APK não encontrado em $apk" }
$version = (Get-Content (Join-Path $ProjectRoot "app.json") -Raw | ConvertFrom-Json).expo.version
$dest = Join-Path (Join-Path $env:USERPROFILE "Downloads") ("SuperLista-{0}-{1}.apk" -f $version, ($Arch -replace ",", "+"))
Copy-Item $apk $dest -Force
Write-Host ("APK pronto: {0} ({1:N1} MB)" -f $dest, ((Get-Item $dest).Length / 1MB)) -ForegroundColor Green

if ($Install) {
    $adb = Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"
    & $adb devices
    & $adb install -r $dest
}
