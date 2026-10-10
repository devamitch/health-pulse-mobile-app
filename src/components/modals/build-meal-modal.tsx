import { ColorScheme } from '@/constants/theme';
import BaseModal from './base-modal';
import {
  ColorValue,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '@/hooks/themeHook';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState, useMemo, useCallback } from 'react';
import Sparkle from '@/icons/sparkle';
import Button from '@/components/ui/buttons/button';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { Toast } from '@/utils/toast';
import { addPreference } from '@/services/mmkv-redux/slices';
import { Routine } from '@/services/mmkv-redux/slices';
import InfoModal from './info-alert-modal';
import EditPlanModal from './edit-plan-modal';

type Preference = {
  preference: string;
  isSelected?: boolean;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
};

type MealBuilderResult = {
  cost: string;
  fancyness: string;
  preferences: string[];
};

interface BuildMealModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGeneratePress?: (result: MealBuilderResult) => void;
  onEditPress?: () => void;
  existingMealsList?: Routine[];
}

const FANCYNESS_LABELS = ['Comfort', 'Regular', 'Fancy'];
const COST_LABELS = ['Budget', 'Normal', '5star'];

const MEAL_CATEGORIES = {
  CUISINES: {
    items: [
      'Indian',
      'Canadian',
      'Mediterranean',
      'Chinese',
      'Mexican',
      'Italian',
    ],
    color: '#76D176',
  },
  DIETARY: {
    items: ['Vegan', 'Vegetarian'],
    color: '#FFAF02',
  },
  PREPARATION: {
    items: ['Left-overs', '30min prep'],
    color: '#FE3219',
  },
};

const BuildMealModal: React.FC<BuildMealModalProps> = ({
  isVisible,
  onClose,
  onGeneratePress,
  onEditPress,
  existingMealsList,
}) => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const Diet = useAppSelector(
    state => state.message?.CategorisedPreferences?.Diet || [],
  );

  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editPlanData, setEditPlanData] = useState<Routine[]>([]);

  const [cost, setCost] = useState(1);
  const [fancyness, setFancyness] = useState(1);
  const [selectedDietPreferences, setSelectedDietPreferences] = useState<
    string[]
  >([]);
  const [customPreference, setCustomPreference] = useState('');

  const preferences: Preference[] = useMemo(() => {
    const mealTypes: Preference[] = [];
    const searchTerm = customPreference.toLowerCase().trim();

    // Add meal category items
    Object.values(MEAL_CATEGORIES).forEach(category => {
      category.items.forEach(item => {
        if (!searchTerm || item.toLowerCase().includes(searchTerm)) {
          mealTypes.push({
            preference: item,
            isSelected: selectedDietPreferences.includes(item),
            backgroundColor: category.color,
            textColor: 'white',
          });
        }
      });
    });

    // Add diet preferences
    const dietPreferences: Preference[] = Diet.filter(
      val => !searchTerm || val.toLowerCase().includes(searchTerm),
    ).map(val => ({
      preference: val,
      isSelected: selectedDietPreferences.includes(val),
    }));

    return [...mealTypes, ...dietPreferences];
  }, [Diet, selectedDietPreferences, customPreference]);

  const handlePreferencePress = useCallback((val: string) => {
    setSelectedDietPreferences(prev =>
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val],
    );
  }, []);

  const handleAddDietPreference = useCallback(
    (val: string) => {
      const trimmedVal = val.trim();
      if (!trimmedVal) {
        Toast('Please enter a valid preference');
        return;
      }

      // Check if already exists in Diet
      if (Diet.includes(trimmedVal)) {
        Toast('Item already in the list');
        // Still select it if not already selected
        if (!selectedDietPreferences.includes(trimmedVal)) {
          handlePreferencePress(trimmedVal);
        }
        return;
      }

      // Check if already exists in meal categories
      const existsInCategories = Object.values(MEAL_CATEGORIES).some(category =>
        category.items.some(
          item => item.toLowerCase() === trimmedVal.toLowerCase(),
        ),
      );

      if (existsInCategories) {
        Toast('Item already exists');
        if (!selectedDietPreferences.includes(trimmedVal)) {
          handlePreferencePress(trimmedVal);
        }
        return;
      }

      // Add new preference
      dispatch(
        addPreference({
          preference: trimmedVal,
          category: 'Diet',
        }),
      );

      // Auto-select the new preference
      if (!selectedDietPreferences.includes(trimmedVal)) {
        handlePreferencePress(trimmedVal);
      }
    },
    [Diet, selectedDietPreferences, dispatch, handlePreferencePress],
  );

  const handleAddCustomPreference = useCallback(() => {
    if (customPreference.trim()) {
      handleAddDietPreference(customPreference);
      setCustomPreference('');
    }
  }, [customPreference, handleAddDietPreference]);

  const handleGenerate = useCallback(() => {
    // Validation
    if (selectedDietPreferences.length === 0) {
      setInfoModalMessage('Please select at least one preference');
      setInfoModalVisible(true);
      return;
    }

    try {
      onGeneratePress?.({
        cost: `${cost} of 10`,
        fancyness: `${fancyness} of 10`,
        preferences: selectedDietPreferences,
      });
      onClose();
    } catch (error) {
      console.error('Error generating meal:', error);
      setInfoModalMessage('Something went wrong. Please try again.');
      setInfoModalVisible(true);
    }
  }, [cost, fancyness, selectedDietPreferences, onGeneratePress, onClose]);

  const handleEditPlan = useCallback(() => {
    if (onEditPress) {
      onEditPress();
      onClose();
    } else {
      setEditPlanData(existingMealsList ? [...existingMealsList] : []);
      setEditModalVisible(true);
    }
  }, [onEditPress, existingMealsList, onClose]);

  const handleSavePlan = useCallback((updatedList: Routine[]) => {
    setEditPlanData(updatedList);
    setEditModalVisible(false);
    Toast('Plan updated successfully');
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
  }, []);

  const handleCloseInfoModal = useCallback(() => {
    setInfoModalVisible(false);
    setInfoModalMessage('');
  }, []);

  const renderSliderLabels = useCallback(
    (labels: string[]) => (
      <View style={styles.sliderTagContainer}>
        {labels.map(val => (
          <Text key={val} style={styles.sliderText}>
            {val}
          </Text>
        ))}
      </View>
    ),
    [styles],
  );

  const GenerateButton = (
    <Button
      text="Generate Meal"
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
        title="Build Your Perfect Meal"
        buttons={[EditPlanButton, GenerateButton]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.modalTitle}>Fancyness</Text>
            <Slider
              minimumTrackTintColor={Colors.primaryColor}
              maximumTrackTintColor={Colors.primaryColor}
              thumbTintColor={Colors.primaryColor}
              style={styles.slider}
              step={1}
              minimumValue={1}
              maximumValue={5}
              value={fancyness}
              onValueChange={setFancyness}
            />
            {renderSliderLabels(FANCYNESS_LABELS)}
          </View>

          <View style={styles.section}>
            <Text style={styles.modalTitle}>Cost</Text>
            <Slider
              minimumTrackTintColor={Colors.primaryColor}
              maximumTrackTintColor={Colors.primaryColor}
              thumbTintColor={Colors.primaryColor}
              style={styles.slider}
              step={1}
              minimumValue={1}
              maximumValue={5}
              value={cost}
              onValueChange={setCost}
            />
            {renderSliderLabels(COST_LABELS)}
          </View>

          <View style={styles.section}>
            <Text style={styles.modalTitle}>Your Preferences</Text>
            <View style={styles.preferenceContainer}>
              {preferences.length > 0 ? (
                preferences.map((val, index) => (
                  <TouchableOpacity
                    key={`${val.preference}-${index}`}
                    onPress={() => handlePreferencePress(val.preference)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.preferenceText,
                        val.isSelected && {
                          backgroundColor:
                            val.backgroundColor ?? Colors.primaryColor,
                          borderColor:
                            val.backgroundColor ?? Colors.primaryColor,
                          color: val.textColor ?? 'white',
                        },
                      ]}
                    >
                      {val.preference}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>
                  No preferences found. Add your own below!
                </Text>
              )}
            </View>
          </View>

          <View style={styles.customPreferenceContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Search or add your preference"
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
        </ScrollView>
      </BaseModal>

      <EditPlanModal
        isVisible={isEditModalVisible}
        onClose={handleCloseEditModal}
        selectedList={editPlanData}
        setSelectedList={setEditPlanData}
        savePlan={handleSavePlan}
      />

      <InfoModal
        isVisible={isInfoModalVisible}
        onClose={handleCloseInfoModal}
        description={
          infoModalMessage || 'Something went wrong. Please try again.'
        }
        Colors={Colors}
      />
    </>
  );
};

const createStyles = (Colors: ColorScheme) =>
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
    noResultsText: {
      fontSize: 14,
      fontFamily: 'Nunito-Sans',
      color: Colors.greyColor700,
      fontStyle: 'italic',
      paddingVertical: 10,
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
    },
    textInput: {
      flex: 1,
      paddingVertical: 12,
      color: Colors.textColor,
    },
    buttonText: {
      fontFamily: 'Nunito-Sans',
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.3,
      textAlign: 'center',
      color: 'white',
    },
    buttonStyle: {
      width: '49%',
      backgroundColor: Colors.primaryColor,
      paddingVertical: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 40,
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },
  });

export default BuildMealModal;
