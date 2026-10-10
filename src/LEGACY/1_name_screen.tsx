import Button from '@/components/ui/buttons/button';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import TextBox from '../../../../components/TextBox';
import { ColorScheme } from '../../../../constants/theme';
import { useAppTheme } from '../../../../hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../../services/mmkv-redux/slices';
import { haptic } from '../../../../utils';
import { Toast } from '../../../../utils/toast';

interface NameScreenProps {
  onNext: () => void;
  onBack: () => void;
  name: string;
  setName: (val: string) => void;
}

const NameScreen: React.FC<NameScreenProps> = ({ onNext, name, setName }) => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { haptic_level } = useAppSelector(state => state.message);

  const handleNext = async () => {
    try {
      haptic(haptic_level);
      if (name.trim() !== '') {
        const data: Quiz = {
          id: 1,
          question: 'What is your name?',
          answerString: `I'm ${name}.`,
          questionTag: 'Name',
          answer: name,
        };
        dispatch(addQuiz(data));
        onNext();
      } else {
        Toast('Please enter your name');
      }
    } catch (err) {
      console.log(err);
      Toast('Error occured');
    }
  };

  return (
    <ScrollView
      bounces={false}
      overScrollMode="never"
      scrollToOverflowEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Content */}
      <View style={styles.content}>
        <View style={{ borderColor: '#888', height: 20 }} />
        <Text
          style={styles.text}
        >{`Welcome, we are so glad to have you here!`}</Text>
        <Text
          style={styles.description}
        >{`You’re one of a kind! Your goals, lifestyle and diet are all unique to you.\n\nIt takes just 5 minutes to build a highly personalized health companion who can help you reach your health and fitness goals faster.\n\nLet’s get started on the journey to a better, stronger and healthier you.`}</Text>
        <Text
          style={styles.subtitle}
        >{`To begin with, How would you like us to address you?`}</Text>
        <TextBox
          style={styles.textInput}
          value={name}
          onChangeText={text => {
            const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
            setName(cleaned);
          }}
          placeholder="Enter your first name"
        />
        <View style={{ height: 20 }} />
        <Button text="Next" variant="contained" onPress={handleNext} />
        <View style={{ borderColor: '#888', height: 20 }} />
      </View>
    </ScrollView>
  );
};

const createStyle = (Colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      //            justifyContent: 'center',
      //            alignItems: 'center',
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
    subtitle: {
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      textAlign: 'center',
      marginBottom: 20,
      color: Colors.textColor,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      textAlign: 'left',
      color: Colors.textColor,
      marginBottom: 30,
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
      borderRadius: 30,
      width: 250,
      marginBottom: 20,
      paddingHorizontal: 10,
    },
  });
  return styles;
};

export default NameScreen;
