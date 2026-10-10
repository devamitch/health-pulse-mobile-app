import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Purchase, requestSubscription, useIAP } from 'react-native-iap';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';

interface SubscriptionModalProps {
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
  const items = ['AuraCore_premium'];
  // const {
  //   connected,
  //   subscriptions,
  //   purchaseHistory,
  //   finishTransaction,
  //   getSubscriptions,
  //   getPurchaseHistory,
  // } = useIAP();

  const [loading, setLoading] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  useEffect(() => {
    handleGetSubscriptions();
  }, []);

  const handleGetSubscriptions = async () => {
    setLoading(true);
    try {
      // await getSubscriptions({ skus: items });
      // await getPurchaseHistory();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (purchaseHistory) {
  //     checkActivePlan();
  //   }
  // }, [purchaseHistory]);

  const checkActivePlan = () => {
    // const purchasedProductIds = purchaseHistory.map(
    //   purchase => purchase.productId,
    // );
    // if (purchasedProductIds.includes(items[0])) {
    //   setActivePlan('AuraCore Premium');
    // } else {
    //   setActivePlan('AuraCore Free');
    // }
  };

  const handlePurchase = async (sku: string) => {
    setLoading(true);
    try {
      // await requestSubscription({ sku });
    } catch (e) {
      console.log('error ', e);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (connected === false) {
  //     Toast('Please check your internet connection.');
  //   }
  // }, [connected]);

  // useEffect(() => {
  //   const checkCurrentPurchase = async (purchase?: Purchase): Promise<void> => {
  //     if (purchase) {
  //       const receipt = purchase.transactionReceipt;
  //       if (receipt) {
  //         try {
  //           const ackResult = await finishTransaction({
  //             purchase: purchase,
  //             isConsumable: false,
  //           });
  //           console.log('ackResult', ackResult);
  //           await getPurchaseHistory();
  //         } catch (ackErr) {
  //           console.warn('ackErr', ackErr);
  //         }
  //       }
  //     }
  //   };
  //   checkCurrentPurchase(purchaseHistory?.[0]);
  // }, [purchaseHistory, finishTransaction]);

  // const purchasedProductIds =
  //   purchaseHistory?.map(purchase => purchase.productId) || [];

  const confirmAndRestorePurchases = () => {
    // Alert.alert(
    //   'Restore Purchases',
    //   'Are you sure you want to restore your purchases?',
    //   [
    //     {
    //       text: 'Cancel',
    //       style: 'cancel',
    //     },
    //     {
    //       text: 'Yes',
    //       onPress: restorePurchases,
    //     },
    //   ],
    //   { cancelable: true },
    // );
  };

  // const restorePurchases = async () => {
  //   try {
  //     setLoading(true);
  //     // const restoredPurchases: any = await getPurchaseHistory();

  //     if (restoredPurchases?.length > 0) {
  //       console.log('Purchases restored successfully:', restoredPurchases);
  //       Toast('Purchases restored successfully');
  //     } else {
  //       console.log('No purchases to restore');
  //       Toast('No purchases to restore');
  //     }
  //   } catch (error: any) {
  //     console.log('Restore error:', error);
  //     Toast(error?.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  return (
    <View style={styles.container}>
      {activePlan ? (
        <View style={styles.activePlanWrapper}>
          <Text style={styles.activePlanText}>
            Your Current Plan: {activePlan}
          </Text>
        </View>
      ) : null}

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>
          40% off for the first year
          {/* <Text style={{ fontFamily: 'Nunito-Bold' }}>it’s free.</Text> */}
        </Text>
      </View>
      <Text style={styles.heading}>Unlock AuraCore</Text>
      <View style={styles.bulletPoints}>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <Image
            source={require('../assets/icons/check.png')}
            style={styles.checkIcon}
            resizeMode="contain"
          />
          <Text style={styles.bullet}>
            Achieve any habit you want – Increase your energy levels...
          </Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <Image
            source={require('../assets/icons/check.png')}
            style={styles.checkIcon}
            resizeMode="contain"
          />
          <Text style={styles.bullet}>
            Get unstuck – Follow a complete, step-by-step plan...
          </Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <Image
            source={require('../assets/icons/check.png')}
            style={styles.checkIcon}
            resizeMode="contain"
          />
          <Text style={styles.bullet}>
            Finally own a positive mindset – How far will you go...
          </Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <Image
            source={require('../assets/icons/check.png')}
            style={styles.checkIcon}
            resizeMode="contain"
          />
          <Text style={styles.bullet}>
            Make success inevitable – It’s as easy as designing...
          </Text>
        </View>
      </View>
      {/* {!purchasedProductIds.includes(items[0]) && (
        <TouchableOpacity
          onPress={() => handlePurchase(items[0])}
          style={styles.button}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
        </TouchableOpacity>
      )} */}
      <TouchableOpacity
        onPress={confirmAndRestorePurchases}
        style={styles.restoreButton}
      >
        <Text style={styles.restoreButtonText}>Restore Purchase</Text>
      </TouchableOpacity>
      {/* <Text style={styles.note}>One week free, then {subscriptions[0]?.localizedPrice ?? '24.99$'} CAD/year</Text> */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: Colors.white,
      borderRadius: 20,
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 10,
      ...DEffect,
    },
    titleWrapper: {
      backgroundColor: '#2d6aff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 50,
      marginBottom: 12,
    },
    title: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
    },
    heading: {
      color: Colors.textColor,
      fontSize: 24,
      fontFamily: 'Nunito-Bold',
      marginBottom: 16,
    },
    bulletPoints: {
      marginBottom: 20,
    },
    bullet: {
      flex: 1,
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
    },
    button: {
      backgroundColor: Colors.secondaryColor,
      paddingVertical: 12,
      paddingHorizontal: 50,
      borderRadius: 25,
      marginBottom: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    note: {
      color: Colors.textColor,
      fontSize: 12,
      fontFamily: 'Nunito-SemiBold',
    },
    activePlanWrapper: {
      paddingBottom: 10,
      borderRadius: 10,
      marginBottom: 10,
    },
    activePlanText: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
    },
    checkIcon: {
      height: 16,
      width: 16,
      marginTop: 2,
      marginRight: 8,
    },
    closeButton: {
      backgroundColor: Colors.greyColor,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 20,
    },
    closeButtonText: {
      color: Colors.textColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    restoreButton: {
      // backgroundColor: Colors.secondaryColor,
      // paddingVertical: 10,
      // paddingHorizontal: 20,
      // borderRadius: 25,
      marginTop: 10,
    },
    restoreButtonText: {
      color: Colors.secondaryColor,
      fontSize: 16,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
  });
};

export default SubscriptionModal;
