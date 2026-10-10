import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import LinearGradient from 'react-native-linear-gradient';

interface ShareableCardProps {
  message: string;
  userName?: string;
  timestamp?: string;
}

const ShareableCard = React.forwardRef<View, ShareableCardProps>(
  ({ message, userName = 'User', timestamp }, ref) => {
    const { Colors } = useAppTheme();
    const styles = createStyles(Colors);

    // Format timestamp
    const formattedTime = timestamp
      ? new Date(timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

    return (
      <View ref={ref} style={styles.container}>
        <LinearGradient
          colors={['#1c256b', '#2c3bbb']}
          angle={135}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>SKYLA</Text>
            <Text style={styles.tagline}>AI Health Assistant</Text>
          </View>

          {/* Message Content */}
          <View style={styles.messageContainer}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.timestamp}>{formattedTime}</Text>
              </View>
            </View>
            <Text style={styles.watermark}>health-pulse.com</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

const createStyles = (_Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      width: 400,
      minHeight: 500,
      backgroundColor: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    gradient: {
      flex: 1,
      padding: 24,
      justifyContent: 'space-between',
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      fontFamily: 'Aquatico-Regular',
      fontSize: 32,
      color: 'white',
      letterSpacing: 2,
      marginBottom: 4,
    },
    tagline: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      letterSpacing: 1,
    },
    messageContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 20,
    },
    messageBubble: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    messageText: {
      fontFamily: 'Nunito-Regular',
      fontSize: 16,
      color: '#1c256b',
      lineHeight: 24,
    },
    footer: {
      marginTop: 20,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontFamily: 'Nunito-Bold',
      fontSize: 18,
      color: 'white',
    },
    userName: {
      fontFamily: 'Nunito-Bold',
      fontSize: 14,
      color: 'white',
      marginBottom: 2,
    },
    timestamp: {
      fontFamily: 'Nunito-Regular',
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    watermark: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
  });

ShareableCard.displayName = 'ShareableCard';

export default ShareableCard;
