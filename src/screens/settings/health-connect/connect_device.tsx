import { StyleSheet, Text, TouchableOpacity, View, Image, Platform, ListRenderItem, ImageRequireSource, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/constants/typography';
// import { Provider } from 'react-native-spike-sdk';
// import useHealthConnect from '@/hooks/use-health-connect';
import { Toast } from '@/utils/toast';
import BackButton from '@/components/ui/buttons/back-button';
import { useAppTheme } from '@/hooks/themeHook';

// type Devices = {
//   name: string;
//   provider: Provider,
//   icon: ImageRequireSource,
//   onPress?: () => void,
// }

// const otherDevices = [
//   {
//     name: 'Coros',
//     icon: require('@/assets/images/fitness-logos/fit2.png'),
//     provider: Provider.coros,
//   },
//   { 
//     name: 'Fitbit', 
//     icon: require('@/assets/images/fitness-logos/fit4.png'), 
//     provider: Provider.fitbit,
//   },
//   { 
//     name: 'Freestyle Libre', 
//     icon: require('@/assets/images/fitness-logos/fit5.jpeg'), 
//     provider: Provider.freestyleLibre,
//   },
//   { 
//     name: 'Garmin', 
//     icon: require('@/assets/images/fitness-logos/fit6.png'), 
//     provider: Provider.garmin,
//   },
//   {
//     name: "Huawei",
//     icon: require('@/assets/images/fitness-logos/fit8.png'),
//     provider: Provider.huawei,
//   },
//   { 
//     name: 'Oura', 
//     icon: require('@/assets/images/fitness-logos/fit9.jpg'),
//     provider: Provider.oura,
//   },
//   {
//     name: 'Polar',
//     icon: require('@/assets/images/fitness-logos/fit10.png'),
//     provider: Provider.polar,
//   },
//   {
//     name: 'Strava',
//     icon: require('@/assets/images/fitness-logos/fit12.png'),
//     provider: Provider.strava,
//   },
//   {
//     name: 'Suunto',
//     icon: require('@/assets/images/fitness-logos/fit13.png'),
//     provider: Provider.suunto,
//   },
//   {
//     name: 'Ultrahuman',
//     icon: require('@/assets/images/fitness-logos/fit14.jpeg'),
//     provider: Provider.ultrahuman,
//   },
//   {
//     name: 'Whoop',
//     icon: require('@/assets/images/fitness-logos/fit15.png'),
//     provider: Provider.whoop,
//   },
//   {
//     name: 'Withings',
//     icon: require('@/assets/images/fitness-logos/fit16.png'),
//     provider: Provider.withings,
//   },
// ];

// const DeviceCards = () => {
//   const {
//     requestPermission,
//     connectProvider,
//   } = useHealthConnect();

//   const appleHealthKit = {
//     name: 'Apple Health',
//     provider: Provider.apple,
//     icon: require('@/assets/images/fitness-logos/fit1.png'),
//     onPress: requestPermission,
//   };

//   const googleHealthConnect = {
//     name: "Google's health",
//     provider: Provider.healthConnect,
//     icon: require('@/assets/images/fitness-logos/fit7.png'),
//     onPress: requestPermission,
//   };

//   const devices = [
//     Platform.OS === 'android' ? googleHealthConnect : appleHealthKit,
//     ...otherDevices,
//   ];

//   const { Colors } = useAppTheme();

//   const renderItem: ListRenderItem<Devices> = ({
//     item
//   }) => {
//     return(
//         <View key={item.name} style={[styles.card, { backgroundColor: Colors.surface, shadowColor: Colors.shadow }]}>
//           <View style={styles.deviceInfoNew}>
//             <View style={[styles.iconCircleNew, { backgroundColor: Colors.greyColor100 }]}>
//               <Image source={item.icon} style={{ width: 32, height: 32 }} />
//             </View>
//             <Text style={[styles.deviceNameNew, { color: Colors.textPrimaryColor }]}>{item.name}</Text>
//           </View>
//           <TouchableOpacity 
//             style={[styles.connectBtnNew, { backgroundColor: Colors.primaryColor, shadowColor: Colors.primaryDark }]}
//             onPress={async () => {
//             if(item.onPress !== undefined)
//               item.onPress();
//             else{
//               try {
//                 await connectProvider(item.provider)
//               } catch (error) {
//                 Toast('Something went wrong. Please try again.');
//               }
//             }
//           }}>
//             <Text style={[styles.connectBtnTextNew, { color: Colors.white }]}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//     );
//   }

//   return (
//     <View 
//       style={{ marginBottom: 150 }}
//     >
//       <FlatList
//         data={devices}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

const ConnectDevice = () => {
  const navigation = useNavigation();
  const { Colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundColor }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerText, { color: Colors.textPrimaryColor }]}>Connect your Device</Text>
        {/* <TouchableOpacity onPress={() => {}}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity> */}
      </View>
      {/* <DeviceCards /> */}
    </View>
  );
};

export default ConnectDevice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.urbanistRegular,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfoNew: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleNew: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceNameNew: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.urbanistRegular,
    fontWeight: FONT_WEIGHTS.bold,
  },
  connectBtnNew: {
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  connectBtnTextNew: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.urbanistRegular,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
  },
  deviceButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  deviceButton: {
    borderWidth: 1,
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  deviceIcon: {
    height: 40,
    width: 40,
  },
});
