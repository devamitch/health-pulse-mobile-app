import VideoScreen from '@/components/video-player';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';

const MindfulScreen = (props: any) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const inset = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={styles.container}>
      <VideoScreen
        screen={'mindful_morning'}
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

const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
  });
};

export default MindfulScreen;
