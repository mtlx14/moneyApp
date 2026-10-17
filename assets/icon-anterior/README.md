# Ícono anterior

Este era el ícono de la app antes del 17-10-2026, cuando iOS pasó a usar el ícono de Icon Composer (`assets/app.icon`).

![Ícono anterior](./icon.png)

- `icon.png`: ícono principal (1024×1024). Sigue siendo el `icon` general en `app.json`, así que Android y web lo usan todavía.
- `adaptive-icon.png`: primer plano del ícono adaptativo de Android.
- `favicon.png`: favicon de la web.

Para volver a usarlo en iOS, borra `"icon": "./assets/app.icon"` de la sección `ios` en `app.json`.
