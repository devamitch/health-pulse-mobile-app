import LinearGradient from '@/components/base/LinearGradient';
import BackButton from '@/components/ui/buttons/back-button';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useGameHook } from '@/providers/GameProgressionProvider';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { Colors } = useAppTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const { history, weeklyReports, generateWeeklyReport, isReady } =
    useGameHook();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly'>('daily');

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateWeeklyReport();
      Toast.success('Weekly report generated!');
    } catch (error) {
      console.error('[History] Report generation failed:', error);
      Toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  }, [generateWeeklyReport]);

  const renderDailyHistory = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {history.map((day, index) => (
        <View key={`day-${index}`} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayDate}>{day.date}</Text>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>
                {day.completionRate.toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.scoresRow}>
            <ScoreItem label="Diet" score={day.scores.diet} color="#27A864" />
            <ScoreItem
              label="Activity"
              score={day.scores.activity}
              color="#C63F2C"
            />
            <ScoreItem
              label="Stress"
              score={day.scores.stress}
              color="#7C60C8"
            />
          </View>

          <View style={styles.statsRow}>
            <StatItem
              label="Tasks"
              value={`${day.tasksCompleted}/${day.tasksGenerated}`}
            />
            <StatItem label="XP" value={day.totalXPEarned.toString()} />
            <StatItem label="Streak" value={day.streak.toString()} />
          </View>

          {day.totalMacros && (
            <View style={styles.macrosContainer}>
              <Text style={styles.macrosTitle}>Daily Macros</Text>
              <View style={styles.macrosRow}>
                <MacroItem label="Cal" value={day.totalMacros.calories} />
                <MacroItem label="Pro" value={`${day.totalMacros.protein}g`} />
                <MacroItem label="Carb" value={`${day.totalMacros.carbs}g`} />
                <MacroItem label="Fat" value={`${day.totalMacros.fats}g`} />
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderWeeklyReports = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateReport}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.generateButtonText}>Generate New Report</Text>
        )}
      </TouchableOpacity>

      {weeklyReports.map((report, index) => (
        <View key={`report-${index}`} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>
              {report.weekStartDate} - {report.weekEndDate}
            </Text>
          </View>

          <View style={styles.reportMetrics}>
            <MetricItem
              label="Completion"
              value={`${report.metrics.completionRate}%`}
              color={Colors.success}
            />
            <MetricItem
              label="Total XP"
              value={report.metrics.totalXP.toString()}
              color={Colors.warning}
            />
            <MetricItem
              label="Streak Days"
              value={report.metrics.streakMaintained.toString()}
              color={Colors.primaryColor}
            />
          </View>

          <View style={styles.markdownContainer}>
            <Markdown style={markdownStyles(Colors)}>
              {report.aiGeneratedReport}
            </Markdown>
          </View>

          {report.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {report.recommendations.map((rec, i) => (
                <Text key={`rec-${i}`} style={styles.recommendationText}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}

          {report.behaviorPatterns.length > 0 && (
            <View style={styles.patternsContainer}>
              <Text style={styles.sectionTitle}>Patterns Observed</Text>
              {report.behaviorPatterns.map((pattern, i) => (
                <Text key={`pattern-${i}`} style={styles.patternText}>
                  • {pattern}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  if (!isReady) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryColor, Colors.backgroundColor]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} iconColor="#FFFFFF" />
          <Text style={styles.headerTitle}>Progress History</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'daily' && styles.activeTab]}
            onPress={() => setSelectedTab('daily')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'daily' && styles.activeTabText,
              ]}
            >
              Daily
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
            onPress={() => setSelectedTab('weekly')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'weekly' && styles.activeTabText,
              ]}
            >
              Weekly Reports
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {selectedTab === 'daily' ? renderDailyHistory() : renderWeeklyReports()}
    </View>
  );
};

// Helper Components
const ScoreItem: React.FC<{ label: string; score: number; color: string }> = ({
  label,
  score,
  color,
}) => (
  <View style={styles.scoreItem}>
    <Text style={styles.scoreLabel}>{label}</Text>
    <View style={[styles.scoreBar, { backgroundColor: `${color}20` }]}>
      <View
        style={[
          styles.scoreFill,
          { width: `${score}%`, backgroundColor: color },
        ]}
      />
    </View>
    <Text style={[styles.scoreValue, { color }]}>{score}</Text>
  </View>
);

const StatItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const MacroItem: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <View style={styles.macroItem}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
  </View>
);

const MetricItem: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    activeTab: {
      backgroundColor: '#FFFFFF',
    },
    tabText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    activeTabText: {
      color: Colors.primaryColor,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    dayCard: {
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    dayDate: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    completionBadge: {
      backgroundColor: Colors.primaryColor,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    completionText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    scoresRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    scoreItem: {
      flex: 1,
      marginHorizontal: 4,
    },
    scoreLabel: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textSecondary,
      marginBottom: 4,
    },
    scoreBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 4,
    },
    scoreFill: {
      height: '100%',
      borderRadius: 3,
    },
    scoreValue: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textTertiary,
      marginBottom: 2,
    },
    statValue: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    macrosContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    macrosTitle: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textSecondary,
      marginBottom: 8,
    },
    macrosRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    macroItem: {
      alignItems: 'center',
    },
    macroLabel: {
      fontSize: 10,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textTertiary,
    },
    macroValue: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    generateButton: {
      backgroundColor: Colors.primaryColor,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
    },
    generateButtonText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    reportCard: {
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    reportHeader: {
      marginBottom: 16,
    },
    reportTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    reportMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      marginBottom: 16,
    },
    metricItem: {
      alignItems: 'center',
    },
    metricLabel: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textTertiary,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
    },
    markdownContainer: {
      marginBottom: 16,
    },
    recommendationsContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    patternsContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      marginBottom: 8,
    },
    recommendationText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
    patternText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
  });

const markdownStyles = (Colors: any) => ({
  body: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: Colors.textColor,
    lineHeight: 20,
  },
  heading2: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: Colors.textColor,
    marginTop: 12,
    marginBottom: 8,
  },
  strong: {
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  list_item: {
    marginBottom: 4,
  },
});

export default HistoryScreen;
