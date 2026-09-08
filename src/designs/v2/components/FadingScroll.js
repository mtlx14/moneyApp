import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/useTheme';

const FADE_HEIGHT = 26;

// Lista con scroll propio que se desvanece contra el fondo en el borde donde
// todavía queda contenido. El degradado aparece solo si hay algo más para ver,
// así que su presencia ya es la señal.
export default function FadingScroll({ children, style }) {
  const theme = useTheme();
  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const [offset, setOffset] = useState(0);

  const hidden = content - viewport;
  const moreAbove = offset > 2;
  const moreBelow = hidden > 2 && offset < hidden - 2;

  // Alto natural del contenido, pero con flexShrink para que ceda cuando el
  // conjunto no entra. Así la lista no se roba el espacio sobrante: el bloque
  // se sigue centrando como antes, y solo scrollea si de verdad hace falta.
  return (
    <View style={[{ position: 'relative', flexShrink: 1, height: content > 0 ? content : undefined }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => setViewport(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContent(height)}
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}
      >
        {children}
      </ScrollView>

      {moreAbove && <LinearGradient pointerEvents='none' colors={[theme.bg.primary, theme.bg.primary_0]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: FADE_HEIGHT }} />}
      {moreBelow && <LinearGradient pointerEvents='none' colors={[theme.bg.primary_0, theme.bg.primary]} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FADE_HEIGHT }} />}
    </View>
  );
}
