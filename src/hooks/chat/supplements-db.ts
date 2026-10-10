import {
  clearTable as sqliteClearTable,
  fetchPlanSupplementChatMessage as sqliteFetchMessages,
  fetchSupplementRecordWithDateRange as sqliteFetchSupplementRecord,
  savePlanSupplementMessage as sqliteSaveMessage,
} from '@/services/sqlite/message';

export const clearTable = async (tableName: string) => {
  return sqliteClearTable(tableName);
};

export const savePlanSupplementMessage = async (
  role: string,
  message: string,
) => {
  return sqliteSaveMessage(role, message);
};

export const fetchPlanSupplementChatMessage = async () => {
  return sqliteFetchMessages();
};

export const fetchSupplementRecordWithDateRange = async (
  startDate: string,
  endDate: string,
) => {
  return sqliteFetchSupplementRecord(startDate, endDate);
};
