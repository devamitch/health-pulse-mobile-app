import { LOTTIE_NOTE } from '@/assets';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

const LoadingAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={LOTTIE_NOTE}
        autoPlay
        loop
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  image: {
    position: 'absolute',
    height: 250,
    width: 250,
    left: '18%',
    top: '25%',
  },
});

export default LoadingAnimation;
