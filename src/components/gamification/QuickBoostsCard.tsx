import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

interface QuickBoostsCardProps {
  onPress: () => void;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

export const QuickBoostsCard: React.FC<QuickBoostsCardProps> = ({
  onPress,
  Colors,
  DEffect,
}) => {
  const styles = createStyles(Colors, DEffect);
  const { today, userProfile } = useAppSelector(state => state.gameProgression);

  const precentageCompleted = useMemo(
    () => Math.round((today.logs.length * 100) / 15),
    [today.logs],
  );

  return (
    <View style={styles.container}>
      <RectButton onPress={onPress} style={styles.button}>
        <View style={styles.card}>
          <View style={styles.quickBoost}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.pendingCoinsContainer}>
                <Text style={styles.pendingCoinsText}>
                  80+ more coins are pending
                </Text>
                <Image
                  source={require('./../../assets/images/coin-2.png')}
                  style={styles.taskCoinIcon}
                />
              </View>
              <View style={styles.pendingCoinsContainer}>
                <Text style={styles.pendingCoinsText}>
                  {`${userProfile.xp}/${userProfile.xpToNextLevel} XP`}
                </Text>
              </View>
            </View>
            <Text style={styles.quickBoostTitle}>Quick Boosts</Text>
            <Text
              style={styles.quickBoostSubtitle}
            >{`${today.logs.length} of 15 task completed`}</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {`${precentageCompleted}%`}
              </Text>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${precentageCompleted}%` },
                  ]}
                />
              </View>
            </View>
          </View>
          <Image
            source={require('./../../assets/images/coin.png')}
            style={styles.coinImage}
          />
        </View>
      </RectButton>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      position: 'absolute',
      top: 110,
      borderRadius: 50,
      backgroundColor: Colors.white,
      margin: 20,
      flexDirection: 'column',
      zIndex: 10,
      ...DEffect,
    },
    button: {
      borderRadius: 30,
      height: 150,
      width: '100%',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: '#1857C1',
      ...DEffect,
    },
    card: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 24,
      margin: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickBoost: {
      flex: 1,
      flexDirection: 'column',
      gap: 4,
      paddingRight: 10,
    },
    pendingCoinsContainer: {
      backgroundColor: '#FDEEC3',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 4,
      alignSelf: 'flex-start',
      flexDirection: 'row',
    },
    pendingCoinsText: {
      fontSize: 11,
      color: '#292524',
      fontWeight: '600',
      fontFamily: 'Nunito-SemiBold',
    },
    taskCoinIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
    quickBoostTitle: {
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    quickBoostSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Nunito-SemiBold',
      color: '#808080',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progressText: {
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
      minWidth: 50,
    },
    progressBarBackground: {
      flex: 1,
      height: 8,
      backgroundColor: '#F0F0F0',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#1857C1',
      borderRadius: 4,
    },
    coinImage: {
      width: 90,
      height: 90,
      resizeMode: 'contain',
    },
  });
