# Arquitectura

La app móvil es la tercera pieza del sistema Brisa10:

| Repositorio | Qué es | Tecnología |
|-------------|--------|------------|
| [brisa10-admin](https://github.com/dylanarizaaa/brisa10-admin) | App administrativa web y de escritorio (Windows) | React + Vite + Tauri |
| [brisa10-catalog](https://github.com/dylanarizaaa/brisa10-catalog) | Tienda virtual pública | Astro |
| **brisa10-app** (este) | App administrativa para Android e iOS | React Native + Expo |

Las tres usan el **mismo proyecto de Supabase**. Las reglas de negocio (existencias nunca negativas, ventas atómicas, permisos por rol) viven en PostgreSQL —RLS y funciones RPC—, así que se aplican igual sin importar desde qué app se opere. Este repositorio **no tiene migraciones**: el esquema se mantiene en `brisa10-admin/supabase/migrations`.

## Stack

| Área | Tecnología |
|------|------------|
| Base | Expo SDK 58, React Native 0.88, React 19, TypeScript estricto |
| Navegación | Expo Router (rutas por archivos, pestañas, rutas protegidas) |
| Interfaz | React Native Reusables (shadcn/ui para React Native) + NativeWind (Tailwind) + Lucide |
| Datos | Supabase JS + TanStack Query |
| Formularios | React Hook Form + Zod |
| Sesión en el dispositivo | `expo-sqlite` (almacenamiento local), `localStorage` en web |
| Fotos | `expo-image-picker` (galería y cámara), `expo-image` (caché) |

## Unidad gráfica con la app administrativa

- Los componentes base (`src/components/ui`) son de **React Native Reusables**, la adaptación de shadcn/ui que usa la app administrativa: mismos nombres, variantes y estilo `new-york`.
- `src/global.css` define los **mismos tokens de color** (paleta neutra) y radios que la app administrativa, más los tonos de estado (disponible, bajo inventario, agotado) que allí se usan.
- Mismo icono (tienda blanca sobre fondo oscuro) e iconos Lucide.
- Mismos textos, validaciones y mensajes de error.

`src/lib/theme.ts` repite los colores principales para lo que no acepta clases (barra de pestañas, indicadores de carga). Si cambias un color, cámbialo en los dos archivos.

## Estructura

```
src/
├─ app/                        Rutas (Expo Router). Archivos delgados que exportan pantallas.
│  ├─ _layout.tsx              Raíz: proveedores, sesión y rutas protegidas
│  ├─ login.tsx, estado.tsx    Sin sesión / cuenta desactivada
│  └─ (app)/                   Con sesión
│     ├─ (tabs)/               Inicio, Vender, Productos, Inventario, Más
│     ├─ producto/…            Detalle, nuevo, editar
│     ├─ venta/…               Detalle y confirmación
│     └─ …                     Ventas, movimientos, categorías, configuración y hojas modales
├─ features/<módulo>/          Igual que en la app administrativa
│  ├─ screens/                 Pantallas
│  ├─ components/              Componentes del módulo
│  ├─ hooks/                   TanStack Query (consultas, mutaciones, invalidación)
│  ├─ services/                Único lugar que llama a Supabase
│  ├─ schemas/                 Zod
│  └─ types.ts
├─ components/
│  ├─ ui/                      React Native Reusables (se agregan con su CLI o copiando del registro)
│  └─ shared/                  Componentes propios reutilizables (ver abajo)
├─ lib/                        Cliente Supabase, formato COP/fechas, errores, tema
└─ types/database.ts           Tipos del esquema (copiados de brisa10-admin)
```

## Componentes compartidos

Toda pantalla se arma con estos componentes, para que el estilo sea consistente:

| Componente | Uso |
|------------|-----|
| `Screen`, `ScrollScreen` | Fondo, márgenes, teclado, "tirar para actualizar" y barra de acción al pie |
| `InfiniteList` | Listas con carga progresiva, estados de carga/error/vacío y contador |
| `SearchInput`, `FilterChips`, `PeriodChips`, `SelectField` | Búsqueda y filtros |
| `TextField`, `SwitchField`, `FormField`, `FormError` | Formularios con React Hook Form |
| `LoadingButton`, `HeaderButton`, `Fab` | Botones |
| `ConfirmDialog` | Confirmaciones |
| `SectionCard`, `DetailList`, `MenuRow`, `StatusBadge` | Bloques de contenido |
| `QueryBoundary`, `EmptyState`, `ErrorState`, `ListSkeleton` | Estados |
| `toast` | Avisos breves |

## Relación con el código de la app administrativa

La capa de datos se copió de `brisa10-admin` sin cambios de lógica:

- `src/features/*/services`, `src/features/*/schemas`, `src/features/*/types.ts`
- `src/types/database.ts`, `src/lib/errors.ts`, `src/lib/dates.ts`

Únicas diferencias: el cliente de Supabase guarda la sesión con `expo-sqlite`; las fotos se suben como bytes leídos del dispositivo; y el formato de fechas y moneda no depende de `Intl`, para que se vea igual en todos los teléfonos.

**Si cambia el esquema de la base de datos** (nueva migración en `brisa10-admin`), actualiza aquí `src/types/database.ts` y el servicio afectado.

## Decisiones

| Decisión | Motivo |
|----------|--------|
| Expo (Continuous Native Generation) | Sin carpetas `android/` ni `ios/` en el repositorio: se generan al compilar. Actualizar de versión es más simple. |
| Formularios en pantallas modales en lugar de diálogos | En el teléfono, el teclado tapa los diálogos centrados; una pantalla modal se adapta mejor. |
| Filtros de fecha con atajos (Hoy, 7 días, 30 días) | Más rápido con el dedo que un selector de fechas, y sin dependencias nativas extra. |
| Navegación protegida por rol (`Stack.Protected`) | El operador no puede abrir pantallas de administrador ni con un enlace directo. La base de datos además lo impide. |
| La navegación se monta cuando ya se conoce la sesión | Un enlace directo llega a su pantalla en lugar de redirigirse al inicio. |
| `anchor: '(tabs)'` | Una pantalla abierta por enlace directo tiene debajo las pestañas, así que siempre hay flecha para volver. |
| Carrito en memoria (contexto) | Se conserva al cambiar de pestaña; se pierde al cerrar la app, igual que en la versión web. |
| APK gratis por GitHub Actions y Expo Build para iOS/tiendas | Android se puede instalar sin tiendas ni cuentas; iOS exige firma de Apple. |
