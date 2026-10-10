import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

const PasswordChangedScreen = ({ navigation }: any) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/images/tick.png')}
            style={styles.image}
          />
        </View>

        <Text style={styles.heading}>Password Changed!</Text>
        <Text style={styles.subheading}>
          Your password has been changed successfully.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginScreen')}
      >
        <Text style={styles.buttonText}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  checkmarkContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  heading: {
    fontSize: 30,
    marginBottom: 8,
    color: Colors.textPrimaryColor,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  subheading: {
    width: 200,
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  button: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

export default PasswordChangedScreen;
