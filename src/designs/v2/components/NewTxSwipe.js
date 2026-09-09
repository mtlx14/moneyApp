import { useRef } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { txTypes } from '../../../../data.js';

// Botón para anotar un movimiento: scroll horizontal con el botón al medio y
// las acciones a los costados.
//
//   toque         → modal en blanco
//   deslizo poco  → queda anclado con el cachito de color asomado
//   deslizo mucho → se dispara la acción y el botón vuelve solo
//
// Los anclajes salen de los anchos de los hijos: en web el único snap que
// existe es pagingEnabled, que le pone scroll-snap-align a cada hijo directo,
// así que el botón va partido en dos para que su corte sea un anclaje. En
// nativo pagingEnabled ancla de a pantallas, ahí van snapToOffsets.
export default function NewTxSwipe({ onNew, height, incomeOnly = false }) {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const width = windowWidth * 0.9;

  const peek = width * 0.3;
  // los paneles miden la barra entera: así el recorrido de más que dispara la
  // acción termina con el color llenándola, y no cortado por la mitad
  const panel = width;
  const trigger = peek * 2;

  const scrollRef = useRef(null);
  const didInitScroll = useRef(false);
  // el scroll sigue mandando eventos después de disparar: sin esto se abre el
  // modal una vez por frame
  const fired = useRef(false);

  const toCenter = (animated = true) => scrollRef.current?.scrollTo({ x: panel, animated });

  const handleContentSizeChange = () => {
    if (didInitScroll.current) return;
    didInitScroll.current = true;
    toCenter(false);
  };

  const handleScroll = (e) => {
    if (fired.current) return;
    const dx = e.nativeEvent.contentOffset.x - panel;
    if (Math.abs(dx) < trigger) return;

    fired.current = true;
    // se queda con el color llenando la barra hasta que desaparece: si lo
    // dejamos suelto, el snap lo devuelve al cachito y se ve el salto
    scrollRef.current?.scrollTo({ x: dx < 0 ? 0 : panel * 2, animated: false });
    // con incomeOnly los dos lados anotan un ingreso: la cuenta no lleva gastos
    onNew?.(dx < 0 || incomeOnly ? 'income' : 'expense');
    // vuelve a su lugar cuando ya no se ve. Si el modal se abrió, para entonces
    // esto ni existe y no hace nada
    setTimeout(() => {
      toCenter(false);
      fired.current = false;
    }, 500);
  };

  const sign = (text, color) => <Text style={{ color, fontSize: height * 0.45, fontWeight: '300', lineHeight: height * 0.55 }}>{text}</Text>;
  const block = (w, color, child, style) => <View style={[{ width: w, height, backgroundColor: color, justifyContent: 'center', alignItems: 'center' }, style]}>{child}</View>;

  const snapProps =
    Platform.OS === 'web'
      ? { pagingEnabled: true }
      : { snapToOffsets: [panel - peek, panel, panel + peek], snapToStart: false, snapToEnd: false, disableIntervalMomentum: true, decelerationRate: 'fast' };

  return (
    <View style={{ width, height, borderRadius: 15, overflow: 'hidden' }}>
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={handleScroll} contentOffset={{ x: panel, y: 0 }} onContentSizeChange={handleContentSizeChange} {...snapProps}>
        {/* ingreso: el signo va en el cachito, que es lo único que se asoma */}
        {block(panel - peek, txTypes.income.color)}
        {block(peek, txTypes.income.color, sign('+', theme.text.onFill))}

        {/* el botón, partido donde tiene que quedar el anclaje del otro lado */}
        {block(peek, theme.bg.tr_1)}
        <Pressable onPress={() => onNew?.(incomeOnly ? 'income' : null)} style={{ width: width - peek, height, backgroundColor: theme.bg.tr_1, justifyContent: 'center' }}>
          {/* centrado contra el botón entero, no contra este pedazo */}
          <View style={{ position: 'absolute', left: width / 2 - peek - height / 2, width: height, alignItems: 'center' }}>{sign('+', theme.text._2)}</View>
        </Pressable>

        {/* gasto; en una cuenta de solo ingresos este lado también suma, así que
            se pinta y se firma igual que el otro */}
        {block(peek, incomeOnly ? txTypes.income.color : txTypes.expense.color, sign(incomeOnly ? '+' : '−', theme.text.onFill))}
        {block(panel - peek, incomeOnly ? txTypes.income.color : txTypes.expense.color)}
      </ScrollView>
    </View>
  );
}
