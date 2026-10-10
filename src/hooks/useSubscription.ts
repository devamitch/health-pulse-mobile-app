import { IAP_CONFIG, SUBSCRIPTIONS } from '@/constants/subscriptions';
import {
  endIAPConnection,
  getAvailableSubscriptions,
  initializeIAP,
  purchaseSubscription,
  restorePurchases,
} from '@/services/iap';
import { RootState } from '@/services/mmkv-redux';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  loadSubscriptionsFailure,
  loadSubscriptionsStart,
  loadSubscriptionsSuccess,
  purchaseFailure,
  purchaseStart,
  purchaseSuccess,
  restoreFailure,
  restoreStart,
  restoreSuccess,
} from '@/services/mmkv-redux/slices/subscription-slice';
import { useEffect } from 'react';

export const useSubscriptions = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state.subscription);

  // Initialize IAP on mount
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await initializeIAP();
        if (initialized) {
          await loadSubscriptions();
          // No need to manually check storage - Redux Persist handles this
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();

    return () => {
      endIAPConnection();
    };
  }, []);

  const loadSubscriptions = async () => {
    try {
      dispatch(loadSubscriptionsStart());

      // Get real products from app stores
      const products = await getAvailableSubscriptions();

      // Map store products to our subscription plans
      const availableSubscriptions = SUBSCRIPTIONS.map(sub => {
        const product = products.find(p => p.productId === IAP_CONFIG[sub.id]);
        return product
          ? {
              ...sub,
              price: product.localizedPrice,
              currency: product.currency,
              productId: product.productId,
            }
          : sub;
      });

      dispatch(loadSubscriptionsSuccess(availableSubscriptions));
    } catch (error) {
      dispatch(loadSubscriptionsFailure(error.message));
    }
  };

  const purchase = async (productId: string) => {
    try {
      dispatch(purchaseStart());
      await purchaseSubscription(productId);

      // Find the subscription that was purchased
      const subscription = state.availableSubscriptions.find(
        sub => sub.productId === productId,
      );

      if (subscription) {
        dispatch(purchaseSuccess(subscription));
      }
    } catch (error) {
      dispatch(purchaseFailure(error.message));
    }
  };

  const restore = async () => {
    try {
      dispatch(restoreStart());
      const purchases = await restorePurchases();

      if (purchases.length > 0) {
        // Find the highest level subscription
        const latestPurchase = purchases.reduce((prev, current) =>
          current.transactionDate > prev.transactionDate ? current : prev,
        );

        const subscription = state.availableSubscriptions.find(
          sub => sub.productId === latestPurchase.productId,
        );

        if (subscription) {
          dispatch(restoreSuccess(subscription));
          return;
        }
      }

      dispatch(restoreSuccess(null));
    } catch (error) {
      dispatch(restoreFailure(error?.message));
    }
  };

  return {
    ...state,
    loadSubscriptions,
    purchase,
    restore,
  };
};
