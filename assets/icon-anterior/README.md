# Ícono anterior

Este era el ícono de la app antes del 17-10-2026, cuando iOS pasó a usar el ícono de Icon Composer (`assets/app.icon`).

![Ícono anterior](./icon.png)

- `icon.png`: ícono principal (1024×1024). Sigue siendo el `icon` general en `app.json`, así que Android y web lo usan todavía.
- `adaptive-icon.png`: primer plano del ícono adaptativo de Android.
- `favicon.png`: favicon de la web.

Para volver a usarlo en iOS, borra `"icon": "./assets/app.icon"` de la sección `ios` en `app.json`.

## Web

El 17-10-2026 la web también cambió al ícono verde nuevo, exportado de `moneyAppWeb.icon` con Icon Composer. Los anteriores están en `web/`:

![Ícono web anterior](./web/icon-web.png)

- `web/apple-touch-icon.png`: el que se ve al agregar la web al inicio desde Safari (va en `public/`).
- `web/icon-web.png`: la versión 1024×1024 del mismo (va en `assets/`).
- `favicon.png` (arriba): el favicon anterior de la web.

## iOS (tarjeta con barras de vidrio)

El 20-10-2026 iOS pasó, como prueba, al ícono de `moneyApp.icon`. El de la tarjeta con barras de vidrio que se usaba antes está en `ios-tarjeta/app.icon`. Para volver a él, reemplaza `assets/app.icon` por esa carpeta y corre `npx expo prebuild -p ios`.

## Web (verde)

El 21-10-2026 la web pasó al mismo ícono negro de iOS (`assets/app.icon`), exportado con `ictool` de Icon Composer. Los verdes que tenía están en `web-verde/` (`icon-web.png` va en `assets/`, `apple-touch-icon.png` en `public/`, `favicon.png` en `assets/`).
