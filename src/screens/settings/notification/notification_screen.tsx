import SettingsLayout from '@/components/ui/settings-layout';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import notifee, {
  TriggerType,
  RepeatFrequency,
  TimestampTrigger,
  AuthorizationStatus,
  AndroidImportance,
  AndroidCategory,
} from '@notifee/react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomSwitch from '../../../components/CustomSwitch';
import { ColorScheme, ElevationScheme } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/themeHook';
import { RootState } from '../../../services/mmkv-redux';
import {
  updateNotification,
  toggleNotification,
} from '../../../services/mmkv-redux/slices/notification_slice';
import { fetchDietRecordByDate } from '../../../services/sqlite/message';
import { logButtonTap } from '@/services/analytics-service';
import { FONT_FAMILIES } from '@/constants/typography';

type NotificationChannel =
  | 'morning'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'evening';

interface NotificationItem {
  id: string;
  title: string;
  channel: NotificationChannel;
  time: string;
  enabled: boolean;
}

const iconMapping: Record<NotificationChannel, any> = {
  morning: require('@/assets/icons/lotus.png'),
  breakfast: require('@/assets/icons/diet.png'),
  lunch: require('@/assets/icons/diet.png'),
  dinner: require('@/assets/icons/diet.png'),
  evening: require('@/assets/icons/sleeping.png'),
};

// Channel descriptions for each notification type
const CHANNEL_CONFIG = {
  morning: {
    name: 'Morning Notifications',
    description: 'Start your day mindfully',
    body: '🧘‍♀️ Time for your morning mindfulness practice!',
  },
  breakfast: {
    name: 'Meal Reminders',
    description: 'Meal time notifications',
    body: '🍳 Time for a healthy breakfast!',
  },
  lunch: {
    name: 'Meal Reminders',
    description: 'Meal time notifications',
    body: "🥗 Lunch time! Don't forget to eat.",
  },
  dinner: {
    name: 'Meal Reminders',
    description: 'Meal time notifications',
    body: '🍽️ Dinner is ready!',
  },
  evening: {
    name: 'Evening Notifications',
    description: 'Wind down for the day',
    body: '🌙 Time to wind down and relax.',
  },
};

interface NotificationsProps {
  navigation: any;
}

const Notifications = (props: NotificationsProps) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications,
  );
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        await createNotificationChannels();
        // Schedule any notifications that are enabled but not yet scheduled
        const scheduled = await notifee.getTriggerNotificationIds();
        for (const n of notifications) {
          if (n.enabled && !scheduled.includes(n.id)) {
            await scheduleNotification(n);
          }
        }
      }
    };
    initialize();
  }, [notifications]);

  // Enhanced permission request with battery optimization handling
  const requestNotificationPermission = async () => {
    try {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }],
        );
        return false;
      }

      // Android-specific permissions and optimizations
      if (Platform.OS === 'android') {
        // Check for battery optimization
        const batteryOptimizationEnabled =
          await notifee.isBatteryOptimizationEnabled();

        if (batteryOptimizationEnabled) {
          Alert.alert(
            'Battery Optimization Detected',
            'To ensure notifications work reliably when the app is closed, please disable battery optimization for this app.\n\nThis allows scheduled notifications to be delivered on time.',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: async () => {
                  try {
                    await notifee.openBatteryOptimizationSettings();
                  } catch (error) {
                    console.error('Error opening battery settings:', error);
                  }
                },
              },
            ],
          );
        }

        // Request exact alarm permission (Android 12+)
        try {
          const alarmSettings = await notifee.getNotificationSettings();

          if (Platform.Version >= 31 && !alarmSettings.android?.alarm) {
            Alert.alert(
              'Exact Alarm Permission Required',
              'For precise notification timing when the app is closed, please enable "Alarms & reminders" permission.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: async () => {
                    try {
                      await notifee.openAlarmPermissionSettings();
                    } catch (error) {
                      console.error('Error opening alarm settings:', error);
                    }
                  },
                },
              ],
            );
          }
        } catch (error) {
          console.error('Error checking alarm permission:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Create notification channels with enhanced settings (Android)
  const createNotificationChannels = async () => {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: 'morning',
          name: 'Morning Notifications',
          description: 'Start your day mindfully',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          lightColor: '#FF6B6B',
        });

        await notifee.createChannel({
          id: 'meal',
          name: 'Meal Reminders',
          description: 'Meal time notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          lightColor: '#4ECDC4',
        });

        await notifee.createChannel({
          id: 'evening',
          name: 'Evening Notifications',
          description: 'Wind down for the day',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          lightColor: '#95E1D3',
        });

        console.log('Notification channels created successfully');
      } catch (error) {
        console.error('Error creating notification channels:', error);
      }
    }
  };

  // Convert time string to Date object
  const timeStringToDate = (timeString: string): Date => {
    const parts = timeString.split(' ');
    if (parts.length !== 2) {
      throw new Error(
        'Invalid time string format. Expected format: "HH:MM AM/PM"',
      );
    }

    const [time, period] = parts;
    if (!time) {
      throw new Error('Invalid time format in time string');
    }

    const timeParts = time.split(':');
    if (timeParts.length !== 2) {
      throw new Error('Invalid time format. Expected "HH:MM"');
    }

    const [hoursStr, minutesStr] = timeParts;
    let hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error('Invalid numeric values in time string');
    }

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    return date;
  };

  // Format Date to time string
  const formatTimeString = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hours}:${minutesStr} ${period}`;
  };

  // Helper function to get the correct routine topic name
  const getRoutineTopicName = async (
    channel: NotificationChannel,
  ): Promise<string> => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (todayStr) {
        // Fetch today's diet records to find the matching routine
        const dietRecords = await fetchDietRecordByDate(todayStr);

        // Map channel to routine type
        const channelToRoutineType: Partial<
          Record<NotificationChannel, string>
        > = {
          breakfast: 'Breakfast',
          lunch: 'Lunch',
          dinner: 'Dinner',
        };

        const routineType = channelToRoutineType[channel];
        if (!routineType) return channel; // For morning/evening

        // Find the routine that starts with the expected type
        const matchingRoutine = dietRecords.find((record: any) =>
          Boolean(
            record?.routine
              ?.toLowerCase()
              ?.startsWith(routineType.toLowerCase()),
          ),
        );

        // Return the full routine name if found, otherwise fallback to short name
        return matchingRoutine?.routine || routineType;
      }
      return channel;
    } catch (error) {
      console.error('Error fetching routine name:', error);
      // Fallback to channel name if database query fails
      return channel;
    }
  };

  // Enhanced notification scheduling with better Android handling
  const scheduleNotification = async (notification: NotificationItem) => {
    if (!notification.enabled) return;

    try {
      const triggerDate = timeStringToDate(notification.time);
      const channelId =
        notification.channel === 'breakfast' ||
        notification.channel === 'lunch' ||
        notification.channel === 'dinner'
          ? 'meal'
          : notification.channel;

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager:
          Platform.OS === 'android'
            ? {
                allowWhileIdle: true, // Critical for Android - allows notification when device is idle
              }
            : undefined,
      };

      // Prepare navigation data for deep linking
      const navigationData: any = {};
      if (notification.channel === 'morning') {
        navigationData.screen = 'MindfulScreen';
        console.log(
          '🌅 Morning mindfulness notification - adding screen data:',
          navigationData,
        );
      } else if (notification.channel === 'evening') {
        navigationData.screen = 'WindScreen';
        console.log(
          '🌙 Evening wind down notification - adding screen data:',
          navigationData,
        );
      } else if (
        notification.channel === 'breakfast' ||
        notification.channel === 'lunch' ||
        notification.channel === 'dinner'
      ) {
        navigationData.screen = 'SuperfoodScreen';
        // Get the correct routine topic name from the database
        const topicName = await getRoutineTopicName(notification.channel);
        navigationData.topic = topicName;
        console.log(
          `🍽️ ${notification.channel} notification - using topic: ${topicName}`,
        );
      }

      await notifee.createTriggerNotification(
        {
          id: notification.id,
          title: notification.title,
          body: CHANNEL_CONFIG[notification.channel].body,
          data: navigationData,
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            sound: 'default',
            vibrationPattern: [300, 500],
            // Make notification visible and actionable
            autoCancel: true,
            ongoing: false,
            // Show notification even when device is locked
            visibility: 1, // VISIBILITY_PUBLIC
            // Small icon (you can customize this)
            smallIcon: 'ic_launcher',
            // Show notification in full screen on some devices
            fullScreenAction: {
              id: 'default',
            },
            // Category for better handling
            category: AndroidCategory.REMINDER,
          },
          ios: {
            sound: 'default',
            critical: false,
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
            categoryId: 'reminder',
          },
        },
        trigger,
      );

      console.log(
        `✅ Scheduled notification "${notification.title}" (ID: ${
          notification.id
        }) for ${notification.time} (${triggerDate.toLocaleString()})`,
      );
    } catch (error) {
      console.error(
        `❌ Error scheduling notification ${notification.id}:`,
        error,
      );
      Alert.alert(
        'Scheduling Error',
        `Failed to schedule ${notification.title}. Please check your notification permissions.`,
      );
    }
  };

  // Toggle notification on/off
  const handleToggleNotification = async (item: NotificationItem) => {
    dispatch(toggleNotification(item.id));

    if (!item.enabled) {
      // Enable notification
      await scheduleNotification({ ...item, enabled: true });
      console.log(`🔔 Enabled notification: ${item.title}`);
    } else {
      // Disable notification
      await notifee.cancelNotification(item.id);
      console.log(`🔕 Disabled notification: ${item.title}`);
    }
  };

  // Show time picker
  const showTimePicker = (item: NotificationItem) => {
    setSelectedNotification(item);
    setTimePickerVisible(true);
  };

  // Handle time change
  const handleTimeConfirm = async (date: Date) => {
    if (!selectedNotification) return;

    const newTime = formatTimeString(date);
    const updatedNotification = {
      ...selectedNotification,
      time: newTime,
    };

    dispatch(updateNotification(updatedNotification));
    setTimePickerVisible(false);

    // Reschedule if enabled
    if (updatedNotification.enabled) {
      await notifee.cancelNotification(updatedNotification.id);
      await scheduleNotification(updatedNotification);
      console.log(
        `⏰ Updated time for ${updatedNotification.title} to ${newTime}`,
      );
    }

    setSelectedNotification(null);
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.gradientContainer}>
          <View style={styles.rowSpaceBetween}>
            <View style={styles.rowCenter}>
              <Image source={iconMapping[item.channel]} style={styles.icon} />
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <CustomSwitch
              isOn={item.enabled}
              onToggle={() => handleToggleNotification(item)}
            />
          </View>

          <TouchableOpacity
            style={styles.timeContainer}
            disabled={!item.enabled}
            onPress={() => showTimePicker(item)}
          >
            <Text style={[styles.time, !item.enabled && styles.disabledText]}>
              {item.time}
            </Text>
          </TouchableOpacity>

          <Text
            style={[styles.frequencyText, !item.enabled && styles.disabledText]}
          >
            Every day
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SettingsLayout
      heading="Notifications"
      subtitle="Manage your daily reminders and notification preferences"
      onBackPress={async () => {
        await logButtonTap('Profile Backbutton');
        props.navigation.goBack();
      }}
    >
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => {
          setTimePickerVisible(false);
          setSelectedNotification(null);
        }}
        date={
          selectedNotification
            ? timeStringToDate(selectedNotification.time)
            : new Date()
        }
      />
    </SettingsLayout>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    modalContainer: {
      backgroundColor: Colors.white,
      margin:16,
      padding: 12,
      borderRadius: 20,
      ...DEffect,
    },
    gradientContainer: {
      padding: 15,
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowSpaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    icon: {
      height: 28,
      width: 28,
    },
    title: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      marginLeft: 10,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginVertical: 10,
    },
    time: {
      color: Colors.textColor,
      fontSize: 28,
      fontFamily : FONT_FAMILIES.nunitoBold,
    },
    frequencyText: {
      color: Colors.textColor,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      fontSize: 16,
      opacity: 0.7,
    },
    disabledText: {
      fontFamily: FONT_FAMILIES.nunitoRegular,
      opacity: 0.3,
    },
  });
};

export default Notifications;
