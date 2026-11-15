# Brisa10 App

App móvil (Android e iOS) del sistema de gestión comercial de Brisa10: vender, consultar y mover inventario, gestionar productos con fotos, y revisar el historial y los indicadores del negocio.

Usa el mismo proyecto de Supabase que la [app administrativa](https://github.com/dylanarizaaa/brisa10-admin) y la [tienda virtual](https://github.com/dylanarizaaa/brisa10-catalog): mismos usuarios, roles, datos y reglas.

## Funciones

| Pestaña | Qué hace |
|---------|----------|
| **Inicio** | Ventas e ingresos del día, estado del inventario, ingresos de los últimos 14 días, más vendidos y actividad reciente |
| **Vender** | Buscar productos, armar la venta, elegir método de pago y confirmar. Descuenta existencias al instante |
| **Productos** | Lista con búsqueda y filtros; detalle, fotos (galería o cámara), publicación en la tienda virtual; crear y editar (administrador) |
| **Inventario** | Existencias y alertas; entradas, salidas y ajustes (ajustes solo administrador) |
| **Más** | Historial de ventas (y anulación, administrador), movimientos, categorías, datos del negocio, usuarios (administrador) y mi cuenta |

El operador ve las mismas pantallas sin las acciones de administrador. La base de datos aplica los mismos permisos.

## Documentación

- [Compilar e instalar (Android e iOS)](docs/BUILDS.md): Expo Go, APK por GitHub Actions y Expo Build.
- [Arquitectura](docs/ARCHITECTURE.md): stack, estructura, unidad gráfica con la app administrativa y decisiones.

## Desarrollo

Requisitos: Node.js 20.19 o superior (probado con 22).

```bash
npm install
cp .env.example .env.local   # URL y clave anon de Supabase (las mismas de la app administrativa)
npx expo start               # escanea el QR con Expo Go, o pulsa w para abrir en el navegador
```

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo de Expo |
| `npm run web` | Abrir en el navegador |
| `npm run lint` | ESLint (configuración de Expo) |
| `npm run typecheck` | Verificación de tipos |

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` |

Todo lo que empieza por `EXPO_PUBLIC_` queda dentro de la app: nunca uses la clave `service_role`.

## Usuarios y base de datos

Este repositorio no crea tablas. El esquema, las migraciones y la creación de usuarios se gestionan desde [brisa10-admin](https://github.com/dylanarizaaa/brisa10-admin) (ver su README).
