import SuperFood from '@/assets/svg/superfood.svg';
import { StatusList } from '@/components/status/layout-list/animated-list';
import useGameProgression from '@/hooks/useGameProgression';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomCheckbox from '../../components/CustomCheckBox';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { claudeCheckItemHelper } from '../../services/api/claude_client';

const DietTaskScreen = (props: any) => {
  const { haptic_level } = useAppSelector(state => state.message);

  const [loading, setLoading] = useState(false);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const { tasks, handleTaskPress } = useGameProgression();

  const dietTasks = tasks.filter(item => item.category === 'diet');

  const taskId = props.route.params?.taskId ?? null;

  const currentTask = tasks.find(item => item.id === taskId);

  const addItem = (item: string) => {
    // const date = moment().format('YYYY-MM-DD');
    // const updatedList = [...list, { item: item, checked: true }];
    // setList(updatedList);
    // updateDietRecord(date, routine, JSON.stringify(updatedList));
  };

  const updateItemList = async ({
    base64,
    imageType,
  }: {
    base64: string;
    imageType: 'image/png' | 'image/jpeg' | 'image/webp';
    path: string;
  }) => {
    try {
      const items = dietTasks.map(({ title }) => title);
      const response = await claudeCheckItemHelper(
        base64,
        imageType,
        items,
        'food',
      );
      if (response.success) {
        if (response.present) {
          const index = items.indexOf(response.item);
          if (index >= 0) {
          }
          // if(!(list[index]?.checked)) handleBulletChange(index);
        } else {
          addItem(response.item);
        }
      }
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const renderFooter = () => {
    return (
      <View>
        <View style={[styles.card, { padding: 12 }]}>
          {/* {dietTasks.map((item, index) => (
            <CustomCheckbox
              key={index}
              label={item.title}
              onChange={() => handleTaskPress(item)}
              checked={item.isDone}
            />
          ))} */}
          {currentTask ? (
            <CustomCheckbox
              label={currentTask.title}
              onChange={() => handleTaskPress(currentTask)}
              checked={currentTask.isDone}
            />
          ) : null}
        </View>

        {/* {!props.route?.params?.timeframe ? (
          <View style={[styles.card, styles.qrCode]}>
            <ProductScanner
              onCapture={updateItemList}
              setLoading={setLoading}
            />
          </View>
        ) : null} */}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={SuperFood}
        angle={126.57}
        gradientColors={['#4CAF50', '#8BC34A']} // Green gradient for superfoods
        title="Today's Diet"
        subtitle="Let's get started!"
        description=" Here's your diet plan for today. Track your food intake and scan items with the QR code."
        loading={loading}
        handleClearChat={async () => {}}
        handleNotification={async () => {}}
        input={''}
        setInput={() => {}}
        onSend={async () => {}}
        onStop={async () => {}}
        messages={[]}
        animatedText={false}
        onLongPress={() => {}}
        hapticLevel={haptic_level}
        messageFeedback={{}}
        onFeedbackSubmit={() => {}}
        ListFooterComponent={renderFooter}
        expandedHeight={200}
      />

      {isConfettiVisible && (
        <ConfettiCannon
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: 50 }}
          autoStart={true}
          onAnimationEnd={() => setIsConfettiVisible(false)}
        />
      )}

      {/* Gamification Quick Feedback */}
      {/* {quickFeedback?.visible && quickFeedback.xpEarned !== undefined && (
        <QuickFeedbackToast
          visible={quickFeedback.visible}
          message={quickFeedback.message}
          xpEarned={quickFeedback.xpEarned}
          emoji={quickFeedback.emoji || '🍎'}
          onHide={dismissQuickFeedback}
          Colors={Colors}
        />
      )} */}
    </GestureHandlerRootView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    headerText: {
      marginLeft: 8,
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
      marginBottom: 8,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      ...DEffect,
    },
    qrCode: {
      marginVertical: 10,
    },
  });
};

export default DietTaskScreen;
