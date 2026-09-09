import { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme.js';
import Icon from './Icon.js';

// Fila que se desliza hacia la izquierda para borrar.
//
//   deslizo poco o mucho → frena con el basurero asomado
//   sigo arrastrando     → dispara
//
// En los dos casos quien recibe `onDelete` es el que pregunta: acá no se borra
// nada sin confirmar.
//
// Es el mismo mecanismo de songListApp, que es donde funciona bien: la fila y el
// basurero son puntos de anclaje con **scroll-snap-stop: always**, que es lo que
// hace que una deslizada fuerte no pueda saltearse el anclaje del medio; pasado
// el basurero viene una zona sin anclajes, y ahí el scroll dispara por posición.
//
// ScrollView no expone scroll-snap, así que en web el CSS se inyecta una vez y
// se engancha con data-* (`dataSet`). En nativo los dos puntos van en
// snapToOffsets, que con disableIntervalMomentum se comporta igual.
const SNAP_STYLE_ID = 'swipe-to-delete-snap';

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById(SNAP_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = SNAP_STYLE_ID;
  style.textContent = `
    [data-swipe-scroll] { scroll-snap-type: x mandatory; }
    [data-swipe-snap] { scroll-snap-align: end; scroll-snap-stop: always; }
  `;
  document.head.appendChild(style);
}

export default function SwipeToDelete({ width, height, onDelete, children }) {
  const theme = useTheme();
  // el basurero asoma en un cuadrado del alto de la fila
  const peek = height;
  // lo que hay que arrastrar pasado el basurero para que dispare
  const trigger = peek + width * 0.4;

  const scrollRef = useRef(null);
  // el scroll sigue mandando eventos después de disparar: sin esto se pregunta
  // una vez por frame
  const fired = useRef(false);
  const rearmTimer = useRef(null);

  // La fila vuelve a su lugar cuando la pregunta ya se contestó. Si el movimiento
  // se borró, para entonces esta fila ni existe y no hace nada.
  //
  // El gesto se rearma recién cuando ya volvió: mientras vuelve, el scroll pasa
  // de nuevo por el umbral y volvía a disparar, así que al cancelar la fila se
  // quedaba tomada en el rojo.
  const reset = () => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
    clearTimeout(rearmTimer.current);
    rearmTimer.current = setTimeout(() => (fired.current = false), 400);
  };

  useEffect(() => () => clearTimeout(rearmTimer.current), []);

  const fire = () => {
    if (fired.current) return;
    fired.current = true;

    // el rojo termina de llenar la fila mientras se pregunta
    scrollRef.current?.scrollTo({ x: peek + width, animated: true });

    // en web window.confirm bloquea el hilo: sin este respiro el rojo no
    // alcanza a pintarse antes de que aparezca el diálogo
    setTimeout(() => (onDelete ? onDelete({ reset }) : reset()), 80);
  };

  const handleScroll = (e) => {
    if (fired.current) return;
    if (e.nativeEvent.contentOffset.x >= trigger) fire();
  };

  const snapProps = Platform.OS === 'web' ? { dataSet: { swipeScroll: '' } } : { snapToOffsets: [0, peek], snapToStart: false, snapToEnd: false, disableIntervalMomentum: true, decelerationRate: 'fast' };

  // en nativo el dataSet no significa nada, pero tampoco molesta
  const snapPoint = { dataSet: { swipeSnap: '' } };

  return (
    <View style={{ width, height, borderRadius: 10, overflow: 'hidden' }}>
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={handleScroll} {...snapProps}>
        {/* primer anclaje: la fila entera */}
        <View {...snapPoint} style={{ width, height }}>
          {children}
        </View>

        {/* segundo anclaje: acá frena por fuerte que haya sido la deslizada */}
        <Pressable {...snapPoint} onPress={fire} style={{ width: peek, height, backgroundColor: theme.bg.danger, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name='delete' size={height * 0.45} color={theme.text.onFill} />
        </Pressable>

        {/* el rojo que llena la fila. Arrastrar hasta acá es lo que borra: el
            disparo es por posición, antes de llegar. Ancla al final —si no, con
            snap mandatory el navegador devuelve el scroll al basurero y el rojo
            no se queda mientras se pregunta— */}
        <View {...snapPoint} style={{ width, height, backgroundColor: theme.bg.danger }} />
      </ScrollView>
    </View>
  );
}
