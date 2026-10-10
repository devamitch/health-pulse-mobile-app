import Supplement from '@/assets/svg/supplement.svg';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import ProductScanner from '@/components/status/product-scanner';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomCheckbox from '../../components/CustomCheckBox';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { claudeCheckItemHelper } from '../../services/api/claude_client';
import { Routine } from '../../services/mmkv-redux/slices';
import {
  fetchSupplementRecordByDate,
  fetchSupplementRecordWithDateRange,
  updateSupplementsRecord,
} from '../../services/sqlite/message';
import {
  addStatusRecord,
  initializeNotificationsTable,
} from '../../services/sqlite/vitals';
import { haptic } from '../../utils';
import { saveSupplementRoutine } from '../../utils/routinePlanHandler';
import { useStatusSupplementsChat } from '@/hooks/chat/useStatusSupplementsChat';
import { StatusList } from '@/components/status/layout-list/animated-list';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import ConfettiCannon from 'react-native-confetti-cannon';

const SupplementScreen = (props: any) => {
  const timeframe = props.route?.params?.timeframe ?? 'day';
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const {
    loading,
    userInput,
    setUserInput,
    supplementsMessages,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
    setLoading,
  } = useStatusSupplementsChat({ timeframe, date });

  const [list, setList] = useState<{ item: string; checked: boolean }[]>([]);
  const [routineList, setRoutineList] = useState<Routine[]>([]);
  const [routineListDateRange, setRoutineListDateRange] = useState<
    { date: string; routine: Routine[] }[]
  >([]);

  const routine = props.route?.params?.topic ?? '';

  const routineStructurer = (routine_data: any) => {
    try {
      const routine: Routine[] = [];
      routine_data.map((item: any) => {
        const value: Routine = {
          id: item.id,
          date: item.date,
          routine_items: JSON.parse(item.routine_list),
          routine: item.routine,
          time: item.time,
          notification_message: item.notification_message,
          notification_days: item.notification_days,
        };
        routine.push(value);
      });
      return routine;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const transformRecords = (data: any[]) => {
    return data.reduce((acc, item) => {
      const routineItems = JSON.parse(item.routine_list);

      let existingDate = acc.find(
        (entry: { date: any }) => entry.date === item.date,
      );

      if (!existingDate) {
        existingDate = {
          date: item.date,
          routine: [],
        };
        acc.push(existingDate);
      }

      const value: Routine = {
        routine: item.routine,
        routine_items: routineItems,
        time: item.time,
        notification_message: item.notification_message,
        notification_days: item.notification_days,
      };

      existingDate.routine.push(value);

      return acc;
    }, []);
  };

  const fetchListRoutine = async () => {
    const date = moment().format('YYYY-MM-DD');
    const list = await fetchSupplementRecordByDate(date, routine);
    if (list.length !== 0) {
      setList(JSON.parse(list[0].routine_list));
    }
  };

  const fetchListDaily = async () => {
    const date = moment(props.route?.params?.date).format('YYYY-MM-DD');
    const list = await fetchSupplementRecordByDate(date);
    setRoutineList(routineStructurer(list));
  };

  const fetchListDateRange = async (start_date: string) => {
    const end_date = moment().format('YYYY-MM-DD');
    const list = (await fetchSupplementRecordWithDateRange(
      start_date,
      end_date,
    )) as any[];
    setRoutineListDateRange(transformRecords(list));
  };

  useEffect(() => {
    fetchListRoutine();
    if (props.route?.params?.timeframe === 'day') {
      fetchListDaily();
    } else if (props.route?.params?.timeframe === 'week') {
      const date = moment(props.route?.params?.date).format('YYYY-MM-DD');
      fetchListDateRange(date);
    } else if (props.route?.params?.timeframe === 'month') {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      fetchListDateRange(moment(date).format('YYYY-MM-DD'));
    }
  }, []);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  useEffect(() => {
    const initializeDatabase = async () => {
      await initializeNotificationsTable();
    };
    initializeDatabase();
  }, []);

  const handleNotification = async () => {
    props.navigation.navigate('Notifications');
  };

  const handleBulletChange = (index: number) => {
    const updatedList = [...list];
    const date = moment().format('YYYY-MM-DD');
    if (updatedList[index]) {
      if (!updatedList[index].checked) {
        setIsConfettiVisible(true);
      }
      updatedList[index] = {
        item: updatedList[index].item,
        checked: !updatedList[index].checked,
      };
    }
    setList(updatedList);
    updateSupplementsRecord(date, routine, JSON.stringify(updatedList));
  };

  const addItem = (item: string) => {
    const date = moment().format('YYYY-MM-DD');
    const updatedList = [...list, { item: item, checked: true }];
    setList(updatedList);
    updateSupplementsRecord(date, routine, JSON.stringify(updatedList));
  };

  const updateItemList = async ({
    base64,
    imageType,
  }: {
    base64: string;
    imageType: 'image/png' | 'image/jpeg' | 'image/webp';
    path: string;
  }) => {
    try {
      setLoading(true);
      const items = list.map(({ item }) => item);
      console.log(items);
      const response = await claudeCheckItemHelper(
        base64,
        imageType,
        items,
        'supplement',
      );
      console.log(response.item);
      if (response.success) {
        if (response.present) {
          const index = items.indexOf(response.item);
          if (index >= 0) 
            if(!(list[index]?.checked))handleBulletChange(index);
        } else {
          addItem(response.item);
        }
      }
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedList, setSelectedList] = useState<any>([]);
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const handleLongPress = (message: string) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const pinToStatus = (message: string) => {
    // dispatch(pinMessageToStatus(message));
    addStatusRecord(message, 0, 'popup', '');
    setModalVisible(false);
  };

  const savePlan = async (selectedList: Routine[]) => {
    haptic(haptic_level);
    const date = moment().format('YYYY-MM-DD');
    const res = await saveSupplementRoutine(selectedList, date);
    // for (const item of res){
    //   await createWeeklyNotification(item)
    // }
    setEditModalVisible(false);
  };

  const renderFooter = () => {
    return (
      <View>
        {/* Food intake tracking section */}
        <View style={[styles.card, { padding: 12 }]}>
          {list.map((item, index) => (
            <CustomCheckbox
              key={index}
              label={item.item}
              onChange={() => handleBulletChange(index)}
              checked={item.checked}
            />
          ))}

          {/* Daily routines */}
          {routineList.map((element, elementIndex) => (
            <View
              key={elementIndex}
              style={[styles.card, { padding: 12, marginVertical: 7 }]}
            >
              <Text style={styles.headerText}>{element.routine}</Text>
              {element.routine_items.map((item, itemIndex) => (
                <CustomCheckbox
                  key={itemIndex}
                  label={item.item}
                  checked={item.checked}
                />
              ))}
            </View>
          ))}

          {/* Date range routines */}
          {routineListDateRange.map((ele, dateIndex) => (
            <View key={dateIndex} style={[styles.card]}>
              <Text style={styles.headerText}>
                {new Date(ele.date).toDateString()}
              </Text>
              {ele.routine.map((element, routineIndex) => (
                <View
                  key={routineIndex}
                  style={[styles.card, { padding: 12, marginVertical: 7 }]}
                >
                  <Text style={styles.headerText}>{element.routine}</Text>
                  {element.routine_items.map((item, itemIndex) => (
                    <CustomCheckbox
                      key={itemIndex}
                      label={item.item}
                      checked={item.checked}
                    />
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* QR Code scanning section */}
        {!props.route?.params?.timeframe ? (
          <View style={[styles.card, styles.qrCode]}>
            <ProductScanner
              onCapture={updateItemList}
              setLoading={setLoading}
            />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <StatusList
        ImageComponent={Supplement}
        angle={126.57}
        gradientColors={['#AC5B00', '#FEDD00']}
        title="Today's supplement"
        subtitle="Let's get started!"
        description="The first step is always the hardest, but today marks the start of something great."
        loading={loading}
        handleClearChat={handleClearChat}
        handleNotification={handleNotification}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        messages={[...supplementsMessages]}
        animatedText={animatedText}
        onLongPress={handleLongPress}
        // onAddPlan={savePlan}
        onEditPlan={data => {
          setSelectedList(data);
          setEditModalVisible(true);
        }}
        hapticLevel={haptic_level}
        messageFeedback={messageFeedback}
        onFeedbackSubmit={handleFeedbackSubmit}
        ListFooterComponent={renderFooter}
      />

      {isConfettiVisible && (
        <ConfettiCannon
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: 50 }}
          autoStart={true}
          onAnimationEnd={() => setIsConfettiVisible(false)}
        />
      )}

      <ChatMessageModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={selectedMessage}
        onPinToStatus={() => pinToStatus(selectedMessage)}
      />

      <EditPlanModal
        isVisible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        savePlan={() => savePlan(selectedList)}
      />
    </GestureHandlerRootView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    gradient: {
      height: 60,
      borderBottomRightRadius: 26,
      borderBottomLeftRadius: 26,
    },
    header: {
      width: '90%',
      marginHorizontal: 20,
      marginBottom: 6,
      padding: 19,
      borderRadius: 20,
      bottom: 0,
      position: 'absolute',
      backgroundColor: Colors.white,
      ...DEffect,
    },
    headerText: {
      marginLeft: 8,
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    headerSubText: {
      marginTop: 8,
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    icon: {
      height: 24,
      width: 24,
    },
    videoText: {
      margin: 24,
      marginBottom: 30,
      fontSize: 26,
      fontFamily: 'Nunito-Bold',
      color: 'white',
      textAlign: 'center',
    },
    chatBubble: {
      maxWidth: '85%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 33,
      padding: 17,
      marginTop: 10,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 0,
    },
    sentBubble: {
      backgroundColor: Colors.secondaryColor,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 30,
    },
    bubbleButtonWrapper: {
      width: 160,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    sentText: {
      color: 'white',
    },
    chatText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
    },
    flatList: {
      flexGrow: 1,
      padding: 16,
      paddingBottom: 8,
      justifyContent: 'flex-end',
    },
    footer: {
      backgroundColor: Colors.white,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingLeft: 16,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      ...DEffect,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      ...DEffect,
    },
    video: {
      height: 200,
      alignItems: 'center',
      borderRadius: 20,
      overflow: 'hidden',
    },
    videoDarkShadow: {
      height: 200,
      width: '100%',
      alignItems: 'center',
    },
    videoRecorderWrapper: {
      marginTop: 12,
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoRecorder: {
      height: 300,
      width: '100%',
      alignItems: 'center',
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
      width: '80%', // Modal width
      backgroundColor: Colors.white, // Modal background color
      borderRadius: 24, // Rounded corners
      padding: 20, // Padding inside the modal
      // alignItems: 'center',
      ...DEffect,
    },
    modalTextContainer: {
      width: '100%',
      backgroundColor: Colors.greyColor,
      padding: 12,
      marginBottom: 16,
      borderRadius: 12,
    },
    modalText: {
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
      color: Colors.textColor,
    },
    editModalContent: {
      height: '40%',
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      ...DEffect,
    },
    textBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalButtonWrapper: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    removeIcon: {
      height: 20,
      width: 20,
      marginLeft: 6,
    },
    share: {
      backgroundColor: Colors.greyColor,
      borderRadius: 50,
      alignSelf: 'flex-end',
      padding: 8,
      marginLeft: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'space-between',
    },
    cancelText: {
      fontSize: 16,
      color: Colors.textPrimaryColor,
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    highlightedText: {
      backgroundColor: 'yellow',
      fontWeight: 'bold',
      color: '#000',
    },
    titleText: {
      fontSize: 24,
      fontFamily: 'Nunito-SemiBold',
      backgroundColor: 'rgba(0,0,0,0.2)',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingHorizontal: 30,
      paddingVertical: 2,
      borderRadius: 20,
      marginBottom: 10,
    },
    subtitleText: {
      top: '5%',
      paddingLeft: 20,
      fontFamily: 'Nunito-SemiBold',
      fontSize: 22,
      paddingBottom: 10,
    },
    descriptionText: {
      top: '10%',
      paddingLeft: 20,
      fontSize: 17,
      width: '55%',
    },
    circleContainer: {
      top: 50,
      right: -70,
      position: 'relative',
      height: 200,
      width: 200,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
    },

    circle1: {
      position: 'absolute',
      height: 297,
      width: 297,
      borderRadius: 297 / 2,
      borderWidth: 30,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    circle2: {
      position: 'absolute',
      height: 173,
      width: 173,
      borderRadius: 173 / 2,
      borderWidth: 30,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    component: {
      height: 125,
      width: 125,
      marginTop: 'auto',
    },
    svgImage: {
      height: 100,
      width: 100,
      bottom: 100,
      right: 70,
    },
    voiceChatContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    gradientCircleContainer: {
      width: 300,
      height: 300,
      borderRadius: 100,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    gradientCircle: {
      width: '100%',
      height: '100%',
      borderRadius: 100,
    },
    dotsContainer: {
      height: 200,
      width: 200,
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
      marginHorizontal: 4,
    },
    closeVoiceButton: {
      position: 'absolute',
      bottom: 50,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: Colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      ...DEffect,
    },
    qrCode: {
      marginVertical: 10,
    },
  });
};

export default SupplementScreen;
