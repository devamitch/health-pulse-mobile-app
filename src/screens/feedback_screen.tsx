import LinearGradient from '@/components/base/LinearGradient';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';
import Button from '@/components/ui/buttons/button';

const { width } = Dimensions.get('window');

const FeedBackScreen = (props: any) => {
  const insets = useSafeAreaInsets();

  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  return (
    <View style={styles.mainContainer}>
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      <ScrollView>
        <LinearGradient
          colors={[Colors.gradientColor1, Colors.gradientColor2]}
          style={[styles.linearGradient, { height: 70 + insets.top }]}
        >
          <SafeAreaView />
          <View style={styles.backButtonWrapper}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              {Platform.OS === 'ios' ? (
                <Ionicons name="chevron-back" size={26} color={Colors.white} />
              ) : (
                <Image
                  source={require('./../assets/icons/back.png')}
                  style={{ height: 30, width: 30 }}
                ></Image>
              )}
            </TouchableOpacity>
            <Text style={styles.secondstyle}>Give Feedback</Text>
          </View>
        </LinearGradient>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>How Would You Rate Your Experience</Text>
        <View style={{ height: 20 }} />
        <Image
          source={require('@/assets/images/emojis.png')}
          style={styles.emojiImage}
        ></Image>
        <View style={{ height: 20 }} />
        <Text style={styles.textstyle}>
          Would You tell us a little more about Your Experience.
        </Text>
        <View style={{ height: 20 }} />
        <View style={styles.dividerStyle}></View>
        <View style={styles.rowMargin20}>
          <Text style={styles.contentContainerTextStyle}>Delivery Time</Text>
          <Image
            source={require('./../assets/icons/like.png')}
            style={styles.iconStyle}
          ></Image>
          <View style={{ width: 10 }} />
          <Image
            source={require('./../assets/icons/dislike.png')}
            style={styles.iconStyle}
          ></Image>
        </View>
        <View style={styles.dividerStyle}></View>
        <View style={styles.rowMargin20}>
          <Text style={styles.contentContainerTextStyle}>Product Quality</Text>
          <Image
            source={require('./../assets/icons/like.png')}
            style={styles.iconStyle}
          ></Image>
          <View style={{ width: 10 }} />
          <Image
            source={require('./../assets/icons/dislike.png')}
            style={styles.iconStyle}
          ></Image>
        </View>
        <View style={styles.dividerStyle}></View>
        <View style={styles.rowMargin20}>
          <Text style={styles.contentContainerTextStyle}>Customer Service</Text>
          <Image
            source={require('./../assets/icons/like.png')}
            style={styles.iconStyle}
          ></Image>
          <View style={{ width: 10 }} />
          <Image
            source={require('./../assets/icons/dislike.png')}
            style={styles.iconStyle}
          ></Image>
        </View>
        <View style={styles.dividerStyle}></View>
        <View style={{ height: 10 }} />
        <Text style={styles.threestyle}>Comment</Text>
        <View style={{ height: 10 }} />
        <TextInput multiline={true} numberOfLines={10} style={styles.input} />
        <View style={{ height: 30 }} />
        <Button
          onPress={() => {
            props.navigation.navigate('PersonalInfoScreen');
          }}
          text="Submit"
          variant="contained"
        />
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    linearGradient: {
      height: 80,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    backButtonWrapper: {
      flexDirection: 'row',
      marginTop: 20,
      marginHorizontal: 20,
    },
    rowMargin20: {
      flexDirection: 'row',
      marginHorizontal: 20,
    },
    backIcon: {
      height: 30,
      width: 30,
    },
    emojiImage: {
      height: 30,
      width: width / 1.1,
      alignSelf: 'center',
      resizeMode: 'contain',
    },
    dividerStyle: {
      height: 1.5,
      width: '90%',
      alignSelf: 'center',
      marginVertical: 10,
      backgroundColor: Colors.greyColor,
    },
    iconStyle: {
      height: 20,
      width: 20,
      alignSelf: 'center',
      alignItems: 'center',
      resizeMode: 'contain',
      tintColor: Colors.primaryColor,
    },
    contentContainerTextStyle: {
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: 'Nunito-Medium',
      alignSelf: 'center',
      letterSpacing: 0.7,
      flex: 1,
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 16,
      marginHorizontal: 20,
      fontFamily: 'Nunito-Bold',
      textAlign: 'justify',
      letterSpacing: 0.8,
    },
    secondstyle: {
      color: 'white',
      fontSize: 20,
      left: 10,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    threestyle: {
      color: Colors.textColor,
      fontSize: 20,
      marginHorizontal: 20,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    input: {
      borderColor: Colors.textColor,
      borderWidth: 2,
      paddingHorizontal: 10,
      marginBottom: 20,
      width: 350,
      borderRadius: 5,
      textAlignVertical: 'top',
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      height: '35%',
    },
  });
};

export default FeedBackScreen;
