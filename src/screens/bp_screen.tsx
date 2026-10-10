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
import { haptic } from '../utils';
import Button from '@/components/ui/buttons/button';

const { width } = Dimensions.get('window');

const BPScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  const [vitalData, setVitalData] = useState<any>();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const scrollRef = useRef();
  const [lastIndex, setLastInset] = useState(-1);

  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [isBPMetricsModalVisible, setBPMetricsModalVisible] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isVitalModalVisible, setVitalModalVisible] = useState(false);
  const [priorityVital, setPriorityVital] = useState<PriorityVital | null>(
    null,
  );
  const [metrics, setMetrics] = useState<Record<string, string>>({});

  const closeBPMetricsModal = () => {
    setBPMetricsModalVisible(false);
  };

  const handleAddRecord = () => {
    haptic(haptic_level);
    setPriorityVital({
      title: 'BP',
      metrics: [
        { metric: 'Systolic', unit: 'mmHg' },
        { metric: 'Diastolic', unit: 'mmHg' },
      ],
    });
    setMetrics({});
    setVitalModalVisible(true);
    setMenuVisible(false);
  };

  const saveVitals = () => {
    const systolic = metrics['Systolic'];
    const diastolic = metrics['Diastolic'];

    if (systolic && diastolic) {
      const bpValue = `${systolic}/${diastolic}`;

      addVitalToDB({
        vital_type: 'BP',
        value: bpValue,
        unit: 'mmHg',
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
        getVitalStatistics('BP', timeframe, props.route.params?.date).then(
          setVitalData,
        );
      });
    }

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

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);
  const { haptic_level } = useAppSelector(state => state.message);

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
    getVitalStatistics('BP', timeframe, props.route.params?.date).then(data => {
      // const dateTime = new Date(data?.latestDate);
      // const formattedTime = dateTime.toLocaleTimeString('en-US', {
      //     hour: 'numeric',
      //     minute: '2-digit',
      //     hour12: true,
      // });
      // data.latestDate = formattedTime;
      setVitalData(data);

      let _lastIndex = -1; // Initialize with -1 to indicate no such item found
      for (let i = data?.graphResult.length - 1; i >= 0; i--) {
        const stacks = data?.graphResult[i].stacks;
        if (stacks.some((stack: { value: number }) => stack.value > 0)) {
          _lastIndex = i;
          break; // Found the last item, exit the loop
        }
      }
      setLastInset(_lastIndex - 5);
    });
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
              <Text style={styles.secondstyle}>Blood Pressure</Text>
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
                <Image
                  source={require('./../assets/icons/bp.png')}
                  style={styles.imageStyle}
                />
                <Text style={styles.textstyle}>{vitalData?.latestValue}</Text>
                <View style={{ flex: 1 }} />
                <View style={styles.lastCheckWrapper}>
                  <Text style={styles.lastTextStyle}>Last checked</Text>
                  <Text style={styles.timeTextStyle}>
                    {vitalData?.latestDate}
                  </Text>
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
                    <Text style={styles.lowsmalltextstyle}> LOW :</Text>
                  </View>
                  <Text style={styles.lowtextstyle}>
                    {vitalData?.low === Infinity ? `${0}/${0}` : vitalData?.low}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoBox}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      source={require('./../assets/icons/trending_flat.png')}
                      style={styles.infoIcon}
                    ></Image>
                    <Text style={styles.lowsmalltextstyle}> AVG :</Text>
                  </View>
                  <Text style={styles.lowtextstyle}>{vitalData?.average}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoBox}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      source={require('./../assets/icons/trending_up.png')}
                      style={styles.infoIcon}
                    ></Image>
                    <Text style={styles.lowsmalltextstyle}> HIGH :</Text>
                  </View>
                  <Text style={styles.lowtextstyle}>
                    {vitalData?.high === -Infinity
                      ? `${0}/${0}`
                      : vitalData?.high}
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
            // scrollToEnd
            width={width / 1.6}
            //rotateLabel
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
            // noOfVerticalLines={6}
            verticalLinesColor={Colors.greyColor700}
            verticalLinesThickness={0.3}
            showVerticalLines
            stackData={vitalData?.graphResult ?? stackData}
            backgroundColor={Colors.backgroundColor}
            stackBorderRadius={20}
            renderTooltip={(item: any, index: number) => (
              <Text style={{ color: Colors.textColor, marginLeft: -16 }}>
                {`${item.stacks?.[0].value} - ${
                  item.stacks?.[0].value + item.stacks?.[1].value
                }`}
              </Text>
            )}
            onPress={(item: any) => {
              console.log(item);
              haptic(haptic_level);
              try {
                setSys(
                  Math.floor(
                    parseFloat(item.stacks[0].value + item.stacks[1].value),
                  ).toString(),
                );
                setDia(Math.floor(parseFloat(item.stacks[0].value)).toString());
                setBPMetricsModalVisible(true);
              } catch {
                console.error('error');
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isBPMetricsModalVisible}
        onRequestClose={closeBPMetricsModal}
      >
        <TouchableWithoutFeedback
          onPress={closeBPMetricsModal}
          style={{ width: '100%' }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.container, { width: '80%' }]}>
              <View style={styles.modalTextViewTitleWrapper}>
                <Text style={styles.labeltext}>Blood Pressure</Text>
              </View>
              <View style={{ height: 10 }} />
              <View>
                <View style={styles.modalTextViewLabelWrapper}>
                  <Text style={styles.labeltext}>SYS : {sys}</Text>
                </View>
                <View style={{ height: 10 }} />
                <View style={styles.modalTextViewLabelWrapper}>
                  <Text style={styles.labeltext}>DIA : {dia}</Text>
                </View>
              </View>
              <View style={{ height: 10 }} />
              <Button
                onPress={() => {
                  haptic(haptic_level);
                  closeBPMetricsModal();
                }}
                text="Close"
                variant="contained"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
      height: 230,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    header: {
      // marginHorizontal: 18,
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
      //height: 60,
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      padding: 12,
      borderRadius: 20,
      marginBottom: 20,
      ...DEffect,
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
      fontSize: 10,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    timeTextStyle: {
      color: Colors.greyColor600,
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
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

export default BPScreen;
