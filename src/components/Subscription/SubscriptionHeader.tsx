import { FONT_FAMILIES } from '@/constants/typography';
import { fontScale } from '@/hooks/styles/responsive';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SubscriptionHeaderProps {
  titlePart1: string;
  titlePart2: string;
  highlightWord: string;
  subtitle: string;
}

export const SubscriptionHeader = ({
  titlePart1,
  titlePart2,
  highlightWord,
  subtitle,
}: SubscriptionHeaderProps) => {
  const navigation = useNavigation();

  const handleGoBack = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  const renderBackButton = useMemo(
    () =>
      navigation?.canGoBack?.() ? (
        <RectButton onPress={handleGoBack} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </RectButton>
      ) : null,
    [navigation, handleGoBack],
  );
  return (
    <View
      style={{
        justifyContent: 'space-between',
        flexDirection: 'row',
        position: 'relative',
      }}
    >
      <StatusBar backgroundColor={'transparent'} barStyle={'light-content'} />
      <View style={styles.container}>
        <Text style={styles.title}>
          {titlePart1} <Text style={styles.highlight}>{highlightWord}</Text>
        </Text>
        <Text style={styles.title}>{titlePart2}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {renderBackButton}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: fontScale(24),
  },
  title: {
    fontSize: fontScale(32),
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#f1f1f1',
    lineHeight: fontScale(36),
  },
  highlight: {
    color: '#fdfcf9ff',
  },
  subtitle: {
    fontSize: fontScale(14),
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: fontScale(8),
  },
  closeButton: {
    position: 'absolute',

    right: -20,
    top: -20,
    backgroundColor: '#f1f1f103',
    padding: 6,
    borderRadius: 30,
    zIndex: 1,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
