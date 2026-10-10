import { FONT_FAMILIES } from '@/constants/typography';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { resetGame } from '@/services/mmkv-redux/slices/game_engine_slice';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LevelBadge from '../level-badge';

interface HomeHeaderProps {
  userData: any;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  truncateUsername: (name: string) => string;
  navigation?: any;
}

const HEADER_BASE_HEIGHT = 220;

const HomeContent: React.FC<HomeHeaderProps> = ({
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { userProfile } = useAppSelector(state => state.gameProgression);

  return (
    <View
      style={[
        styles.mainContent,
        {
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          zIndex: 1000,
        },
      ]}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <Text style={styles.greetingText} onPress={() => dispatch(resetGame())}>
          Hey {truncateUsername(userData?.displayName || '')} 👋
        </Text>

        <View style={styles.iconGroup}>
          {/* Roadmap/Notification Button */}
          <RectButton
            onPress={onNotificationPress}
            style={styles.roadMapButton}
          >
            <Image
              source={require('@/assets/images/fire.png')}
              style={styles.fireIcon}
            />
          </RectButton>

          {/* Profile Button Container */}
          <View style={styles.profileContainer}>
            <RectButton onPress={onProfilePress} style={styles.profileButton}>
              <Image
                source={
                  userData?.photoURL
                    ? { uri: userData.photoURL }
                    : require('@/assets/images/avatar.png')
                }
                style={styles.profileImage}
              />
            </RectButton>

            {/* Level Badge */}
            <View style={styles.levelBadgeContainer}>
              <LevelBadge
                level={userProfile.level}
                xp={userProfile.xp}
                xpToNextLevel={userProfile.xpToNextLevel}
                size="xsmall"
                showXp
              />
            </View>
          </View>
        </View>
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome Back</Text>
    </View>
  );
};

export default HomeContent;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mainContent: {
    width: '100%',
    zIndex: 2,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    letterSpacing: -0.5,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roadMapButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFEB71',
    borderRadius: 22.5,
    width: 45,
    height: 45,
    justifyContent: 'center',
  },
  fireIcon: {
    width: 28,
    height: 28,
  },
  profileContainer: {
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  levelBadgeContainer: {
    position: 'absolute',
    bottom: -8,
    right: 0,
    zIndex: 1,
  },
  welcomeText: {
    color: '#FAFAFA',
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  headerCardsContainer: {
    width: '100%',
    marginBottom: 16,
    zIndex: 2,
  },
});
