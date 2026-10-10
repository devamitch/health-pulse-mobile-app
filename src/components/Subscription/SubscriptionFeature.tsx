import BlurView from '@/components/base/BlurView';
import { FONT_FAMILIES } from '@/constants/typography';
import { fontScale } from '@/hooks/styles/responsive';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SubscriptionFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const SubscriptionFeature = ({
  icon,
  title,
  description,
}: SubscriptionFeatureProps) => (
  <BlurView style={styles.container}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="white" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </BlurView>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: fontScale(16),
    padding: fontScale(5),
    paddingHorizontal: fontScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 74, 142, 0.2)',
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: fontScale(40),
    height: fontScale(40),
    borderRadius: fontScale(20),
    backgroundColor: 'rgba(7, 74, 142, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: fontScale(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontScale(16),
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#f1f1f1',
    marginBottom: 2,
  },
  description: {
    fontSize: fontScale(11),
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#212224ff',
  },
});
