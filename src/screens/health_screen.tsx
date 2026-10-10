import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { VitalIcon, VitalIconType } from '@/assets/svg/vitals-icon';
import { logButtonTap } from '../services/analyticsService';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';

interface HealthScreenProps {
  title: string;
  icon: VitalIconType;
  screen: string;
  params?: Record<string, string>;
}

const healthMetrics: HealthScreenProps[] = [
  {
    title: 'Blood Pressure',
    icon: 'BP',
    screen: 'BPScreen',
  },
  {
    title: 'Heart Rate',
    icon: 'HR',
    screen: 'HRScreen',
  },
  {
    title: 'Heart Rate Variability',
    icon: 'HRV',
    screen: 'HRVScreen',
  },
  // {
  //   title: 'Sleep',
  //   icon: 'sleep' as VitalIconType,
  //   screen: 'VitalScreen',
  //   params: { vital: 'Sleep' },
  // },
  {
    title: 'Sleep Efficiency',
    icon: 'Efficiency',
    screen: 'VitalScreen',
    params: { vital: 'Sleep Efficiency' },
  },
  {
    title: 'Calories',
    icon: 'Calories',
    screen: 'VitalScreen',
    params: { vital: 'Calories' },
  },
  {
    title: 'Body Temperature',
    icon: 'Body Temperature',
    screen: 'VitalScreen',
    params: { vital: 'Body Temperature' },
  },
  {
    title: 'BMI',
    icon: 'BMI',
    screen: 'VitalScreen',
    params: { vital: 'BMI' },
  },
  {
    title: 'Weight',
    icon: 'Weight',
    screen: 'VitalScreen',
    params: { vital: 'Weight' },
  },
  {
    title: 'Walking Activity',
    icon: 'Walking',
    screen: 'VitalScreen',
    params: { vital: 'Walking' },
  },
  {
    title: 'Distance Walking',
    icon: 'Distance Walking',
    screen: 'VitalScreen',
    params: { vital: 'Distance Walking' },
  },
  {
    title: 'VO2 Max',
    icon: 'VO2 Max',
    screen: 'VitalScreen',
    params: { vital: 'VO2 Max' },
  },
  {
    title: 'Sleep Duration',
    icon: 'Sleep Duration',
    screen: 'VitalScreen',
    params: { vital: 'Sleep Duration' },
  },
  {
    title: 'Sleep Interruptions',
    icon: 'Sleep Interruptions',
    screen: 'VitalScreen',
    params: { vital: 'Sleep Interruptions' },
  },
  {
    title: 'Active Time',
    icon: 'Active',
    screen: 'VitalScreen',
    params: { vital: 'Active' },
  },
];

const HealthScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { Colors, DEffect } = useAppTheme();

  const navigateToVital = (metric: HealthScreenProps) => {
    props.navigation.navigate(metric.screen, metric.params);
  };

  const styles = createStyle(Colors, DEffect);

  return (
    <View style={styles.mainContainer}>
      <View style={{ height: 200 + insets.top }}>
        <LinearGradient
          colors={['#1c256b', '#2c3bbb']}
          style={[styles.linearGradient, { height: 120 + insets.top }]}
        />
        <View style={[styles.header, { marginTop: 10 + insets.top }]}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Ionicons name="chevron-back" size={26} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.secondstyle}>Health Metrics</Text>
            <View style={{ width: 26 }} />
          </View>
          <Text style={styles.editstyle}>Track your vital signs</Text>
          <View style={{ height: 15 }} />
        </View>
      </View>
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.labelStyle}>Your Metrics</Text>
        <View style={{ height: 20 }} />
        {healthMetrics.map((metric, index) => (
          <TouchableOpacity
            key={index}
            style={styles.metricCard}
            onPress={() => {
              logButtonTap(`View ${metric.title}`);
              navigateToVital(metric);
            }}
          >
            <View style={styles.metricContainer}>
              <VitalIcon vital={metric.icon} height={50} width={50} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <Text style={styles.metricDescription}>
                  Tap to view detailed graphs and trends
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors.greyColor500}
              />
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    linearGradient: {
      height: 230,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    header: {
      width: '90%',
      marginTop: 20,
      position: 'absolute',
      alignSelf: 'center',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    secondstyle: {
      color: 'white',
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'center',
      letterSpacing: 0.7,
    },
    editstyle: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito',
      alignSelf: 'center',
      letterSpacing: 0.7,
    },
    labelStyle: {
      color: Colors.textColor,
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      paddingBottom: 15,
    },
    metricCard: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      marginBottom: 15,
      ...DEffect,
    },
    metricContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    metricTitle: {
      color: Colors.textColor,
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
      letterSpacing: 0.7,
    },
    metricDescription: {
      color: Colors.greyColor600,
      fontSize: 14,
      fontFamily: 'Nunito-Medium',
      marginTop: 4,
      letterSpacing: 0.7,
    },
  });

export default HealthScreen;
