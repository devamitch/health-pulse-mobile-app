import VideoScreen from '@/components/video-player';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';

const WindScreen = (props: any) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const inset = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoScreen
        screen={'evening_winddown'}
        insetTop={inset.top}
        onBackPress={() => {
          if (props.navigation.canGoBack()) {
            props.navigation.goBack();
          } else {
            props.navigation.navigate('NavigationTab');
          }
        }}
        navigation={props.navigation}
      />
    </GestureHandlerRootView>
  );
};

export const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
  });
};

export default WindScreen;
