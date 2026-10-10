import {
  SubscriptionPlan as ISubscriptionPlan,
  SubscriptionSkuValue,
} from '@/constants/subscriptions';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

type SubscriptionPlanProps = ISubscriptionPlan & {
  isPopular?: boolean;
  isSelected?: boolean;
  isPurchasing?: boolean;
  onSelect?: (id: SubscriptionSkuValue) => void;
};

export const SubscriptionPlan = ({
  id,
  title,
  price,
  period,
  isPopular = false,
  isSelected = false,
  onSelect,
}: SubscriptionPlanProps) => (
  <RectButton
    style={[styles.container, isSelected && styles.containerSelected]}
    onPress={() => onSelect?.(id)}
  >
    <View style={styles.leftSection}>
      <FontAwesome6
        name={isSelected ? 'circle-check' : 'circle'}
        size={20}
        color={isSelected ? '#1857C1' : '#ccc'}
      />
    </View>

    <View style={styles.middleSection}>
      <Text style={styles.title}>
        {price}/{period}
      </Text>
      <Text style={styles.period}>{period}ly</Text>
    </View>

    <View style={styles.rightSection}>
      <Text style={styles.popularText}>Save 23%</Text>
    </View>
  </RectButton>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  containerSelected: {
    borderColor: '#1857C1',
    backgroundColor: '#f5f9ff',
  },
  leftSection: {
    marginRight: 12,
  },
  middleSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'center',
    backgroundColor: '#1857C1',
    top: 0,
    right: 0,
    position: 'absolute',
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1857C1',
  },
  period: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  popularText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
});
