# Diseño (tema beige / papel)

Contexto para retomar el diseño en otro chat. Hay **un solo árbol de diseño**,
`src/designs/v2`: el original se eliminó. El tema solo define colores.

Referencia visual: `~/Desktop/code/songListApp` — de ahí salen la paleta de
papel, la cuadrícula del fondo y la barra vertical.

---

## Temas

`src/theme/theme.js`:

- `baseTheme` es la paleta del rediseño (papel + tinta) y `beigeTheme` la usa
  tal cual: es el tema por defecto (`DEFAULT_THEME` en `data.js`).
- Los demás son variantes de color heredadas del diseño anterior. Todas salen
  de `createDarkTheme`, que apila `darkBase` (texto blanco, transparencias
  claras, cuadrícula apagada) sobre la base; cada una cambia los dos tonos de
  fondo y algún acento.

Para sumar un tema alcanza con crearlo ahí y agregarlo a `themes` en `data.js`:
el selector del `UserTag` los lista todos en una sola grilla.

`useDesign()` (`src/designs/index.js`) devuelve el único diseño; `App.js`
resuelve las páginas contra ese registry en vez de importarlas directo.

---

## Estructura

```
src/
  theme/theme.js        TODOS los colores
  theme/useTheme.js
  helpers.js            compartido
  services.js           compartido
  designs/
    index.js
    v2/
      layout.js              medidas del riel y del padding
      index.js
      pages/       Home, Monthly_summary, Subscriptions, Categories,
                   Matias_accounts, Aylin_accounts, FixedExpenses
      components/
```

`context.js`, `appStorageProvider.js`, `data.js` y `services.js` son únicos: la
lógica de negocio no está duplicada.

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

## Piezas propias del diseño

**`components/GradientBackground.js`** — pese al nombre (se conserva para que el
registry resuelva igual), pinta papel **plano** más una cuadrícula de
12px. React Native no tiene `background-image` repetido, así que la retícula son
~100 `View` de 1px dibujadas una vez.

**`components/MainMenu.js`** — riel vertical fijo a la izquierda. Cuatro
entradas: Inicio, Gastos, Matías, Aylin. Suscripciones quedó fuera. El cambio de
mes también salió del riel: vive en el menú de los tres puntos de Inicio.

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

**`components/HomeMenu.js`** — los tres puntos de arriba a la derecha de
Inicio, donde antes se leía el mes. Abre un popover con la misma caja que los
del globo de usuario: cambiar de mes (`toggleMonthOffset`) e ir a Categorías. El
mes pasó al pie de la página, centrado y con el año (`monthAndYear`), por eso la
segunda página de Inicio bajó de `0.75` a `0.72` de alto: le deja esa franja.

**`pages/Categories.js` + `components/ModalCategory.js`** — listado de
categorías y su modal de alta/edición: nombre, tipo (gasto / ingreso / ambos),
color de `CATEGORY_COLORS` e ícono de `CATEGORY_ICONS`, las dos listas en
`data.js`. El modal **reemplaza** a la lista, no se apoya encima: mismo patrón
que Resumen del mes con `ModalEditAccount` (`editing ? <modal/> : <lista/>`, y la
lista vuelve con los dos `FadeInDown` anidados). La caja es la de filas de
siempre —`0.8` de ancho, filas de `0.12` sobre `tr_05`, divisores `tr_3`— con el
borde de arriba clavado donde quedaría centrada, así la lista de íconos crece
hacia abajo sin mover el resto. Las listas de íconos y colores salen **dentro**
de la caja y las recorta su `overflow: hidden`: la caja las abre animando el
**alto** de esa franja, como la fila de "mes 2" de `ModalEditAccount`, no con un
`LinearTransition` —con layout transition cada caja corría su propia animación y
los botones de abajo llegaban tarde—. La fila de Ícono muestra la pastilla con
el dibujo y la de Color solo el círculo de color, sin ícono encima. Cada fila muestra cuántos movimientos usan la categoría, porque
borrarla los deja sin ella. El id se arma con el nombre la primera vez y después
no se toca: las transacciones guardan la clave, así que renombrar no puede mover
movimientos de una categoría a otra.

**`components/SwipeToDelete.js`** — la fila del historial que se desliza hacia la
izquierda para borrar, con la técnica de `NewTxSwipe`: un scroll horizontal con
la fila y el panel rojo adentro, sin librería de gestos. Deslizada corta o
larga, frena con el basurero asomado; para borrar hay que seguir arrastrando
pasado ese punto.

Es el mecanismo de songListApp, copiado: la fila y el basurero son anclajes con
**`scroll-snap-stop: always`**, que es lo que impide que una deslizada fuerte se
saltee el anclaje del medio, y pasado el basurero viene una zona **sin** anclajes
donde el scroll dispara por posición. `ScrollView` no expone scroll-snap, así que
en web el CSS se inyecta una vez y se engancha con `data-*` (`dataSet`, que
react-native-web reenvía al nodo); en nativo los dos puntos van en
`snapToOffsets` con `disableIntervalMomentum`.

Antes de dar con esto fallaron tres intentos: anclar con `onScrollEndDrag` (en
web no llega, `ScrollViewBase` solo emite `onScroll`), partir los hijos para que
`pagingEnabled` ancle en medio de la fila (hay que sacar la fila del flujo y en
absoluto **desaparece de la lista**) y pedir el dedo apoyado para disparar. Nunca borra: llama a `onDelete`, y quien lo recibe pregunta con
`confirmDelete` (`helpers.js`), el mismo diálogo por plataforma que usan los
modales de gastos. El modal de un movimiento tiene además su botón rojo, a la
izquierda de Cerrar y Guardar.

**`components/Caret.js`** — cursor parpadeante para los campos de monto de los
modales. Esos campos son un `Pressable` con un `Text`, no un input, porque el
monto se edita con el teclado propio, así que no traen cursor.

**Tarjetas de cuenta** — la imagen no está en la base de datos, se elige en
código:

- `data.js` → `accountCardByName[type][name]` y `subAccountCard[name]`, ambos
  por **nombre de Firestore**. Si el nombre no coincide, no hay error: cae en
  la tarjeta por defecto, o en ninguna.
- `components/AccountCard.js` → consulta esos mapas y después una cadena por
  `id`/`type`/`hasSubAccount`.
- `card_transparent.png` es blanca y desaparece sobre el papel: se usa
  `card_light.png` (gris) para las cuentas con subcuentas, con texto oscuro.

---

## Categorías e íconos

Saldo inicial, transferencia y ajuste **no son categorías, son tipos**, y los
movimientos de esos tipos no llevan categoría: la lista está en
`TYPES_WITHOUT_CATEGORY` (`data.js`), el modal de un movimiento le esconde la
fila y le suelta la categoría que tuviera al cambiarle el tipo. El ícono y el
color salen de `txTypes`. La semilla vieja las traía como categorías;
`scripts/drop-type-categories.mjs` las borró de Firestore (ya corrido).

Una **transferencia** es un solo documento, no dos: al elegir el tipo aparece la
fila "A cuenta" y el destino se guarda en `toAccountId`. El destino **no se elige**: las transferencias van
solo entre la cuenta corriente y el efectivo del mismo dueño (`TRANSFER_PAIR` en
`data.js`, por nombre de Firestore como el resto de los mapas de ese archivo),
así que elegido el origen el destino es la otra del par y la fila solo lo
muestra. Si cambia la cuenta de origen, se rehace solo.

Queda afuera todo lo demás: entre usuarios no se transfiere, y Bencina y los
sueldos llevan el saldo escrito a mano (`isLedger` en `false`), así que un
movimiento no los movería. Cuando la cuenta no tiene par, el tipo
Transferencia ni se ofrece. El monto se resta de la
cuenta de origen y se suma a la de destino (`signedAmountFor` en `helpers.js`, y
el `txByAccount` de `context.js`), y el movimiento se ve en el historial de las
dos cuentas: en la de destino entra en positivo. Cambiar el tipo a otra cosa
suelta el destino, como suelta la categoría.

El modal de un movimiento es también donde se **guarda**: `saveTransaction`
(`services.js`) escribe el documento —uno sin id es nuevo y Firestore le pone
uno— y el botón Guardar aparece, como el del modal de gastos, solo cuando el
movimiento está entero (descripción, monto, tipo, cuenta, fecha, y categoría si
ese tipo la lleva) y además cambió respecto de lo guardado.

En el modal de un movimiento la categoría se elige en la misma caja chica que el
tipo y la cuenta: aparece al costado fundiéndose desde la derecha y se va
fundiéndose hacia la derecha, con los 25px de recorrido de
`FadeInRight`/`FadeOutRight` —antes entraba deslizándose desde fuera de la
pantalla— mientras la caja grande se corre a la izquierda, las dos con la misma
duración. La caja chica arranca **a la altura
de su fila** y crece hacia abajo; cuando ya no entra se apoya en el borde de
abajo de la caja grande y sigue creciendo hacia arriba, nunca más alta que ella,
y lo que sobra scrollea adentro. Solo ofrece
las categorías que sirven para ese tipo (un ingreso no ve las de gasto; las de
`kind: 'both'` salen siempre).

Las categorías **ya no viven en código**: son la colección `categories` de
Firestore. `data.js` conserva `defaultCategories` como semilla y `context.js` la
escribe la primera vez que la colección aparece vacía (ids fijos, así que es
idempotente aunque los dos teléfonos lo hagan a la vez). Todo lo que las
consuma tiene que sacarlas de `useData().categories`, no de `data.js`.

La fuente de íconos (`assets/fonts/MaterialSymbolsRounded.ttf`) se volvió a bajar
pidiendo el alfabeto entero más dígitos y guión bajo, así que **cualquier nombre
de Material Symbols funciona** y agregar uno ya no obliga a regenerar el subset.
Pasó de 335KB a 1.1MB. Ver el comentario de `components/Icon.js`.

---

## Las cuentas de transporte (Por pagar / Currently)

**Ya no hay sub-cuentas.** Uber, Didi y Cabify eran una cuenta cada una dentro de
`m_account_to_be_paid` y `m_account_currently`; hoy son **movimientos con
categoría** dentro de esas dos cuentas, que pasaron a `isLedger` como el resto.
`scripts/drop-sub-accounts.mjs` hizo el cambio (ya corrido): marcó las dos
cuentas, las dejó en cero, borró los seis documentos `sub_account` y creó las
categorías que faltaban. Los saldos viejos no se migraron, se arrancó de cero.

Las dos listas están en `data.js`: `RIDE_ACCOUNTS` (por **id**) y
`RIDE_CATEGORIES` (por **etiqueta**, como el resto de los mapas de ese archivo,
en el orden en que se ven y con el emoji que tenía cada sub-cuenta). Sobre eso trabajan tres helpers de `helpers.js`:
`isRideAccount`, `rideCategories` y `rideBreakdown`.

Qué cambia en esas cuentas:

- **Solo llevan ingresos.** `ModalTransaction` no ofrece otro tipo, y si el
  movimiento llega con otro (el lado del gasto del swipe, o se cambió la cuenta)
  se corrige solo. `NewTxSwipe` recibe `incomeOnly`: los dos lados anotan un
  ingreso y el panel de la derecha se pinta de verde.
- **Solo esas categorías**, en el orden de `RIDE_CATEGORIES`.
- **En el listado de cuentas se abren** mostrando cuánto puso cada app, en el
  lugar donde antes iban las sub-cuentas. Es la suma de los movimientos de esa
  categoría (`rideBreakdown`) y no se toca: los montos se anotan abriendo la
  cuenta, o tocando la fila: eso abre el movimiento más nuevo de esa app, y al
  cerrarlo queda la cuenta abierta con toda su lista. Las categorías sin
  movimientos no salen, y una cuenta vacía no muestra nada. La fila se ve como la vieja sub-cuenta: **emoji** y nombre, no la
  pastilla con el ícono. El emoji sale de `RIDE_CATEGORIES`, no del movimiento,
  así que cambiarle la cuenta a un movimiento no lo mueve. La pastilla con el
  ícono de la categoría sigue siendo lo que usa la lista de movimientos.

Con las sub-cuentas se fueron también, de `Matias_accounts` y de `AccountCard`,
el traspaso entre sub-cuentas (`ModalTransferAccount`), las pastillas de la
tarjeta para elegir a cuál guardar y la tarjeta gris de "Agregar cuenta".
`Aylin_accounts` conserva ese código: no hay sub-cuentas de Aylin, así que no
corre, pero está para limpiar.

---

## Transiciones entre páginas

Cada diseño define la suya: `pageAnimations(direction)` en su `index.js`, y
`App.js` se la pide en vez de tenerlas escritas. El riel pasa `direction` según
la posición del destino: 1 si está más abajo en la lista, 0 si está más arriba.

Estado actual: **solo entrada**, `FadeInDown`/`FadeInUp` de 100ms, sin
delay y con el recorrido por defecto del preset.

Esto costó muchas vueltas. Lo que quedó aprendido, para no repetirlo:

- **Solo funcionan los presets.** Las animaciones custom —tanto una función
  devuelta por una fábrica como worklets sueltos a nivel de módulo, con la
  directiva puesta— reanimated las descarta **sin ningún error**: no anima y no
  avisa. Probado en las dos formas. (Reanimated 4.1.6 + react-native-worklets
  0.5.1; el plugin de babel es correcto, `react-native-reanimated/plugin` es un
  re-export de `react-native-worklets/plugin`.)
- **No hay un recorrido intermedio.** `Slide*` recorre `windowHeight` entera,
  `Fade*` tiene 25px escritos. Nada en el medio. `withInitialValues` mueve el
  punto de partida de la entrada, pero no el destino de la salida, así que
  usarlo descalza las dos.
- **`withInitialValues` no surtió efecto en las páginas con `GoBackScroll`**,
  solo en Inicio. Nunca se llegó a la causa.
- **Cada página necesita su propio lugar en el árbol de `App.js`.** Con un slot
  compartido y `key`, React desmonta y monta en el mismo commit y reanimated se
  saltea la salida.
- **El nodo animado tiene que ser el más externo de la página.** Por eso
  `GoBackScroll` recibe `entering`/`exiting` y los aplica sobre su propio
  `ScrollView`: envuelto en otra vista, no animaba.
- **Los hijos no animan su salida si un ancestro se desmonta.** Juega en los dos
  sentidos: es lo que rompía la salida de las páginas internas, y es lo que hoy
  evita el parpadeo.
- **Las páginas no tienen fondo propio** —el papel lo pinta
  `GradientBackground`—, así que cualquier transición que las superponga muestra
  los dos contenidos encimados. Es la razón de fondo por la que ningún
  cruce entrada/salida se veía bien.
- **No hay animación de salida, a propósito.** Con ella, la página que se va
  queda montada y sus hijos con animación propia (los puntos verdes de Inicio,
  `OkToChanges`, las filas plegables) corren la suya y quedan parpadeando encima
  de la nueva.

Si algún día se quiere la salida animada, el camino es darle fondo opaco a las
páginas para que la que entra tape a la que sale — con el costo de perder la
cuadrícula, que está detrás.

---

## Estado

Hecho: fondo, riel, padding de todas las páginas, paleta, Inicio (páginas 1 y
2, con el scroll de la lista del mes siguiente), Gastos, cuentas de Matías y
Aylin, teclado y modales de edición, popovers del usuario, banner de cambios.

Se prueba en **el navegador del teléfono**, no en un build nativo. Importa: el
`scrollTo` animado y las animaciones de reanimated no se comportan igual ahí que
en nativo.

Pendiente / conocido:

- **La entrada de las páginas internas no recorre**, solo funde; la de Inicio sí
  se desplaza. Ver la sección de transiciones.
- **El desglose por categoría no contrasta** — `bg.subAccount` (.05) quedó casi
  igual que `bg.account` (.04); antes contrastaban porque la cuenta era blanca.
- **`Aylin_accounts` todavía tiene el código de sub-cuentas**, que ya no corre.
- **La cuadrícula casi no se ve** — alpha `.015`, copiado tal cual de
  songListApp. Subir a `.03` si se quiere notar.
- **Las líneas divisorias de Inicio se desbordan asimétrico** (`width: 85%` con
  margen negativo solo a la izquierda), a diferencia de las cajas.
- **Espaciadores de `windowHeight * 0.3`** al final del scroll en
  Suscripciones, Matías y Aylin: existían para esquivar el botón flotante del
  menú viejo. En Gastos ya se bajó a `0.05`.
- **Los iconos PNG de `assets/icons/` se dibujan sin `tintColor`.** Si son
  blancos, sobre el papel no se ven.
- **`theme.home_acc_text_2`** (sin el `.fw`) es `undefined` y renderiza el peso
  por defecto. Va `theme.fw.home_acc_text_2`.
