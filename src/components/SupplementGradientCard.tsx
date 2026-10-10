import LinearGradient from '@/components/base/LinearGradient';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SupplementGradientCardProps {
  colors: (string | number)[];
  text: string;
  descriptionText?: string;
  angle?: number;
  textColor?: string;
  style?: ViewStyle;
  component?: React.ReactNode;
  openIconFunction?: () => void;
  leftIconFunciton?: () => void;
}

const SupplementGradientCard: React.FC<SupplementGradientCardProps> = ({
  colors,
  text,
  angle = 105.57,
  textColor = 'white',
  style,
  descriptionText = '',
  openIconFunction,
  leftIconFunciton,
  component,
}) => {
  return (
    <LinearGradient
      useAngle={true}
      angle={angle}
      colors={colors}
      style={[styles.container, style]}
    >
      <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image
              source={require('@/assets/images/stars.png')}
              style={styles.star}
            />

            <Text style={[styles.titleText, { color: textColor }]}>{text}</Text>
          </View>
          <TouchableOpacity onPress={openIconFunction} style={styles.buttons}>
            <Ionicons name="cart" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[styles.descriptionText, { color: textColor }]}>
          {descriptionText}
        </Text>
        <View style={styles.circleContainer}>
          <View style={styles.circle1} />

          <View style={styles.circle2} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 35,
    paddingTop: 15,
  },

  buttons: {
    height: 40,
    width: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 5,
  },
  star: {
    left: 20,
    position: 'absolute',
    height: 20,
    width: 20,
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitleText: {
    paddingLeft: 20,
    fontFamily: 'Nunito-Sans',
    fontSize: 16,
    paddingBottom: 10,
  },
  descriptionText: {
    paddingLeft: 20,
    fontFamily: 'Nunito-Sans',
    fontSize: 14,
    width: '50%',
  },
  circleContainer: {
    top: -20,
    right: -60,
    position: 'relative',
    height: 180,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  circle1: {
    position: 'absolute',
    height: 180,
    width: 180,
    borderRadius: 90,
    borderWidth: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  circle2: {
    position: 'absolute',
    height: 112,
    width: 112,
    borderRadius: 56,
    borderWidth: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  component: {
    height: 125,
    width: 125,
    marginTop: 'auto',
  },
});

export default SupplementGradientCard;
