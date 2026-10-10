import LinearGradient from '@/components/base/LinearGradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomMetricsCardModal from '../components/CustomMetricsCardModal';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';
import DailyScreen from './daily_screen';
import MonthyScreen from './monthy_screen';
import YearlyScreen from './yearly_screen';

const { width, height } = Dimensions.get('window');

function MyTabs(props: any) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = React.useState('0');
  const [selectedChecked, setSelectedChecked] = React.useState('2');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const handleOk = (value: string) => {
    setIsModalVisible(false);
    setSelectedChecked(value);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.mainContainer}>
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      <View style={{ height: 170 + insets.top }}>
        <LinearGradient
          colors={[Colors.gradientColor1, Colors.gradientColor2]}
          style={[styles.linearGradient, { height: 90 + insets.top }]}
        />
        <View style={styles.topTabContainer}>
          <View style={styles.header}>
            <Text style={styles.textstyle}>Your Trends</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(true);
              }}
            >
              <Image
                source={require('./../assets/icons/filter.png')}
                style={styles.imageStyle}
              ></Image>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.tabstyle}>
            <TouchableOpacity
              style={[
                styles.tabbox,
                {
                  backgroundColor:
                    index == '0' ? Colors.white : Colors.primaryColor,
                },
              ]}
              onPress={() => {
                setIndex('0');
              }}
            >
              <Text
                style={[
                  styles.tabtext,
                  { color: index == '0' ? Colors.primaryColor : Colors.white },
                ]}
              >
                DAILY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabbox,
                {
                  backgroundColor:
                    index == '1' ? Colors.white : Colors.primaryColor,
                },
              ]}
              onPress={() => {
                setIndex('1');
              }}
            >
              <Text
                style={[
                  styles.tabtext,
                  { color: index == '1' ? Colors.primaryColor : Colors.white },
                ]}
              >
                MONTHLY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabbox,
                {
                  backgroundColor:
                    index == '2' ? Colors.white : Colors.primaryColor,
                },
              ]}
              onPress={() => {
                setIndex('2');
              }}
            >
              <Text
                style={[
                  styles.tabtext,
                  { color: index == '2' ? Colors.primaryColor : Colors.white },
                ]}
              >
                YEARLY
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {index === '0' && <DailyScreen {...props} checked={selectedChecked} />}
        {index === '1' && <MonthyScreen {...props} checked={selectedChecked} />}
        {index === '2' && <YearlyScreen {...props} checked={selectedChecked} />}
      </View>
      <CustomMetricsCardModal
        isModalVisible={isModalVisible}
        closeModal={closeModal}
        handleOk={handleOk}
        selectedChecked={selectedChecked}
      />
      {/* <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.container}>
                            <View style={styles.radioButtonWrapper}>
                                <RadioButton
                                    value="0"
                                    status={checked === '0' ? 'checked' : 'unchecked'}
                                    onPress={() => setChecked('0')}
                                    uncheckedColor={Colors.blueColor600}
                                    color={Colors.blueColor600}
                                />
                                <Text style={styles.modeltextStyle}>Metrics</Text>
                            </View>
                            <Divider style={styles.dividerStyle}></Divider>
                            <View style={styles.radioButtonWrapper}>
                                <RadioButton
                                    value="1"
                                    status={checked === '1' ? 'checked' : 'unchecked'}
                                    onPress={() => setChecked('1')}
                                    uncheckedColor={Colors.blueColor600}
                                    color={Colors.blueColor600}
                                />
                                <Text style={styles.modeltextStyle}>Card</Text>
                            </View>
                            <Divider style={styles.dividerStyle}></Divider>
                            <View style={styles.radioButtonWrapper}>
                                <RadioButton
                                    value="2"
                                    status={checked === '2' ? 'checked' : 'unchecked'}
                                    onPress={() => setChecked('2')}
                                    uncheckedColor={Colors.blueColor600}
                                    color={Colors.blueColor600}
                                />
                                <Text style={styles.modeltextStyle}>Reset</Text>
                            </View>
                            <View style={styles.buttonWrapper}>
                                <TouchableOpacity onPress={handleOk} style={styles.buttonStyle}>
                                    <Text style={styles.buttonText}>OK</Text>
                                </TouchableOpacity>
                                <View style={{ width: 10 }} />
                                <TouchableOpacity onPress={closeModal} style={styles.buttonStyle}>
                                    <Text style={styles.buttonText}>CANCEL</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal> */}
    </View>
  );
}

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    linearGradient: {
      height: 110,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    dividerStyle: {
      height: 1,
      width: width / 1.3,
      alignSelf: 'center',
      marginVertical: 10,
      backgroundColor: Colors.greyColor,
    },
    modeltextStyle: {
      color: Colors.blueColor600,
      fontSize: 17,
      fontFamily: 'Nunito-Medium',
      alignSelf: 'center',
      marginLeft: 10,
      letterSpacing: 0.7,
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    textstyle: {
      color: 'black',
      fontSize: 19,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    topTabContainer: {
      position: 'absolute',
      bottom: 0,
      width: '90%',
      borderRadius: 20,
      backgroundColor: 'white',
      margin: 20,
      flexDirection: 'column',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    container: {
      width: '90%',
      borderRadius: 20,
      backgroundColor: 'white',
      margin: 20,
      flexDirection: 'column',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      paddingLeft: 5,
    },
    imageStyle: {
      height: 25,
      width: 25,
      marginRight: 5,
      resizeMode: 'cover',
      tintColor: Colors.primaryColor,
    },
    tabstyle: {
      flexDirection: 'row',
      width: '100%',
      height: 45,
      backgroundColor: Colors.primaryColor,
      padding: 5,
      borderRadius: 20,
    },
    tabtext: {
      color: Colors.primaryColor,
    },
    tabbox: {
      borderRadius: 15,
      height: 35,
      justifyContent: 'center',
      width: '33%',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    radioButtonWrapper: {
      flexDirection: 'row',
      paddingLeft: 10,
      alignItems: 'flex-start',
    },
    buttonWrapper: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonStyle: {
      height: 40,
      width: 100,
      backgroundColor: Colors.primaryColor,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontWeight: '700',
      color: Colors.white,
    },
  });
};

export default MyTabs;
