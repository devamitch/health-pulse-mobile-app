import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const createMessageStyles = (Colors: ColorScheme) => {
  return StyleSheet.create({
    incomingContainer: {
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    outgoingContainer: {
      marginBottom: 12,
      alignSelf: 'flex-end',
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    incomingBubble: {
      maxWidth: '85%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 30,
      padding: 15,
      marginTop: 10,
      borderBottomLeftRadius: 0,
    },
    outgoingBubble: {
      maxWidth: '85%',
      backgroundColor: Colors.secondaryColor,
      borderRadius: 30,
      padding: 15,
      marginTop: 10,
      borderBottomRightRadius: 0,
    },
    incomingText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
    },
    outgoingText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
    },
    shareButton: {
      backgroundColor: Colors.greyColor,
      borderRadius: 50,
      padding: 8,
      marginLeft: 8,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 160,
      marginTop: 10,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: 4,
    },
  });
};

export const createModalStyles = (
  Colors: ColorScheme,
  DEffect: ElevationScheme,
) => {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 20,
      maxHeight: '75%',
      ...DEffect,
    },
    modalTextContainer: {
      width: '100%',
      backgroundColor: Colors.greyColor,
      padding: 12,
      marginBottom: 16,
      borderRadius: 12,
      maxHeight: '75%',
    },
    modalText: {
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
      color: Colors.textColor,
    },
  });
};

export const createOutgoingStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 12,
      alignSelf: 'flex-end',
    },
    bubble: {
      backgroundColor: Colors.secondaryColor,
      borderRadius: 20,
      padding: 15,
      marginTop: 10,
      borderBottomRightRadius: 5,
      maxWidth: 300,
    },
    text: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      lineHeight: 22,
    },
  });

export const createFeedbackStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: Colors.backgroundColor,
      borderRadius: 20,
      padding: 20,
      margin: 20,
      maxHeight: '60%',
      width: '90%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginLeft: 12,
      flex: 1,
    },
    textInput: {
      borderWidth: 1,
      borderColor: Colors.greyColor,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
      color: Colors.textColor,
      minHeight: 100,
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      marginHorizontal: 8,
    },
  });

export const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      maxWidth: '95%',
    },
    bubble: {
      // maxWidth: '85%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 20,
      padding: 15,
      marginTop: 10,
      borderBottomLeftRadius: 5,
    },
    text: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      lineHeight: 22,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
      flexWrap: 'wrap',
    },
    iconButton: {
      padding: 6,
      marginHorizontal: 1,
      borderRadius: 20,
      backgroundColor: Colors.greyColor + '40',
    },
    likedButton: {
      backgroundColor: Colors.primaryColor + '20',
    },
    dislikedButton: {
      backgroundColor: Colors.secondaryColor + '20',
    },
    disclaimerContainer: {
      backgroundColor: Colors.greyColor + '80',
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    disclaimerText: {
      fontSize: 12,
      fontFamily: 'Nunito-Italic',
      color: Colors.textColor,
      flex: 1,
    },
    closeButton: {
      marginLeft: 8,
    },
  });
