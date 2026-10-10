import { RoutineRecord } from '@/services/mmkv-redux/slices';
import { processChatMemory, updatePrompt } from '@/utils/llm_utils';
import {
  findBulletList,
  jsonToMessage,
  saveSupplementRoutine,
} from '@/utils/routinePlanHandler';

const groupRoutineData = (data: any): RoutineRecord[] => {
  return data.reduce((acc: RoutineRecord[], entry: any) => {
    const date = entry.date.split('T')[0];
    const routineList = JSON.parse(entry.routine_list);

    const suggestedItems = routineList.map((item: any) => item.item);
    const doneItems = routineList
      .filter((item: any) => item.checked)
      .map((item: any) => item.item);

    let dateEntry = acc.find(d => d.date === date);
    if (!dateEntry) {
      dateEntry = { date, routines: [] };
      acc.push(dateEntry);
    }

    dateEntry.routines.push({
      routine: entry.routine,
      suggested_items: suggestedItems,
      done_items: doneItems,
    });

    return acc;
  }, []);
};

export const saveSupplementRoutine2 = saveSupplementRoutine;

export {
  findBulletList,
  groupRoutineData,
  jsonToMessage,
  processChatMemory,
  updatePrompt,
};
