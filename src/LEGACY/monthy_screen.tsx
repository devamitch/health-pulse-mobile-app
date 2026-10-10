import BloodDrop from '@/assets/svg/blood-drop.svg';
import VitalModal from '@/components/VitalModal';
import VitalsGraph from '@/components/VitalsGraph';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Loader from '../constants/loader';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';
import { useAppSelector } from '../services/mmkv-redux/hooks';
import { getVitalHistory } from '../services/sqlite/queries';

const MonthyScreen = (props: any) => {
  const { prioritizedVitals } = useAppSelector(state => state.message);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any>([]);
  const currentDate = new Date().toLocaleDateString('en-US', {
    // year: 'numeric',
    month: 'long',
    // day: 'numeric',
  });
  const [lastIndex1, setLastInset1] = useState(-1);
  const [lastIndex2, setLastInset2] = useState(-1);
  const [lastIndex3, setLastInset3] = useState(-1);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const priorityVitalTags = prioritizedVitals?.map(vital => {
    return vital.metrics.length > 1 ? vital.title : vital?.metrics?.[0]?.metric;
  });

  const [isMetricModalVisible, setMetricModalVisible] = useState(false);
  const [currentVital, setCurrentVital] = useState(prioritizedVitals?.[0]);
  const [vitalValues, setVitalValues] = useState<string[]>([]);
  const closeMetricsModal = () => setMetricModalVisible(false);

  useEffect(() => {
    getHistoryData();
  }, []);

  const getHistoryData = async () => {
    setLoading(true);
    getVitalHistory('monthly')
      .then(data => {
        setHistoryData(data);
        data?.forEach((vital: any) => {
          if (vital?.vital_type === 'BP') {
            let _lastIndex = -1; // Initialize with -1 to indicate no such item found
            for (let i = vital?.data?.graphResult.length - 1; i >= 0; i--) {
              const stacks = vital?.data?.graphResult[i].stacks;
              if (stacks.some((stack: { value: number }) => stack.value > 0)) {
                _lastIndex = i;
                break; // Found the last item, exit the loop
              }
            }
            setLastInset1(_lastIndex - 5);
          } else if (vital?.vital_type === 'HR') {
            let _lastIndex = -1; // Initialize with -1 to indicate no such item found
            for (let i = vital?.data?.graphResult.length - 1; i >= 0; i--) {
              const stacks = vital?.data?.graphResult[i].stacks;
              if (stacks.some((stack: { value: number }) => stack.value > 0)) {
                _lastIndex = i;
                break; // Found the last item, exit the loop
              }
            }
            setLastInset2(_lastIndex - 5);
          } else if (vital?.vital_type === 'HRV') {
            let _lastIndex = -1; // Initialize with -1 to indicate no such item found
            for (let i = vital?.data?.graphResult.length - 1; i >= 0; i--) {
              const stacks = vital?.data?.graphResult[i].stacks;
              if (stacks.some((stack: { value: number }) => stack.value > 0)) {
                _lastIndex = i;
                break; // Found the last item, exit the loop
              }
            }
            setLastInset3(_lastIndex - 5);
          }
        });
        setLoading(false);
      })
      .catch(error => {
        console.log('Error', error);
        setLoading(false);
      });
  };

  const graphMarkPress = (item: any, index: 0 | 1 | 2) => {
    try {
      const values: string[] = [];
      setCurrentVital(prioritizedVitals?.[index]);
      values.push(
        Math.floor(
          parseFloat(item.stacks[0].value + item.stacks[1].value),
        ).toString(),
      );
      if (prioritizedVitals?.[index] && prioritizedVitals[index].metrics.length > 1) {
        values.push(item.stacks[0].value.toString());
      }
      setVitalValues(values);
      setMetricModalVisible(true);
    } catch {
      console.error('error');
    }
  };

  return (
    <ScrollView>
      <Loader loading={loading} />
      <View
        style={{
          width: '100%',
          backgroundColor: Colors.white,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <View style={styles.trendTextStyle}>
          <Text style={styles.textstyle}>{currentDate}</Text>
        </View>
        <View style={{ height: 15 }} />
        {historyData.map((vital: any, index: React.Key | null | undefined) => (
          <React.Fragment>
            {priorityVitalTags?.[0] && vital?.vital_type === priorityVitalTags[0] && (
              <React.Fragment>
                {(props.checked === '0' || props.checked === '2') && (
                  <React.Fragment>
                    <VitalsGraph
                      vitalText={priorityVitalTags[0]}
                      index={lastIndex1}
                      vitalData={vital}
                      unit={prioritizedVitals?.[0]?.metrics[0]?.unit}
                      onGraphMarkPress={(item: any) => {
                        graphMarkPress(item, 0);
                      }}
                    />
                    <View style={{ height: 10 }} />
                  </React.Fragment>
                )}
                {(props.checked === '1' || props.checked === '2') && (
                  <React.Fragment>
                    {vital?.data?.statusList?.map((element: any) => (
                      <View style={[styles.contentContainer, styles.trendInfo]}>
                        <BloodDrop />
                        <Text style={styles.trendText}>
                          {element.description}
                        </Text>
                      </View>
                    ))}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            {priorityVitalTags?.[1] && vital?.vital_type === priorityVitalTags[1] && (
              <React.Fragment>
                {(props.checked === '0' || props.checked === '2') && (
                  <React.Fragment>
                    <VitalsGraph
                      vitalText={priorityVitalTags[1]}
                      index={lastIndex2}
                      vitalData={vital}
                      unit={prioritizedVitals?.[1]?.metrics[1]?.unit}
                      onGraphMarkPress={(item: any) => {
                        graphMarkPress(item, 1);
                      }}
                    />
                    <View style={{ height: 10 }} />
                  </React.Fragment>
                )}
                {(props.checked === '1' || props.checked === '2') && (
                  <React.Fragment>
                    {vital?.data?.statusList?.map((element: any) => (
                      <View style={[styles.contentContainer, styles.trendInfo]}>
                        <BloodDrop />
                        <Text style={styles.trendText}>
                          {element.description}
                        </Text>
                      </View>
                    ))}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            {priorityVitalTags?.[2] && vital?.vital_type === priorityVitalTags[2] && (
              <React.Fragment>
                {(props.checked === '0' || props.checked === '2') && (
                  <React.Fragment>
                    <VitalsGraph
                      vitalText={priorityVitalTags[2]}
                      index={lastIndex3}
                      vitalData={vital}
                      unit={prioritizedVitals?.[2]?.metrics[2]?.unit}
                      onGraphMarkPress={(item: any) => {
                        graphMarkPress(item, 2);
                      }}
                    />
                    <View style={{ height: 10 }} />
                  </React.Fragment>
                )}
                {(props.checked === '1' || props.checked === '2') && (
                  <React.Fragment>
                    {vital?.data?.statusList?.map((element: any) => (
                      <View style={[styles.contentContainer, styles.trendInfo]}>
                        <BloodDrop />
                        <Text style={styles.trendText}>
                          {element.description}
                        </Text>
                      </View>
                    ))}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        ))}
      </View>
      {currentVital && <VitalModal
        vital={currentVital}
        visible={isMetricModalVisible}
        values={vitalValues}
        onRequestClose={closeMetricsModal}
      />}
    </ScrollView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
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
    },
    arrowButton: {
      padding: 10,
      backgroundColor: 'white',
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    arrowIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: 'black',
    },
    contentContainer: {
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      padding: 12,
      borderRadius: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
      fontFamily: 'Nunito',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      marginHorizontal: 20,
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 19,
      fontFamily: 'Nunito-Bold',
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
      backgroundColor: 'white',
      flexDirection: 'column',
      alignItems: 'center',
      width: '90%',
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
  });
};

export default MonthyScreen;
