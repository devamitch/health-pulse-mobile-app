// import { createWeeklyNotification } from '@/services/notification-services';
import { Routine } from '../services/mmkv-redux/slices';
import {
  deleteActivitiesRecord,
  deleteDietRecord,
  deleteSupplementsRecord,
  insertMultipleActivitiesRecords,
  insertMultipleDietRecords,
  insertMultipleSupplementRecords,
  saveGymMessage,
  saveSuperfoodMessage,
  saveSupplementMessage,
} from '../services/sqlite/message';
// import NotificationTable from '@/services/database/tables/notifications';

export const jsonToMessage2 = (message: string) => {
  try {
    const jsonData = JSON.parse(message);
    if (jsonData.type === 'message') {
      return jsonData[jsonData.type];
    } else {
      let chat = ``;
      jsonData[jsonData.type].map((item: any) => {
        chat += `${item.routine}\n`;
        item.routine_items.map((element: any) => {
          chat += `  ◉ ${element.item}\n`;
        });
      });
      return chat.slice(0, -1);
    }
  } catch (error) {
    console.error(error);
    return message;
  }
};

export const jsonToMessage = (message: string) => {
  try {
    const jsonData = JSON.parse(message);

    if (jsonData.type === 'message') {
      return jsonData[jsonData.type];
    }

    const routineIcons = ['🌅', '💼', '🏋️', '🍎', '🧘', '🛌'];
    let formattedText = '';

    jsonData[jsonData.type].forEach((routine: any, index: number) => {
      // Add header with icon
      formattedText += `${routineIcons[index % routineIcons.length]} ${
        routine.routine
      }\n`;

      // Add items with clean bullets
      routine.routine_items.forEach((item: any) => {
        formattedText += `  ◦ ${item.item}\n`;
      });

      // Add spacing between sections
      if (index < jsonData[jsonData.type].length - 1) {
        formattedText += '\n';
      }
    });

    return formattedText.trim();
  } catch (error) {
    console.error('Message formatting error:', error);
    return message;
  }
};

export const findBulletList = (message: string) => {
  try {
    const data = JSON.parse(message);
    if (
      data.type === 'activities' ||
      data.type === 'diet' ||
      data.type === 'supplement'
    ) {
      console.log(true);
      return true;
    }
    console.log(false);
    return false;
  } catch (e) {
    console.error(e);
  }
  console.log(false);
  return false;
};

export const routineStructurer = (routine_data: any): Routine[] => {
  try {
    const routine: Routine[] = [];
    routine_data.map((item: any) => {
      const value: Routine = {
        id: item.id,
        date: item.date,
        routine_items: JSON.parse(item.routine_list),
        routine: item.routine,
        time: item.time,
        notification_message: item.notification_message,
        notification_days: item.notification_days,
      };
      routine.push(value);
    });
    return routine;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveSuperfoodRoutine = async (
  selectedList: Routine[],
  date: string,
) => {
  await deleteDietRecord(date);
  // await deleteNotificationRecord({ channel: 'superfood' });
  await insertMultipleDietRecords(selectedList);
  await saveSuperfoodMessage(
    'system',
    JSON.stringify({ type: 'diet', diet: selectedList }),
  );

  // await NotificationTable.deleteRecord([{
  //   key: 'channel',
  //   operator: '=',
  //   value: 'superfood'
  // }]);

  const result = selectedList.map((routine) => {
    const date = new Date();
    const [H, M] = routine.time.split(':') as [string, string];
    const daysToIndices = routine.notification_days.map(day =>
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ].indexOf(day),
    ) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

    date.setHours(parseInt(H), parseInt(M), 0, 0);

    return({
      title: routine.routine,
      channel: 'superfood',
      time: date,
      body: routine.notification_message,
      frequency: daysToIndices,
    })
  });

  return result;
  
  // for (const routine of selectedList) {
  //   const date = new Date();
  //   const [H, M] = routine.time.split(':') as [string, string];
  //   const daysToIndices = routine.notification_days.map(day =>
  //     [
  //       'Sunday',
  //       'Monday',
  //       'Tuesday',
  //       'Wednesday',
  //       'Thursday',
  //       'Friday',
  //       'Saturday',
  //     ].indexOf(day),
  //   ) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

  //   date.setHours(parseInt(H), parseInt(M), 0, 0);

  //   await createWeeklyNotification({
  //     title: routine.routine,
  //     channel: 'superfood',
  //     date: date,
  //     body: routine.notification_message,
  //     days: daysToIndices,
  //   })
  // }
};

export const saveSupplementRoutine = async (
  selectedList: Routine[],
  date: string,
) => {
  await deleteSupplementsRecord(date);
  // await deleteNotificationRecord({ channel: 'supplements' });
  await insertMultipleSupplementRecords(selectedList);
  await saveSupplementMessage(
    'system',
    JSON.stringify({ type: 'supplement', supplement: selectedList }),
  );

  // await NotificationTable.deleteRecord([{
  //   key: 'channel',
  //   operator: '=',
  //   value: 'supplements'
  // }]);

  const result = selectedList.map((routine) => {
    const date = new Date();
    const [H, M] = routine.time.split(':') as [string, string];
    const daysToIndices = routine.notification_days.map(day =>
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ].indexOf(day),
    ) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

    date.setHours(parseInt(H), parseInt(M), 0, 0);

    return({
      title: routine.routine,
      channel: 'supplements',
      time: date,
      body: routine.notification_message,
      frequency: daysToIndices,
    });
  });

  return result;

  // for (const routine of selectedList) {
  //   const date = new Date();
  //   const [H, M] = routine.time.split(':') as [string, string];
  //   const daysToIndices = routine.notification_days.map(day =>
  //     [
  //       'Sunday',
  //       'Monday',
  //       'Tuesday',
  //       'Wednesday',
  //       'Thursday',
  //       'Friday',
  //       'Saturday',
  //     ].indexOf(day),
  //   ) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

  //   date.setHours(parseInt(H), parseInt(M), 0, 0);

  //   await createWeeklyNotification({
  //     title: routine.routine,
  //     channel: 'supplements',
  //     date: date,
  //     body: routine.notification_message,
  //     days: daysToIndices,
  //   });
  // }
};

export const saveActivitiesRoutine = async (
  selectedList: Routine[],
  date: string,
) => {
  await deleteActivitiesRecord(date);
  // await deleteNotificationRecord({ channel: 'workout' });
  await insertMultipleActivitiesRecords(selectedList);
  await saveGymMessage(
    'system',
    JSON.stringify({ type: 'activities', activities: selectedList }),
  );

  // await NotificationTable.deleteRecord([{
  //   key: 'channel',
  //   operator: '=',
  //   value: 'workout'
  // }]);

  const result = selectedList.map((routine) => {
    const date = new Date();
    const [H, M] = routine.time.split(':') as [string, string];
    const daysToIndices = routine.notification_days.map(day =>
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ].indexOf(day),
    ) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

    date.setHours(parseInt(H), parseInt(M), 0, 0);

    return({
      title: routine.routine,
      channel: 'workout',
      time: date,
      body: routine.notification_message,
      frequency: daysToIndices,
    });
  });

  return result;

  // for (const routine of selectedList) {
  //   const date = new Date();
  //   const [H, M] = routine.time.split(':') as [string, string];
  //   const daysToIndices = routine.notification_days.map(day =>
  //     [
  //       'Sunday',
  //       'Monday',
  //       'Tuesday',
  //       'Wednesday',
  //       'Thursday',
  //       'Friday',
  //       'Saturday',
  //     ].indexOf(day),
  //   ) as (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

  //   date.setHours(parseInt(H), parseInt(M), 0, 0);

  //   await createWeeklyNotification({
  //     title: routine.routine,
  //     channel: 'workout',
  //     date: date,
  //     body: routine.notification_message,
  //     days: daysToIndices,
  //   });
  // }
};
