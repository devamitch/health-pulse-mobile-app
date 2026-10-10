import ExpandedScreen from '@/components/home/tasktray/ExpandedScreen';
import AddCustomMetricsModal from '@/components/modals/home/add-custom-metric-modal';
import MetricsModal from '@/components/modals/home/metric-modal';
import ImagePreviewModal from '@/components/modals/image-preview-modal';
import InfoModal from '@/components/modals/info-alert-modal';
import { useAppTheme } from '@/hooks/themeHook';
import PremiumTabBar from '@/navigation/premium-tabbar';
import ActivityScannerScreen from '@/screens/home/ActivityScannerScreen';
import CategoryTasksScreen from '@/screens/home/CategoryTasksScreen';
import HomeScreen from '@/screens/home/home_screen';
import RoadmapScreen from '@/screens/home/roadmap_screen';
import TaskDetailScreen from '@/screens/home/task-details';
import PlanScreen from '@/screens/plan/plan_screen';
import ProfileScreen from '@/screens/settings/setting_screen';
import { claudeVisionHelper } from '@/services/api/claude_client';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { MetricReport, Metrics } from '@/services/mmkv-redux/slices';
import { Vital } from '@/services/sqlite/interface';
import { getPrioritizedVitalData } from '@/services/sqlite/queries';
import { addVitalToDB } from '@/services/sqlite/vitals';
import { Toast } from '@/utils/toast';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { Camera } from 'react-native-vision-camera';
import HistoryScreen from '../screens/history/history_screen';
import { HomeStackParamList, MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

// Home Stack Navigator
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen
        name="TasksView"
        component={ExpandedScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          autoHideHomeIndicator: true,
        }}
      />
      <HomeStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <HomeStack.Screen
        name="Activity"
        component={ActivityScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <HomeStack.Screen
        name="RoadMap"
        component={RoadmapScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <HomeStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          animation: 'fade_from_bottom',
          presentation: 'modal',
        }}
      />
      <HomeStack.Screen
        name="CategoryTasks"
        component={CategoryTasksScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </HomeStack.Navigator>
  );
};
interface ModalState {
  hasPermission: boolean;
  imageUri: string;
  isImageModalVisible: boolean;
  currentMetric: MetricReport;
  isMetricsModalVisible: boolean;
  isInfoModalVisible: boolean;
  isAddMetricModalVisible: boolean;
  customMetrics: Metrics[];
}

const NavigationTab = () => {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const { Colors, DEffect } = useAppTheme();
  const navigation = useNavigation<any>();

  // Get prioritized vitals from Redux
  const { prioritizedVitals } = useAppSelector(state => state.message);

  const priorityVitalTags =
    prioritizedVitals?.map(vital => {
      return vital.metrics.length > 1
        ? vital.title
        : vital?.metrics[0]?.metric ?? 'Vital Tag';
    }) ?? [];

  // Modal state management
  const [modalState, setModalState] = useState<ModalState>({
    hasPermission: false,
    imageUri: '',
    isImageModalVisible: false,
    currentMetric: {
      description: '',
      success: false,
    },
    isMetricsModalVisible: false,
    isInfoModalVisible: false,
    isAddMetricModalVisible: false,
    customMetrics: [],
  });

  const updateModalState = useCallback((update: Partial<ModalState>) => {
    setModalState(prev => ({ ...prev, ...update }));
  }, []);

  // Load vitals data
  useEffect(() => {
    const loadVitals = async () => {
      if (priorityVitalTags.length > 0) {
        const fetchedVitals = await getPrioritizedVitalData(priorityVitalTags);
        setVitals(fetchedVitals);
      }
    };
    loadVitals();
  }, [priorityVitalTags]);

  // Process image from camera/gallery
  const processImage = useCallback(
    async (response: ImagePickerResponse) => {
      try {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          return;
        }

        const asset = response.assets?.[0];
        if (!asset || !asset.uri) {
          Toast('No image selected');
          return;
        }

        console.log('Processing image:', asset.uri);

        // Resize image
        const { path } = await ImageResizer.createResizedImage(
          asset.uri,
          500,
          500,
          'JPEG',
          100,
        );

        console.log('Image resized:', path);

        const base64 = await RNFS.readFile(path, 'base64');

        updateModalState({
          imageUri: path,
          isImageModalVisible: true,
        });

        console.log('Calling Claude Vision API...');

        // Process with Claude Vision
        const res = (await claudeVisionHelper(
          String(base64),
          'image/jpeg',
        )) as MetricReport;

        console.log('Claude Vision response:', res);

        updateModalState({
          currentMetric: res,
          isImageModalVisible: false,
        });

        // Show appropriate modal based on success
        if (res.success) {
          updateModalState({ isMetricsModalVisible: true });
        } else {
          updateModalState({ isInfoModalVisible: true });
        }
      } catch (error) {
        console.error('Image processing error:', error);
        Toast('Error processing image: ' + String(error));
        updateModalState({ isImageModalVisible: false });
      }
    },
    [updateModalState],
  );

  // Camera handler
  const handleCameraPress = useCallback(async () => {
    try {
      console.log('Camera button pressed');

      if (!modalState.hasPermission) {
        const status = await Camera.requestCameraPermission();
        const granted = status === 'granted';
        updateModalState({ hasPermission: granted });

        if (!granted) {
          Toast('Camera permission is required to take photos');
          return;
        }
      }

      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 500,
          maxWidth: 500,
          quality: 1,
          saveToPhotos: false,
        },
        processImage,
      );
    } catch (error) {
      console.error('Camera error:', error);
      Toast('Error opening camera: ' + String(error));
    }
  }, [modalState.hasPermission, processImage, updateModalState]);

  // Gallery handler
  const handleGalleryPress = useCallback(() => {
    try {
      console.log('Gallery button pressed');

      launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 500,
          maxWidth: 500,
          quality: 1,
          selectionLimit: 1,
        },
        processImage,
      );
    } catch (error) {
      console.error('Gallery error:', error);
      Toast('Error opening gallery: ' + String(error));
    }
  }, [processImage]);

  // Custom metric handler
  const handleCustomMetricPress = useCallback(() => {
    console.log('Custom metric button pressed');

    updateModalState({
      isAddMetricModalVisible: true,
      customMetrics: [
        {
          metric: '',
          value: '',
          unit: '',
        },
      ],
    });
  }, [updateModalState]);

  // Chat handler - navigates to ChatScreen
  const handleChatPress = useCallback(() => {
    console.log('Chat button pressed - navigating to ChatScreen');
    try {
      navigation.navigate('ChatScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Toast('Unable to open chat');
    }
  }, [navigation]);

  // Save metrics to database
  const saveMetrics = useCallback(
    async (metrics: Metrics[]) => {
      try {
        console.log('Saving metrics:', metrics);

        const sys = metrics?.find(item => item.metric === 'SYS');
        const dia = metrics?.find(item => item.metric === 'DIA');

        const result = [];

        // Combine SYS and DIA into BP
        if (sys && dia) {
          result.push({
            metric: 'BP',
            value: `${sys.value}/${dia.value}`,
            unit: sys.unit,
          });
        }

        // Add other metrics
        metrics?.forEach(item => {
          if (item.metric !== 'SYS' && item.metric !== 'DIA') {
            result.push(item);
          }
        });

        console.log('Processed metrics:', result);

        // Save to database
        if (result.length > 0) {
          for (const metric of result) {
            await addVitalToDB({
              vital_type: metric.metric,
              value: metric.value,
              unit: metric.unit,
            });
          }

          // Refresh vitals
          if (priorityVitalTags.length > 0) {
            const fetchedVitals = await getPrioritizedVitalData(
              priorityVitalTags,
            );
            setVitals(fetchedVitals);
          }

          Toast('✅ Metrics saved successfully!');
        }

        // Close modals
        updateModalState({
          isAddMetricModalVisible: false,
          isMetricsModalVisible: false,
        });
      } catch (error) {
        console.error('Save metrics error:', error);
        Toast('❌ Error saving metrics: ' + String(error));
      }
    },
    [priorityVitalTags, updateModalState],
  );

  return (
    <>
      <Tab.Navigator
        tabBar={props => (
          <PremiumTabBar
            {...props}
            onCameraPress={handleCameraPress}
            onGalleryPress={handleGalleryPress}
            onCustomMetricPress={handleCustomMetricPress}
            onChatPress={handleChatPress}
          />
        )}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Plan" component={PlanScreen} />
      </Tab.Navigator>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isVisible={modalState.isImageModalVisible}
        imageUri={modalState.imageUri}
        primaryColor={Colors.primaryColor}
      />

      {/* Metrics Modal - Shows extracted metrics from image */}
      <MetricsModal
        isVisible={modalState.isMetricsModalVisible}
        onClose={() => updateModalState({ isMetricsModalVisible: false })}
        onSave={saveMetrics}
        metrics={modalState.currentMetric.metrics ?? []}
        title={modalState.currentMetric.type ?? 'Health Metrics'}
        Colors={Colors}
        DEffect={DEffect}
        onMetricsChange={metrics =>
          updateModalState({
            currentMetric: {
              ...modalState.currentMetric,
              metrics,
            },
          })
        }
      />

      {/* Info Modal - Shows error messages */}
      <InfoModal
        isVisible={modalState.isInfoModalVisible}
        onClose={() => updateModalState({ isInfoModalVisible: false })}
        description={
          modalState.currentMetric.message ??
          'Unable to extract metrics from image'
        }
        Colors={Colors}
      />

      {/* Add Custom Metrics Modal */}
      <AddCustomMetricsModal
        isVisible={modalState.isAddMetricModalVisible}
        onClose={() => updateModalState({ isAddMetricModalVisible: false })}
        Colors={Colors}
        metrics={modalState.customMetrics}
        onMetricChange={metrics => updateModalState({ customMetrics: metrics })}
        onSave={saveMetrics}
      />
    </>
  );
};

export default NavigationTab;
