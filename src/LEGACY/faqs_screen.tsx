import LinearGradient from '@/components/base/LinearGradient';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';

const FAQsScreen = (props: any) => {
  const insets = useSafeAreaInsets();

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const [data, setData] = useState([
    { title: 'How can i submit a refund request?', expanded: false },
    { title: 'How can i submit a refund request?', expanded: false },
    { title: 'When will i receive my refund?', expanded: false },
    { title: 'Why was my refund request denied?', expanded: false },
    { title: 'What is a “credit refund”?', expanded: false },
    { title: 'How to Find Your Missing Product?', expanded: false },
    { title: 'How to Find Your Missing Product?', expanded: false },
  ]);

  const toggleExpand = (index: any) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index].expanded = !newData[index].expanded;
      return newData;
    });
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity onPress={() => toggleExpand(index)}>
      <View
        style={[
          styles.expandedContainer,
          { borderColor: item.expanded ? Colors.textPrimaryColor : '#888' },
        ]}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={[
              styles.textstyle,
              {
                color: item.expanded
                  ? Colors.textPrimaryColor
                  : Colors.textColor,
              },
            ]}
          >
            {item.title}
          </Text>
          {item.expanded ? (
            <Image
              source={require('./../assets/icons/up.png')}
              style={styles.expandedIcon}
            ></Image>
          ) : (
            <Image
              source={require('./../assets/icons/down.png')}
              style={[styles.expandedIcon, { alignSelf: 'center' }]}
            ></Image>
          )}
        </View>
        {item.expanded && (
          <Text style={styles.expandtextstyle}>
            make a type specimen book. It has survived not only five centuries,
            but also the leap into electronic typesetting, remaining essentially
            unchanged. It was popularised in the 1960s with the release of
            Letraset sheets
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
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
          <Text style={styles.secondstyle}>Privacy Policy</Text>
        </View>
      </LinearGradient>
      <ScrollView>
        <View style={{ height: 20 }} />
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
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
    backIcon: {
      height: 30,
      width: 30,
    },
    expandedContainer: {
      padding: 10,
      marginVertical: 5,
      borderWidth: 1,
      marginHorizontal: 20,
      borderRadius: 20,
    },
    expandedIcon: {
      height: 15,
      width: 15,
      tintColor: '#888',
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 15,
      fontFamily: 'Nunito-Bold',
      textAlign: 'left',
      letterSpacing: 0.8,
      flex: 1,
    },
    expandtextstyle: {
      color: Colors.textColor,
      fontSize: 15,
      fontFamily: 'Nunito-Medium',
      textAlign: 'left',
      letterSpacing: 0.8,
      flex: 1,
    },
    secondstyle: {
      color: 'white',
      fontSize: 20,
      left: 10,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
  });
};

export default FAQsScreen;
