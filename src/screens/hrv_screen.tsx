import BloodDrop from '@/assets/svg/blood-drop.svg';
import LinearGradient from '@/components/base/LinearGradient';
import PriorityVitalsModal from '@/components/home/priority-vital-modal';
import StatusMenu from '@/components/status/layout-list/status-menu';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../constants/loader';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';
import { useAppSelector } from '../services/mmkv-redux/hooks';
import { PriorityVital } from '../services/mmkv-redux/slices';
import { addVitalToDB } from '../services/sqlite/vitals';
import { getVitalStatistics } from '../services/sqlite/queries';
import { getPrioritizedVitalData } from '../services/sqlite/queries';
import { haptic } from '../utils';
import { VitalIcon } from '@/assets/svg/vitals-icon';
import Button from '@/components/ui/buttons/button';

const { width } = Dimensions.get('window');

const HRVScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { haptic_level } = useAppSelector(state => state.message);
  const [loading, setLoading] = useState<boolean>(false);
  const [vitalData, setVitalData] = useState<any>();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const scrollRef = useRef();
  const [lastIndex, setLastInset] = useState(-1);

  const [hrv, setHRV] = useState('');
  const [isHRVMetricsModalVisible, setHRVMetricsModalVisible] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isVitalModalVisible, setVitalModalVisible] = useState(false);
  const [priorityVital, setPriorityVital] = useState<PriorityVital | null>(
    null,
  );
  const [metrics, setMetrics] = useState<Record<string, string>>({});

  const closeHRVMetricsModal = () => {
    setHRVMetricsModalVisible(false);
  };

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  useEffect(() => {
    let timeframe;
    if (props.route.params?.type === 'weekly') {
      timeframe = 'weekly';
    } else if (props.route.params?.type === 'monthly') {
      timeframe = 'monthly';
    } else if (props.route.params?.type === 'yearly') {
      timeframe = 'yearly';
    } else {
      timeframe = 'daily';
    }
    getVitalStatistics('HRV', timeframe, props.route.params?.date).then(
      data => {
        setVitalData(data);
        console.log(data.graphResult[0].stacks[0], 'RAJ');

        let _lastIndex = -1; // Initialize with -1 to indicate no such item found
        for (let i = data?.graphResult.length - 1; i >= 0; i--) {
          const stacks = data?.graphResult[i].stacks;
          if (stacks.some((stack: { value: number }) => stack.value > 0)) {
            _lastIndex = i;
            break; // Found the last item, exit the loop
          }
        }
        setLastInset(_lastIndex - 5);
      },
    );
    // getDataByVital()
  }, []);

  const stackData = [
    {
      stacks: [
        { value: 0, color: 'transparent' },
        { value: 0, color: Colors.secondaryColor },
      ],
      label: '12AM',
    },
    {
      stacks: [
        { value: 0, color: 'transparent' },
        { value: 0, color: Colors.secondaryColor },
      ],
      label: '1AM',
    },
    {
      stacks: [
        { value: 0, color: 'transparent' },
        { value: 0, color: Colors.secondaryColor },
      ],
      label: '2AM',
    },
    {
      stacks: [
        { value: 0, color: 'transparent' },
        { value: 0, color: Colors.secondaryColor },
      ],
      label: '3AM',
    },
    {
      stacks: [
        { value: 0, color: 'transparent' },
        { value: 0, color: Colors.secondaryColor },
      ],
      label: '4AM',
    },
    {
      stacks: [
        { value: 0, color: 'transparent' },
        { value: 0, color: Colors.secondaryColor },
      ],
      label: '5AM',
    },
  ];

  const formatDate = (date?: Date): string => {
    if (date === undefined) {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return currentDate;
    } else if (props.route.params?.type === 'weekly') {
      const current = new Date(date);
      const currentDay = current.getDay();
      const weekStartDate = new Date(
        current.setDate(current.getDate() - currentDay),
      );
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      return `${weekStartDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} - ${weekEndDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`;
    } else if (props.route.params?.type === 'monthly') {
      return date.toLocaleDateString('en-US', {
        month: 'long',
      });
    } else if (props.route.params?.type === 'yearly') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const handleAddRecord = () => {
    haptic(haptic_level);
    setPriorityVital({
      title: 'HRV',
      metrics: [{ metric: 'Heart Rate Variability', unit: 'MS' }],
    });
    setMetrics({});
    setVitalModalVisible(true);
    setMenuVisible(false);
  };

  const saveVitals = () => {
    const vital_type = priorityVital?.title || 'HRV';
    const value = Object.values(metrics)[0] as string;

    addVitalToDB({
      vital_type,
      value,
      unit: priorityVital?.metrics[0]?.unit,
    }).then(() => {
      // Refresh the vital data after adding record
      let timeframe;
      if (props.route.params?.type === 'weekly') {
        timeframe = 'weekly';
      } else if (props.route.params?.type === 'monthly') {
        timeframe = 'monthly';
      } else if (props.route.params?.type === 'yearly') {
        timeframe = 'yearly';
      } else {
        timeframe = 'daily';
      }
      getVitalStatistics('HRV', timeframe, props.route.params?.date).then(
        setVitalData,
      );
    });

    setVitalModalVisible(false);
    setMetrics({});
  };

  const menuItems = [
    {
      title: 'Add Record',
      icon: 'add-circle-outline',
      onPress: handleAddRecord,
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <Loader loading={loading} />
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      <ScrollView>
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
                {Platform.OS === 'ios' ? (
                  <Ionicons
                    name="chevron-back"
                    size={26}
                    color={Colors.white}
                  />
                ) : (
                  <Image
                    source={require('./../assets/icons/back.png')}
                    style={styles.icon}
                  ></Image>
                )}
              </TouchableOpacity>
              <Text style={styles.secondstyle}>Heart Rate Variability</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={{
                  height: 30,
                  width: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={require('./../assets/icons/more.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            <View style={{ height: 15 }} />
            <Text style={styles.editstyle} numberOfLines={1}>
              For {formatDate(props.route.params?.date)}
            </Text>
            <View style={{ height: 15 }} />
            <View style={styles.vitalsContainer}>
              <View style={{ flexDirection: 'row' }}>
                <VitalIcon vital={'HRV'} height={50} width={50} />
                <Text style={styles.textstyle}>{vitalData?.latestValue}</Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#8A9197',
                    width: 40,
                    alignSelf: 'center',
                  }}
                >
                  MS
                </Text>
                <View style={{ flex: 1 }} />
                <View style={styles.lastCheckWrapper}>
                  <Text style={styles.lastTextStyle}>
                    {vitalData?.latestDate}
                  </Text>
                  <Text style={styles.timeTextStyle}>LIVE •</Text>
                </View>
              </View>
              <View style={{ height: 15 }} />
              <View style={styles.infoContainer}>
                <View style={styles.infoBox}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      source={require('./../assets/icons/trending_down.png')}
                      style={styles.infoIcon}
                    ></Image>
                    <Text style={styles.lowsmalltextstyle}> MIN :</Text>
                  </View>
                  <Text style={styles.lowtextstyle}>
                    {vitalData?.low === Infinity ? 0 : vitalData?.low} MS
                  </Text>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.infoBox}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      source={require('./../assets/icons/trending_flat.png')}
                      style={styles.infoIcon}
                    ></Image>
                    <Text style={styles.lowsmalltextstyle}> AVG :</Text>
                  </View>
                  <Text style={styles.lowtextstyle}>
                    {parseFloat(vitalData?.average).toFixed(2)} MS
                  </Text>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.infoBox}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      source={require('./../assets/icons/trending_up.png')}
                      style={styles.infoIcon}
                    ></Image>
                    <Text style={styles.lowsmalltextstyle}> MAX :</Text>
                  </View>
                  <Text style={styles.lowtextstyle}>
                    {vitalData?.high === -Infinity ? 0 : vitalData?.hi} MS
                  </Text>
                </View>
              </View>
              <View style={{ height: 10 }} />
            </View>
          </View>
        </View>
        <View style={{ height: 80 }} />
        <View style={styles.graphContainer}>
          <BarChart
            scrollRef={scrollRef}
            scrollToIndex={lastIndex}
            width={width / 1.6}
            barWidth={15}
            spacing={20}
            noOfSections={5}
            barBorderRadius={6}
            frontColor={Colors.greyColor700}
            yAxisTextStyle={{
              color: Colors.greyColor700,
              fontSize: 10,
            }}
            xAxisLabelTextStyle={{
              color: Colors.greyColor700,
              fontSize: 10,
              width: width,
            }}
            dashWidth={5}
            verticalLinesColor={Colors.greyColor700}
            verticalLinesThickness={0.3}
            showVerticalLines
            stackData={vitalData?.graphResult ?? stackData}
            backgroundColor={Colors.white}
            renderTooltip={(item: any, index: number) => (
              <Text style={{ color: Colors.textColor }}>
                {`${item.stacks?.[0].value + item.stacks?.[1].value}`}
              </Text>
            )}
            onPress={(item: any) => {
              haptic(haptic_level);
              try {
                setHRV(
                  Math.floor(
                    parseFloat(item.stacks[0].value + item.stacks[1].value),
                  ).toString(),
                );
                setHRVMetricsModalVisible(true);
              } catch (error) {
                console.log(error);
              }
            }}
          />
        </View>
        <View style={{ height: 20 }} />
        {vitalData?.statusList?.map((element: any) => (
          <View style={[styles.contentContainer, styles.trendInfo]}>
            {/* <Image source={require('./../assets/icons/document.png')} style={styles.trendImage}></Image> */}
            <BloodDrop />
            <Text style={styles.trendText}>{element?.description}</Text>
          </View>
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isHRVMetricsModalVisible}
        onRequestClose={closeHRVMetricsModal}
      >
        <TouchableWithoutFeedback
          onPress={closeHRVMetricsModal}
          style={{ width: '100%' }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.container, { width: '80%' }]}>
              <View style={styles.modalTextViewTitleWrapper}>
                <Text style={styles.labeltext}>Heart Rate Variablity</Text>
              </View>
              <View style={{ height: 10 }} />
              <View>
                <View style={styles.modalTextViewLabelWrapper}>
                  <Text style={styles.labeltext}>HRV : {hrv}</Text>
                </View>
              </View>
              <View style={{ height: 10 }} />
              <Button
                onPress={() => {
                  haptic(haptic_level);
                  closeHRVMetricsModal();
                }}
                text="Close"
                variant="contained"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        ","{' '}
      </Modal>

      <StatusMenu
        insetTop={insets.top + 20}
        menuItems={menuItems}
        menuVisible={isMenuVisible}
        setMenuVisible={setMenuVisible}
      />

      <PriorityVitalsModal
        visible={isVitalModalVisible}
        onClose={() => setVitalModalVisible(false)}
        priorityVital={priorityVital}
        metrics={metrics}
        setMetrics={setMetrics}
        saveVitals={saveVitals}
      />
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    linearGradient: {
      height: 190,
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
    icon: {
      height: 30,
      width: 30,
    },
    lastCheckWrapper: {
      flexDirection: 'column',
      alignSelf: 'center',
    },
    infoContainer: {
      height: 60,
      width: '100%',
      flexDirection: 'row',
      borderColor: Colors.greyColor400,
      borderWidth: 1,
      borderRadius: 20,
      justifyContent: 'space-around',
    },
    infoBox: {
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'center',
    },
    divider: {
      height: 59,
      width: 1,
      backgroundColor: Colors.greyColor400,
    },
    infoIcon: {
      height: 15,
      width: 15,
      tintColor: Colors.textColor,
    },
    contentContainer: {
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      padding: 12,
      borderRadius: 20,
      marginBottom: 20,
      ...DEffect,
    },
    contentContainerTextStyle: {
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: 'Nunito-Medium',
      alignSelf: 'center',
      marginLeft: 10,
      textAlign: 'justify',
      letterSpacing: 0.7,
      marginRight: 5,
      flex: 1,
    },
    vitalsContainer: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 15,
      ...DEffect,
    },
    graphContainer: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 15,
      marginHorizontal: 20,
      ...DEffect,
    },
    imageStyle: {
      height: 50,
      width: 50,
      resizeMode: 'contain',
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 36,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    secondstyle: {
      color: 'white',
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    editstyle: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    lowsmalltextstyle: {
      color: Colors.textColor,
      fontSize: 10,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    lowtextstyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    lastTextStyle: {
      color: Colors.greyColor600,
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    timeTextStyle: {
      color: Colors.greenColor,
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      backgroundColor: Colors.lightGreenColor,
      padding: 2,
      borderRadius: 3,
    },
    trendInfo: {
      flexDirection: 'row',
      paddingLeft: 10,
    },
    trendImage: {
      height: 20,
      width: 20,
      marginTop: 7,
      resizeMode: 'contain',
    },
    trendText: {
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: 'Nunito-Medium',
      margin: 4,
      letterSpacing: 0.7,
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 15,
      ...DEffect,
    },
    modalTextViewTitleWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labeltext: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      letterSpacing: 0.7,
    },
    modalTextViewLabelWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
    },
  });
};

export default HRVScreen;
