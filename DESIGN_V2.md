# Diseño v2 (tema beige / papel)

Contexto para retomar el rediseño en otro chat. La app tiene **dos árboles de
diseño** viviendo a la vez: `v1` es el diseño original y no se toca; `v2` es el
rediseño. El tema activo decide cuál se renderiza.

Referencia visual: `~/Desktop/code/songListApp` — de ahí salen la paleta de
papel, la cuadrícula del fondo y la barra vertical.

---

## Cómo se eligen los diseños

Cada tema declara su árbol:

```js
// src/theme/theme.js
baseTheme  → design: 'v1'   // lo heredan todos los temas viejos
beigeTheme → design: 'v2'
```

`useDesign()` (`src/designs/index.js`) lee `theme.design` y devuelve el módulo
del diseño. `App.js` resuelve contra ese registry: no importa páginas
directamente.

```
src/designs/index.js      useDesign() + registry
src/designs/v1/index.js   páginas + MainMenu + GradientBackground
src/designs/v2/index.js   ídem
```

Para agregar un tema nuevo al rediseño alcanza con `design: 'v2'` y sumarlo a
`newThemes` en `data.js` (`legacyThemes` es el grupo de arriba del selector,
`newThemes` el de abajo, separados por una barra).

---

## Estructura

```
src/
  theme/theme.js        TODOS los colores, de los dos diseños
  theme/useTheme.js
  helpers.js            compartido
  services.js           compartido
  designs/
    index.js
    v1/{pages,components}    diseño original — NO TOCAR
    v2/
      layout.js              medidas del riel y del padding
      index.js
      pages/       Home, Monthly_summary, Subscriptions,
                   Matias_accounts, Aylin_accounts, FixedExpenses
      components/  copias de v1, se editan libremente
```

`context.js`, `appStorageProvider.js`, `data.js` y `services.js` son únicos: la
lógica de negocio no está duplicada.

> **Ojo:** las páginas y componentes de v2 nacieron como copia de v1. Lo que
> todavía no divergió sigue igual en los dos lados, así que **un arreglo de
> lógica hay que hacerlo en los dos árboles**. Cuando algo se toca mucho,
> conviene extraer la lógica a un hook compartido en `src/`.

---

## Layout

`src/designs/v2/layout.js`:

| Constante | Valor | Qué es |
|---|---|---|
| `NAV_WIDTH` | 34 | ancho de la barra vertical izquierda |
| `CONTENT_LEFT` | 37 | donde empieza el contenido, desde el borde |
| `CONTENT_LEFT_HOME` | 47 | ídem, solo en Inicio |

`CONTENT_LEFT` **incluye** el ancho de la barra, no se le suma. La diferencia
con `NAV_WIDTH` es el aire entre la barra y el texto. Reemplaza al
`paddingHorizontal: windowWidth * 0.05` (o `* 0.1` en Inicio) que traían las
páginas: ese sigue puesto para el lado derecho, y el `paddingLeft` lo pisa.

Las cajas de totales de Inicio se alinean **por construcción**, no por cuenta:
se estiran al ancho del contenido, se desbordan `-3%` por los dos lados y
llevan `padding` igual a ese desborde. Así su contenido cae exactamente sobre
las filas sueltas. No cambiar eso por un ancho fijo.

---

## Paleta (`beigeTheme` en `src/theme/theme.js`)

Papel cálido, tinta gris carbón (nunca negro puro), un acento azul.

**Texto**

| Token | Valor | Uso |
|---|---|---|
| `text._1` / `_2` | `#6B6358` | cuerpo. Comparten tono a propósito |
| `text._3` | `#9A9183` | etiquetas secundarias, filas de listas |
| `text._4` | `rgba(57,53,48,.22)` | líneas finas |
| `text.strong` | `#393530` | tinta plena: totales de Inicio, texto sobre tarjeta clara |
| `text.onFill` | blanco | texto sobre un fondo sólido de color |
| `text.onCard` | `rgba(255,255,255,.92)` | texto sobre la imagen de tarjeta oscura |
| `text.green` | `rgb(14,184,59)` | montos de ingreso |
| `text.red` | `rgb(208,66,66)` | montos de deuda |

**Fondo**

| Token | Valor | Uso |
|---|---|---|
| `bg.primary` | `#F3EFE6` | el papel |
| `bg.primary_0` | mismo, alpha 0 | extremo de los degradados. **No usar `'transparent'`**: en iOS el fade tira a negro |
| `bg.grid` | `rgba(57,53,48,.015)` | líneas de la cuadrícula |
| `bg.card` | `#FAF7F0` | superficies: popovers |
| `bg.divider` | `rgba(57,53,48,.1)` | separadores y bordes de panel |
| `bg.tr_05` | `rgba(57,53,48,.04)` | relleno de filas (Gastos) |
| `bg.account` | igual a `tr_05` | tarjetas de cuentas |
| `bg.check` | `rgb(77,189,107)` | verde de botón marcado, banner de cambios, guardar |
| `bg.danger` | `rgb(213,88,88)` | rojo sólido: desmarcar, borrar, cancelar |
| `bg.yellow` | `rgb(238,185,39)` | estado amarillo del check |
| `bg.blue` | `rgb(74,127,193)` | Confirmar del teclado |
| `bg.menuAccentColor` | `#4A7FC1` | item activo del riel |

Hay **dos verdes a propósito**: `text.green` para los montos, `bg.check` para
los rellenos. No unificarlos.

---

## Piezas propias de v2

**`components/GradientBackground.js`** — pese al nombre (se conserva para que el
registry resuelva igual que v1), pinta papel **plano** más una cuadrícula de
12px. React Native no tiene `background-image` repetido, así que la retícula son
~100 `View` de 1px dibujadas una vez.

**`components/MainMenu.js`** — riel vertical fijo a la izquierda. Cuatro
entradas: Inicio, Gastos, Matías, Aylin. Suscripciones y el cambio de mes
quedaron fuera, así que **en v2 no hay forma de cambiar `monthOffset`**.

Cada item es un hueco de `NAV_WIDTH × alto`, y adentro un `Pressable`
horizontal del tamaño del texto, rotado -90°. Se hizo así porque un `Text`
ancho rotado dentro de una caja angosta se desbordaba: el toque no coincidía
con lo que se veía, y el texto salía con elipsis. **No volver a rotar solo el
texto.**

**`components/FadingScroll.js`** — lista con scroll propio que se desvanece
contra el fondo en el borde donde queda contenido. El degradado aparece solo si
hay más para ver, así que su presencia es la señal. Toma el alto de su
contenido con `flexShrink: 1`: solo cede cuando el conjunto no entra, para no
robarse el espacio sobrante.

**Tarjetas de cuenta** — la imagen no está en la base de datos, se elige en
código:

- `data.js` → `accountCardByName[type][name]` y `subAccountCard[name]`, ambos
  por **nombre de Firestore**. Si el nombre no coincide, no hay error: cae en
  la tarjeta por defecto, o en ninguna.
- `components/AccountCard.js` → consulta esos mapas y después una cadena por
  `id`/`type`/`hasSubAccount`.
- `card_transparent.png` es blanca y desaparece sobre el papel: v2 usa
  `card_light.png` (gris) para las cuentas con subcuentas, con texto oscuro.

---

## Estado

Hecho: fondo, riel, padding de todas las páginas, paleta, Inicio (páginas 1 y
2, con el scroll de la lista del mes siguiente), Gastos, cuentas de Matías y
Aylin, teclado y modales de edición, popovers del usuario, banner de cambios.

Pendiente / conocido:

- **Sin cambio de mes en v2** — el botón salió del menú.
- **Subcuentas anidadas sin contraste** — `bg.subAccount` (.05) quedó casi
  igual que `bg.account` (.04); antes contrastaban porque la cuenta era blanca.
- **La cuadrícula casi no se ve** — alpha `.015`, copiado tal cual de
  songListApp. Subir a `.03` si se quiere notar.
- **Las líneas divisorias de Inicio se desbordan asimétrico** (`width: 85%` con
  margen negativo solo a la izquierda), a diferencia de las cajas.
- **Espaciadores de `windowHeight * 0.3`** al final del scroll en
  Suscripciones, Matías y Aylin: existían para esquivar el botón flotante del
  menú viejo. En Gastos ya se bajó a `0.05`.
- **Los iconos PNG de `assets/icons/` se dibujan sin `tintColor`.** Si son
  blancos, sobre el papel no se ven.
- **`theme.home_acc_text_2`** (sin el `.fw`) aparece en varios lados de v1:
  es `undefined` y renderiza el peso por defecto. En v2 ya está corregido.
