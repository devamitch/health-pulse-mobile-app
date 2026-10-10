import LinearGradient from '@/components/base/LinearGradient';
import LevelInfoModal from '@/components/modals/level-info-modal';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface Level {
  id: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  position: { x: number; y: number };
}

interface RoadmapScreenProps {
  navigation: any;
  route: any;
}

const LEVEL_TIERS = {
  bronze: { range: [1, 5], gradient: ['#CD7F32', '#8B4513'], label: 'Bronze' },
  silver: { range: [6, 10], gradient: ['#E8E8E8', '#C0C0C0'], label: 'Silver' },
  gold: { range: [11, 20], gradient: ['#FFD700', '#DAA520'], label: 'Gold' },
  platinum: {
    range: [21, 35],
    gradient: ['#E5E4E2', '#A0B2C6'],
    label: 'Platinum',
  },
  diamond: {
    range: [36, 50],
    gradient: ['#B9F2FF', '#4FC3F7'],
    label: 'Diamond',
  },
  master: {
    range: [51, Infinity],
    gradient: ['#E040FB', '#9C27B0'],
    label: 'Master',
  },
};

export const getTierForLevel = (level: number) => {
  for (const [key, tier] of Object.entries(LEVEL_TIERS)) {
    if (level >= tier.range[0] && level <= tier.range[1]) {
      return { key, ...tier };
    }
  }
  return { key: 'bronze', ...LEVEL_TIERS.bronze };
};

const RoadmapScreen: React.FC<RoadmapScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { Colors } = useAppTheme();

  const {
    level: currentLevel,
    xp,
    xpToNextLevel,
  } = useAppSelector(state => state.gameProgression.userProfile);

  const [isLevelModalVisible, setLevelModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);

  const tier = useMemo(() => getTierForLevel(currentLevel), [currentLevel]);
  const progress = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  // MEMOIZED: Generate levels only when currentLevel changes
  const levels = useMemo((): Level[] => {
    const result: Level[] = [];
    const totalLevels = currentLevel + 100;
    const verticalSpacing = 80;
    const centerX = width / 2;
    const amplitude = width * 0.3;

    for (let i = 0; i < totalLevels; i++) {
      const pattern = i % 3;
      let xOffset = 0;

      switch (pattern) {
        case 0:
          xOffset = 0;
          break;
        case 1:
          xOffset = -amplitude;
          break;
        case 2:
          xOffset = amplitude;
          break;
      }

      result.push({
        id: i + 1,
        isUnlocked: i + 1 <= currentLevel,
        isCompleted: i + 1 < currentLevel,
        position: {
          x: centerX + xOffset - 60,
          y: 8200 - i * verticalSpacing,
        },
      });
    }

    return result;
  }, [currentLevel]);

  // Auto-scroll to current level on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentLevelData = levels.find(l => l.id === currentLevel);
      if (currentLevelData && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: currentLevelData.position.y - height / 2 + 75,
          animated: true,
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentLevel, levels]);

  const handleLevelPress = useCallback((level: Level) => {
    setSelectedLevel(level.id);
    setLevelModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setLevelModalVisible(false);
  }, []);

  const renderSteppingStones = useCallback(
    (fromLevel: Level, toLevel: Level) => {
      const deltaX = toLevel.position.x - fromLevel.position.x;
      const deltaY = toLevel.position.y - fromLevel.position.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const numStones = Math.floor(distance / 40);

      const stones = [];
      for (let i = 1; i <= numStones; i++) {
        const ratio = i / (numStones + 1);
        const stoneX = fromLevel.position.x + deltaX * ratio + 60;
        const stoneY = fromLevel.position.y + deltaY * ratio + 80;

        stones.push(
          <Image
            key={`stone-${fromLevel.id}-${i}`}
            source={require('@/assets/images/stepping-stones.png')}
            style={[
              styles.steppingStone,
              {
                position: 'absolute',
                left: stoneX,
                top: stoneY,
              },
            ]}
            resizeMode="contain"
          />,
        );
      }
      return stones;
    },
    [],
  );

  const renderLevel = useCallback(
    (level: Level, index: number) => {
      return (
        <RectButton
          key={level.id}
          style={[
            styles.levelContainer,
            {
              position: 'absolute',
              left: level.position.x,
              top: level.position.y,
            },
          ]}
          onPress={() => handleLevelPress(level)}
          rippleColor={`${Colors.primaryColor}4D`}
          underlayColor="transparent"
        >
          <ImageBackground
            source={require('@/assets/images/island.png')}
            style={styles.islandImage}
            resizeMode="contain"
          >
            {!level.isUnlocked && (
              <MaterialCommunityIcons
                name="lock"
                size={30}
                color={Colors.textTertiary}
              />
            )}
          </ImageBackground>

          <View style={styles.badgeContainer}>
            <ImageBackground
              source={require('@/assets/images/coin-2.png')}
              style={[styles.coinBadge, !level.isUnlocked && { opacity: 0.6 }]}
              resizeMode="contain"
            >
              <Text style={styles.levelNumberText}>{level.id}</Text>
            </ImageBackground>
          </View>
        </RectButton>
      );
    },
    [handleLevelPress],
  );

  return (
    <LinearGradient
      colors={[Colors.primaryColor, Colors.backgroundColor]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Image
        source={require('@/assets/images/roadmap_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Header with User Stats */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <LinearGradient
          colors={[`${Colors.surface}F2`, `${Colors.surface}D9`]}
          style={styles.headerBackground}
        />

        {/* Top Row */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={Colors.textPrimaryColor}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Journey</Text>

          {/* User level badge */}
          <View style={styles.userBadgeContainer}>
            <LinearGradient colors={tier.gradient} style={styles.userBadge}>
              <MaterialCommunityIcons
                name="shield-star"
                size={14}
                color="white"
              />
              <Text style={styles.userBadgeText}>{currentLevel}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* XP Progress Section */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <View style={styles.xpLabelContainer}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={16}
                color={Colors.warning}
              />
              <Text style={styles.xpLabel}>Level {currentLevel} Progress</Text>
            </View>
            <Text style={styles.xpValue}>
              {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </Text>
          </View>

          <View style={styles.xpProgressContainer}>
            <View style={styles.xpProgressTrack}>
              <LinearGradient
                colors={tier.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.xpProgressFill,
                  { width: `${Math.min(progress * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.xpPercentage}>
              {Math.round(progress * 100)}%
            </Text>
          </View>

          <View style={styles.xpStats}>
            <View style={styles.xpStatItem}>
              <Text style={styles.xpStatValue}>
                {(xpToNextLevel - xp).toLocaleString()}
              </Text>
              <Text style={styles.xpStatLabel}>XP to next</Text>
            </View>
            <View style={styles.xpStatDivider} />
            <View style={styles.xpStatItem}>
              <Text style={styles.xpStatValue}>{currentLevel}</Text>
              <Text style={styles.xpStatLabel}>Level</Text>
            </View>
            <View style={styles.xpStatDivider} />
            <View style={styles.xpStatItem}>
              <Text style={[styles.xpStatValue, { color: tier.gradient[0] }]}>
                {tier.label}
              </Text>
              <Text style={styles.xpStatLabel}>Tier</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Map */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.mapContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* Stepping stones connecting levels */}
        {levels.map((level, index) => {
          if (index < levels.length - 1) {
            return renderSteppingStones(level, levels[index + 1]);
          }
          return null;
        })}

        {/* Levels */}
        {levels.map((level, index) => renderLevel(level, index))}
      </ScrollView>

      {/* Quick Jump Button */}
      <View style={[styles.quickJumpContainer, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.quickJumpButton}
          onPress={() => {
            const currentLevelData = levels.find(l => l.id === currentLevel);
            if (currentLevelData && scrollViewRef.current) {
              scrollViewRef.current.scrollTo({
                y: currentLevelData.position.y - height / 2 + 75,
                animated: true,
              });
            }
          }}
        >
          <LinearGradient
            colors={['#1857C1', '#0D3D8F']}
            style={styles.quickJumpGradient}
          >
            <MaterialCommunityIcons name="target" size={18} color="white" />
            <Text style={styles.quickJumpText}>Current Level</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <LevelInfoModal
        visible={isLevelModalVisible}
        onClose={handleCloseModal}
        level={selectedLevel - 1}
      />
    </LinearGradient>
  );
};

const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    headerBackground: {
      ...StyleSheet.absoluteFillObject,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textPrimaryColor,
    },
    userBadgeContainer: {
      borderRadius: 18,
      overflow: 'hidden',
    },
    userBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 5,
    },
    userBadgeText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: 'white',
    },
    xpSection: {
      backgroundColor: Colors.surfaceHover,
      borderRadius: 14,
      padding: 14,
    },
    xpHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    xpLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    xpLabel: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textSecondary,
    },
    xpValue: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.primaryColor,
    },
    xpProgressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    xpProgressTrack: {
      flex: 1,
      height: 8,
      backgroundColor: Colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    xpProgressFill: {
      height: '100%',
      borderRadius: 4,
    },
    xpPercentage: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.primaryColor,
      minWidth: 40,
      textAlign: 'right',
    },
    xpStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    xpStatItem: {
      alignItems: 'center',
    },
    xpStatValue: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textPrimaryColor,
    },
    xpStatLabel: {
      fontSize: 10,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    xpStatDivider: {
      width: 1,
      height: 28,
      backgroundColor: Colors.border,
    },
    scrollView: {
      flex: 1,
      marginTop: 200, // Adjust based on header height
    },
    mapContainer: {
      minHeight: 8400,
      position: 'relative',
      paddingBottom: 100,
    },
    levelContainer: {
      width: 120,
      height: 150,
      alignItems: 'center',
      justifyContent: 'center',
    },
    islandImage: {
      width: 120,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeContainer: {
      position: 'absolute',
      top: 5,
      zIndex: 10,
    },
    coinBadge: {
      width: 45,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center',
    },
    steppingStone: {
      width: 30,
      height: 30,
    },
    levelNumberText: {
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textPrimary,
      fontSize: 18,
      position: 'absolute',
      zIndex: 5,
    },
    quickJumpContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 20,
    },
    quickJumpButton: {
      borderRadius: 22,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: Colors.primaryColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    quickJumpGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 12,
      gap: 6,
    },
    quickJumpText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: 'white',
    },
  });

export default RoadmapScreen;
