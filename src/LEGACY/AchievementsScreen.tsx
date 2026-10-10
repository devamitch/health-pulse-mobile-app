/**
 * ACHIEVEMENTS SCREEN
 *
 * Browse all achievements, see progress, and track unlocked achievements
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/themeHook';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { Achievement, ACHIEVEMENT_TIERS } from '@/systems/gamificationEngine';
import { useGamification } from '@/hooks/useGamification';

const { width } = Dimensions.get('window');

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  progress = 0,
  Colors,
  DEffect,
}) => {
  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  };

  return (
    <TouchableOpacity
      style={[
        styles.achievementCard,
        {
          backgroundColor: Colors.cardBackground,
          opacity: isUnlocked ? 1 : 0.5,
        },
        DEffect.level1,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View
          style={[
            styles.tierBadge,
            { backgroundColor: tierColors[achievement.tier] },
          ]}
        >
          <Text style={styles.tierText}>{achievement.tier.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={[styles.achievementTitle, { color: Colors.textColor }]}>
        {achievement.title}
      </Text>

      <Text
        style={[
          styles.achievementDescription,
          { color: Colors.textColorSecondary },
        ]}
      >
        {achievement.description}
      </Text>

      <View style={styles.rewardsContainer}>
        <View style={styles.reward}>
          <Text style={styles.rewardLabel}>⭐</Text>
          <Text style={[styles.rewardValue, { color: Colors.textColor }]}>
            {achievement.xpReward} XP
          </Text>
        </View>
        <View style={styles.reward}>
          <Text style={styles.rewardLabel}>💰</Text>
          <Text style={[styles.rewardValue, { color: Colors.textColor }]}>
            {achievement.coinReward} coins
          </Text>
        </View>
      </View>

      {isUnlocked && achievement.unlockedAt && (
        <Text
          style={[styles.unlockedDate, { color: Colors.textColorSecondary }]}
        >
          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </Text>
      )}

      {!isUnlocked && progress > 0 && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: Colors.borderColor },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: tierColors[achievement.tier],
                },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: Colors.textColorSecondary }]}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const AchievementsScreen = ({ navigation }: any) => {
  const { Colors, DEffect } = useAppTheme();
  const { achievements, profile } = useGamification();

  const styles = createStyles(Colors, DEffect);

  // Group achievements by tier
  const achievementsByTier = useMemo(() => {
    const grouped: Record<string, Achievement[]> = {
      diamond: [],
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
    };

    achievements.forEach(achievement => {
      grouped[achievement.tier].push(achievement);
    });

    return grouped;
  }, [achievements]);

  // Calculate stats
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.backgroundColor }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: Colors.textColor }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.textColor }]}>
          Achievements
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Stats */}
      <View
        style={[
          styles.statsContainer,
          { backgroundColor: Colors.cardBackground },
          DEffect.level1,
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.textColor }]}>
            {unlockedCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: Colors.textColorSecondary }]}
          >
            Unlocked
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.textColor }]}>
            {totalCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: Colors.textColorSecondary }]}
          >
            Total
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.textColor }]}>
            {completionPercentage.toFixed(0)}%
          </Text>
          <Text
            style={[styles.statLabel, { color: Colors.textColorSecondary }]}
          >
            Complete
          </Text>
        </View>
      </View>

      {/* Achievements List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(achievementsByTier).map(([tier, tierAchievements]) => {
          if (tierAchievements.length === 0) return null;

          return (
            <View key={tier} style={styles.tierSection}>
              <Text style={[styles.tierTitle, { color: Colors.textColor }]}>
                {tier.toUpperCase()} TIER
              </Text>
              <View style={styles.achievementsGrid}>
                {tierAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={achievement.unlocked}
                    progress={0} // TODO: Calculate progress based on condition
                    Colors={Colors}
                    DEffect={DEffect}
                  />
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: {
      width: 60,
    },
    backText: {
      fontSize: 16,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
      paddingVertical: 20,
      borderRadius: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: '#E0E0E0',
    },
    scrollView: {
      flex: 1,
    },
    tierSection: {
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    tierTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    achievementsGrid: {
      gap: 12,
    },
    achievementCard: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
    },
    achievementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    achievementIcon: {
      fontSize: 48,
    },
    tierBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tierText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    achievementTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    achievementDescription: {
      fontSize: 14,
      marginBottom: 12,
      lineHeight: 20,
    },
    rewardsContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    reward: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    rewardLabel: {
      fontSize: 16,
    },
    rewardValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    unlockedDate: {
      fontSize: 12,
      marginTop: 8,
      fontStyle: 'italic',
    },
    progressContainer: {
      marginTop: 12,
      gap: 4,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      textAlign: 'right',
    },
  });

export default AchievementsScreen;
