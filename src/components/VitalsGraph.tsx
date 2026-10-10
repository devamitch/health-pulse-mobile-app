import { VitalIcon, VitalIconType } from '@/assets/svg/vitals-icon';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { MutableRefObject } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

interface VitalsGraphProps {
  vitalText?: string;
  scrollRef?: MutableRefObject<any>;
  index?: number;
  vitalData?: any;
  unit?: string | undefined;
  onArrowPress?: () => void;
  onGraphMarkPress?: (params: any) => any;
}

const VitalsGraph: React.FC<VitalsGraphProps> = ({
  vitalText = 'Vital Text',
  scrollRef,
  index,
  vitalData,
  unit,
  onArrowPress,
  onGraphMarkPress,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const safeParseFloat = (value: any) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <View style={styles.graphContainer}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.contentLabelWrapper}>
          <VitalIcon vital={vitalText as VitalIconType} height={30} width={30}/>
          <Text style={styles.textstyle}>{vitalText}</Text>
        </View>
        <TouchableOpacity onPress={onArrowPress}>
          <View style={styles.arrowButton}>
            <Image
              source={require('./../assets/icons/arrows.png')}
              style={styles.arrowIcon}
            ></Image>
          </View>
        </TouchableOpacity>
      </View>
      <BarChart
        scrollRef={scrollRef}
        scrollToIndex={index}
        height={100}
        width={width / 1.4}
        barWidth={7}
        spacing={25}
        noOfSections={1}
        barBorderRadius={6}
        yAxisTextStyle={{
          color: 'transparent',
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: Colors.greyColor700,
          fontSize: 10,
          width: width,
        }}
        dashWidth={0}
        stackData={vitalData?.data?.graphResult ?? []}
        endSpacing={10}
        maxValue={300}
        yAxisColor={'transparent'}
        xAxisColor={Colors.greyColor}
        backgroundColor={'transparent'}
        onPress={onGraphMarkPress}
      />
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={require('./../assets/icons/trending_down.png')}
              style={styles.infoIcon}
            ></Image>
            <Text style={styles.lowsmalltextstyle}> MIN :</Text>
          </View>
          <Text style={styles.lowtextstyle}>
            {vitalData?.data?.low} {unit}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={require('./../assets/icons/trending_flat.png')}
              style={styles.infoIcon}
            ></Image>
            <Text style={styles.lowsmalltextstyle}> AVG :</Text>
          </View>
          <Text style={styles.lowtextstyle}>
            {safeParseFloat(vitalData?.data?.average).toFixed(2)} {unit}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={require('./../assets/icons/trending_up.png')}
              style={styles.infoIcon}
            ></Image>
            <Text style={styles.lowsmalltextstyle}> MAX :</Text>
          </View>
          <Text style={styles.lowtextstyle}>
            {vitalData?.data?.high} {unit}
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    graphContainer: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      width: '90%',
      marginHorizontal: 20,
      ...DEffect,
    },
    contentLabelWrapper: {
      marginLeft: 15,
      marginTop: 10,
      flexDirection: 'row',
      flex: 1,
    },
    contentIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 19,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      flex: 1,
    },
    arrowButton: {
      padding: 10,
      backgroundColor: Colors.white,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 10,
      ...DEffect,
    },
    arrowIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: Colors.textColor,
    },
    infoContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-around',
      marginBottom: 15,
      marginTop: 10,
    },
    infoBox: {
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'center',
    },
    infoIcon: {
      height: 15,
      width: 15,
      tintColor: Colors.textColor,
    },
    lowsmalltextstyle: {
      color: Colors.textColor,
      fontSize: 10,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    lowtextstyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
  });
};

export default VitalsGraph;
