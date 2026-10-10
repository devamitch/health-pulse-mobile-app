import {
  StyleSheet,
  View,
  Text,
  ColorValue,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import BaseModal from './base-modal';
import Button from '../ui/buttons/button';
import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import Slider from '@react-native-community/slider';
import { useCallback, useMemo, useState } from 'react';
import { Toast } from '@/utils/toast';
import { addPreference, Routine } from '@/services/mmkv-redux/slices';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InfoModal from './info-alert-modal';
import EditPlanModal from './edit-plan-modal';
import Sparkle from '@/icons/sparkle';

type Preference = {
  preference: string;
  isSelected?: boolean;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
};

type WorkoutPlannerResult = {
  toughness: string;
  preferences: string[];
};

interface BuildWorkoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGeneratePress?: (result: WorkoutPlannerResult) => void;
  onEditPress?: () => void;
  existingWorkoutList?: Routine[];
}

// Constants moved outside component for better performance
const TOUGHNESS_LABEL = ['Easy', 'Hard'];
const WORKOUT_CATEGORIES = {
  WEIGHT_TRAINING: {
    items: [
      'Full Body',
      'Upper Body',
      'Lower Body',
      'Core & Abs',
      'Bodyweight Strength',
    ],
    color: '#76D176',
  },
  CARDIO: {
    items: ['Jogging', 'Cycling', 'HIIT', 'Jump Rope', 'Dance Cardio'],
    color: '#FFAF02',
  },
  FLEXIBILITY: {
    items: [
      'Yoga',
      'Pilates',
      'Dynamic Stretching',
      'Mobility Flow',
      'Cool-Down & Recovery Stretch',
    ],
    color: '#FE3219',
  },
  ATHLETIC: {
    items: [
      'CrossFit',
      'Circuit Training',
      'Plyometrics',
      'Agility Drills',
      'Functional Fitness',
    ],
    color: '#0081EF',
  },
};

const BuildWorkoutModal: React.FC<BuildWorkoutModalProps> = ({
  isVisible,
  onClose,
  onGeneratePress,
  onEditPress,
  existingWorkoutList,
}) => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const styles = useMemo(() => createStyle(Colors), [Colors]);

  const Activities = useAppSelector(
    state => state.message?.CategorisedPreferences?.Activities || [],
  );

  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editPlanData, setEditPlanData] = useState<Routine[]>([]);

  const [toughness, setToughness] = useState(1);
  const [customPreference, setCustomPreference] = useState('');
  const [selectedActivityPreferences, setSelectedActivityPreferences] =
    useState<string[]>([]);

  const preferences: Preference[] = useMemo(() => {
    const workoutTypes: Preference[] = [];

    Object.values(WORKOUT_CATEGORIES).forEach(category => {
      category.items.forEach(item => {
        if (
          !customPreference ||
          item.toLowerCase().includes(customPreference.toLowerCase())
        ) {
          workoutTypes.push({
            preference: item,
            isSelected: selectedActivityPreferences.includes(item),
            backgroundColor: category.color,
          });
        }
      });
    });

    const activityPreferences: Preference[] = Activities.filter(
      val =>
        !customPreference ||
        val.toLowerCase().includes(customPreference.toLowerCase()),
    ).map(val => ({
      preference: val,
      isSelected: selectedActivityPreferences.includes(val),
    }));

    return [...workoutTypes, ...activityPreferences];
  }, [Activities, selectedActivityPreferences, customPreference]);

  const preferenceList = useMemo(
    () => preferences.map(val => val.preference),
    [preferences],
  );

  const toggleSelection = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
      (val: string) => {
        setter(prev =>
          prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val],
        );
      },
    [],
  );

  const handlePreferencePress = useMemo(
    () => toggleSelection(setSelectedActivityPreferences),
    [toggleSelection],
  );

  const handleAddActivitiesPreference = useCallback(
    (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) return;

      if (
        Activities.includes(trimmedVal) ||
        preferenceList.includes(trimmedVal)
      ) {
        Toast('Item already in the list');
        handlePreferencePress(val);
        return;
      }

      dispatch(
        addPreference({
          preference: trimmedVal,
          category: 'Activities',
        }),
      );

      if (!selectedActivityPreferences.includes(trimmedVal)) {
        setSelectedActivityPreferences(prev => [...prev, trimmedVal]);
      }
    },
    [Activities, selectedActivityPreferences, dispatch, preferenceList],
  );

  const handleAddCustomPreference = useCallback(() => {
    if (customPreference.trim()) {
      handleAddActivitiesPreference(customPreference);
      setCustomPreference('');
    }
  }, [customPreference, handleAddActivitiesPreference]);

  const handleGenerate = useCallback(() => {
    try {
      onGeneratePress?.({
        toughness: `${toughness} of 10`,
        preferences: selectedActivityPreferences,
      });
      onClose();
    } catch (error) {
      setInfoModalVisible(true);
    }
  }, [toughness, selectedActivityPreferences, onGeneratePress, onClose]);

  const handleEditPlan = useCallback(() => {
    if (onEditPress) {
      onEditPress();
      onClose();
    } else {
      setEditPlanData(existingWorkoutList ? [...existingWorkoutList] : []);
      setEditModalVisible(true);
    }
  }, [onEditPress, existingWorkoutList, onClose]);

  const handleSavePlan = useCallback((updatedList: Routine[]) => {
    setEditPlanData(updatedList);
    setEditModalVisible(false);
    Toast('Plan updated successfully');
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
  }, []);

  // Render preference pill component
  const renderPreferencePill = useCallback(
    (val: Preference, index: number, onPress: (pref: string) => void) => (
      <TouchableOpacity
        key={`${val.preference}-${index}`}
        onPress={() => onPress(val.preference)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.preferenceText,
            val.isSelected && {
              backgroundColor: val.backgroundColor ?? Colors.primaryColor,
              borderColor: val.backgroundColor ?? Colors.primaryColor,
              color: val.textColor ?? 'white',
            },
          ]}
        >
          {val.preference}
        </Text>
      </TouchableOpacity>
    ),
    [styles, Colors],
  );

  const GenerateButton = (
    <Button
      text="Get Activity"
      onPress={handleGenerate}
      variant="contained"
      icon={<Sparkle width={24} height={24} color={Colors.white} />}
       />
  );

  const EditPlanButton = (
    <Button
      text="Edit Plan"
      onPress={handleEditPlan}
      variant="contained"
      icon={<Ionicons name="create-outline" size={24} color={Colors.white} />}
    />
  );

  return (
    <>
      <BaseModal
        isVisible={isVisible}
        onClose={onClose}
        title="Get Your Workout Plan"
        buttons={[EditPlanButton, GenerateButton]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.modalTitle}>Toughness</Text>
            <Slider
              minimumTrackTintColor={Colors.primaryColor}
              maximumTrackTintColor={Colors.primaryColor}
              thumbTintColor={Colors.primaryColor}
              style={styles.slider}
              step={1}
              minimumValue={1}
              maximumValue={10}
              value={toughness}
              onValueChange={setToughness}
            />
            <View style={styles.sliderTagContainer}>
              {TOUGHNESS_LABEL.map(label => (
                <Text key={label} style={styles.sliderText}>
                  {label}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.modalTitle}>Preferences</Text>

            <View style={styles.customPreferenceContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Add your Preferences here..."
                placeholderTextColor={Colors.greyColor700}
                value={customPreference}
                onChangeText={setCustomPreference}
                onSubmitEditing={handleAddCustomPreference}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddCustomPreference}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={30} color="#aaa" />
              </TouchableOpacity>
            </View>

            <View style={styles.preferenceContainer}>
              {preferences.map((val, index) =>
                renderPreferencePill(val, index, handlePreferencePress),
              )}
            </View>
          </View>
        </ScrollView>
      </BaseModal>
      <InfoModal
        isVisible={isInfoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        description={'Something went wrong. Please try again.'}
        Colors={Colors}
      />
      <EditPlanModal
        isVisible={isEditModalVisible}
        onClose={handleCloseEditModal}
        selectedList={editPlanData}
        setSelectedList={setEditPlanData}
        savePlan={handleSavePlan}
      />
    </>
  );
};

const createStyle = (Colors: ColorScheme) =>
  StyleSheet.create({
    modalTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      letterSpacing: 0.3,
    },
    sliderText: {
      fontSize: 12,
      fontFamily: 'Nunito-Sans',
      color: Colors.greyColor700,
      letterSpacing: 0.3,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderTagContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    section: {
      paddingBottom: 20,
    },
    preferenceContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingTop: 10,
      gap: 10,
    },
    preferenceText: {
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: Colors.greyColor700,
      borderRadius: 30,
      textAlign: 'center',
      paddingHorizontal: 10,
      color: Colors.textColor,
    },
    customPreferenceContainer: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#aaa',
      borderRadius: 20,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10,
    },
    textInput: {
      flex: 1,
      paddingVertical: 12,
      color: Colors.textColor,
    },
     });

export default BuildWorkoutModal;
