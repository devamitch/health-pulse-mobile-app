import OrbitingIcons from '@/components/OrbitingIcons';
import BackButton from '@/components/ui/buttons/back-button';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const HealthPulseConnect = () => {
  const navigation = useNavigation();
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>health-connect</Text>
        <TouchableOpacity onPress={() => {}}>
          <MaterialIcons
            name="info-outline"
            size={24}
            color={Colors.textColor}
          />
        </TouchableOpacity>
      </View>
      <View style={{ height: '30%' }} />
      <OrbitingIcons />
      {/* <ComingSoon width={150} height={150} style={{ alignSelf: 'center' }} /> */}
      <View style={{ height: '10%' }} />
      <Text style={styles.description}>
        health-connect works with over 90 smart health devices, from wearables to
        trackers, so all your wellness data lives in one smart hub for you.
        {/* We’re building this feature right now. It’ll be arriving in the next
        update - stay tuned! */}
      </Text>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ConnectDevice' as never);
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: 'NavigationTab' as never }],
          // });
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Supported Devices
          {/* Back to Home */}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HealthPulseConnect;

const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      top: 40,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    headerText: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      textAlign: 'center',
      color: Colors.textColor,
    },
    description: {
      fontSize: 18,
      color: Colors.textColor,
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 30,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      marginBottom: 10,
    },
    button: {
      marginTop: 30,
      alignSelf: 'center',
      backgroundColor: Colors.primaryColor,
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 25,
    },
    buttonText: {
      color: Colors.white,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
  });
