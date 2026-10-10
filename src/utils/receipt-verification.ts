import { APP_CONFIG } from '@/config/app-config';
import { Platform } from 'react-native';

/**
 * Verifies a receipt with Apple's App Store or Google Play
 * @param receiptData The receipt data to verify
 * @param isProduction Whether to use production or sandbox environment
 * @returns The verification result
 */
export const verifyReceipt = async (
  receiptData: string,
  isProduction = true,
): Promise<any> => {
  try {
    if (Platform.OS === 'ios') {
      // iOS receipt verification
      const verifyUrl = isProduction
        ? 'https://buy.itunes.apple.com/verifyReceipt'
        : 'https://sandbox.itunes.apple.com/verifyReceipt';

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'receipt-data': receiptData,
          password: APP_CONFIG.APP_STORE.SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`Receipt verification failed: ${response.status}`);
      }

      const result = await response.json();

      // Check if we need to retry with sandbox
      if (isProduction && result.status === 21007) {
        // This receipt is from the sandbox environment, retry with sandbox URL
        return verifyReceipt(receiptData, false);
      }

      return result;
    } else if (Platform.OS === 'android') {
      // Android receipt verification would go here
      // This typically involves sending the purchase token to your backend
      // which then verifies it with Google Play Developer API
      console.warn('Android receipt verification not implemented');
      return { status: 0, environment: 'android' };
    }

    throw new Error(`Unsupported platform: ${Platform.OS}`);
  } catch (error) {
    console.error('Error verifying receipt:', error);
    throw error;
  }
};

/**
 * Calculates the expiry date based on subscription type and purchase date
 * @param productId The product ID
 * @param purchaseDate The purchase date
 * @param durationMonths Optional override for duration in months
 * @returns The expiry date as an ISO string
 */
export const calculateExpiryDate = (
  productId: string,
  purchaseDate: string,
  durationMonths?: number,
): string => {
  const date = new Date(purchaseDate);

  if (durationMonths) {
    date.setMonth(date.getMonth() + durationMonths);
  } else if (productId.includes('year')) {
    date.setFullYear(date.getFullYear() + 1);
  } else if (productId.includes('month')) {
    date.setMonth(date.getMonth() + 1);
  } else if (productId.includes('week')) {
    date.setDate(date.getDate() + 7);
  } else if (productId.includes('trial') || productId.includes('free')) {
    // Default trial period is 3 months if not specified
    date.setMonth(date.getMonth() + 3);
  } else {
    // Default to 1 month if we can't determine the period
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString();
};

/**
 * Formats a price for display
 * @param price The price value
 * @param currency The currency code
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};
