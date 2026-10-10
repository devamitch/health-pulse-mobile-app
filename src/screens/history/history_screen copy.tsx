import React, { useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomMetricsCardModal from '../../components/CustomMetricsCardModal';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '../../hooks/themeHook';
import { logButtonTap } from '../../services/analyticsService';
import DaysTab from './days';
import MonthsTab from './months';
import WeeksTab from './weeks';
import ScreenLayout from '@/components/ui/layout';
import FilterIcon from '@/icons/filter-icon';import { IconButton } from '@/components/ui/buttons/button';
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

function HistoryScreen(props: any) {
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

  const renderHeaderContent = () => (
    <View style={styles.topTabContainerWrapper}>
      <Text style={styles.historyTitle}>HISTORY</Text>
      <View style={styles.topTabContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Your Trends</Text>
          <View style={{ flex: 1 }} />
          <IconButton
            onPress={async () => {
              setIsModalVisible(true);
            }}
            variant="light"
            icon={<FilterIcon width={24} height={24} color={Colors.primaryColor} />}
          />
        </View>
        <View style={{ height: 20 }} />
        <View style={styles.tabstyle}>
          <TouchableOpacity
            style={[
              styles.tabbox,
              {
                backgroundColor: index == '0' ? Colors.white : '#1857C1',
              },
            ]}
            onPress={async () => {
              setIndex('0');
              await logButtonTap('History Day');
            }}
          >
            <Text
              style={[
                styles.tabtext,
                {
                  color:
                    index == '0'
                      ? Colors.textColor
                      : Colors.isDark
                      ? 'white'
                      : Colors.white,
                },
              ]}
            >
              Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabbox,
              {
                backgroundColor: index == '1' ? Colors.white : '#1857C1',
              },
            ]}
            onPress={async () => {
              setIndex('1');
              await logButtonTap('History Weeks');
            }}
          >
            <Text
              style={[
                styles.tabtext,
                {
                  color:
                    index == '1'
                      ? Colors.textColor
                      : Colors.isDark
                      ? 'white'
                      : Colors.white,
                },
              ]}
            >
              Weeks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabbox,
              {
                backgroundColor: index == '2' ? Colors.white : '#1857C1',
              },
            ]}
            onPress={async () => {
              setIndex('2');
              await logButtonTap('History Months');
            }}
          >
            <Text
              style={[
                styles.tabtext,
                {
                  color:
                    index == '2'
                      ? Colors.textColor
                      : Colors.isDark
                      ? 'white'
                      : Colors.white,
                },
              ]}
            >
              Months
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle={'dark-content'} />

      <ScreenLayout
        headerContent={renderHeaderContent()}
        headerBackgroundColor="#1857C1"
        backgroundColor={Colors.backgroundColor}
        headerPaddingTop={20}
        headerHeight={130}
      >
        {index === '0' && <DaysTab {...props} checked={selectedChecked} />}
        {index === '1' && <WeeksTab {...props} checked={selectedChecked} />}
        {index === '2' && <MonthsTab {...props} checked={selectedChecked} />}
      </ScreenLayout>

      <CustomMetricsCardModal
        isModalVisible={isModalVisible}
        closeModal={closeModal}
        handleOk={handleOk}
        selectedChecked={selectedChecked}
      />
    </View>
  );
}

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },

    historyTitle: {
      color: 'white',
      fontFamily: FONT_FAMILIES.nunitoRegular,
      fontSize: 18,
    },
    headerText: {
      color: Colors.textColor,
      fontSize: 19,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      marginLeft: 5,
    },
    topTabContainerWrapper: {
      width: '90%',
      borderRadius: 20,
      margin: 20,
      flexDirection: 'column',
      paddingVertical: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topTabContainer: {
      width: '100%',
      marginTop: 20,
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      padding: 20,
      height: 150,
      ...DEffect,
    },
    header: {
      flexDirection: 'row',
      // paddingLeft: 5
    },
    imageStyle: {
      height: 25,
      width: 25,
      marginRight: 5,
      resizeMode: 'cover',
      tintColor: Colors.textPrimaryColor,
    },
    tabstyle: {
      flexDirection: 'row',
      width: '100%',
      height: 45,
      backgroundColor: '#1857C1',
      padding: 5,
      borderRadius: 30,
    },
    tabtext: {
      color: Colors.primaryColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
    tabbox: {
      flex: 1,
      borderRadius: 20,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      marginHorizontal: 0,
      marginVertical: 0,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
    },
    cancelText: {
      marginLeft: 10,
      fontSize: 16,
      color: Colors.textColor,
    },
    // Tooltip styles
    tooltipBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    tooltipContainer: {
      padding: 0,
      borderRadius: 8,
      backgroundColor: Colors.white,
    },
    tooltipContent: {
      padding: 16,
      minWidth: 200,
      maxWidth: 300,
    },
    tooltipTitle: {
      fontFamily: FONT_FAMILIES.nunitoBold,
      fontSize: 18,
      color: Colors.textColor,
      marginBottom: 8,
    },
    tooltipDescription: {
      fontFamily: FONT_FAMILIES.nunitoRegular,
      fontSize: 14,
      color: Colors.black,
      marginBottom: 16,
      lineHeight: 20,
    },
    tooltipButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tooltipButton: {
      backgroundColor: Colors.primaryColor,
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tooltipButtonText: {
      color: Colors.white,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      fontSize: 14,
    },
    skipButton: {
      backgroundColor: 'transparent',
    },
    skipButtonText: {
      color: Colors.textPrimaryColor,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      fontSize: 14,
    },
  });
};

export default HistoryScreen;