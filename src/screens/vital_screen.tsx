import BloodDrop from '@/assets/svg/blood-drop.svg';
import LinearGradient from '@/components/base/LinearGradient';
import StatusMenu from '@/components/status/layout-list/status-menu';
import VitalModal from '@/components/VitalModal';
import { PriorityVital } from '@/services/mmkv-redux/slices';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
import { getVitalStatistics } from '../services/sqlite/queries';
import { haptic } from '../utils';
import { VitalIcon, VitalIconType } from '@/assets/svg/vitals-icon';
import Button from '@/components/ui/buttons/button';
import { addVitalToDB } from '@/services/sqlite/vitals';

const { width } = Dimensions.get('window');

const VitalScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  const [vitalData, setVitalData] = useState<any>();
  const scrollRef = useRef();
  const [lastIndex, setLastInset] = useState(-1);
  const { prioritizedVitals } = useAppSelector(state => state.message);

  const currentVital: PriorityVital =
    props.route.params.prioritizedVital ?? prioritizedVitals?.[0];

  const [isMetricModalVisible, setMetricModalVisible] = useState(false);
  const [vitalValues, setVitalValues] = useState<string[]>([]);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isAddRecordModalVisible, setAddRecordModalVisible] = useState(false);
  const [manualRecordValue, setManualRecordValue] = useState('');
  const closeMetricsModal = () => setMetricModalVisible(false);
  const closeAddRecordModal = () => {
    setAddRecordModalVisible(false);
    setManualRecordValue('');
  };

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);
  const { haptic_level } = useAppSelector(state => state.message);

  let vital = 'BP';
  if (props.route.params?.vital) {
    vital = props.route.params.vital;
  }

  const fetchDataFromDB = () => {
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
    getVitalStatistics(vital, timeframe, props.route.params?.date).then(
      data => {
        setVitalData(data);

        let _lastIndex = -1;
        for (let i = data?.graphResult.length - 1; i >= 0; i--) {
          const stacks = data?.graphResult[i].stacks;
          if (stacks.some((stack: { value: number }) => stack.value > 0)) {
            _lastIndex = i;
            break;
          }
        }
        setLastInset(_lastIndex - 5);
      },
    );
  };

  useEffect(fetchDataFromDB, []);

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

  const graphMarkPress = (item: any) => {
    try {
      const values: string[] = [];
      values.push(
        Math.floor(
          parseFloat(item.stacks[0].value + item.stacks[1].value),
        ).toString(),
      );
      if (currentVital.metrics.length > 1) {
        values.push(item.stacks[0].value.toString());
      }
      setVitalValues(values);
      setMetricModalVisible(true);
    } catch {
      console.error('error');
    }
  };

  const handleAddRecord = () => {
    haptic(haptic_level);
    setAddRecordModalVisible(true);
    setMenuVisible(false);
  };

  const submitManualRecord = () => {
    if (manualRecordValue.trim()) {
      addVitalToDB({
        vital_type: vital,
        value: manualRecordValue,
      }).then(fetchDataFromDB);
      Alert.alert(
        'Record Added',
        `Manual record added for ${vital}: ${manualRecordValue}`,
        [
          {
            text: 'OK',
            onPress: closeAddRecordModal,
          },
        ],
      );
    } else {
      Alert.alert('Error', 'Please enter a value');
    }
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
            angle={270}
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
              <Text style={styles.secondstyle}>{vital ? vital : ''}</Text>

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
            <Text style={styles.editstyle} numberOfLines={1}>
              For {formatDate(props.route.params?.date)}
            </Text>

            <View style={{ height: 15 }} />
            <View style={styles.vitalsContainer}>
              <View style={{ flexDirection: 'row' }}>
                <VitalIcon
                  vital={vital as VitalIconType}
                  height={50}
                  width={50}
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
            stackBorderRadius={20}
            renderTooltip={(item: any, index: number) => (
              <Text style={{ color: Colors.textColor, marginLeft: -16 }}>
                {`${item.stacks?.[0].value} - ${
                  item.stacks?.[0].value + item.stacks?.[1].value
                }`}
              </Text>
            )}
            onPress={graphMarkPress}
          />
        </View>
        <View style={{ height: 20 }} />
        {vitalData?.statusList?.map((element: any) => (
          <View style={[styles.contentContainer, styles.trendInfo]}>
            <BloodDrop />
            <Text style={styles.trendText}>{element?.description}</Text>
          </View>
        ))}
      </ScrollView>
      <VitalModal
        vital={currentVital}
        visible={isMetricModalVisible}
        values={vitalValues}
        onRequestClose={closeMetricsModal}
      />

      <StatusMenu
        insetTop={insets.top + 20}
        menuItems={menuItems}
        menuVisible={isMenuVisible}
        setMenuVisible={setMenuVisible}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddRecordModalVisible}
        onRequestClose={closeAddRecordModal}
      >
        <TouchableWithoutFeedback
          onPress={closeAddRecordModal}
          style={{ width: '100%', flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.container, { width: '85%' }]}>
              <View style={styles.modalTextViewTitleWrapper}>
                <Text style={styles.labeltext}>Add Manual Record</Text>
              </View>
              <View style={{ height: 15 }} />
              <Text
                style={[
                  styles.labeltext,
                  { fontSize: 14, fontFamily: 'Nunito-Medium' },
                ]}
              >
                {vital} Value:
              </Text>
              <View style={{ height: 10 }} />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: Colors.greyColor400,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: Colors.textColor,
                  width: '100%',
                }}
                placeholder={`Enter ${vital} value`}
                placeholderTextColor={Colors.greyColor600}
                keyboardType="numeric"
                value={manualRecordValue}
                onChangeText={setManualRecordValue}
                autoFocus
              />
              <View style={{ height: 20 }} />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 10,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Button
                    onPress={closeAddRecordModal}
                    text="Cancel"
                    variant="outline"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    onPress={submitManualRecord}
                    text="Add Record"
                    variant="contained"
                  />
                </View>
              </View>
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
      alignSelf: 'center',
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

export default VitalScreen;
