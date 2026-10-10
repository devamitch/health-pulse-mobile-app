import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import Button from '@/components/ui/buttons/button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ColorScheme } from '../../../../constants/theme';
import { useAppTheme } from '../../../../hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../../services/mmkv-redux/slices';
import { haptic } from '../../../../utils';
import { Toast } from '../../../../utils/toast';

const countryData = [
  { key: 'Prefer not to say', value: 'Prefer not to say' },
  { key: 'United States', value: 'United States' },
  { key: 'Canada', value: 'Canada' },
  { key: 'Afghanistan', value: 'Afghanistan' },
  { key: 'Albania', value: 'Albania' },
  { key: 'Algeria', value: 'Algeria' },
  { key: 'Andorra', value: 'Andorra' },
  { key: 'Angola', value: 'Angola' },
  { key: 'Antigua and Barbuda', value: 'Antigua and Barbuda' },
  { key: 'Argentina', value: 'Argentina' },
  { key: 'Armenia', value: 'Armenia' },
  { key: 'Australia', value: 'Australia' },
  { key: 'Austria', value: 'Austria' },
  { key: 'Azerbaijan', value: 'Azerbaijan' },
  { key: 'Bahamas', value: 'Bahamas' },
  { key: 'Bahrain', value: 'Bahrain' },
  { key: 'Bangladesh', value: 'Bangladesh' },
  { key: 'Barbados', value: 'Barbados' },
  { key: 'Belarus', value: 'Belarus' },
  { key: 'Belgium', value: 'Belgium' },
  { key: 'Belize', value: 'Belize' },
  { key: 'Benin', value: 'Benin' },
  { key: 'Bhutan', value: 'Bhutan' },
  { key: 'Bolivia', value: 'Bolivia' },
  { key: 'Bosnia and Herzegovina', value: 'Bosnia and Herzegovina' },
  { key: 'Botswana', value: 'Botswana' },
  { key: 'Brazil', value: 'Brazil' },
  { key: 'Brunei', value: 'Brunei' },
  { key: 'Bulgaria', value: 'Bulgaria' },
  { key: 'Burkina Faso', value: 'Burkina Faso' },
  { key: 'Burundi', value: 'Burundi' },
  { key: 'Cabo Verde', value: 'Cabo Verde' },
  { key: 'Cambodia', value: 'Cambodia' },
  { key: 'Cameroon', value: 'Cameroon' },
  { key: 'Central African Republic', value: 'Central African Republic' },
  { key: 'Chad', value: 'Chad' },
  { key: 'Chile', value: 'Chile' },
  { key: 'China', value: 'China' },
  { key: 'Colombia', value: 'Colombia' },
  { key: 'Comoros', value: 'Comoros' },
  { key: 'Congo (Congo-Brazzaville)', value: 'Congo (Congo-Brazzaville)' },
  { key: 'Costa Rica', value: 'Costa Rica' },
  { key: 'Croatia', value: 'Croatia' },
  { key: 'Cuba', value: 'Cuba' },
  { key: 'Cyprus', value: 'Cyprus' },
  { key: 'Czechia (Czech Republic)', value: 'Czechia (Czech Republic)' },
  { key: 'Denmark', value: 'Denmark' },
  { key: 'Djibouti', value: 'Djibouti' },
  { key: 'Dominica', value: 'Dominica' },
  { key: 'Dominican Republic', value: 'Dominican Republic' },
  { key: 'Ecuador', value: 'Ecuador' },
  { key: 'Egypt', value: 'Egypt' },
  { key: 'El Salvador', value: 'El Salvador' },
  { key: 'Equatorial Guinea', value: 'Equatorial Guinea' },
  { key: 'Eritrea', value: 'Eritrea' },
  { key: 'Estonia', value: 'Estonia' },
  { key: 'Eswatini (Swaziland)', value: 'Eswatini (Swaziland)' },
  { key: 'Ethiopia', value: 'Ethiopia' },
  { key: 'Fiji', value: 'Fiji' },
  { key: 'Finland', value: 'Finland' },
  { key: 'France', value: 'France' },
  { key: 'Gabon', value: 'Gabon' },
  { key: 'Gambia', value: 'Gambia' },
  { key: 'Georgia', value: 'Georgia' },
  { key: 'Germany', value: 'Germany' },
  { key: 'Ghana', value: 'Ghana' },
  { key: 'Greece', value: 'Greece' },
  { key: 'Grenada', value: 'Grenada' },
  { key: 'Guatemala', value: 'Guatemala' },
  { key: 'Guinea', value: 'Guinea' },
  { key: 'Guinea-Bissau', value: 'Guinea-Bissau' },
  { key: 'Guyana', value: 'Guyana' },
  { key: 'Haiti', value: 'Haiti' },
  { key: 'Honduras', value: 'Honduras' },
  { key: 'Hungary', value: 'Hungary' },
  { key: 'Iceland', value: 'Iceland' },
  { key: 'India', value: 'India' },
  { key: 'Indonesia', value: 'Indonesia' },
  { key: 'Iran', value: 'Iran' },
  { key: 'Iraq', value: 'Iraq' },
  { key: 'Ireland', value: 'Ireland' },
  { key: 'Israel', value: 'Israel' },
  { key: 'Italy', value: 'Italy' },
  { key: 'Jamaica', value: 'Jamaica' },
  { key: 'Japan', value: 'Japan' },
  { key: 'Jordan', value: 'Jordan' },
  { key: 'Kazakhstan', value: 'Kazakhstan' },
  { key: 'Kenya', value: 'Kenya' },
  { key: 'Kiribati', value: 'Kiribati' },
  { key: 'Kuwait', value: 'Kuwait' },
  { key: 'Kyrgyzstan', value: 'Kyrgyzstan' },
  { key: 'Laos', value: 'Laos' },
  { key: 'Latvia', value: 'Latvia' },
  { key: 'Lebanon', value: 'Lebanon' },
  { key: 'Lesotho', value: 'Lesotho' },
  { key: 'Liberia', value: 'Liberia' },
  { key: 'Libya', value: 'Libya' },
  { key: 'Liechtenstein', value: 'Liechtenstein' },
  { key: 'Lithuania', value: 'Lithuania' },
  { key: 'Luxembourg', value: 'Luxembourg' },
  { key: 'Madagascar', value: 'Madagascar' },
  { key: 'Malawi', value: 'Malawi' },
  { key: 'Malaysia', value: 'Malaysia' },
  { key: 'Maldives', value: 'Maldives' },
  { key: 'Mali', value: 'Mali' },
  { key: 'Malta', value: 'Malta' },
  { key: 'Marshall Islands', value: 'Marshall Islands' },
  { key: 'Mauritania', value: 'Mauritania' },
  { key: 'Mauritius', value: 'Mauritius' },
  { key: 'Mexico', value: 'Mexico' },
  { key: 'Micronesia', value: 'Micronesia' },
  { key: 'Moldova', value: 'Moldova' },
  { key: 'Monaco', value: 'Monaco' },
  { key: 'Mongolia', value: 'Mongolia' },
  { key: 'Montenegro', value: 'Montenegro' },
  { key: 'Morocco', value: 'Morocco' },
  { key: 'Mozambique', value: 'Mozambique' },
  { key: 'Myanmar (Burma)', value: 'Myanmar (Burma)' },
  { key: 'Namibia', value: 'Namibia' },
  { key: 'Nauru', value: 'Nauru' },
  { key: 'Nepal', value: 'Nepal' },
  { key: 'Netherlands', value: 'Netherlands' },
  { key: 'New Zealand', value: 'New Zealand' },
  { key: 'Nicaragua', value: 'Nicaragua' },
  { key: 'Niger', value: 'Niger' },
  { key: 'Nigeria', value: 'Nigeria' },
  { key: 'North Korea', value: 'North Korea' },
  { key: 'North Macedonia', value: 'North Macedonia' },
  { key: 'Norway', value: 'Norway' },
  { key: 'Oman', value: 'Oman' },
  { key: 'Pakistan', value: 'Pakistan' },
  { key: 'Palau', value: 'Palau' },
  { key: 'Palestine', value: 'Palestine' },
  { key: 'Panama', value: 'Panama' },
  { key: 'Papua New Guinea', value: 'Papua New Guinea' },
  { key: 'Paraguay', value: 'Paraguay' },
  { key: 'Peru', value: 'Peru' },
  { key: 'Philippines', value: 'Philippines' },
  { key: 'Poland', value: 'Poland' },
  { key: 'Portugal', value: 'Portugal' },
  { key: 'Qatar', value: 'Qatar' },
  { key: 'Romania', value: 'Romania' },
  { key: 'Russia', value: 'Russia' },
  { key: 'Rwanda', value: 'Rwanda' },
  { key: 'Saint Kitts and Nevis', value: 'Saint Kitts and Nevis' },
  { key: 'Saint Lucia', value: 'Saint Lucia' },
  {
    key: 'Saint Vincent and the Grenadines',
    value: 'Saint Vincent and the Grenadines',
  },
  { key: 'Samoa', value: 'Samoa' },
  { key: 'San Marino', value: 'San Marino' },
  { key: 'Sao Tome and Principe', value: 'Sao Tome and Principe' },
  { key: 'Saudi Arabia', value: 'Saudi Arabia' },
  { key: 'Senegal', value: 'Senegal' },
  { key: 'Serbia', value: 'Serbia' },
  { key: 'Seychelles', value: 'Seychelles' },
  { key: 'Sierra Leone', value: 'Sierra Leone' },
  { key: 'Singapore', value: 'Singapore' },
  { key: 'Slovakia', value: 'Slovakia' },
  { key: 'Slovenia', value: 'Slovenia' },
  { key: 'Solomon Islands', value: 'Solomon Islands' },
  { key: 'Somalia', value: 'Somalia' },
  { key: 'South Africa', value: 'South Africa' },
  { key: 'South Korea', value: 'South Korea' },
  { key: 'South Sudan', value: 'South Sudan' },
  { key: 'Spain', value: 'Spain' },
  { key: 'Sri Lanka', value: 'Sri Lanka' },
  { key: 'Sudan', value: 'Sudan' },
  { key: 'Suriname', value: 'Suriname' },
  { key: 'Sweden', value: 'Sweden' },
  { key: 'Switzerland', value: 'Switzerland' },
  { key: 'Syria', value: 'Syria' },
  { key: 'Taiwan', value: 'Taiwan' },
  { key: 'Tajikistan', value: 'Tajikistan' },
  { key: 'Tanzania', value: 'Tanzania' },
  { key: 'Thailand', value: 'Thailand' },
  { key: 'Timor-Leste', value: 'Timor-Leste' },
  { key: 'Togo', value: 'Togo' },
  { key: 'Tonga', value: 'Tonga' },
  { key: 'Trinidad and Tobago', value: 'Trinidad and Tobago' },
  { key: 'Tunisia', value: 'Tunisia' },
  { key: 'Turkey', value: 'Turkey' },
  { key: 'Turkmenistan', value: 'Turkmenistan' },
  { key: 'Tuvalu', value: 'Tuvalu' },
  { key: 'Uganda', value: 'Uganda' },
  { key: 'Ukraine', value: 'Ukraine' },
  { key: 'United Arab Emirates', value: 'United Arab Emirates' },
  { key: 'United Kingdom', value: 'United Kingdom' },
  { key: 'Uruguay', value: 'Uruguay' },
  { key: 'Uzbekistan', value: 'Uzbekistan' },
  { key: 'Vanuatu', value: 'Vanuatu' },
  { key: 'Vatican City', value: 'Vatican City' },
  { key: 'Venezuela', value: 'Venezuela' },
  { key: 'Vietnam', value: 'Vietnam' },
  { key: 'Yemen', value: 'Yemen' },
  { key: 'Zambia', value: 'Zambia' },
  { key: 'Zimbabwe', value: 'Zimbabwe' },
];

interface CountryScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const CountryScreen: React.FC<CountryScreenProps> = ({
  onNext,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { haptic_level } = useAppSelector(state => state.message);

  const [country, setCountry] = useState('');

  const dispatch = useAppDispatch();

  const handleNext = async () => {
    haptic(haptic_level);
    if (country) {
      const country_data: Quiz = {
        id: 6,
        question: 'Where are you from?',
        answerString: `I'm from ${country}.`,
        answer: country,
        questionTag: 'Country',
      };
      dispatch(addQuiz(country_data));
      onNext();
    } else {
      Toast('Please select your country');
    }
  };

  const handleSkip = () => {
      const country_data: Quiz = {
        id: 6,
        question: 'Where are you from?',
        answer: `Prefer not to say`,
        answerString: `Prefer not to say`,
        questionTag: 'Country'
      };
      dispatch(addQuiz(country_data));
      onNext();
  }

  return (
    <ScrollView
      bounces={false}
      overScrollMode="never"
      scrollToOverflowEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <View style={styles.container}>
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.text}>{`Which country do you live in?`}</Text>
          <SelectList
            data={countryData}
            setSelected={setCountry}
            dropdownStyles={{ width: 350, borderRadius: 20 }}
            dropdownTextStyles={{ color: Colors.textColor }}
            placeholder="Select a country..."
            maxHeight={500}
            inputStyles={{
              color: Colors.textColor,
              width: 280,
              borderRadius: 15,
            }}
            searchPlaceholder=""
            searchicon={
              <Icon
                name="search"
                size={20}
                color={Colors.textColor}
                style={{ paddingRight: 12 }}
              />
            }
            closeicon={<Icon name="close" size={20} color={Colors.textColor} />}
            arrowicon={
              <Icon name="arrow-drop-down" size={20} color={Colors.textColor} />
            }
            boxStyles={{ borderRadius: 20 }}
          />
          <View style={{ height: 20 }} />
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Button
              text="Skip"
              variant="outline"
              onPress={handleSkip}
            />
            <Button
              text="Next"
              variant="contained"
              onPress={handleNext}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyle = (Colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: Colors.white,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Aquatico-Regular',
      color: Colors.textColor,
      paddingTop: 8,
    },
    progressBar: {
      height: 12,
      width: '100%',
      backgroundColor: Colors.textPrimaryColor + 50,
      borderRadius: 10,
    },
    backButtonWrapper: {
      flexDirection: 'row',
      marginHorizontal: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 20,
      fontFamily: 'Nunito-Bold',
      color: Colors.textPrimaryColor,
      textAlign: 'center',
      marginBottom: 20,
    },
    textInput: {
      height: 40,
      borderColor: Colors.textColor,
      borderWidth: 1,
      borderRadius: 5,
      width: '100%',
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    border: {
      width: '90%',
      borderWidth: 0.5,
      borderColor: Colors.greyColor500,
      borderRadius: 20,
      marginBottom: 20,
    },
  });
  return styles;
};

export default CountryScreen;
