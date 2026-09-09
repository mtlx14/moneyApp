import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { fS } from '../../../theme/theme';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Una columna de la ruleta: se arrastra y cae en la opción del centro.
function Column({ items, index, onIndex, itemHeight, flex, theme }) {
  const ref = useRef(null);
  // el snap del sistema no existe en web, así que la caída al centro se hace a mano
  const settle = (y) => {
    const next = Math.min(items.length - 1, Math.max(0, Math.round(y / itemHeight)));
    ref.current?.scrollTo({ y: next * itemHeight, animated: true });
    onIndex(next);
  };

  // si la lista se acorta (meses de 30 días) la posición se corrige sola
  useEffect(() => {
    ref.current?.scrollTo({ y: index * itemHeight, animated: false });
  }, [items.length]);

  return (
    <View style={{ flex, height: itemHeight * 5 }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate='fast'
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: index * itemHeight }}
        contentContainerStyle={{ paddingVertical: itemHeight * 2 }}
        // mientras se arrastra, el resaltado sigue al dedo
        onScroll={(e) => {
          const next = Math.min(items.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / itemHeight)));
          if (next !== index) onIndex(next);
        }}
        onScrollEndDrag={(e) => settle(e.nativeEvent.contentOffset.y)}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
      >
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              ref.current?.scrollTo({ y: i * itemHeight, animated: true });
              onIndex(i);
            }}
            style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text numberOfLines={1} style={{ color: theme.text._1, opacity: i === index ? 1 : 0.35, fontSize: fS.modalTransfer * (i === index ? 1.15 : 1) }}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// Selector de fecha con la misma caja de abajo que el teclado de montos:
// tres ruletas, día / mes / año.
export default function DatePicker({ value, onChange, onConfirm }) {
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height - insets.top;
  const theme = useTheme();

  const base = value || new Date();
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => thisYear - 5 + i);

  const [day, setDay] = useState(base.getDate());
  const [month, setMonth] = useState(base.getMonth());
  const [year, setYear] = useState(base.getFullYear());

  // 31 de marzo pasando a febrero: el día se recorta al último del mes
  const max = daysInMonth(year, month);
  const safeDay = Math.min(day, max);
  const days = Array.from({ length: max }, (_, i) => i + 1);

  useEffect(() => {
    onChange?.(new Date(year, month, safeDay));
  }, [safeDay, month, year]);

  const itemHeight = windowWidth * 0.11;

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={{ backgroundColor: theme.bg.keyboard, position: 'absolute', width: windowWidth, height: windowHeight * 0.35, top: windowHeight * 0.65, borderTopRightRadius: 20, borderTopLeftRadius: 20, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
        {/* la fila del medio es la elegida: se marca una vez, detrás de las tres ruletas */}
        <View pointerEvents='none' style={{ position: 'absolute', left: 10, right: 10, top: itemHeight * 2, height: itemHeight, borderRadius: 15, backgroundColor: theme.bg.keyboard_key }} />
        <Column items={days} index={safeDay - 1} onIndex={(i) => setDay(i + 1)} itemHeight={itemHeight} flex={1} theme={theme} />
        <Column items={MONTHS} index={month} onIndex={setMonth} itemHeight={itemHeight} flex={1.6} theme={theme} />
        <Column items={years} index={years.indexOf(year)} onIndex={(i) => setYear(years[i])} itemHeight={itemHeight} flex={1} theme={theme} />
      </View>

      <Pressable
        onPress={() => onConfirm?.(new Date(year, month, safeDay))}
        style={{ position: 'absolute', width: windowWidth * 0.25, top: -windowWidth * 0.09 - 5, right: 5, backgroundColor: theme.bg.blue, height: windowWidth * 0.09, borderRadius: 15, justifyContent: 'center', alignItems: 'center', userSelect: 'none' }}
      >
        <Text style={{ color: theme.text.onFill, fontWeight: 400, fontSize: fS.keyboardBtn }}>Confirmar</Text>
      </Pressable>
    </Animated.View>
  );
}
