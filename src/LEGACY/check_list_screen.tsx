import LinearGradient from '@/components/base/LinearGradient';
import { useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';

const ChatListcreen = (props: any) => {
  const [isChecked, setIsChecked] = useState(false);
  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };
  const [istwoChecked, settwoIsChecked] = useState(false);
  const toggletwoCheckbox = () => {
    settwoIsChecked(!istwoChecked);
  };
  const [isthreeChecked, setthreeIsChecked] = useState(false);
  const togglethreeCheckbox = () => {
    setthreeIsChecked(!isthreeChecked);
  };

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      <LinearGradient
        colors={[
          'rgba(33, 69, 123, 1)',
          'rgba(33, 69, 123, 0.9)',
          'rgba(33, 69, 123, 0.8)',
        ]}
        style={{
          height: 110,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      >
        <View style={{ height: 10 }} />
        <View style={{ flexDirection: 'row', marginHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{ flex: 1 }}
          >
            <Image
              source={require('./../assets/icons/close.png')}
              style={{ height: 28, width: 28 }}
            ></Image>
          </TouchableOpacity>
          <Image
            source={require('./../assets/icons/search.png')}
            style={{ height: 28, width: 28 }}
          ></Image>
          <View style={{ width: 10 }} />
          <Image
            source={require('./../assets/icons/more.png')}
            style={{ height: 28, width: 28 }}
          ></Image>
        </View>
        <View style={{ height: 15 }} />
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              // props.navigation.navigate('ChatScreen');
            }}
            style={[styles.nextButton, { backgroundColor: '#22467C' }]}
          >
            <Text style={[styles.nextButtonText, { color: 'white' }]}>
              Check in
            </Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity
            onPress={() => {
              // props.navigation.navigate('ChatScreen');
            }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Check list</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* <ScrollView style={{ marginHorizontal: 20 }}> */}
      <View style={{ marginHorizontal: 20 }}>
        <View style={{ height: 40 }} />
        <Text style={styles.chattextStyle}>Your checklist for the day</Text>
        <View style={{ height: 10 }} />
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.secondstyle}>Completed : </Text>
          <Text
            style={{
              backgroundColor: '#FFDDE8',
              paddingHorizontal: 7,
              borderRadius: 5,
              color: '#FE568D',
            }}
          >
            0
          </Text>
        </View>
        <View style={{ height: 40 }} />
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 50,
            backgroundColor: 'white',
            elevation: 5,
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            borderRadius: 10,
          }}
        >
          <CheckBox
            style={{ marginHorizontal: 10 }}
            onClick={() => {
              toggleCheckbox();
            }}
            isChecked={isChecked}
            leftText={'CheckBox'}
          />
          <Text style={styles.threestyle}>Do mindfulness exercise.</Text>
        </View>
        <View style={{ height: 20 }} />
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 50,
            backgroundColor: 'white',
            elevation: 5,
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            borderRadius: 10,
          }}
        >
          <CheckBox
            style={{ marginHorizontal: 10 }}
            onClick={() => {
              toggletwoCheckbox();
            }}
            isChecked={istwoChecked}
            leftText={'CheckBox'}
          />
          <Text style={styles.threestyle}>Take a short nap.</Text>
        </View>
        <View style={{ height: 20 }} />
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 50,
            backgroundColor: 'white',
            elevation: 5,
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            borderRadius: 10,
          }}
        >
          <CheckBox
            style={{ marginHorizontal: 10 }}
            onClick={() => {
              togglethreeCheckbox();
            }}
            isChecked={isthreeChecked}
            leftText={'CheckBox'}
          />
          <Text style={styles.threestyle}>Do a light workout.</Text>
        </View>
      </View>
      {/* </ScrollView> */}
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    nextButton: {
      borderRadius: 10,
      height: 42,
      width: '42%',
      justifyContent: 'center',
      alignSelf: 'center',
      alignItems: 'center',
      elevation: 5,
      backgroundColor: 'white',
    },
    nextButtonText: {
      color: '#22467C',
      fontFamily: 'Nunito-Bold',
      fontSize: 17,
      textAlign: 'center',
    },
    secondstyle: {
      color: '#45484C',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      alignSelf: 'flex-start',
    },
    threestyle: {
      color: '#00050A',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      alignSelf: 'center',
      alignItems: 'center',
    },
    chattextStyle: {
      color: '#00050A',
      fontSize: 20,
      fontFamily: 'Nunito-Bold',
    },
  });
};

export default ChatListcreen;
