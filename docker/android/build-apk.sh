#!/usr/bin/env bash
# Compila el APK de Android a partir del proyecto montado en /src y lo deja en /out.
# Pensado para ejecutarse dentro de la imagen docker/android/Dockerfile.
#
# Variables opcionales:
#   VERSION_CODE   número interno de versión del APK (debe ser mayor en cada actualización instalada)
#   PREBUILD_ONLY  si vale 1, genera el proyecto Android y se detiene (para depurar)
#   SRC, WORK, OUT carpetas de origen, trabajo y salida (por defecto /src, /work y /out)
set -euo pipefail

SRC="${SRC:-/src}"
WORK="${WORK:-/work}"
OUT="${OUT:-/out}"

if [ ! -f "$SRC/app.json" ]; then
  echo "Error: no se encontró app.json en $SRC. Monta la carpeta del proyecto con -v \"<ruta>:/src:ro\"." >&2
  exit 1
fi

if [ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  echo "Aviso: faltan EXPO_PUBLIC_SUPABASE_URL y/o EXPO_PUBLIC_SUPABASE_ANON_KEY." >&2
  echo "       El APK se compilará, pero abrirá la pantalla 'Falta configurar la conexión'." >&2
  echo "       Pásalas con --env-file .env.local" >&2
fi

echo "==> Java:"; java -version 2>&1 | head -1
echo "==> Node: $(node -v)"

# Se trabaja sobre una copia: node_modules, android/ e ios/ de tu equipo (Windows o Mac) no sirven
# dentro de Linux, y así tu carpeta nunca se modifica.
rm -rf "$WORK"
mkdir -p "$WORK" "$OUT"
tar -C "$SRC" \
  --exclude=./node_modules --exclude=./android --exclude=./ios \
  --exclude=./dist --exclude=./.expo --exclude=./.git \
  -cf - . | tar -C "$WORK" -xf -
cd "$WORK"

if [ -n "${VERSION_CODE:-}" ]; then
  node -e "
    const fs = require('fs');
    const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    app.expo.android = { ...app.expo.android, versionCode: Number(process.env.VERSION_CODE) };
    fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
  "
fi

echo "==> Instalando dependencias"
npm ci --no-audit --no-fund

echo "==> Generando el proyecto Android"
npx expo prebuild --platform android --no-install --clean

if [ "${PREBUILD_ONLY:-0}" = "1" ]; then
  echo "==> PREBUILD_ONLY=1: se detiene antes de compilar."
  exit 0
fi

echo "==> Compilando el APK (la primera vez descarga el SDK y tarda más)"
cd android
NODE_ENV=production ./gradlew assembleRelease --no-daemon \
  -Dorg.gradle.jvmargs="-Xmx3g -XX:MaxMetaspaceSize=1g" \
  -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
cd ..

VERSION="$(node -p "require('./app.json').expo.version")"
APK="$OUT/brisa10-$VERSION.apk"
cp android/app/build/outputs/apk/release/app-release.apk "$APK"
echo "==> Listo: $APK"
