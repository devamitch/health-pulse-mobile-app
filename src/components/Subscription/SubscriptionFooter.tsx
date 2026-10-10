import { SUBSCRIPTIONS, SubscriptionSkuValue } from '@/constants/subscriptions';
import { FONT_FAMILIES } from '@/constants/typography';
import { fontScale } from '@/hooks/styles/responsive';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from '../base/LinearGradient';

interface SubscriptionFooterProps {
  onSubscribe: () => void;
  onRestore: () => Promise<void>;
  selected: SubscriptionSkuValue;
  isPurchasing?: boolean;
}

export const SubscriptionFooter = ({
  onSubscribe,
  selected,
}: SubscriptionFooterProps) => {
  const currentPlan = SUBSCRIPTIONS?.find(item => item?.id === selected);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ marginBottom: fontScale(12) }}
        onPress={onSubscribe}
      >
        <LinearGradient
          colors={['#1857C1', '#3181d0ff']}
          style={[
            { flex: 1, alignItems: 'center', justifyContent: 'center' },
            styles.subscribeButton,
          ]}
        >
          <Text style={styles.subscribeButtonText}>
            Start With {currentPlan?.title} {currentPlan?.price}{' '}
            {`${currentPlan?.period}ly`}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: fontScale(24),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subscribeButton: {
    backgroundColor: '#1857C1',
    padding: fontScale(16),
    borderRadius: fontScale(12),
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  restoreButton: {
    padding: fontScale(12),
    alignItems: 'center',
    marginBottom: fontScale(16),
  },
  restoreButtonText: {
    color: '#1857C1',
    fontSize: fontScale(14),
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  disclaimer: {
    fontSize: fontScale(10),
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#777',
    textAlign: 'center',
    marginBottom: fontScale(12),
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: fontScale(12),
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#1857C1',
  },
  linkSeparator: {
    marginHorizontal: fontScale(8),
    color: '#999',
  },
});
