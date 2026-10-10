import FeminineIcon from '@/assets/svg/feminine-dial.svg';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Button from '@/components/ui/buttons/button';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import {
  fetchAllFeminineRecords,
  fetchFeminineRecords,
  fetchFeminineSymptomRecords,
  insertFeminineDates,
  insertFeminineSymptomRecords,
  updateFeminineRecord,
  updateFeminineSymptomRecord,
} from '../../services/sqlite/message';
import { addStatusRecord } from '../../services/sqlite/vitals';
import { haptic } from '../../utils';
import { useFeminineChat } from '@/hooks/chat/useFeminineChat';
import { StatusList } from '@/components/status/layout-list/animated-list';
import { MarkedDates } from 'react-native-calendars/src/types';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import FeminineCycleModal from '@/components/modals/feminine-cycle-modal';
import ConfettiCannon from 'react-native-confetti-cannon';

interface CycleDateRecord {
  id?: number;
  color: string;
  textColor: string;
  startingDay?: boolean;
  endingDay?: boolean;
  lastDay?: boolean;
  day: number;
}

const { width } = Dimensions.get('screen');

const list = [
  {
    id: 1,
    image: require('@/assets/images/feminine/feminine01.png'),
    name: 'Cramps',
  },
  {
    id: 2,
    image: require('@/assets/images/feminine/feminine02.png'),
    name: 'Flow',
  },
  {
    id: 3,
    image: require('@/assets/images/feminine/feminine03.png'),
    name: 'Mood Swing',
  },
  {
    id: 4,
    image: require('@/assets/images/feminine/feminine04.png'),
    name: 'Headache',
  },
  {
    id: 5,
    image: require('@/assets/images/feminine/feminine05.png'),
    name: 'Bloating',
  },
  {
    id: 6,
    image: require('@/assets/images/feminine/feminine06.png'),
    name: 'Acne',
  },
];

const FeminineScreen = (props: any) => {
  const timeframe = props?.route?.params?.date ?? 'day';
  const date = new Date();

  const {
    loading,
    userInput,
    setUserInput,
    feminineMessages,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
  } = useFeminineChat({ timeframe, date });

  const [counts, setCounts] = useState<
    Record<string, Record<number, number> & { id?: number | undefined }>
  >({});
  const [markedDates, setMarkedDatesFromScreen] = useState<
    Record<string, CycleDateRecord | undefined>
  >({});
  const [selectedDay, setSelectedDay] = useState<
    Record<
      string,
      {
        color: string;
        endingDay: boolean;
        selected: boolean;
        startingDay: boolean;
        textColor: string;
      }
    >
  >();
  const [subtitle, setSubtitle] = useState(`Let's get started`);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>({});
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const handleNotification = async () => {
    props.navigation.navigate('Notifications');
  };

  const handleDayPress = async (day: { dateString: moment.MomentInput }) => {
    const selectedDate = moment(day.dateString);

    if (Object.keys(markedDates).length !== 0) {
      const updatedDates = {
        [selectedDate.format('YYYY-MM-DD')]: {
          selected: true,
          color: Colors.gradientColor2,
          textColor: Colors.white,
          startingDay:
            markedDates[selectedDate.format('YYYY-MM-DD')] === undefined
              ? true
              : markedDates[selectedDate.format('YYYY-MM-DD')]?.startingDay ===
                true,
          endingDay:
            markedDates[selectedDate.format('YYYY-MM-DD')] === undefined
              ? true
              : markedDates[selectedDate.format('YYYY-MM-DD')]?.endingDay ===
                true,
        },
      };
      setSelectedDay(updatedDates);
    }
  };

  const handleRemoveDate = (date_string: string) => {
    const today = moment().format('YYYY-MM-DD');

    if (date_string <= today) {
      const newDateRecords = { ...markedDates };
      if (markedDates[date_string]) {
        const previous_date = moment(date_string)
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
        const next_date = moment(date_string)
          .add(1, 'day')
          .format('YYYY-MM-DD');

        if (markedDates[date_string].startingDay) {
          shiftDatesForward(previous_date, newDateRecords);
        } else if (
          markedDates[date_string].lastDay &&
          newDateRecords[previous_date]
        ) {
          newDateRecords[previous_date].lastDay = true;
          newDateRecords[previous_date].endingDay = true;
          delete newDateRecords[date_string];
          console.log(date_string, previous_date, 'last_date');
          shiftDatesBackward(next_date, newDateRecords);
        } else if (
          markedDates[date_string].endingDay &&
          newDateRecords[previous_date]
        ) {
          newDateRecords[previous_date].endingDay = true;
          delete newDateRecords[date_string];
          console.log(date_string, previous_date, 'end_date');
          shiftDatesBackward(next_date, newDateRecords);
        } else {
          console.log(date_string, 'date');
        }
      } else {
        Alert.alert('Please select valid date.');
      }
    } else {
      Alert.alert('Please select valid date.');
    }
  };

  const updateMarkedDates = async (dateString: string) => {
    const selectedDate = moment(dateString);
    const updatedDates = generateContinuesDate(selectedDate);
    const dateList = dateRecordToList(updatedDates);

    await insertFeminineDates(dateList);
    await fetchFeminineDateRecords();
    setConfirmModalVisible(false);
  };

  const shiftDatesForward = async (
    start_date: string,
    markedDates: Record<string, CycleDateRecord | undefined>,
  ) => {
    const new_dates: Record<string, CycleDateRecord | undefined> = {
      ...markedDates,
    };
    for (const date of Object.keys(markedDates)) {
      if (start_date < date) {
        const next_date = moment(date).add(1, 'day').format('YYYY-MM-DD');
        new_dates[next_date] = markedDates[date];

        if (markedDates[date]?.id)
          await updateFeminineRecord(
            'id',
            'date',
            markedDates[date].id,
            next_date,
          );

        if (markedDates[date]?.startingDay) {
          delete new_dates[date];
        }
      }
    }
    setMarkedDatesFromScreen(new_dates);
  };

  const shiftDatesBackward = async (
    start_date: string,
    markedDates: Record<string, CycleDateRecord | undefined>,
  ) => {
    const new_dates = { ...markedDates };
    for (const date of Object.keys(markedDates)) {
      if (start_date < date) {
        const previous_date = moment(date)
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
        new_dates[previous_date] = markedDates[date];

        if (markedDates[date])
          await updateFeminineRecord(
            'id',
            'date',
            markedDates[date].id,
            previous_date,
          );

        if (markedDates[date]?.endingDay) {
          delete new_dates[date];
        }
      }
    }
    setMarkedDatesFromScreen(new_dates);
  };

  const generateContinuesDate = (start_date: moment.Moment) => {
    let dateRecords: Record<
      string,
      {
        id?: number;
        color: string;
        textColor: string;
        startingDay?: boolean;
        endingDay?: boolean;
        lastDay?: boolean;
        day: number;
      }
    > = {};

    let current_date = start_date.clone();
    let last_date = moment(start_date).format('YYYY-MM-DD');

    const markDates = (date: moment.Moment, color: string) => {
      for (let i = 0; i < 4; i++) {
        const inst_date = date.clone().add(i, 'days').format('YYYY-MM-DD');
        if (i === 0) {
          dateRecords[inst_date] = {
            color: color.slice(0, 7),
            startingDay: true,
            textColor: Colors.black,
            day: i,
          };
        } else if (i === 3) {
          dateRecords[inst_date] = {
            color: color.slice(0, 7),
            endingDay: true,
            textColor: Colors.black,
            day: i,
          };
          last_date = inst_date;
        } else {
          dateRecords[inst_date] = {
            color: color,
            textColor: Colors.black,
            day: i,
          };
        }
      }
    };

    for (let j = 0; j < 12; j++) {
      let blockColor = j % 2 === 1 ? '#2E70B366' : '#F0546633';
      markDates(current_date.clone(), blockColor);
      current_date.add(16, 'days');
    }
    dateRecords[last_date] = {
      ...dateRecords[last_date],
      lastDay: true,
    } as CycleDateRecord;

    return dateRecords;
  };

  const updateCounts = async (
    key_date: string,
    index: number,
    increment: number,
  ) => {
    const record: Record<string, Record<number, number>> = {};
    if (counts[key_date]) {
      const newCounts = { ...counts };
      if (newCounts[key_date])
        newCounts[key_date][index] = newCounts[key_date][index]
          ? newCounts[key_date][index] + increment
          : increment === -1
          ? 0
          : 1;
      record[key_date] = newCounts[key_date] as Record<number, number>;

      const countList = countRecordToList(record);
      if (countList[0]) await updateFeminineSymptomRecord(countList[0]);
      setCounts(newCounts);
    } else {
      const newCounts = { ...counts };
      newCounts[key_date] = {};
      newCounts[key_date][index] = increment;
      record[key_date] = newCounts[key_date];
      const countList = countRecordToList(record);

      if (countList[0]) await insertFeminineSymptomRecords(countList[0]);
      setCounts(newCounts);
    }
  };

  const handleSymptomCardPress = async (index: number) => {
    if (selectedDay) {
      const key_date = Object.keys(selectedDay)[0];
      const today = moment().format('YYYY-MM-DD');

      if (key_date && key_date <= today) {
        const previous_date = moment(key_date)
          .subtract(1, 'day')
          .format('YYYY-MM-DD');

        if ((counts[key_date]?.[index] ?? 0) === 0) {
          setIsConfettiVisible(true);
        }

        if (markedDates[key_date]) {
          updateCounts(key_date, index, 1);
        } else if (markedDates[previous_date]) {
          const newDateRecords = { ...markedDates };

          newDateRecords[key_date] = newDateRecords[previous_date];

          newDateRecords[previous_date] = {
            ...newDateRecords[previous_date],
            endingDay: false,
          } as CycleDateRecord;

          await updateFeminineRecord('date', 'end_date', previous_date, 0);
          if (newDateRecords[previous_date])
            await insertFeminineDates([
              {
                date: key_date,
                color: newDateRecords[previous_date].color,
                start_date: 0,
                end_date: 1,
                last_date: newDateRecords[previous_date].lastDay ? 1 : 0,
                day: newDateRecords[previous_date].day + 1,
              },
            ]);

          updateCounts(key_date, index, 1);
          shiftDatesForward(key_date, newDateRecords);
        } else {
          Alert.alert('Please select valid date');
        }
      } else {
        Alert.alert('Please select valid date.');
      }
    } else {
      Alert.alert('Please select a date');
    }
  };

  const handleSymptomCardLongPress = (index: number) => {
    if (selectedDay) {
      const key_date = Object.keys(selectedDay)[0];
      if (key_date && counts[key_date]) {
        updateCounts(key_date, index, -1);
      } else {
        Alert.alert('Please select valid date');
      }
    } else {
      Alert.alert('Please select a date');
    }
  };

  const getDaysFromPrevious = (
    dateStr: string,
    data: Record<string, any>,
  ): [number | null, number | null] => {
    const inputDate = new Date(dateStr);
    let previousDate: Date | null = null;
    let nextDate: Date | null = null;

    // Sort dates in chronological order
    const sortedDates = Object.keys(data).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    for (const date of sortedDates) {
      const current = new Date(date);
      if (
        current < inputDate &&
        data[date].startingDay &&
        data[date].color === '#F05466'
      ) {
        previousDate = current;
      }
      if (
        current > inputDate &&
        data[date].startingDay &&
        data[date].color === '#F05466'
      ) {
        nextDate = current;
        break;
      }
    }

    if (!previousDate || !nextDate) return [null, null]; // No valid range found

    // Calculate the difference in days
    const prevDiff = Math.ceil(
      (inputDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const rangeDiff = Math.ceil(
      (nextDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return [prevDiff, rangeDiff];
  };

  const dateRecordToList = (
    record: Record<
      string,
      {
        id?: number;
        color: string;
        textColor: string;
        startingDay?: boolean;
        endingDay?: boolean;
        lastDay?: boolean;
        day: number;
      }
    >,
  ) => {
    const transformedData = Object.entries(record).map(([date, value]) => ({
      date,
      color: value.color,
      start_date: value.startingDay ? 1 : 0,
      end_date: value.endingDay ? 1 : 0,
      last_date: value.lastDay ? 1 : 0,
      day: value.day,
    }));

    return transformedData;
  };

  const dateListToRecord = (
    list: {
      id: number;
      date: string;
      start_date: number;
      end_date: number;
      color: string;
      last_date: string;
      day: number;
    }[],
  ) => {
    const reversedData = list.reduce<
      Record<
        string,
        {
          id?: number;
          color: string;
          textColor: string;
          startingDay?: boolean;
          endingDay?: boolean;
          lastDay?: boolean;
          day: number;
        }
      >
    >((acc, { id, date, color, start_date, end_date, last_date, day }) => {
      acc[date] = {
        id,
        color,
        textColor: Colors.black,
        ...(start_date ? { startingDay: true } : {}),
        ...(end_date ? { endingDay: true } : {}),
        ...(last_date ? { selected: true } : {}),
        day,
      };
      return acc;
    }, {});

    return reversedData;
  };

  const countRecordToList = (
    input: Record<string, Record<number, number> & { id?: number }>,
  ) => {
    return Object.entries(input).map(([date, symptoms]) => ({
      date,
      symptom_1: symptoms[0] ?? 0,
      symptom_2: symptoms[1] ?? 0,
      symptom_3: symptoms[2] ?? 0,
      symptom_4: symptoms[3] ?? 0,
      symptom_5: symptoms[4] ?? 0,
      symptom_6: symptoms[5] ?? 0,
    }));
  };

  const listToCountRecord = (
    input: Array<{
      date: string;
      symptom_1: number;
      symptom_2: number;
      symptom_3: number;
      symptom_4: number;
      symptom_5: number;
      symptom_6: number;
      id?: number;
    }>,
  ) => {
    return input.reduce(
      (
        acc,
        {
          date,
          symptom_1,
          symptom_2,
          symptom_3,
          symptom_4,
          symptom_5,
          symptom_6,
          id,
        },
      ) => {
        acc[date] = {
          0: symptom_1,
          1: symptom_2,
          2: symptom_3,
          3: symptom_4,
          4: symptom_5,
          5: symptom_6,
          id: id ?? undefined, // Add id if available, otherwise set as undefined
        };
        return acc;
      },
      {} as Record<
        string,
        Record<number, number> & { id?: number | undefined }
      >,
    );
  };

  const fetchFeminineDateRecords = async () => {
    const records_list = await fetchAllFeminineRecords();
    const records = dateListToRecord(records_list);
    setMarkedDatesFromScreen(records);
  };

  const fetchFeminineCountRecords = async () => {
    const records_list = await fetchFeminineSymptomRecords();
    const records = listToCountRecord(records_list);
    setCounts(records);
  };

  const addNewDates = async () => {
    const max_date = moment().add(6, 'months').format('YYYY-MM-DD');
    let lastRecord = await fetchFeminineRecords('is_last_date', 1);

    if (lastRecord.length !== 0) {
      let lastRecordDate = lastRecord[0].date;

      while (lastRecordDate <= max_date) {
        const date = moment(lastRecordDate).add(13, 'day').format('YYYY-MM-DD');

        await updateFeminineRecord('is_last_date', 'is_last_date', 1, 0);
        await updateMarkedDates(date);

        lastRecord = await fetchFeminineRecords('is_last_date', 1);
        lastRecordDate = lastRecord[0].date;
      }
    }
  };

  const initFunction = async () => {
    await fetchFeminineDateRecords();
    await fetchFeminineCountRecords();
    await addNewDates();
  };

  useEffect(() => {
    initFunction();
  }, []);

  useEffect(() => {
    const date = moment().format('YYYY-MM-DD');
    const days = getDaysFromPrevious(date, markedDates);
    if (days[0]) setSubtitle(`Day ${days[0] + 1}`);
  }, [markedDates]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');

  const handleLongPress = (message: string) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const pinToStatus = (message: string) => {
    addStatusRecord(message, 0, 'popup', '');
    setModalVisible(false);
  };

  const handleConfirmCycleDate = async () => {
    haptic(haptic_level);
    const today = moment().format('YYYY-MM-DD');
    if (today >= selectedDate.dateString) {
      await updateMarkedDates(selectedDate.dateString);
      await addNewDates();
    } else {
      Alert.alert('Please select valid date');
    }
  };

  const renderFooter = () => {
    return (
      <View>
        <View style={[styles.card, { padding: 6 }]}>
          <Calendar
            current={moment().format('YYYY-MM-DD')}
            markingType={'period'}
            markedDates={{ ...markedDates, ...selectedDay } as MarkedDates}
            onDayPress={(day: { dateString: moment.MomentInput }) => {
              haptic(haptic_level);
              setSelectedDate(day);
              if (Object.keys(markedDates).length === 0) {
                setConfirmModalVisible(true);
              } else {
                handleDayPress(day);
              }
            }}
            theme={{
              backgroundColor: Colors.white,
              arrowColor: Colors.textColor,
              todayTextColor: 'red',
              textDayFontFamily: 'Nunito-SemiBold',
              textMonthFontFamily: 'Nunito-Bold',
              textDayHeaderFontFamily: 'Nunito-SemiBold',
              monthTextColor: Colors.textColor,
              calendarBackground: Colors.white,
              textDisabledColor: Colors.greyColor500,
              dayTextColor: Colors.textColor,
            }}
            style={{
              backgroundColor: Colors.white,
              // textColors: Colors.textColor,
            }}
          />
        </View>
        <View style={[styles.card, styles.imagesWrapper]}>
          {list.map((item, index) => {
            const selectedDateKey = selectedDay
              ? Object.keys(selectedDay)[0]
              : null;
            const selectedDate = moment(selectedDateKey).format('YYYY-MM-DD');
            const countForDate = counts?.[selectedDate]?.[`${index}`] || 0;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSymptomCardPress(index)}
                onLongPress={() => handleSymptomCardLongPress(index)}
                activeOpacity={0.7}
                style={{ alignItems: 'center' }}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={item.image}
                    style={{
                      height: width * 0.22,
                      width: width * 0.22,
                      borderRadius: 12,
                    }}
                  />
                </View>
                <Text style={styles.imageText}>{item.name}</Text>
                {countForDate > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{countForDate}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <Button
            text="Remove Date"
            variant="contained"
            onPress={() => handleRemoveDate(selectedDate.dateString)}
            style={[{ width: '100%', marginTop: 5 }, { backgroundColor: Colors.secondaryColor }]}
          />
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={FeminineIcon}
        angle={126.57}
        gradientColors={['#A737D5', '#EF497A']}
        title="Feminine Health"
        subtitle={subtitle}
        description={
          Object.keys(markedDates).length === 0
            ? `You can track your mesutrual cycle with AuraCore. Please select first date of your cycle to get started.`
            : markedDates[moment().format('YYYY-MM-DD')]
            ? `Your are in your Menstrual Phase. make sure to take plenty of rest. your body needs more nourishment and to handle the hormonal shifts.`
            : `Support your energy shifts with movement, balanced nutrition, and self-care. Listen to your body and flow with your cycle!`
        }
        loading={loading}
        handleClearChat={handleClearChat}
        handleNotification={handleNotification}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        messages={[...feminineMessages]}
        animatedText={animatedText}
        onLongPress={handleLongPress}
        hapticLevel={haptic_level}
        messageFeedback={messageFeedback}
        onFeedbackSubmit={handleFeedbackSubmit}
        ListFooterComponent={renderFooter}
        expandedHeight={200}
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

      <FeminineCycleModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        dateString={selectedDate.date_string}
        Colors={Colors}
        onYes={handleConfirmCycleDate}
        onNo={() => {
          haptic(haptic_level);
          setConfirmModalVisible(false);
        }}
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
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 20,
      ...DEffect,
    },
    imagesWrapper: {
      marginTop: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
      padding: 16,
    },
    imageContainer: {
      backgroundColor: Colors.white,
      padding: 6,
      borderRadius: 12,
    },
    imageText: {
      marginTop: 4,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    badge: {
      position: 'absolute',
      backgroundColor: 'red',
      borderRadius: 20,
      right: -4,
      top: -4,
      height: 20,
      width: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: 12,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.white,
    },
  });
};

export default FeminineScreen;
