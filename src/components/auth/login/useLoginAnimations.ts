import {
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export const useLoginAnimations = () => {
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const socialOpacity = useSharedValue(0);

  const startAnimations = () => {
    // Header animation
    headerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Form animation
    formOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
    formTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }),
    );

    // Social section animation
    socialOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
  };

  return {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    socialOpacity,
    startAnimations,
  };
};
