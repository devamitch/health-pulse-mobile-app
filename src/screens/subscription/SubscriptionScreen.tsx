import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterContainer,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import LinearGradient from '@/components/base/LinearGradient';

import { SubscriptionFeature } from '@/components/Subscription/SubscriptionFeature';
import { SubscriptionFooter } from '@/components/Subscription/SubscriptionFooter';
import { SubscriptionHeader } from '@/components/Subscription/SubscriptionHeader';
import { SubscriptionPlan } from '@/components/Subscription/SubscriptionPlan';
import {
  SUBSCRIPTION_SKUS,
  SUBSCRIPTIONS,
  SubscriptionSkuValue,
} from '@/constants/subscriptions';
import { fontScale } from '@/hooks/styles/responsive';
import { useSubscriptions } from '@/hooks/useSubscription';

const getSubscription = (id: string) => {
  return SUBSCRIPTIONS.find(item => item.id === id) ?? undefined;
};

const SubscriptionScreen = ({ navigation }: { navigation: any }) => {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const {
    availableSubscriptions,
    activeSubscription,
    isLoading,
    isPurchasing,
    error,
    purchase,
    restore,
  } = useSubscriptions();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionSkuValue>(
    SUBSCRIPTION_SKUS.FREE_TRIAL,
  );

  const handleSelect = useCallback((id: SubscriptionSkuValue) => {
    setSelectedPlan(id);
  }, []);

  const handleSubscribe = useCallback(async () => {
    const subscription = getSubscription(selectedPlan);
    if (subscription?.productId) {
      await purchase(subscription?.productId);
      // Optionally navigate after successful purchase
      // navigation.navigate('Terms');
    }
  }, [selectedPlan, purchase, navigation]);

  const handleRestore = useCallback(async () => {
    await restore();
  }, [restore]);

  const features = useMemo(() => {
    return getSubscription(selectedPlan)?.features || [];
  }, [selectedPlan]);

  const snapPoints = useMemo(
    () => [100 + insets.bottom, features.length * 62 + 100 + insets.bottom],
    [features.length, insets.bottom],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1857C1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={['#1857C1', '#5f9cd9ff', '#5596D8', '#5f9eddff']}
        angle={30}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <SubscriptionHeader
            titlePart1="Get the"
            titlePart2="Experience"
            highlightWord="Full"
            subtitle="Unlock all premium features and join our exclusive community"
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <FlatList
            data={features}
            keyExtractor={(item, index) => `feature-${index}`}
            renderItem={({ item }) => (
              <SubscriptionFeature
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            )}
            contentContainerStyle={styles.featuresContainer}
          />
        </SafeAreaView>
      </LinearGradient>

      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        detached={true}
        style={styles.sheetContainer}
        index={1}
        backgroundComponent={() => <View style={styles.sheetBackground} />}
        handleComponent={() => (
          <View style={styles.sheetHandle}>
            <View style={styles.sheetHandleIndicator} />
          </View>
        )}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
        >
          {SUBSCRIPTIONS?.filter(item => item.id !== selectedPlan)?.map(
            (item, index) => (
              <SubscriptionPlan
                key={index.toString()}
                {...item}
                onSelect={() => handleSelect(item.id as SubscriptionSkuValue)}
                isSelected={activeSubscription?.id === item.id}
                isPurchasing={
                  isPurchasing && activeSubscription?.id === item.id
                }
              />
            ),
          )}
        </BottomSheetScrollView>

        <BottomSheetFooterContainer
          footerComponent={props => (
            <BottomSheetFooter bottomInset={0} {...props}>
              <SubscriptionFooter
                onSubscribe={handleSubscribe}
                onRestore={handleRestore}
                selected={selectedPlan}
                isPurchasing={isPurchasing}
              />
            </BottomSheetFooter>
          )}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: fontScale(36),
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  sheetContainer: {
    borderTopLeftRadius: fontScale(34),
    borderTopRightRadius: fontScale(34),
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'black',
    shadowOffset: {
      height: -5,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  sheetBackground: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: fontScale(34),
    borderTopRightRadius: fontScale(34),
  },
  sheetHandle: {
    paddingTop: fontScale(12),
    paddingBottom: fontScale(6),
    alignItems: 'center',
  },
  sheetHandleIndicator: {
    width: fontScale(40),
    height: fontScale(4),
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: fontScale(2),
  },
  bottomSheetContent: {
    padding: fontScale(24),
    paddingBottom: fontScale(100),
    gap: 10,
  },
  featuresContainer: {
    gap: fontScale(8),
  },
});

export default SubscriptionScreen;
