# Entorno para compilar el APK de Android de Brisa10 sin instalar nada en tu equipo:
# Java 17 (la versión que React Native soporta), Node 22 y el SDK de Android.
#
# Uso (ver docs/BUILDS.md):
#   docker build -t brisa10-android -f docker/android/Dockerfile docker/android
#   docker run --rm --env-file .env.local -v "<ruta del proyecto>:/src:ro" -v "<carpeta de salida>:/out" \
#     -v brisa10-gradle:/root/.gradle -v brisa10-sdk:/opt/android-sdk brisa10-android
FROM eclipse-temurin:17-jdk-jammy

ARG NODE_MAJOR=22
# Herramientas de línea de comandos del SDK de Android (https://developer.android.com/studio#command-line-tools-only).
ARG CMDLINE_TOOLS_BUILD=11076708

ENV ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    CI=1 \
    EXPO_NO_TELEMETRY=1
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl unzip git \
    && curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# SDK de Android: solo las herramientas base y las licencias aceptadas. Gradle descarga el resto
# (plataforma, build-tools, NDK, CMake) la primera vez, y se conserva en el volumen del SDK.
RUN mkdir -p "${ANDROID_HOME}/cmdline-tools" \
    && curl -fsSL -o /tmp/cmdline-tools.zip \
        "https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_BUILD}_latest.zip" \
    && unzip -q /tmp/cmdline-tools.zip -d "${ANDROID_HOME}/cmdline-tools" \
    && mv "${ANDROID_HOME}/cmdline-tools/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest" \
    && rm /tmp/cmdline-tools.zip \
    && (yes || true) | sdkmanager --licenses > /dev/null \
    && sdkmanager "platform-tools"

COPY build-apk.sh /usr/local/bin/build-apk
RUN chmod +x /usr/local/bin/build-apk

WORKDIR /work
ENTRYPOINT ["build-apk"]
