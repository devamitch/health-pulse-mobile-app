import CustomMetricsCardModal from '@/components/CustomMetricsCardModal';
import { IconButton } from '@/components/ui/buttons/button';
import ScreenLayout from '@/components/ui/layout';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import useGameProgression from '@/hooks/useGameProgression';
import FilterIcon from '@/icons/filter-icon';
import { DayRecord, TaskLogEntry } from '@/lib/types/game-progression.types';
import { logButtonTap } from '@/services/analyticsService';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = '0' | '1' | '2';

function HistoryScreen(props: any) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState<TabKey>('0');
  const [selectedChecked, setSelectedChecked] = useState('2');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { Colors, DEffect } = useAppTheme();
  const styles = useMemo(() => createStyle(Colors, DEffect), [Colors, DEffect]);
  const { history, todaysLogs, todaysScores } = useGameProgression();

  const handleOk = (value: string) => {
    setIsModalVisible(false);
    setSelectedChecked(value);
  };
  const closeModal = () => setIsModalVisible(false);

  const dailyData = useMemo(() => {
    const today: DayRecord = {
      date: moment().format('YYYY-MM-DD'),
      mode: 'standard',
      tasksGenerated: 0,
      tasksCompleted: todaysLogs.filter(l => l.isDone).length,
      completionRate: 0,
      scores: todaysScores,
      totalXPEarned: todaysLogs.reduce((s, l) => s + l.points, 0),
      streak: 0,
      photosLogged: 0,
    };
    return [today, ...(history || [])].slice(0, 30);
  }, [history, todaysLogs, todaysScores]);

  const weeklyData = useMemo(() => {
    const weeks: any[] = [];
    const sorted = [...(history || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (let i = 0; i < sorted.length; i += 7) {
      const chunk = sorted.slice(i, i + 7);
      if (chunk.length === 0) continue;
      weeks.push({
        label: `${moment(chunk[chunk.length - 1]?.date).format(
          'MMM D',
        )} - ${moment(chunk[0]?.date).format('MMM D')}`,
        records: chunk,
        totalXP: chunk.reduce((s, d) => s + d.totalXPEarned, 0),
        avgCompletion: Math.round(
          chunk.reduce((s, d) => s + d.completionRate, 0) / chunk.length,
        ),
      });
    }
    return weeks;
  }, [history]);

  const monthlyData = useMemo(() => {
    const months: Record<string, DayRecord[]> = {};
    (history || []).forEach(d => {
      const key = moment(d.date).format('YYYY-MM');
      if (!months[key]) months[key] = [];
      months[key]!.push(d);
    });
    return Object.entries(months)
      .map(([key, records]) => ({
        label: moment(key, 'YYYY-MM').format('MMMM YYYY'),
        records,
        totalXP: records.reduce((s, d) => s + d.totalXPEarned, 0),
        avgCompletion: Math.round(
          records.reduce((s, d) => s + d.completionRate, 0) / records.length,
        ),
      }))
      .sort((a, b) => b.label.localeCompare(a.label));
  }, [history]);

  const renderDayCard = useCallback(
    ({ item }: { item: DayRecord }) => {
      const avg = Math.round(
        (item.scores.diet + item.scores.activity + item.scores.stress) / 3,
      );
      const isGood = avg >= 60;
      return (
        <View
          style={[
            styles.dayCard,
            { borderLeftColor: isGood ? '#10B981' : '#EF4444' },
          ]}
        >
          <View style={styles.dayCardHeader}>
            <Text style={styles.dayDate}>
              {moment(item.date).format('ddd, MMM D')}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isGood ? '#D1FAE5' : '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isGood ? '#065F46' : '#991B1B' },
                ]}
              >
                {isGood ? 'Completed' : 'Missed'}
              </Text>
            </View>
          </View>
          <View style={styles.scoreRow}>
            <ScorePill label="Diet" score={item.scores.diet} color="#4CAF50" />
            <ScorePill
              label="Activity"
              score={item.scores.activity}
              color="#DC0014"
            />
            <ScorePill
              label="Calm"
              score={item.scores.stress}
              color="#7C60C8"
            />
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.xpText}>+{item.totalXPEarned} XP</Text>
            {item.photosLogged > 0 && (
              <Text style={styles.photoCount}>📸 {item.photosLogged}</Text>
            )}
          </View>
          {item.totalMacros && (
            <View style={styles.macroGrid}>
              <MacroItem
                label="Cal"
                value={item.totalMacros.calories}
                unit=""
                color="#FF6B6B"
              />
              <MacroItem
                label="Protein"
                value={item.totalMacros.protein}
                unit="g"
                color="#4ECDC4"
              />
              <MacroItem
                label="Carbs"
                value={item.totalMacros.carbs}
                unit="g"
                color="#FFE66D"
              />
              <MacroItem
                label="Fat"
                value={item.totalMacros.fats}
                unit="g"
                color="#A8E6CF"
              />
            </View>
          )}
        </View>
      );
    },
    [styles],
  );

  const renderWeekCard = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.weekCard}>
        <Text style={styles.weekLabel}>{item.label}</Text>
        <View style={styles.weekStats}>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{item.totalXP}</Text>
            <Text style={styles.weekStatLabel}>XP</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{item.avgCompletion}%</Text>
            <Text style={styles.weekStatLabel}>Avg</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatValue}>{item.records.length}</Text>
            <Text style={styles.weekStatLabel}>Days</Text>
          </View>
        </View>
      </View>
    ),
    [styles],
  );

  const renderLogCard = useCallback(
    ({ item }: { item: TaskLogEntry }) => {
      const isFailed = !item.isDone;
      const hasPhoto = !!item.photoUri;
      const hasPatience = !!item.patienceLevel;
      const patienceColor =
        item.patienceLevel === 'high'
          ? '#10B981'
          : item.patienceLevel === 'medium'
          ? '#F59E0B'
          : '#EF4444';
      return (
        <View style={[styles.logCard, isFailed && styles.logCardFailed]}>
          <View style={styles.logHeader}>
            <View
              style={[
                styles.logDot,
                { backgroundColor: isFailed ? '#EF4444' : '#10B981' },
              ]}
            />
            <Text style={styles.logTitle} numberOfLines={1}>
              {item.title || item.type}
            </Text>
            <Text
              style={[
                styles.logCategory,
                {
                  color:
                    item.category === 'diet'
                      ? '#4CAF50'
                      : item.category === 'activity'
                      ? '#DC0014'
                      : '#7C60C8',
                },
              ]}
            >
              {item.category}
            </Text>
            <Text style={styles.logXp}>+{item.points}XP</Text>
          </View>
          {hasPhoto && item.photoUri && (
            <View style={styles.photoSection}>
              <Image
                source={{ uri: item.photoUri }}
                style={styles.photoThumb}
              />
              {item.aiFeedback && (
                <Text style={styles.aiFeedback}>{item.aiFeedback}</Text>
              )}
              {item.macros && (
                <View style={styles.macroGrid}>
                  <MacroItem
                    label="Cal"
                    value={item.macros.calories}
                    unit=""
                    color="#FF6B6B"
                  />
                  <MacroItem
                    label="Pro"
                    value={item.macros.protein}
                    unit="g"
                    color="#4ECDC4"
                  />
                  <MacroItem
                    label="Carb"
                    value={item.macros.carbs}
                    unit="g"
                    color="#FFE66D"
                  />
                  <MacroItem
                    label="Fat"
                    value={item.macros.fats}
                    unit="g"
                    color="#A8E6CF"
                  />
                </View>
              )}
            </View>
          )}
          {hasPatience && (
            <View style={styles.patienceRow}>
              <View
                style={[
                  styles.patienceBadge,
                  { backgroundColor: patienceColor + '20' },
                ]}
              >
                <Text style={[styles.patienceText, { color: patienceColor }]}>
                  Patience: {item.patienceLevel}
                </Text>
              </View>
              {item.playDuration != null && (
                <Text style={styles.durationText}>
                  {Math.round(item.playDuration)}s watched
                </Text>
              )}
            </View>
          )}
        </View>
      );
    },
    [styles],
  );

  const renderHeaderContent = () => (
    <View style={styles.topTabContainerWrapper}>
      <Text style={styles.historyTitle}>HISTORY</Text>
      <View style={styles.topTabContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Your Trends</Text>
          <View style={{ flex: 1 }} />
          <IconButton
            onPress={() => setIsModalVisible(true)}
            variant="light"
            icon={
              <FilterIcon width={24} height={24} color={Colors.primaryColor} />
            }
          />
        </View>
        <View style={{ height: 20 }} />
        <View style={styles.tabstyle}>
          {(['Days', 'Weeks', 'Months'] as const).map((label, i) => {
            const key = String(i) as TabKey;
            const isActive = index === key;
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.tabbox,
                  { backgroundColor: isActive ? Colors.white : '#1857C1' },
                ]}
                onPress={async () => {
                  setIndex(key);
                  await logButtonTap(`History ${label}`);
                }}
              >
                <Text
                  style={[
                    styles.tabtext,
                    {
                      color: isActive
                        ? Colors.textColor
                        : Colors.isDark
                        ? 'white'
                        : Colors.white,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <ScreenLayout
        headerContent={renderHeaderContent()}
        headerBackgroundColor="#1857C1"
        backgroundColor={Colors.backgroundColor}
        headerPaddingTop={20}
        headerHeight={130}
      >
        {index === '0' && (
          <View style={styles.contentContainer}>
            {todaysLogs.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Activity</Text>
              </View>
            )}
            <FlatList
              data={todaysLogs}
              keyExtractor={(item, idx) => `log-${item.id}-${idx}`}
              renderItem={renderLogCard}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No tasks logged today</Text>
              }
            />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Previous Days</Text>
            </View>
            <FlatList
              data={dailyData}
              keyExtractor={(item, idx) => `day-${item.date}-${idx}`}
              renderItem={renderDayCard}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
        {index === '1' && (
          <FlatList
            data={weeklyData}
            keyExtractor={(_, idx) => `week-${idx}`}
            renderItem={renderWeekCard}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No weekly data yet</Text>
            }
          />
        )}
        {index === '2' && (
          <FlatList
            data={monthlyData}
            keyExtractor={(_, idx) => `month-${idx}`}
            renderItem={renderWeekCard}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No monthly data yet</Text>
            }
          />
        )}
      </ScreenLayout>
      <CustomMetricsCardModal
        isModalVisible={isModalVisible}
        closeModal={closeModal}
        handleOk={handleOk}
        selectedChecked={selectedChecked}
      />
    </View>
  );
}

const ScorePill = ({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        marginRight: 6,
      }}
    />
    <Text
      style={{
        fontSize: 13,
        fontFamily: FONT_FAMILIES.nunitoMedium,
        color: '#6B7280',
      }}
    >
      {label}: {score}
    </Text>
  </View>
);

const MacroItem = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: color + '15',
      borderRadius: 12,
      padding: 8,
      alignItems: 'center',
      marginHorizontal: 3,
    }}
  >
    <Text
      style={{
        fontSize: 14,
        fontFamily: FONT_FAMILIES.nunitoBold,
        color: '#374151',
      }}
    >
      {value}
      {unit}
    </Text>
    <Text
      style={{
        fontSize: 11,
        fontFamily: FONT_FAMILIES.nunitoRegular,
        color: '#6B7280',
      }}
    >
      {label}
    </Text>
  </View>
);

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: Colors.white },
    historyTitle: {
      color: 'white',
      fontFamily: FONT_FAMILIES.nunitoRegular,
      fontSize: 18,
    },
    headerText: {
      color: Colors.textColor,
      fontSize: 19,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      marginLeft: 5,
    },
    topTabContainerWrapper: {
      width: '90%',
      borderRadius: 20,
      margin: 20,
      flexDirection: 'column',
      paddingVertical: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topTabContainer: {
      width: '100%',
      marginTop: 20,
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      padding: 20,
      height: 150,
      ...DEffect,
    },
    header: { flexDirection: 'row' },
    tabstyle: {
      flexDirection: 'row',
      width: '100%',
      height: 45,
      backgroundColor: '#1857C1',
      padding: 5,
      borderRadius: 30,
    },
    tabtext: {
      color: Colors.primaryColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
    tabbox: {
      flex: 1,
      borderRadius: 20,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    contentContainer: { paddingBottom: 40 },
    sectionHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
    sectionTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 20 },
    emptyText: {
      textAlign: 'center',
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#9CA3AF',
      marginTop: 40,
    },
    dayCard: {
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#10B981',
      ...DEffect,
    },
    dayCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    dayDate: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: { fontSize: 12, fontFamily: FONT_FAMILIES.nunitoSemiBold },
    scoreRow: { flexDirection: 'row', marginBottom: 8 },
    xpRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    xpText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#F59E0B',
    },
    photoCount: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#6B7280',
    },
    macroGrid: { flexDirection: 'row', marginTop: 10 },
    weekCard: {
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...DEffect,
    },
    weekLabel: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      marginBottom: 12,
    },
    weekStats: { flexDirection: 'row', justifyContent: 'space-around' },
    weekStat: { alignItems: 'center' },
    weekStatValue: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#1857C1',
    },
    weekStatLabel: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#6B7280',
    },
    logCard: {
      backgroundColor: Colors.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      ...DEffect,
    },
    logCardFailed: { opacity: 0.5 },
    logHeader: { flexDirection: 'row', alignItems: 'center' },
    logDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    logTitle: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textColor,
    },
    logCategory: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      marginRight: 8,
      textTransform: 'uppercase',
    },
    logXp: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#F59E0B',
    },
    photoSection: { marginTop: 10 },
    photoThumb: {
      width: '100%',
      height: 120,
      borderRadius: 12,
      marginBottom: 8,
    },
    aiFeedback: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#6B7280',
      marginBottom: 6,
    },
    patienceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 10,
    },
    patienceBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    patienceText: { fontSize: 12, fontFamily: FONT_FAMILIES.nunitoSemiBold },
    durationText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#6B7280',
    },
  });

export default HistoryScreen;
