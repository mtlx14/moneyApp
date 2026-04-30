import { View, Dimensions, Text, Pressable } from 'react-native';
import { useTheme } from '../theme/useTheme.js';

import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { fS } from '../theme/theme.js';
import { okChanges } from '../services.js';

export default function OkToChanges({ user, setShowChanges }) {
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();

  const otherUser = user.name === 'matias' ? 'Aylin' : 'Matías';

  return (
    <Animated.View entering={SlideInLeft} exiting={SlideOutLeft.duration(200)} style={{ position: 'absolute', bottom: windowWidth * 0.25, left: windowWidth * 0.05, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: 20 }}>
      <BlurView intensity={10} style={{ borderRadius: 20, overflow: 'hidden' }}>
        <View style={{ width: windowWidth * 0.9, height: windowWidth * 0.14, backgroundColor: theme.bg.green, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
          <Text style={{ color: theme.text._2, fontSize: fS.okButton, flex: 1, textAlign: 'center' }}>{`${otherUser} ha realizado cambios`}</Text>
          <Pressable onPress={() => (okChanges({ user: user }), setShowChanges([]))} style={{ height: '100%', width: windowWidth * 0.2, backgroundColor: theme.bg.tr_1, justifyContent: 'center', alignItems: 'center', borderRadius: 15 }}>
            <Text style={{ color: theme.text._1, fontSize: fS.okButton }}>Ok</Text>
          </Pressable>
        </View>
      </BlurView>
    </Animated.View>
  );
}
