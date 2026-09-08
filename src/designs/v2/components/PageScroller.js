import { useEffect, useRef } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const windowWidth = Dimensions.get('window').width;

// Todas las páginas montadas, una debajo de otra, y navegar es hacer scroll.
// El desplazamiento lo hace el propio ScrollView, así que se siente igual que
// el scroll horizontal de Inicio, que es de donde salió la idea.
export default function PageScroller({ pages, order, page, pageProps }) {
  const insets = useSafeAreaInsets();
  const pageHeight = Dimensions.get('window').height - insets.top;

  const scrollRef = useRef(null);
  const index = Math.max(0, order.indexOf(page));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: index * pageHeight, animated: true });
  }, [index, pageHeight]);

  return (
    <ScrollView
      ref={scrollRef}
      // el gesto queda deshabilitado: adentro hay listas que scrollean vertical
      // y dos scrolls verticales anidados se pelean. Se mueve solo por el riel.
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    >
      {order.map((name) => {
        const Page = pages[name];
        if (!Page) return null;

        return (
          <View key={name} style={{ height: pageHeight, width: windowWidth, overflow: 'hidden' }}>
            <Page {...pageProps} />
          </View>
        );
      })}
    </ScrollView>
  );
}
