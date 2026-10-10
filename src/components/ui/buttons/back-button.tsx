import { useAppTheme } from '@/hooks/themeHook';
import BackIcon from '@/icons/BackIcon';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface BackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle> | undefined;
  iconColor?: string;
}

const BackButton = ({
  onPress,
  style,
  iconColor,
}: BackButtonProps) => {
  const { Colors } = useAppTheme();

  const buttonColor = iconColor ?? Colors.white;

  return (
    <SafeAreaView style={style}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, { backgroundColor: 'transparent'}]}
      >
        <BackIcon width={32} height={32} color={buttonColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
});

export default BackButton;
