import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { MultiRingProgress } from './ActivityRing';
import { ActivityRing as ActivityRingType } from '@/systems/gamificationEngine';
import { LevelInfo } from '@/systems/gamificationEngine';

interface GamificationDashboardProps {
  rings: ActivityRingType[];
  levelInfo: LevelInfo;
  streak: number;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
  onRingPress?: (ring: ActivityRingType) => void;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  rings,
  levelInfo,
  streak,
  Colors,
  DEffect,
  onRingPress,
}) => {
  const styles = createStyles(Colors, DEffect);

  // Calculate overall progress
  const overallProgress =
    rings.reduce((sum, ring) => sum + Math.min(ring.progress, 1), 0) /
    rings.length;

  return (
    <View style={styles.container}>
      {/* Level & XP Header */}
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>LEVEL</Text>
          <Text style={styles.levelNumber}>{levelInfo.level}</Text>
          <Text style={styles.levelTitle}>{levelInfo.title}</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>
            {levelInfo.xpProgress}/{levelInfo.nextLevelXP} XP
          </Text>
          <View style={styles.xpBar}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${
                    (levelInfo.xpProgress / levelInfo.nextLevelXP) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Streak Badge */}
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
      </View>

      {/* Activity Rings */}
      <View style={styles.ringsContainer}>
        <MultiRingProgress
          rings={rings.map(ring => ({
            progress: ring.progress,
            color: ring.color,
            overflowColor: ring.overflowColor,
            glowColor: ring.glowColor,
          }))}
          size={240}
          strokeWidth={12}
          gap={10}
        />

        {/* Center Stats */}
        <View style={styles.centerStats}>
          <Text style={styles.centerStatsLabel}>OVERALL</Text>
          <Text style={styles.centerStatsValue}>
            {Math.round(overallProgress * 100)}%
          </Text>
        </View>
      </View>

      {/* Ring Details */}
      <View style={styles.ringDetailsContainer}>
        {rings.map((ring, index) => (
          <TouchableOpacity
            key={index}
            style={styles.ringDetail}
            onPress={() => onRingPress?.(ring)}
            activeOpacity={0.7}
          >
            <View style={styles.ringDetailHeader}>
              <View
                style={[styles.ringColorDot, { backgroundColor: ring.color }]}
              />
              <Text style={styles.ringLabel}>{ring.label}</Text>
              {ring.streak > 0 && (
                <View style={styles.ringStreakBadge}>
                  <Text style={styles.ringStreakText}>🔥 {ring.streak}</Text>
                </View>
              )}
            </View>

            <View style={styles.ringDetailStats}>
              <Text style={styles.ringXP}>
                {Math.round(ring.xpEarned)}/{ring.xpTarget} XP
              </Text>
              <Text style={styles.ringTasks}>
                {ring.tasksCompleted}/{ring.totalTasks} tasks
              </Text>
            </View>

            {ring.progress > 1 && (
              <View style={styles.overflowBadge}>
                <Text style={styles.overflowText}>
                  ⭐ {Math.round((ring.progress - 1) * 100)}% BONUS
                </Text>
              </View>
            )}

            {ring.multiplier > 1 && (
              <Text style={styles.multiplierText}>
                {ring.multiplier.toFixed(1)}x multiplier
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      padding: 20,
      ...DEffect,
    },
    header: {
      marginBottom: 24,
      position: 'relative',
    },
    levelContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    levelLabel: {
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      color: Colors.greyColor,
      letterSpacing: 2,
    },
    levelNumber: {
      fontSize: 48,
      fontFamily: 'Nunito-ExtraBold',
      color: Colors.primaryColor,
      lineHeight: 56,
    },
    levelTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginTop: 4,
    },
    xpContainer: {
      width: '100%',
    },
    xpText: {
      fontSize: 14,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
      textAlign: 'center',
      marginBottom: 8,
    },
    xpBar: {
      width: '100%',
      height: 12,
      backgroundColor: Colors.isDark ? '#2A2A2A' : '#E0E0E0',
      borderRadius: 6,
      overflow: 'hidden',
    },
    xpBarFill: {
      height: '100%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 6,
    },
    streakBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF6B35',
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      ...DEffect,
    },
    streakEmoji: {
      fontSize: 16,
      marginRight: 4,
    },
    streakText: {
      fontSize: 16,
      fontFamily: 'Nunito-ExtraBold',
      color: '#FFFFFF',
    },
    ringsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 24,
      position: 'relative',
    },
    centerStats: {
      position: 'absolute',
      alignItems: 'center',
    },
    centerStatsLabel: {
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      color: Colors.greyColor,
      letterSpacing: 1.5,
    },
    centerStatsValue: {
      fontSize: 32,
      fontFamily: 'Nunito-ExtraBold',
      color: Colors.textColor,
      marginTop: 4,
    },
    ringDetailsContainer: {
      gap: 12,
    },
    ringDetail: {
      backgroundColor: Colors.isDark ? '#1A1A1A' : '#F8F9FA',
      borderRadius: 16,
      padding: 16,
    },
    ringDetailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    ringColorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    ringLabel: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      flex: 1,
    },
    ringStreakBadge: {
      backgroundColor: Colors.isDark ? '#2A2A2A' : '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    ringStreakText: {
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    ringDetailStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    ringXP: {
      fontSize: 14,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.primaryColor,
    },
    ringTasks: {
      fontSize: 14,
      fontFamily: 'Nunito-Medium',
      color: Colors.greyColor,
    },
    overflowBadge: {
      backgroundColor: '#FFD700',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    overflowText: {
      fontSize: 12,
      fontFamily: 'Nunito-ExtraBold',
      color: '#000000',
    },
    multiplierText: {
      fontSize: 12,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.primaryColor,
      marginTop: 4,
    },
  });

export default GamificationDashboard;
