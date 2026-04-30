import { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

export default function GoBackScroll({ page = 'home', children, navigate }) {
  const windowWidth = Dimensions.get('window').width;

  const scrollRef = useRef(null);

  const goBackOpacity = useSharedValue(1);

  const handleGoBackScroll = useAnimatedScrollHandler((e) => {
    const { x } = e.contentOffset;
    goBackOpacity.value = x / (windowWidth * 0.5);

    if (x < windowWidth * 0.25) {
      runOnJS(navigate)(page, 0);
      goBackOpacity.value = withTiming(0, {
        duration: 100,
      });
    }
  });
  return (
    <Animated.ScrollView ref={scrollRef} horizontal scrollEventThrottle={16} pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleGoBackScroll} contentOffset={{ x: windowWidth * 0.5 }} decelerationRate={'fast'}>
      <View style={{ width: windowWidth * 0.5 }} />
      <Animated.View style={{ opacity: goBackOpacity }}>{children}</Animated.View>
    </Animated.ScrollView>
  );
}
