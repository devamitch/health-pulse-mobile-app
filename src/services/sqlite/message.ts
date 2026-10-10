import moment from 'moment';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { Message, Routine } from '../mmkv-redux/slices';
import { SQLiteTransaction } from './interface';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db: SQLiteDatabase;

export const initializeMessagesDatabase = async (): Promise<any> => {
  try {
    db = await SQLite.openDatabase({
      name: 'messages.db',
      location: 'default',
    });

    if (!db) {
      throw new Error('Failed to open database');
    }

    const tsx = db.transaction((tx: SQLiteTransaction) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS general_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS plan_superfood_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS plan_supplement_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS plan_activities_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS mindful_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS gym_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS superfood_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS supplement_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS wind_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS feminine_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                role TEXT, 
                message TEXT,
                createdAt TEXT NOT NULL
            );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS statuses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    icon INTEGER,
                    description TEXT NOT NULL,
                    status_type TEXT,
                    filePath TEXT,
                    createdAt TEXT NOT NULL,
                    lastSync TEXT
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS supplement_checklist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    is_checked INTEGER NOT NULL,
                    createdAt TEXT NOT NULL,
                    category TEXT NOT NULL
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS diet_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    routine TEXT NOT NULL,
                    routine_list TEXT NOT NULL,
                    time TEXT NOT NULL,
                    notification_message TEXT NOT NULL,
                    notification_days TEXT NOT NULL
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS supplements_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    routine TEXT NOT NULL,
                    routine_list TEXT NOT NULL,
                    time TEXT NOT NULL,
                    notification_message TEXT NOT NULL,
                    notification_days TEXT NOT NULL
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS activities_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    routine TEXT NOT NULL,
                    routine_list TEXT NOT NULL,
                    time TEXT NOT NULL,
                    notification_message TEXT NOT NULL,
                    notification_days TEXT NOT NULL
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS feminine_tracker (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    color TEXT NOT NULL,
                    start_date INTEGER,
                    end_date INTEGER,
                    is_last_date INTEGER,
                    day INTEGER
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS feminine_tracker_symptoms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    symptom_1 INTEGER DEFAULT 0,
                    symptom_2 INTEGER DEFAULT 0,
                    symptom_3 INTEGER DEFAULT 0,
                    symptom_4 INTEGER DEFAULT 0,
                    symptom_5 INTEGER DEFAULT 0,
                    symptom_6 INTEGER DEFAULT 0
                );`,
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    notification_id TEXT NOT NULL,
                    time TEXT,
                    title TEXT,
                    body TEXT,
                    channel TEXT,
                    frequency TEXT
                );`,
      );
    });
  } catch (e) {
    console.log('Error opening database: ', e);
  }
};

export const insertNotificationReord = async (
  id: string,
  time: Date,
  title: string,
  body: string,
  channel: string,
  frequency: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO notifications (notification_id, time, title, body, channel, frequency) VALUES (?, ?, ?, ?, ?, ?)`,
          [id, time.toISOString(), title, body, channel, frequency],
          (tx, results) => {
            console.log('Record inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting notification record: ', e);
      reject(e);
    }
  });
};

export const fetchNotificationRecord = async (
  condition: Record<string, string> = {},
): Promise<
  {
    body: string;
    channel: string;
    frequency: string;
    id: number;
    notification_id: string;
    time: string;
    title: string;
  }[]
> => {
  const columns = Object.keys(condition);
  const values = Object.values(condition);

  const whereClause = ` WHERE ${columns
    .map(column => `${column} = ?`)
    .join(' AND ')}`;
  const query = `SELECT * FROM notifications${
    columns.length !== 0 ? whereClause : ''
  }`;

  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          query,
          values,
          (_, result) => resolve(result.rows.raw()),
          (_, error) => {
            console.error('Error fetching notifications:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching notification record: ', e);
      reject(e);
    }
  });
};

export const deleteNotificationRecord = async (
  condition: Record<string, string> = {},
): Promise<void> => {
  const columns = Object.keys(condition);
  const values = Object.values(condition);

  const whereClause = ` WHERE ${columns
    .map(column => `${column} = ?`)
    .join(' AND ')}`;
  const query = `DELETE FROM notifications${
    columns.length !== 0 ? whereClause : ''
  }`;

  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          query,
          values,
          (_, result) => resolve(),
          (_, error) => {
            console.error('Error fetching notifications:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching notification record: ', e);
      reject(e);
    }
  });
};

export const updateNotificationRecord = async (
  updates: Record<string, any>,
  condition: Record<string, string> = {},
): Promise<void> => {
  if (Object.keys(updates).length === 0) {
    throw new Error('No update fields provided');
  }

  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  const setClause = Object.keys(updates)
    .map(column => `${column} = ?`)
    .join(', ');
  const setValues = Object.values(updates);

  const whereClause = Object.keys(condition).length
    ? ` WHERE ${Object.keys(condition)
        .map(column => `${column} = ?`)
        .join(' AND ')}`
    : '';
  const whereValues = Object.values(condition);

  const query = `UPDATE notifications SET ${setClause}${whereClause}`;

  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          query,
          [...setValues, ...whereValues],
          (_, result) => resolve(),
          (_, error) => {
            console.error('Error updating notifications:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error updating notification record: ', e);
      reject(e);
    }
  });
};

export const insertFeminineSymptomRecords = async (record: {
  date: string;
  symptom_1: number;
  symptom_2: number;
  symptom_3: number;
  symptom_4: number;
  symptom_5: number;
  symptom_6: number;
}): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO feminine_tracker_symptoms (date, symptom_1, symptom_2, symptom_3, symptom_4, symptom_5, symptom_6)  VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            record.date,
            record.symptom_1,
            record.symptom_2,
            record.symptom_3,
            record.symptom_4,
            record.symptom_5,
            record.symptom_6,
          ],
          (tx, results) => {
            console.log('Record inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting diet record: ', e);
      reject(e);
    }
  });
};

export const updateFeminineSymptomRecord = async (record: {
  date: string;
  symptom_1: number;
  symptom_2: number;
  symptom_3: number;
  symptom_4: number;
  symptom_5: number;
  symptom_6: number;
}): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE feminine_tracker_symptoms SET symptom_1 = ?, symptom_2 = ?, symptom_3 = ?, symptom_4 = ?, symptom_5 = ?, symptom_6 = ? WHERE date = ?`,
          [
            record.symptom_1,
            record.symptom_2,
            record.symptom_3,
            record.symptom_4,
            record.symptom_5,
            record.symptom_6,
            record.date,
          ],
          (tx, results) => {
            console.log('Record inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting diet record: ', e);
      reject(e);
    }
  });
};

export const insertFeminineDates = async (
  records: {
    date: string;
    color: string;
    start_date: number;
    end_date: number;
    last_date: number;
    day: number;
  }[],
): Promise<void> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        const promises = records.map(rec => {
          return new Promise<void>((innerResolve, innerReject) => {
            tx.executeSql(
              `INSERT INTO feminine_tracker (date, color, start_date, end_date, is_last_date, day) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                rec.date,
                rec.color,
                rec.start_date,
                rec.end_date,
                rec.last_date,
                rec.day,
              ],
              (_, results) => {
                console.log('Record inserted:', results.insertId);
                innerResolve();
              },
              (_, error) => {
                console.error('Error inserting record:', error);
                innerReject(error);
                return true;
              },
            );
          });
        });

        Promise.all(promises)
          .then(() => resolve())
          .catch(reject);
      },
      error => {
        console.error('Transaction error:', error);
        reject(error);
      },
    );
  });
};

export const fetchFeminineSymptomRecords = async (): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM feminine_tracker_symptoms`;

        tx.executeSql(
          query,
          [],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving feminine_tracker_symptoms:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchFeminineRecords = async (
  condition: string,
  value: any,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM feminine_tracker WHERE ${condition} = ?`;

        tx.executeSql(
          query,
          [value],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving feminine_tracker:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchAllFeminineRecords = async (): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM feminine_tracker`;

        tx.executeSql(
          query,
          [],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving feminine_tracker:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const deleteFeminineRecord = async (date: string) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM feminine_tracker WHERE date = ?',
          [date],
          (tx, results) => {
            console.log('Record deleted:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error deleting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error deleting record: ', e);
      reject(e);
    }
  });
};

export const updateFeminineRecord = async (
  key_column: string,
  update_column: string,
  key_value: any,
  update_value: any,
) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE feminine_tracker SET ${update_column} = ? WHERE ${key_column} = ?`,
          [update_value, key_value],
          (tx, results) => {
            console.log('Record updated:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error updating Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error updating diet record: ', e);
      reject(e);
    }
  });
};

export const insertDietRecords = async (
  date: string,
  routine: string,
  routineList: string,
  time: string,
  notificationMessage: string,
  notification_days: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO diet_records (date, routine, routine_list, time, notification_message, notification_days)  VALUES (?, ?, ?, ?, ?, ?)`,
          [
            date,
            routine,
            routineList,
            time,
            notificationMessage,
            notification_days,
          ],
          (tx, results) => {
            console.log('Record inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting diet record: ', e);
      reject(e);
    }
  });
};

export const insertSupplementsRecords = async (
  date: string,
  routine: string,
  routineList: string,
  time: string,
  notificationMessage: string,
  notification_days: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO supplements_records (date, routine, routine_list, time, notification_message, notification_days)  VALUES (?, ?, ?, ?, ?, ?)`,
          [
            date,
            routine,
            routineList,
            time,
            notificationMessage,
            notification_days,
          ],
          (tx, results) => {
            console.log('Record inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting diet record: ', e);
      reject(e);
    }
  });
};

export const insertActivitiesRecords = async (
  date: string,
  routine: string,
  routineList: string,
  time: string,
  notificationMessage: string,
  notification_days: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO activities_records (date, routine, routine_list, time, notification_message, notification_days)  VALUES (?, ?, ?, ?, ?, ?)`,
          [
            date,
            routine,
            routineList,
            time,
            notificationMessage,
            notification_days,
          ],
          (tx, results) => {
            console.log('Record inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting diet record: ', e);
      reject(e);
    }
  });
};

export const deleteDietRecord = async (date: string) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM diet_records WHERE date = ?',
          [date],
          (tx, results) => {
            console.log('Record deleted:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error deleting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error deleting diet record: ', e);
      reject(e);
    }
  });
};

export const deleteSupplementsRecord = async (date: string) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM supplements_records WHERE date = ?',
          [date],
          (tx, results) => {
            console.log('Record deleted:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error deleting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error deleting supplements record: ', e);
      reject(e);
    }
  });
};

export const deleteActivitiesRecord = async (date: string) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM activities_records WHERE date = ?',
          [date],
          (tx, results) => {
            console.log('Record deleted:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error deleting Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error deleting activities record: ', e);
      reject(e);
    }
  });
};

export const updateDietRecord = async (
  date: string,
  routine: string,
  routine_items: string,
) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE diet_records SET routine_list = ? WHERE date = ? AND routine = ?',
          [routine_items, date, routine],
          (tx, results) => {
            console.log('Record updated:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error updating Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error updating diet record: ', e);
      reject(e);
    }
  });
};

export const updateSupplementsRecord = async (
  date: string,
  routine: string,
  routine_items: string,
) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE supplements_records SET routine_list = ? WHERE date = ? AND routine = ?',
          [routine_items, date, routine],
          (tx, results) => {
            console.log('Record updated:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error updating Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error updating supplements record: ', e);
      reject(e);
    }
  });
};

export const updateActivitiesRecord = async (
  date: string,
  routine: string,
  routine_items: string,
) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE activities_records SET routine_list = ? WHERE date = ? AND routine = ?',
          [routine_items, date, routine],
          (tx, results) => {
            console.log('Record updated:', results);
            resolve(results.rowsAffected);
          },
          error => {
            console.error('Error updating Record:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error updating activities record: ', e);
      reject(e);
    }
  });
};

export const insertMultipleDietRecords = async (routineList: Routine[]) => {
  const dateString = moment().format('YYYY-MM-DD');
  for (const routine of routineList) {
    await insertDietRecords(
      dateString,
      routine.routine,
      JSON.stringify(routine.routine_items),
      routine.time,
      routine.notification_message,
      JSON.stringify(routine.notification_days),
    );
  }
};

export const insertMultipleSupplementRecords = async (
  routineList: Routine[],
) => {
  const dateString = moment().format('YYYY-MM-DD');
  for (const routine of routineList) {
    await insertSupplementsRecords(
      dateString,
      routine.routine,
      JSON.stringify(routine.routine_items),
      routine.time,
      routine.notification_message,
      JSON.stringify(routine.notification_days),
    );
  }
};

export const insertMultipleActivitiesRecords = async (
  routineList: Routine[],
) => {
  const dateString = moment().format('YYYY-MM-DD');
  for (const routine of routineList) {
    await insertActivitiesRecords(
      dateString,
      routine.routine,
      JSON.stringify(routine.routine_items),
      routine.time,
      routine.notification_message,
      JSON.stringify(routine.notification_days),
    );
  }
};

export const fetchDietRecordByDate = async (
  date: string,
  routine?: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM diet_records WHERE date = ?${
          routine !== undefined ? 'AND routine = ?' : ''
        }`;
        const params = routine !== undefined ? [date, routine] : [date];

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving diet_records:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchSupplementRecordByDate = async (
  date: string,
  routine?: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM supplements_records WHERE date = ?${
          routine !== undefined ? 'AND routine = ?' : ''
        }`;
        const params = routine !== undefined ? [date, routine] : [date];

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving supplements_records:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchActivitiesRecordByDate = async (
  date: string,
  routine?: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM activities_records WHERE date = ?${
          routine !== undefined ? 'AND routine = ?' : ''
        }`;
        const params = routine !== undefined ? [date, routine] : [date];

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving activities_records:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchDietRecordWithDateRange = async (
  start_date: string,
  end_date: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM diet_records WHERE date BETWEEN ? AND ? ORDER BY date ASC`;

        tx.executeSql(
          query,
          [start_date, end_date],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving diet_records:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchSupplementRecordWithDateRange = async (
  start_date: string,
  end_date: string,
) => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM supplements_records WHERE date BETWEEN ? AND ? ORDER BY date ASC`;

        tx.executeSql(
          query,
          [start_date, end_date],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving supplements_records:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchActivitiesRecordWithDateRange = async (
  start_date: string,
  end_date: string,
): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return new Promise(async (resolve, reject) => {
    try {
      db.transaction(tx => {
        const query = `SELECT * FROM activities_records WHERE date BETWEEN ? AND ? ORDER BY date ASC`;

        tx.executeSql(
          query,
          [start_date, end_date],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving activities_records:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const dropMessageTable = async (tableName: string): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return db.transaction((tx: SQLiteTransaction) => {
    tx.executeSql(
      `DROP TABLE IF EXISTS ${tableName}`,
      [],
      (tx, result) => {
        console.log(`${tableName} table dropped successfully.`);
      },
      (tx, error) => {
        console.error(`Failed to drop ${tableName} table: ${error.message}`);
      },
    );
  });
};

export const clearTable = async (tableName: string): Promise<any> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  return db.transaction((tx: SQLiteTransaction) => {
    tx.executeSql(
      `DELETE FROM ${tableName}`,
      [],
      (tx, result) => {
        console.log(`${tableName} table cleared successfully.`);
      },
      (tx, error) => {
        console.error(`Failed to clear ${tableName} table: ${error.message}`);
      },
    );
  });
};

export const deleteMessagesByDate = async (
  tableName: string,
  date: string,
): Promise<any> => {
  try {
    db = await SQLite.openDatabase({
      name: 'messages.db',
      location: 'default',
    });

    if (!db) {
      throw new Error('Failed to open database');
    }

    return db.transaction((tx: SQLiteTransaction) => {
      tx.executeSql(
        `DELETE FROM ${tableName} WHERE DATE(createdAt) = ?`,
        [date],
        (_, result) => {
          console.log(
            `Deleted ${result.rows.length} messages from ${tableName} for date: ${date}`,
          );
        },
        (_, error) => {
          console.error(`Failed to delete messages from ${tableName}: `, error);
          return false;
        },
      );
    });
  } catch (e) {
    console.log('Error deleting messages: ', e);
  }
};

export const saveMindfulMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO mindful_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const saveGeneralMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO general_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const savePlanSuperfoodMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO plan_superfood_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const savePlanSupplementMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO plan_supplement_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const savePlanActivitiesMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO plan_activities_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const saveGymMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO gym_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const saveSuperfoodMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO superfood_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const saveSupplementMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO supplement_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const saveFeminineMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO feminine_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const saveWindMessage = async (
  role: string,
  message: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO wind_messages (role, message, createdAt) VALUES (?, ?, ?)',
          [role, message, new Date().toISOString()],
          (tx, results) => {
            console.log('Message inserted:', results.insertId);
            resolve(results.insertId);
          },
          error => {
            console.error('Error inserting Message:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const fetchGeneralChatMessage = async (
  date?: string,
): Promise<Message[]> => {
  const query = `SELECT * FROM general_messages${
    date !== undefined ? ' WHERE createdAt = ?' : ''
  }  ORDER BY createdAt DESC`;
  const params = date !== undefined ? [date] : [];

  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving general messages:', error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('Error in fetching messages:', error);
      reject(error);
    }
  });
};

export const fetchPlanSuperfoodMessage = async (
  date?: string,
): Promise<Message[]> => {
  const query = `SELECT * FROM plan_superfood_messages${
    date !== undefined ? ' WHERE createdAt = ?' : ''
  }  ORDER BY createdAt ASC`;
  const params = date !== undefined ? [date] : [];

  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving general messages:', error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('Error in fetching messages:', error);
      reject(error);
    }
  });
};

export const fetchPlanSupplementChatMessage = async (
  date?: string,
): Promise<Message[]> => {
  const query = `SELECT * FROM plan_supplement_messages${
    date !== undefined ? ' WHERE createdAt = ?' : ''
  }  ORDER BY createdAt ASC`;
  const params = date !== undefined ? [date] : [];

  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving general messages:', error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('Error in fetching messages:', error);
      reject(error);
    }
  });
};

export const fetchPlanActivitiesChatMessage = async (
  date?: string,
): Promise<Message[]> => {
  const query = `SELECT * FROM plan_activities_messages${
    date !== undefined ? ' WHERE createdAt = ?' : ''
  }  ORDER BY createdAt ASC`;
  const params = date !== undefined ? [date] : [];

  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });

      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving general messages:', error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.log('Error in fetching messages:', error);
      reject(error);
    }
  });
};

export const fetchMindfulMessages = async (
  timeframe: 'day' | 'week' | 'month',
  date?: Date,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const baseDate = date ? new Date(date) : new Date();
        let query = 'SELECT * FROM mindful_messages';
        const params = [];

        let dateCondition = '';

        // Adjust query based on timeframe
        if (timeframe === 'day') {
          const dayString = baseDate.toISOString().split('T')[0];
          dateCondition = ' WHERE DATE(createdAt) = ?';
          params.push(dayString);
        } else if (timeframe === 'week') {
          const startOfWeek = new Date(baseDate);
          startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
          const startDate = startOfWeek.toISOString().split('T')[0];

          const endOfWeek = new Date(baseDate);
          endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of week
          const endDate = endOfWeek.toISOString().split('T')[0];

          dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (timeframe === 'month') {
          const year = baseDate.getFullYear();
          const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Get month in "MM" format
          dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
          params.push(`${year}-${month}`);
        }

        query += dateCondition + ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving mindful messages:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetch messages response: ', e);
      reject(e);
    }
  });
};

export const fetchGymMessages = async (
  timeframe: 'day' | 'week' | 'month',
  date?: Date,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const baseDate = date ? new Date(date) : new Date();
        let query = 'SELECT * FROM gym_messages';
        const params = [];

        let dateCondition = '';

        // Adjust query based on timeframe
        if (timeframe === 'day') {
          const dayString = baseDate.toISOString().split('T')[0];
          dateCondition = ' WHERE DATE(createdAt) = ?';
          params.push(dayString);
        } else if (timeframe === 'week') {
          const startOfWeek = new Date(baseDate);
          startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
          const startDate = startOfWeek.toISOString().split('T')[0];

          const endOfWeek = new Date(baseDate);
          endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of week
          const endDate = endOfWeek.toISOString().split('T')[0];

          dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (timeframe === 'month') {
          const year = baseDate.getFullYear();
          const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Get month in "MM" format
          dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
          params.push(`${year}-${month}`);
        }

        query += dateCondition + ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving gym messages:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching gym messages:', e);
      reject(e);
    }
  });
};

export const fetchSuperfoodMessages = async (
  timeframe: 'day' | 'week' | 'month',
  date?: Date,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const baseDate = date ? new Date(date) : new Date();
        let query = 'SELECT * FROM superfood_messages';
        const params = [];

        let dateCondition = '';

        // Adjust query based on timeframe
        if (timeframe === 'day') {
          const dayString = baseDate.toISOString().split('T')[0];
          dateCondition = ' WHERE DATE(createdAt) = ?';
          params.push(dayString);
        } else if (timeframe === 'week') {
          const startOfWeek = new Date(baseDate);
          startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
          const startDate = startOfWeek.toISOString().split('T')[0];

          const endOfWeek = new Date(baseDate);
          endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of week
          const endDate = endOfWeek.toISOString().split('T')[0];

          dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (timeframe === 'month') {
          const year = baseDate.getFullYear();
          const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Get month in "MM" format
          dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
          params.push(`${year}-${month}`);
        }

        query += dateCondition + ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving superfood messages:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching superfood messages:', e);
      reject(e);
    }
  });
};

export const fetchSupplementMessages = async (
  timeframe?: 'day' | 'week' | 'month',
  date?: Date,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const baseDate = date ? new Date(date) : new Date();
        let query = 'SELECT * FROM supplement_messages';
        const params: string[] = [];

        let dateCondition = '';

        // Adjust query based on timeframe
        if (timeframe === 'day') {
          const dayString = baseDate.toISOString().split('T')[0];
          dateCondition = ' WHERE DATE(createdAt) = ?';
          params.push(dayString);
        } else if (timeframe === 'week') {
          const startOfWeek = new Date(baseDate);
          startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
          const startDate = startOfWeek.toISOString().split('T')[0];

          const endOfWeek = new Date(baseDate);
          endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of week
          const endDate = endOfWeek.toISOString().split('T')[0];

          dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (timeframe === 'month') {
          const year = baseDate.getFullYear();
          const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Get month in "MM" format
          dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
          params.push(`${year}-${month}`);
        }

        query += dateCondition + ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving messages:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching messages response: ', e);
      reject(e);
    }
  });
};

export const fetchWindMessages = async (
  timeframe: 'day' | 'week' | 'month',
  date?: Date,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const baseDate = date ? new Date(date) : new Date();
        let query = 'SELECT * FROM wind_messages';
        const params = [];

        let dateCondition = '';

        // Adjust query based on timeframe
        if (timeframe === 'day') {
          const dayString = baseDate.toISOString().split('T')[0];
          dateCondition = ' WHERE DATE(createdAt) = ?';
          params.push(dayString);
        } else if (timeframe === 'week') {
          const startOfWeek = new Date(baseDate);
          startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
          const startDate = startOfWeek.toISOString().split('T')[0];

          const endOfWeek = new Date(baseDate);
          endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of week
          const endDate = endOfWeek.toISOString().split('T')[0];

          dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (timeframe === 'month') {
          const year = baseDate.getFullYear();
          const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Get month in "MM" format
          dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
          params.push(`${year}-${month}`);
        }

        query += dateCondition + ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving wind messages:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching wind messages:', e);
      reject(e);
    }
  });
};

export const fetchFeminineMessages = async (
  timeframe: 'day' | 'week' | 'month',
  date?: Date,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const baseDate = date ? new Date(date) : new Date();
        let query = 'SELECT * FROM feminine_messages';
        const params = [];

        let dateCondition = '';

        // Adjust query based on timeframe
        if (timeframe === 'day') {
          const dayString = baseDate.toISOString().split('T')[0];
          dateCondition = ' WHERE DATE(createdAt) = ?';
          params.push(dayString);
        } else if (timeframe === 'week') {
          const startOfWeek = new Date(baseDate);
          startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
          const startDate = startOfWeek.toISOString().split('T')[0];

          const endOfWeek = new Date(baseDate);
          endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of week
          const endDate = endOfWeek.toISOString().split('T')[0];

          dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (timeframe === 'month') {
          const year = baseDate.getFullYear();
          const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Get month in "MM" format
          dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
          params.push(`${year}-${month}`);
        }

        query += dateCondition + ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          error => {
            console.error('Error retrieving wind messages:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error fetching wind messages:', e);
      reject(e);
    }
  });
};

export const insertStatus = async (element: any): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO statuses (icon, description, status_type, filePath, createdAt, lastSync)
                     VALUES (?, ?, ?, ?, ?, ?)`,
            [
              element?.icon || null,
              element?.description || null,
              element?.status_type || null,
              element?.filePath || null,
              new Date().toISOString(),
              null,
            ],
            (tx, results) => {
              console.log(
                'Status inserted successfully with ID:',
                results.insertId,
              );
              resolve(results.insertId); // Resolve the promise with the insert ID
            },
            (tx, error) => {
              console.error('Error executing SQL for status insertion:', error);
              reject(error); // Reject the promise with the error
            },
          );
        },
        txError => {
          console.error('Transaction error:', txError);
          reject(txError); // Reject the promise with the transaction error
        },
        () => {
          console.log('Transaction completed successfully');
        },
      );
    } catch (e) {
      console.error('Caught exception while inserting status:', e);
      reject(e); // Catch and reject any higher-level exceptions
    }
  });
};

export const deleteStatus = (id: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM statuses WHERE id = ?',
          [id],
          (tx, results) => {
            console.log('Status deleted from DB:', results);
          },
          error => {
            console.error('Error deleting status from DB:', error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const getStatuses = async (date?: Date): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });
      db.transaction(tx => {
        const dateString = date ? date.toISOString().split('T')[0] : null;

        let query = 'SELECT * FROM statuses';
        const params = [];

        if (dateString) {
          query += ' WHERE DATE(createdAt) = ?'; // Assuming createdAt is a timestamp
          params.push(dateString);
        }

        tx.executeSql(
          query,
          params,
          (tx, results) => {
            const statuses = [];
            let len = results.rows.length;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                statuses.push(results.rows.item(i));
              }
              resolve(statuses);
            } else {
              resolve([]);
            }
          },
          error => {
            console.error('Error retrieving statuses:', error);
            reject(error);
          },
        );
      });
    } catch (e) {
      console.log('Error inserting quiz response: ', e);
      reject(e);
    }
  });
};

export const updateCheckboxStateInDB = async (
  tableName: string,
  title: string,
  isChecked: boolean,
  date?: Date,
) => {
  try {
    const db = await SQLite.openDatabase({
      name: 'messages.db',
      location: 'default',
    });

    if (!db) {
      throw new Error('Failed to open database');
    }

    const createdAt = date
      ? date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]; // Store only the date part
    const isCheckedInt = isChecked ? 1 : 0;

    db.transaction((tx: SQLiteTransaction) => {
      // First check if the record exists
      tx.executeSql(
        `SELECT * FROM ${tableName} WHERE title = ? AND createdAt = ?`,
        [title, createdAt],
        (_, { rows }) => {
          if (rows.length > 0) {
            // If record exists, update it
            tx.executeSql(
              `UPDATE ${tableName} SET is_checked = ? WHERE title = ? AND createdAt = ?`,
              [isCheckedInt, title, createdAt],
              (_, result) => {
                console.log('Checkbox state updated for', title);
              },
              (_, error) => {
                console.error('Error updating checkbox state: ', error);
                return false;
              },
            );
          } else {
            // If record doesn't exist, insert it
            tx.executeSql(
              `INSERT INTO ${tableName} (title, is_checked, createdAt) VALUES (?, ?, ?)`,
              [title, isCheckedInt, createdAt],
              (_, result) => {
                console.log('Checkbox state inserted for', title);
              },
              (_, error) => {
                console.error('Error inserting checkbox state: ', error);
                return false;
              },
            );
          }
        },
        (_, error) => {
          console.error('Error checking checkbox state: ', error);
          return false;
        },
      );
    });
  } catch (e) {
    console.error('Error updating checkbox state: ', e);
  }
};

export const fetchCheckboxStateByDate = (
  tableName: string,
  date: Date,
): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabase({
        name: 'messages.db',
        location: 'default',
      });

      if (!db) {
        throw new Error('Failed to open database');
      }

      const dateString = date
        ? date.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
          `SELECT * FROM ${tableName} WHERE createdAt = ?`,
          [dateString],
          (_, { rows }) => {
            const data = [];
            let len = rows.length;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                data.push(rows.item(i));
              }
              resolve(data);
            } else {
              resolve([]);
            }
          },
          (_, error) => {
            console.error('Error fetching checkbox state: ', error);
            reject(error); // Reject if there's an error during the query execution
          },
        );
      });
    } catch (e) {
      console.error('Error fetching checkbox state: ', e);
      reject(e); // Reject if there's an error opening the database
    }
  });
};

export const fetchStatusRecords = async (
  timeframe: 'day' | 'week' | 'month',
  date?: Date, // Optional date parameter
): Promise<any[]> => {
  const db = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });

  const baseDate = date ? new Date(date) : new Date();
  let query = 'SELECT * FROM statuses';
  const params: string[] = [];

  let dateCondition = '';

  // Adjust query based on the timeframe
  if (timeframe === 'day') {
    const dayString = baseDate.toISOString().split('T')[0];
    dateCondition = ' WHERE DATE(createdAt) = ?';
    params.push(dayString);
  } else if (timeframe === 'week') {
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start of the week
    const startDate = startOfWeek.toISOString().split('T')[0];

    const endOfWeek = new Date(baseDate);
    endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay())); // End of the week
    const endDate = endOfWeek.toISOString().split('T')[0];

    dateCondition = ' WHERE DATE(createdAt) BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (timeframe === 'month') {
    const year = baseDate.getFullYear();
    const month = ('0' + (baseDate.getMonth() + 1)).slice(-2); // Format month as "MM"
    dateCondition = ' WHERE strftime("%Y-%m", createdAt) = ?';
    params.push(`${year}-${month}`);
  }

  query += dateCondition + ' ORDER BY createdAt DESC';

  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLiteTransaction) => {
      tx.executeSql(
        query, // Select records based on the calculated timeframe condition
        params, // Pass the calculated parameters
        (_, result) => {
          const rows = result.rows;
          const statuses = [];
          for (let i = 0; i < rows.length; i++) {
            statuses.push(rows.item(i)); // Push each row into the statuses array
          }
          resolve(statuses); // Resolve the array of status records
        },
        (_, error) => {
          console.error('Fetch failed:', error);
          reject(error); // Reject the promise if there's an error
          return false;
        },
      );
    });
  });
};
