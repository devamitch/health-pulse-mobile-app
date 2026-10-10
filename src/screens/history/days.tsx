import VitalModal from '@/components/VitalModal';
import VitalsGraph from '@/components/VitalsGraph';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HistoryGradientCard from '../../components/HistoryGradientCard';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '../../hooks/themeHook';
import { useAppSelector } from '../../services/mmkv-redux/hooks';
import {
  fetchActivitiesRecordByDate,
  fetchDietRecordByDate,
  fetchFeminineMessages,
  fetchMindfulMessages,
  fetchStatusRecords,
  fetchSupplementRecordByDate,
  fetchWindMessages,
} from '../../services/sqlite/message';
import { getPrioritizedVitalHistory } from '../../services/sqlite/queries';
import { routineStructurer } from '../../utils/routinePlanHandler';
import InfoModal from '@/components/modals/info-alert-modal';
import { StatusScreenIcon } from '@/assets/svg/status-screen-icon';
import { summarizeDayRoutines } from '@/utils/routine-summarizer';

const DaysTab = (props: any) => {
  const { prioritizedVitals } = useAppSelector(state => state.message);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any>([]);
  const [lastIndex1, setLastInset1] = useState(-1);
  const [lastIndex2, setLastInset2] = useState(-1);
  const [lastIndex3, setLastInset3] = useState(-1);

  const [page, setPage] = useState<number>(0); // Track the current page
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    image: 'https://picsum.photos/200/300/?blur',
    description: '',
  });

  const scrollRef1 = useRef<any>(null);
  const scrollRef2 = useRef<any>(null);
  const scrollRef3 = useRef<any>(null);
  const renderFooter = () => {
    return loading ? (
      <ActivityIndicator size="large" color={Colors.primaryColor} />
    ) : null;
  };

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const priorityVitalTags = prioritizedVitals?.map(vital => {
    return vital.metrics.length > 1 ? vital.title : vital.metrics[0]?.metric;
  });

  const [isMetricModalVisible, setMetricModalVisible] = useState(false);
  const [currentVital, setCurrentVital] = useState(prioritizedVitals?.[0]);
  const [vitalValues, setVitalValues] = useState<string[]>([]);
  const closeMetricsModal = () => setMetricModalVisible(false);

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, []),
  );

  const getData = () => {
    setPage(0);
    setHistoryData([]);
    setTimeout(() => getHistoryData(), 100);
  };

  const getHistoryData = async (): Promise<void> => {
    if (loading || !hasMore) return; // Prevent additional requests if already loading or no more data

    setLoading(true);
    const today = new Date();
    const newData: any = [];

    if (page * 3 >= 30) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (page * 3 + i)); // Offset by current page

      if (today.getTime() - date.getTime() > 30 * 24 * 60 * 60 * 1000) {
        setHasMore(false); // Stop if date is beyond the last 30 days
        break;
      }

      const status = [];
      const vitalData = await getPrioritizedVitalHistory(
        priorityVitalTags as string[],
        'daily',
        date,
      );
      const statusRecords = await fetchStatusRecords('day', date);

      const supplementMessages = await fetchSupplementRecordByDate(
        moment(date).format('YYYY-MM-DD'),
      );
      if (supplementMessages.length > 0) {
        status.push({
          description: 'Supplement Routine',
          createdAt: '',
          screen: 'SupplementScreen',
          summary: summarizeDayRoutines(routineStructurer(supplementMessages)),
        });
      }
      const mindfulMessages = await fetchMindfulMessages('day', date);
      if (mindfulMessages.length > 0) {
        status.push({
          description: 'Mindful Morning',
          createdAt: '',
          screen: 'MindfulScreen',
        });
      }
      const superfoodMessages = await fetchDietRecordByDate(
        moment(date).format('YYYY-MM-DD'),
      );
      if (superfoodMessages.length > 0) {
        status.push({
          description: 'Superfood',
          createdAt: '',
          screen: 'SuperfoodScreen',
          summary: summarizeDayRoutines(routineStructurer(superfoodMessages)),
        });
      }
      const windMessages = await fetchWindMessages('day', date);
      if (windMessages.length > 0) {
        status.push({
          description: 'Evening Wind Down',
          createdAt: '',
          screen: 'WindScreen',
        });
      }
      const gymMessages = await fetchActivitiesRecordByDate(
        moment(date).format('YYYY-MM-DD'),
      );
      if (gymMessages.length > 0) {
        status.push({
          description: 'Evening Gym',
          createdAt: '',
          screen: 'GymScreen',
          summary: summarizeDayRoutines(routineStructurer(gymMessages)),
        });
      }
      const feminineMessages = await fetchFeminineMessages('day', date);
      if (feminineMessages.length > 0) {
        status.push({
          description: 'Feminine',
          createdAt: '',
          screen: 'FeminineScreen',
        });
      }

      if (
        vitalData.length > 0 ||
        status.length > 0 ||
        statusRecords.length > 0 ||
        status.length > 0 ||
        statusRecords.length > 0
      ) {
        newData.push({
          date,
          vitalData,
          statusHistoryData: [...status, ...statusRecords],
        });
      }
    }

    if (newData.length > 0) {
      setHistoryData((prevData: any) => [...prevData, ...newData]); // Append new data
      // Update the last index for each vital type
      setLastInset1(
        newData
          .flatMap(
            (item: any) =>
              item.vitalData.filter((v: any) => v.vital_type === 'BP')[0]?.data
                ?.graphResult.length ?? 0,
          )
          .reduce((a: any, b: any) => a + b, 0) - 1,
      );
      setLastInset2(
        newData
          .flatMap(
            (item: any) =>
              item.vitalData.filter((v: any) => v.vital_type === 'HR')[0]?.data
                ?.graphResult.length ?? 0,
          )
          .reduce((a: any, b: any) => a + b, 0) - 1,
      );
      setLastInset3(
        newData
          .flatMap(
            (item: any) =>
              item.vitalData.filter((v: any) => v.vital_type === 'HRV')[0]?.data
                ?.graphResult.length ?? 0,
          )
          .reduce((a: any, b: any) => a + b, 0) - 1,
      );
    }

    setLoading(false);
    setPage(prevPage => prevPage + 1); // Increment page for next batch
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    if (isCloseToBottom(event.nativeEvent)) {
      getHistoryData();
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent): boolean => {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    );
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', // Full month name
      day: 'numeric', // Day of the month
    });
  };

  function safeParseFloat(value: any): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  const graphMarkPress = (item: any, index: 0 | 1 | 2) => {
    try {
      const values: string[] = [];
      setCurrentVital(prioritizedVitals?.[index]);
      values.push(
        Math.floor(
          parseFloat(item.stacks[0].value + item.stacks[1].value),
        ).toString(),
      );
      if (
        prioritizedVitals?.[index] &&
        prioritizedVitals[index].metrics.length > 1
      ) {
        values.push(item.stacks[0].value.toString());
      }
      setVitalValues(values);
      setMetricModalVisible(true);
    } catch {
      console.error('error');
    }
  };

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.mainContainer}
    >
      {historyData.map((data: any, data_index: number) => {
        return (
          <View
            style={{
              width: '100%',
              backgroundColor: Colors.white,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            {(data?.statusHistoryData?.length > 0 ||
              safeParseFloat(data?.vitalData?.[0]?.data?.average) !== 0 ||
              safeParseFloat(data?.vitalData?.[1]?.data?.average) !== 0 ||
              safeParseFloat(data?.vitalData?.[2]?.data?.average) !== 0) && (
              <>
                <View style={styles.trendTextStyle}>
                  <Text style={styles.textstyle}>{`${formatDate(
                    data?.date,
                  )}`}</Text>
                </View>
                <View style={{ height: 8 }} />
              </>
            )}
            {data?.vitalData.map((vital: any) => (
              <React.Fragment>
                {priorityVitalTags?.[0] &&
                  vital?.vital_type === priorityVitalTags[0] &&
                  safeParseFloat(vital?.data?.average) !== 0 && (
                    <React.Fragment>
                      {(props.checked === '0' || props.checked === '2') && (
                        <React.Fragment>
                          <VitalsGraph
                            vitalText={priorityVitalTags[0]}
                            scrollRef={scrollRef1}
                            index={lastIndex1}
                            vitalData={vital}
                            onArrowPress={() => {
                              props.navigation.navigate('VitalScreen', {
                                date: data?.date,
                                vital: priorityVitalTags[0],
                                prioritizedVital: prioritizedVitals?.[0],
                              });
                            }}
                            onGraphMarkPress={(item: any) => {
                              graphMarkPress(item, 0);
                            }}
                            unit={prioritizedVitals?.[0]?.metrics[0]?.unit}
                          />
                          <View style={{ height: 10 }} />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                {priorityVitalTags?.[1] &&
                  vital?.vital_type === priorityVitalTags[1] &&
                  safeParseFloat(vital?.data?.average) !== 0 && (
                    <React.Fragment>
                      {(props.checked === '0' || props.checked === '2') && (
                        <React.Fragment>
                          <VitalsGraph
                            vitalText={priorityVitalTags[1]}
                            scrollRef={scrollRef2}
                            index={lastIndex2}
                            vitalData={vital}
                            onArrowPress={() => {
                              props.navigation.navigate('VitalScreen', {
                                date: data?.date,
                                vital: priorityVitalTags[1],
                                prioritizedVital: prioritizedVitals?.[1],
                              });
                            }}
                            onGraphMarkPress={(item: any) => {
                              graphMarkPress(item, 1);
                            }}
                            unit={prioritizedVitals?.[1]?.metrics[1]?.unit}
                          />
                          <View style={{ height: 10 }} />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                {priorityVitalTags?.[2] &&
                  vital?.vital_type === priorityVitalTags[2] &&
                  safeParseFloat(vital?.data?.average) !== 0 && (
                    <React.Fragment>
                      {(props.checked === '0' || props.checked === '2') && (
                        <React.Fragment>
                          <VitalsGraph
                            vitalText={priorityVitalTags[2]}
                            scrollRef={scrollRef3}
                            index={lastIndex3}
                            vitalData={vital}
                            onArrowPress={() => {
                              props.navigation.navigate('VitalScreen', {
                                date: data?.date,
                                vital: priorityVitalTags[2],
                                prioritizedVital: prioritizedVitals?.[2],
                              });
                            }}
                            onGraphMarkPress={(item: any) => {
                              graphMarkPress(item, 2);
                            }}
                            unit={prioritizedVitals?.[2]?.metrics[2]?.unit}
                          />
                          <View style={{ height: 10 }} />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
              </React.Fragment>
            ))}

            {data?.statusHistoryData?.map((item: any, index: number) =>
              data_index === 0 &&
              (item.description === 'Supplement Routine' ||
                'Superfood' ||
                'Evening Gym') ? (
                <TouchableOpacity
                  onPress={() => {
                    if (item.screen) {
                      props.navigation.navigate(item.screen, {
                        date: data?.date,
                        timeframe: 'day',
                      });
                    } else {
                      setModalContent({
                        image: 'https://picsum.photos/200/300/?blur',
                        description: item?.description,
                      });
                      setModalVisible(true);
                    }
                  }}
                  style={{ width: '100%', paddingVertical: 10 }}
                >
                  <HistoryGradientCard
                    colors={
                      item.description === 'Supplement Routine'
                        ? ['#AC5B00', '#FEDD00']
                        : item.description === 'Superfood'
                        ? ['#76D176', '#3E7F3E']
                        : item.description === 'Evening Gym'
                        ? ['#76000B', '#DC0014']
                        : [Colors.gradientColor1, Colors.gradientColor2]
                    }
                    angle={
                      item.description === 'Supplement Routine'
                        ? 126.57
                        : item.description === 'Superfood'
                        ? 292.08
                        : item.description === 'Evening Gym'
                        ? 126.57
                        : 0
                    }
                    text={item.description}
                    textComponent={item.summary}
                    onCartPress={() => {
                      if (item.screen) {
                        props.navigation.navigate(item.screen, {
                          date: data?.date,
                          timeframe: 'day',
                        });
                      } else {
                        setModalContent({
                          image: 'https://picsum.photos/200/300/?blur',
                          description: item?.description,
                        });
                        setModalVisible(true);
                      }
                    }}
                    onLabelPress={() => {
                      if (item.screen) {
                        props.navigation.navigate(item.screen, {
                          date: data?.date,
                          timeframe: 'day',
                        });
                      } else {
                        setModalContent({
                          image: 'https://picsum.photos/200/300/?blur',
                          description: item?.description,
                        });
                        setModalVisible(true);
                      }
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (item.screen) {
                      props.navigation.navigate(item.screen, {
                        date: data?.date,
                        timeframe: 'day',
                      });
                    } else {
                      setModalContent({
                        image: 'https://picsum.photos/200/300/?blur',
                        description: item?.description,
                      });
                      setModalVisible(true);
                    }
                  }}
                  style={[
                    styles.historyContainer,
                    data?.statusHistoryData?.length - 1 === index && {
                      marginBottom: 16,
                    },
                  ]}
                >
                  <StatusScreenIcon
                    screen={item.screen}
                    height={48}
                    width={48}
                  />
                  <Text style={styles.historyText}>{item.description}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        );
      })}
      {renderFooter()}

      <InfoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        description={modalContent.description}
        Colors={Colors}
      />

      {currentVital ? (
        <VitalModal
          vital={currentVital}
          visible={isMetricModalVisible}
          values={vitalValues}
          onRequestClose={closeMetricsModal}
        />
      ) : null}
    </ScrollView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    infoContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-around',
      marginBottom: 15,
      marginTop: 10,
    },
    infoBox: {
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'center',
    },
    infoIcon: {
      height: 15,
      width: 15,
      tintColor: Colors.textColor,
    },
    arrowButton: {
      padding: 10,
      backgroundColor: Colors.white,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 10,
      ...DEffect,
    },
    arrowIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: Colors.textColor,
    },
    contentContainer: {
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      padding: 12,
      borderRadius: 20,
      marginBottom: 15,
      ...DEffect,
    },
    contentLabelWrapper: {
      marginLeft: 15,
      marginTop: 10,
      flexDirection: 'row',
      flex: 1,
    },
    contentIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
    },
    editstyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      marginHorizontal: 20,
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 19,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      flex: 1,
    },
    trendTextStyle: {
      marginHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    graphContainer: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      width: '90%',
      marginHorizontal: 20,
      ...DEffect,
    },
    lowsmalltextstyle: {
      color: Colors.textColor,
      fontSize: 10,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    lowtextstyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
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
      fontFamily: FONT_FAMILIES.nunitoMedium,
      margin: 4,
      letterSpacing: 0.7,
      flex: 1,
    },
    historyText: {
      color: Colors.textColor,
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      marginLeft: 15,
      textAlign: 'justify',
      letterSpacing: 0.7,
      margin: 4,
      flex: 1,
    },
    historyContainer: {
      height: 70,
      alignItems: 'center',
      backgroundColor: Colors.white,
      marginHorizontal: 16,
      marginTop: 4,
      marginBottom: 8,
      paddingVertical: 20,
      paddingHorizontal: 12,
      borderRadius: 28,
      flexDirection: 'row',
      borderWidth: Colors?.isDark ? 1 : 0,
      borderColor: Colors?.isDark ? Colors.greyColor : 'transparent',
      ...DEffect,
    },
    dateText: {
      fontSize: 14,
      color: Colors.textColor,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    sectionHeader: {
      marginHorizontal: 20,
      marginTop: 10,
    },
    headerText: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: Colors.textColor,
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
      fontFamily: FONT_FAMILIES.nunitoBold,
      letterSpacing: 0.7,
    },
    modalTextViewLabelWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
    },
  });
};

export default DaysTab;
