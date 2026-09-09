import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme.js';
import { fS } from '../../../theme/theme.js';

// Pregunta chica de sí o no, con la caja del modal de movimientos. Un toque
// fuera es lo mismo que decir que no.
export default function ModalConfirm({ message, confirmLabel = 'Sí', cancelLabel = 'No', onConfirm, onCancel }) {
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const theme = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable onPress={onCancel} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight, backgroundColor: theme.bg.black_tr_2 }} />

      <Animated.View entering={FadeInDown.duration(200)} style={{ width: windowWidth * 0.7, backgroundColor: theme.bg.primary, borderRadius: 20, overflow: 'hidden' }}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, textAlign: 'center' }}>{message}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 15, paddingBottom: 15 }}>
          <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: theme.bg.tr_1, borderRadius: 100, height: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>{cancelLabel}</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={{ flex: 1, backgroundColor: theme.bg.check, borderRadius: 100, height: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.text.onFill, fontSize: fS.modalTransfer }}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
