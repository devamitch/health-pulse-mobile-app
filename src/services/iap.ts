import { IAP_CONFIG } from '@/constants/subscriptions';
// import * as RNIap from 'react-native-iap';

const skus = Object.values(IAP_CONFIG);

export const getAvailableSubscriptions = async () => {
  try {
    // const products = await RNIap.getSubscriptions(skus);
    // return products;
    return [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

export const purchaseSubscription = async (productId: string) => {
  try {
    // await RNIap.requestSubscription(productId);
  } catch (error) {
    console.error('Purchase error:', error);
    throw error;
  }
};

export const restorePurchases = async () => {
  try {
    // const purchases = await RNIap.getAvailablePurchases();
    // return purchases;
    return [];
  } catch (error) {
    console.error('Restore error:', error);
    return [];
  }
};

export const initializeIAP = async () => {
  try {
    // await RNIap.initConnection();
    // await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
    return true;
  } catch (error) {
    console.error('IAP initialization error:', error);
    return false;
  }
};

export const endIAPConnection = async () => {
  // await RNIap.endConnection();
};
