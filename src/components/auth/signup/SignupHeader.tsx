import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SignupHeaderProps {
  headerStyle: any;
  onBack: () => void;
}

export const SignupHeader = ({ headerStyle, onBack }: SignupHeaderProps) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  
  return (
    <Reanimated.View style={[styles.headerSection, headerStyle]}>
      <Reanimated.View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.primaryColor}
          />
        </TouchableOpacity>
        <Reanimated.Text style={styles.headerTitle}>
          Join Skyp Health
        </Reanimated.Text>
        <View style={{ width: 24 }} />
      </Reanimated.View>
      <Reanimated.Text style={styles.headerSubtitle}>
        Create your account to start your health journey
      </Reanimated.Text>
    </Reanimated.View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.primaryColor}44`,
  },
  headerTitle: {
    fontSize: 22,
    color: Colors.textPrimaryColor,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
});
