# Compilar e instalar la app (Android e iOS)

Hay tres formas de llevar la app a un teléfono. Puedes usar varias.

| Forma | Android | iOS | Costo | Para qué |
|-------|---------|-----|-------|----------|
| **Expo Go** | Sí | Sí | Gratis | Probar mientras se desarrolla. No es una app instalada. |
| **APK desde GitHub Actions** | Sí | No | Gratis | Instalar la app en los teléfonos Android de la tienda. |
| **Expo Build (EAS)** | Sí | Sí | Plan gratuito con cupo mensual; iOS requiere Apple Developer (99 USD/año) | iPhone, y publicar en Google Play o App Store. |

En todos los casos la app usa el **mismo proyecto de Supabase** que la app administrativa y la tienda virtual, con los mismos usuarios y permisos.

## Datos de conexión

La app necesita dos valores, los mismos del archivo `.env` de la app administrativa (allí se llaman `VITE_…`):

| Nombre | Valor |
|--------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://<tu-proyecto>.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | La clave pública (`anon` o *publishable*) |

Nunca uses la clave `service_role` (o *secret*): quedaría dentro de la app.

Si la app se compila sin estos valores, abre la pantalla **"Falta configurar la conexión"**.

## 1. Probar con Expo Go

1. Instala **Expo Go** en el teléfono (Play Store o App Store). Debe ser compatible con Expo SDK 58.
2. En tu computador, en la carpeta del proyecto:

   ```bash
   npm install
   cp .env.example .env.local   # completa los dos valores
   npx expo start
   ```

3. Escanea el código QR: en Android con Expo Go; en iPhone con la cámara.

El teléfono y el computador deben estar en la misma red Wi-Fi. Si no se conectan, usa `npx expo start --tunnel`.

## 2. APK de Android con GitHub Actions (recomendado para Android)

El flujo `.github/workflows/android-apk.yml` compila el APK en los servidores de GitHub. El repositorio es público, así que no tiene costo.

### Una sola vez: secrets

En GitHub → **Settings** → **Secrets and variables** → **Actions** → pestaña **Secrets** → **New repository secret**, crea `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con los valores de la tabla de arriba.

### APK de prueba

Cada push a cualquier rama genera el APK (unos 15 minutos; un poco menos cuando ya hay caché). Para descargarlo: pestaña **Actions** → la ejecución → **Summary** → **Artifacts** → `brisa10-android-<versión>` (un `.zip` con el `.apk`).

También puedes lanzarlo a mano: **Actions** → **APK de Android** → **Run workflow**.

### Publicar una versión

1. Sube la versión en `app.json` (campo `expo.version`, p. ej. `1.0.0` → `1.1.0`). La primera versión es `1.0.0` y no hace falta cambiarla.
2. Crea y sube la etiqueta con el mismo número:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. Al terminar, en **Releases** aparece el borrador **Brisa10 v1.0.0** con el APK. Revísalo y pulsa **Publish release**.

Si la etiqueta no coincide con la versión de `app.json`, o faltan los secrets, el flujo se detiene y explica por qué.

### Instalar en el teléfono

1. En el teléfono, abre la versión publicada en GitHub y descarga el `.apk`.
2. Ábrelo. Android pedirá permitir **instalar apps de fuentes desconocidas** para el navegador o el gestor de archivos.
3. Para actualizar, instala la versión nueva encima de la anterior: Android la acepta porque cada build tiene un número interno (`versionCode`) mayor.

### Límites de este APK

- Se firma con la **clave de depuración pública** de la plantilla de Expo. Sirve para instalarlo directamente, pero **no** para Google Play.
- Si más adelante pasas a Expo Build, la firma cambia: hay que **desinstalar** la versión anterior antes de instalar la nueva (los datos están en Supabase, no se pierde nada; solo hay que volver a iniciar sesión).

## Compilar el APK en tu propio computador (opcional)

No es necesario: el APK de GitHub Actions ya sale firmado y listo. Hazlo solo si quieres compilar sin subir código.

> **Requiere Java 17.** Si tienes una versión más nueva (por ejemplo Java 21 o 27), Gradle falla con `Unsupported class file major version NN` (71 = Java 27). Hay dos formas de resolverlo.

### Opción A: Java 17 solo en esa terminal (recomendada, sin Docker)

1. Instala Java 17: `winget install EclipseAdoptium.Temurin.17.JDK` (o descarga Temurin 17 desde adoptium.net). Puede convivir con tu Java actual.
2. En **PowerShell**, dentro de la carpeta del proyecto (ajusta la ruta a la versión instalada; mira `dir "C:\Program Files\Eclipse Adoptium"`):

   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot"
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   java -version                      # debe decir 17.x
   npm install
   npx expo prebuild --platform android --clean
   cd android
   .\gradlew.bat --stop               # cierra los procesos de Gradle que se hayan iniciado con otra versión de Java
   .\gradlew.bat assembleRelease
   ```

3. El APK queda en `android\app\build\outputs\apk\release\app-release.apk`.

Los datos de conexión se toman de `.env.local` (ver arriba). Los cambios de variables solo aplican a esa ventana de PowerShell: al abrir otra, vuelve a usar Java por defecto.

Si Gradle dice `SDK location not found`, instala **Android Studio** (trae el SDK) y crea `android\local.properties` con `sdk.dir=C\:\\Users\\<tu usuario>\\AppData\\Local\\Android\\Sdk`.

Para fijar Java 17 en Gradle de forma permanente, agrega en `%USERPROFILE%\.gradle\gradle.properties` la línea `org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.13.11-hotspot`. Afecta a todos tus proyectos de Gradle.

### Opción B: Docker (Java 17, Node y SDK de Android incluidos)

Sirve si no quieres instalar Java ni el SDK de Android. Requiere Docker Desktop (en Windows, con WSL 2) con al menos 6 GB de memoria asignada y unos 10 GB libres.

```powershell
# Una vez: construir la imagen
docker build -t brisa10-android -f docker/android/Dockerfile docker/android

# Cada vez que quieras un APK (en la carpeta del proyecto)
docker run --rm --env-file .env.local `
  -v "${PWD}:/src:ro" -v "${PWD}/out-apk:/out" `
  -v brisa10-gradle:/root/.gradle -v brisa10-sdk:/opt/android-sdk `
  brisa10-android
```

En macOS o Linux usa `$(pwd)` en lugar de `${PWD}` y `\` en lugar de `` ` ``.

- El APK queda en `out-apk/brisa10-<versión>.apk`.
- La primera vez descarga el SDK de Android y Gradle (varios GB) y tarda más; los dos volúmenes (`brisa10-gradle`, `brisa10-sdk`) lo conservan para las siguientes.
- Tu carpeta se monta en solo lectura: el contenedor trabaja sobre una copia, así que no toca `node_modules` ni `android/`.
- Para que Android acepte instalar una versión nueva encima de otra, añade `-e VERSION_CODE=2` (un número mayor en cada compilación).
- Firma: igual que el APK de GitHub Actions (clave de depuración de Expo).

## 3. Expo Build (EAS): iPhone y tiendas

Expo compila en sus servidores, sin Mac ni Android Studio, y gestiona las claves de firma.

### Requisitos

- Cuenta gratuita en [expo.dev](https://expo.dev).
- Para iOS: cuenta de **Apple Developer** (99 USD/año).
- Para Google Play: cuenta de desarrollador de Google Play (25 USD, pago único).

### Configuración inicial (una vez, desde un computador)

```bash
npm install -g eas-cli
eas login
eas init                      # crea el proyecto en Expo y agrega su ID a app.json (súbelo al repositorio)

# Datos de conexión para los builds de Expo
eas env:set --name EXPO_PUBLIC_SUPABASE_URL --value https://<tu-proyecto>.supabase.co --environment production --environment preview --visibility plaintext
eas env:set --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <clave-anon> --environment production --environment preview --visibility plaintext
eas env:list --environment production   # comprobar
```

También puedes crearlas en expo.dev → tu proyecto → **Environment variables**.

### iPhone (TestFlight)

```bash
eas build --platform ios --profile production   # la primera vez pide iniciar sesión con Apple y crea los certificados
eas submit --platform ios                        # sube el build a App Store Connect
```

En App Store Connect → **TestFlight**, agrega a las personas de la tienda como probadoras internas; instalan la app con la app **TestFlight**. Los builds de TestFlight caducan a los 90 días: genera uno nuevo antes.

Publicarla en la App Store (pública) pasa por la revisión de Apple; para una app interna basta TestFlight.

### Android con Expo

```bash
eas build --platform android --profile preview      # APK para instalar directo, firmado con tu clave
eas build --platform android --profile production   # AAB para Google Play
eas submit --platform android                       # sube a Google Play (requiere la cuenta de desarrollador)
```

### Desde GitHub (opcional)

Tras la configuración inicial, el flujo **Build con Expo** (`.github/workflows/eas-build.yml`) lanza builds sin terminal:

1. Crea un token en expo.dev → **Account settings** → **Access tokens**, y guárdalo como secret `EXPO_TOKEN` en GitHub.
2. **Actions** → **Build con Expo** → **Run workflow**, elige plataforma y perfil.

El progreso y la descarga aparecen en expo.dev.

## Perfiles de `eas.json`

| Perfil | Android | iOS | Uso |
|--------|---------|-----|-----|
| `preview` | APK | Distribución interna (requiere registrar cada iPhone con `eas device:create`) | Pruebas |
| `production` | AAB | App Store / TestFlight | Tiendas |

La numeración de builds la lleva Expo (`appVersionSource: remote`, `autoIncrement`).

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| La app abre "Falta configurar la conexión" | Se compiló sin los datos de Supabase | Revisa los secrets (GitHub) o las variables de entorno (Expo) y vuelve a compilar |
| "No se pudo conectar con el servidor" al iniciar sesión | Sin internet, o el proyecto de Supabase está pausado | Revisa la conexión; en el plan gratuito, Supabase pausa proyectos sin uso por una semana |
| Gradle falla con `Unsupported class file major version` | Usas una versión de Java más nueva que la 17 | Usa Java 17 (ver «Compilar el APK en tu propio computador») |
| Android no deja instalar el APK | Falta permitir fuentes desconocidas, o hay instalada una versión firmada con otra clave | Permite la instalación; si cambiaste de método de compilación, desinstala la anterior |
| El flujo de GitHub falla en "Versión no coincide" | La etiqueta no es `v` + `expo.version` | Borra la etiqueta y crea la correcta |
| Expo Go dice que el proyecto es incompatible | Expo Go no coincide con SDK 58 | Actualiza Expo Go desde la tienda |
