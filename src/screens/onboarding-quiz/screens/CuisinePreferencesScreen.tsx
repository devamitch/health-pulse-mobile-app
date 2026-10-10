import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';
import { useAppSelector } from '../../../services/mmkv-redux/hooks';
import { haptic } from '../../../utils';

interface CuisinePreferencesScreenProps {
  selectedCuisines: string[];
  setSelectedCuisines: (value: string[]) => void;
}

const CUISINE_OPTIONS = [
  { key: 'Italian', label: 'Italian' },
  { key: 'Indian', label: 'Indian' },
  { key: 'Japanese', label: 'Japanese' },
  { key: 'Mexican', label: 'Mexican' },
  { key: 'Chinese', label: 'Chinese' },
  { key: 'Turkish', label: 'Turkish' },
];

const CuisinePreferencesScreen: React.FC<CuisinePreferencesScreenProps> = ({
  selectedCuisines,
  setSelectedCuisines,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const { haptic_level } = useAppSelector(state => state.message);

  const handleCuisineToggle = (cuisine: string) => {
    haptic(haptic_level);
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <Text style={styles.question}>What are your favorite cuisines?</Text>
      <Text style={styles.subtitle}>Select all that apply</Text>

      <View style={styles.cuisineGrid}>
        {CUISINE_OPTIONS.map(cuisine => {
          const isSelected = selectedCuisines.includes(cuisine.key);
          return (
            <TouchableOpacity
              key={cuisine.key}
              style={[
                styles.cuisineCard,
                isSelected && styles.cuisineCardSelected,
              ]}
              onPress={() => handleCuisineToggle(cuisine.key)}
              activeOpacity={0.8}
            >
              <View style={styles.cuisineImageContainer}>
                <Image
                  source={require('../../../assets/icons/cuisine-icon.png')}
                  style={styles.cuisineImage}
                  resizeMode="cover"
                />
                {isSelected && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.cuisineLabelContainer}>
                <Text
                  style={[
                    styles.cuisineLabel,
                    isSelected && styles.cuisineLabelSelected,
                  ]}
                >
                  {cuisine.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
    },
    question: {
      fontSize: 22,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      alignSelf: 'flex-start',
      textAlign: 'left',
      marginBottom: 10,
      marginHorizontal: 20,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.greyColor700,
      textAlign: 'center',
      marginBottom: 30,
    },
    cuisineGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 15,
    },
    cuisineCard: {
      width: '30%',
      aspectRatio: 0.85,
      borderRadius: 15,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    cuisineCardSelected: {
      borderColor: Colors.primaryColor,
    },
    cuisineImageContainer: {
      flex: 1,
      position: 'relative',
      backgroundColor: Colors.greyColor200,
    },
    cuisineImage: {
      width: '100%',
      height: '100%',
    },
    selectedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.primaryColor + '4D',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmark: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkText: {
      color: Colors.white,
      fontSize: 24,
      fontFamily: FONT_FAMILIES.nunitoBold,
    },
    cuisineLabelContainer: {
      backgroundColor: Colors.white,
      paddingVertical: 8,
    },
    cuisineLabel: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      textAlign: 'center',
    },
    cuisineLabelSelected: {
      color: Colors.primaryColor,
      fontFamily: FONT_FAMILIES.nunitoBold,
    },
  });

export default CuisinePreferencesScreen;
