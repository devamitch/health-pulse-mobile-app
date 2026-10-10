import { ColorScheme } from '@/constants/theme';
import useGameProgression from '@/hooks/useGameProgression';
import { logButtonTap } from '@/services/analyticsService';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface TodaysTasksBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  Colors: ColorScheme;
}

export const TodaysTasksBottomSheet: React.FC<TodaysTasksBottomSheetProps> = ({
  bottomSheetRef,
  Colors,
}) => {
  const { tasks, handleTaskPress } = useGameProgression();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['65%']}
      enablePanDownToClose={true}
      backgroundStyle={[
        styles.bottomSheetBackground,
        { backgroundColor: Colors.white },
      ]}
      handleIndicatorStyle={[
        styles.bottomSheetIndicator,
        { backgroundColor: Colors.greyColor },
      ]}
    >
      <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
        <View style={styles.bottomSheetHeader}>
          <RectButton
            onPress={() => bottomSheetRef.current?.close()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="#808080" />
          </RectButton>
        </View>

        <Text style={[styles.bottomSheetTitle, { color: Colors.textColor }]}>
          Today's Tasks
        </Text>
        <Text style={styles.bottomSheetSubtitle}>
          Complete tasks to earn coins & badges
        </Text>

        <View style={styles.tasksContainer}>
          {tasks.map((task, index) => (
            <RectButton
              key={index}
              onPress={async () => {
                await logButtonTap(task.title);
                bottomSheetRef.current?.close();
                handleTaskPress(task);
              }}
              style={[
                styles.taskItem,
                { backgroundColor: task.color },
                task.isDone ? { opacity: 0.5 } : null,
              ]}
            >
              <View style={styles.tasks}>
                <Image
                  source={require('./../../assets/icons/lungs.png')}
                  style={styles.taskIcon}
                  resizeMode="contain"
                />
                <Text style={styles.taskText}>{task.title}</Text>
              </View>
              <View style={styles.coinBadge}>
                <Text style={styles.coinText}>+{task.coins}</Text>
                <Image
                  source={require('./../../assets/images/coin.png')}
                  style={styles.taskCoinIcon}
                />
              </View>
            </RectButton>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: {
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    padding: 24,
    paddingBottom: 80,
  },
  bottomSheetHeader: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  bottomSheetTitle: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomSheetSubtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#808080',
    marginBottom: 24,
    textAlign: 'center',
  },
  tasksContainer: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    minHeight: 70,
  },
  tasks: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  taskIcon: {
    width: 24,
    height: 24,
  },
  taskText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
    flex: 1,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  coinText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#8B6914',
  },
  taskCoinIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
