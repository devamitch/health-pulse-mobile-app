import SettingsLayout from '@/components/ui/settings-layout';
import HapticModal from '@/components/modals/haptic-modal';
import PhonePreview from '@/components/profile/phone-preview';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/themeHook';
import { useAppDispatch, useAppSelector } from '../../../services/mmkv-redux/hooks';
import {
  setColorScheme,
  updateHaptics,
} from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONT_FAMILIES } from '@/constants/typography';

const ThemeScreen = (props: any) => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { colorScheme } = useAppSelector(state => state.theme);
  const { haptic_level } = useAppSelector(state => state.message);
  const styles = createStyle(Colors);

  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(colorScheme);
  const [isHapticModalVisible, setHapticModalVisible] = useState(false);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    await haptic(haptic_level);
    setSelectedTheme(theme);
    dispatch(setColorScheme(theme));
  };

  const handleHapticChange = async (level: number) => {
    await haptic(level);
    dispatch(updateHaptics(level));
    setHapticModalVisible(false);
  };

  const getHapticLabel = () => {
    if (haptic_level === 0) return 'Off';
    if (haptic_level === 10) return 'Light';
    if (haptic_level === 20) return 'Medium';
    if (haptic_level === 40) return 'Heavy';
    return 'Medium';
  };

  return (
    <SettingsLayout
      heading="App Appearance"
      subtitle="Customize your app's look and feel"
      onBackPress={() => props.navigation.goBack()}
    >
      <View style={styles.container}>
        {/* THEME Section */}
        <Text style={styles.sectionTitle}>THEME</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Mode</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                selectedTheme === 'light' && styles.selectedThemeOption,
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <PhonePreview theme="light" />
              <Text style={styles.themeLabel}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                selectedTheme === 'dark' && styles.selectedThemeOption,
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <PhonePreview theme="dark" />
              <Text style={styles.themeLabel}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                selectedTheme === 'system' && styles.selectedThemeOption,
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <PhonePreview theme="system" />
              <Text style={styles.themeLabel}>System</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HAPTICS Section */}
        <Text style={styles.sectionTitle}>HAPTICS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              haptic(haptic_level);
              setHapticModalVisible(true);
            }}
          >
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{getHapticLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textColor} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <HapticModal
        visible={isHapticModalVisible}
        currentLevel={haptic_level}
        onClose={() => setHapticModalVisible(false)}
        onSelect={handleHapticChange}
        Colors={Colors}
      />
    </SettingsLayout>
  );
};

const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      letterSpacing: 0.5,
      marginTop: 20,
      marginBottom: 10,
    },
    card: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 20,
    },
    cardLabel: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      marginBottom: 15,
    },
    themeOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    themeOption: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedThemeOption: {
      borderColor: '#1857C1',
    },
    themeLabel: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textColor,
      marginTop: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    settingLabel: {
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textColor,
    },
    settingValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    settingValueText: {
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.greyColor600,
    },
  });
};

export default ThemeScreen;
