import Stars from '@/icons/stars';
import LinearGradient from '@/components/base/LinearGradient';
import { FONT_FAMILIES } from '@/constants/typography';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface PlanGradientCardProps {
  colors: (string | number)[];
  text: string;
  angle?: number;
  textColor?: string;
  style?: ViewStyle;
  textComponent?: string;
  imageComponent?: React.ReactNode;
  starSize?: number;
  starColor?: string;
  onCartPress?: () => void;
  onLabelPress?: () => void;
}

const PlanGradientCard: React.FC<PlanGradientCardProps> = ({
  colors,
  text,
  angle = 0,
  textColor = 'white',
  style,
  onCartPress,
  imageComponent,
  textComponent,
  onLabelPress,
  starSize = 20,
  starColor,
}) => {
  const defaultText =
    'Your plan details will appear here. Tap the cart icon to generate a plan.';
  const displayText =
    textComponent && textComponent.trim().length > 0
      ? textComponent
      : defaultText;

  return (
    <LinearGradient
      useAngle={true}
      angle={angle}
      colors={colors}
      style={[styles.container, style]}
    >
      <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={onLabelPress} style={styles.titleContainer}>
          <Stars width={20} height={20} />
          <Text style={[styles.titleText, { color: textColor }]}>{text}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCartPress} style={styles.buttons}>
          <Stars width={starSize} height={starSize} />
        </TouchableOpacity>
      </View>
      <View
        style={{ flexDirection: 'row', paddingLeft: 30, position: 'relative' }}
      >
        <Text style={[styles.descriptionText, { color: textColor }]}>
          {displayText}
        </Text>
        <View
          style={{
            bottom: 0,
            flexDirection: 'row',
            position: 'absolute',
            right: -125,
          }}
        >
          <View
            style={[
              styles.circle,
              { height: 125, width: 125, borderTopLeftRadius: 125, right: 0 },
            ]}
          >
            <View
              style={[
                styles.circle,
                { height: 75, width: 75, borderTopLeftRadius: 75 },
              ]}
            />
          </View>
          <View style={styles.component}>{imageComponent}</View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitleText: {
    paddingLeft: 30,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    fontSize: 16,
    paddingBottom: 10,
  },
  descriptionText: {
    fontFamily: FONT_FAMILIES.nunitoRegular,
    fontSize: 16,
    paddingBottom: 20,
    minHeight: 150,
    zIndex: 1,
    width: '75%',
  },
  circle: {
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 30,
    borderLeftWidth: 30,
    marginLeft: 'auto',
    marginTop: 'auto',
  },
  component: {
    height: 125,
    width: 125,
    right: 120,
  },
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    gap: 8,
    flexDirection: 'row',
    minWidth: '50%',
  },
  star: {
    height: 20,
    width: 20,
    marginHorizontal: 10,
  },
});

export default PlanGradientCard;
