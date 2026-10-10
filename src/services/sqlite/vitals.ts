import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { SQLiteResultSet, SQLiteTransaction, Status } from './interface';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db: SQLiteDatabase;

export const initializeDatabase = async (): Promise<any> => {
    try {
        db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

        if (!db) {
            throw new Error('Failed to open database');
        }

        return db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS vitals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vital_type TEXT NOT NULL,
                value TEXT,
                unit TEXT,
                createdAt TEXT NOT NULL,
                lastSync TEXT
            );`
            );

            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                icon INTEGER,
                description TEXT NOT NULL,
                status_type TEXT,
                filePath TEXT,
                createdAt TEXT NOT NULL,
                lastSync TEXT
            );`
            );

            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS questions (
                  id INTEGER PRIMARY KEY NOT NULL,
                  text TEXT NOT NULL,
                  description TEXT,
                  type TEXT,
                  placeholder TEXT,
                  answer TEXT,
                  createdAt TEXT,
                  updatedAt TEXT
                );`,
                [],
                () => console.log('Questions table created successfully'),
                (tx, error) => console.log('Error creating table: ', error)
            );

            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS quiz_responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT NOT NULL,
                    lastSync TEXT
                );`
            );

            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS quiz_answers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    quizId INTEGER NOT NULL,
                    questionId INTEGER NOT NULL,
                    answer TEXT NOT NULL
                );`
            );

            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS health_questionnaire (
                    id TEXT NOT NULL,
                    question TEXT NOT NULL,
                    answers TEXT NOT NULL
                )`
            );
        });
    } catch (e) {
        console.log('Error opening database: ', e);
    }
};

export const clearTable = async (tableName: string): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `DELETE FROM ${tableName}`,
            [],
            (tx, result) => {
                console.log(`${tableName} table cleared successfully.`);
            },
            (tx, error) => {
                console.error(`Failed to clear ${tableName} table: ${error.message}`);
            }
        );
    });
};

export const dropTable = async (tableName: string): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `DROP TABLE IF EXISTS ${tableName}`,
            [],
            (tx, result) => {
                console.log(`${tableName} table dropped successfully.`);
            },
            (tx, error) => {
                console.error(`Failed to drop ${tableName} table: ${error.message}`);
            }
        );
    });
};

export const resetDatabase = async (): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return db.transaction(async (tx: SQLiteTransaction) => {
        // Drop all tables
        await dropTable('vitals');
        await dropTable('status');

        // Recreate tables
        await initializeDatabase();
    });
};

export const updateSyncTimestamp = async (id: number): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    const currentTimestamp = new Date().toISOString(); // Get current UTC timestamp

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `UPDATE vitals SET lastSync = ? WHERE id = ?`,
            [currentTimestamp, id]
        );
    });
};

export const updateStatusSyncTimestamp = async (id: number): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    const currentTimestamp = new Date().toISOString(); // Get current UTC timestamp

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `UPDATE status SET lastSync = ? WHERE id = ?`,
            [currentTimestamp, id]
        );
    });
};

export const updateQuizResponseSyncTimestamp = async (id: number): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    const currentTimestamp = new Date().toISOString(); // Get current UTC timestamp

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `UPDATE quiz_responses SET lastSync = ? WHERE id = ?`,
            [currentTimestamp, id]
        );
    });
};

export const getUnsyncedVitalsData = async (): Promise<any[]> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return new Promise((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                `SELECT * FROM vitals WHERE lastSync IS NULL OR lastSync < createdAt`,
                [],
                (tx, results) => {
                    let data = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        data.push(results.rows.item(i));
                    }
                    resolve(data);
                },
                (tx, error) => {
                    reject(error);
                }
            );
        });
    });
};

export const getUnsyncedStatusData = async (): Promise<any[]> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return new Promise((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                `SELECT * FROM status WHERE lastSync IS NULL OR lastSync < createdAt`,
                [],
                (tx, results) => {
                    let data = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        data.push(results.rows.item(i));
                    }
                    resolve(data);
                },
                (tx, error) => {
                    reject(error);
                }
            );
        });
    });
};

export const getUnsyncedQuizResponsesData = async (): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

            db.transaction((tx) => {
                // Retrieve all unsynced quiz responses
                tx.executeSql(
                    `SELECT * FROM quiz_responses WHERE lastSync IS NULL OR lastSync < createdAt;`,
                    [],
                    (tx, result) => {
                        if (result.rows.length > 0) {
                            let quizResponses = [];

                            for (let i = 0; i < result.rows.length; i++) {
                                let quizResponse = result.rows.item(i);

                                // Retrieve all answers for the quiz
                                tx.executeSql(
                                    `SELECT * FROM quiz_answers WHERE quizId = ?`,
                                    [quizResponse.id],
                                    (tx, answersResult) => {
                                        let responses = [];

                                        for (let j = 0; j < answersResult.rows.length; j++) {
                                            let answerRow = answersResult.rows.item(j);

                                            let answers;
                                            try {
                                                answers = answerRow ? JSON.parse(answerRow.answer) : [];
                                            } catch (e) {
                                                console.log('JSON Parse error:', e);
                                                answers = [];
                                            }

                                            responses.push({
                                                questionId: answerRow.questionId,
                                                answers: answers,
                                            });
                                        }

                                        // Construct the full response object for each quiz
                                        const fullQuizResponse = {
                                            id: quizResponse.id,
                                            responses: responses,
                                            createdAt: quizResponse.createdAt,
                                            updatedAt: quizResponse.updatedAt,
                                        };

                                        quizResponses.push(fullQuizResponse);

                                        // Once all quizzes are processed, resolve the data
                                        if (i === result.rows.length - 1) {
                                            resolve(quizResponses);
                                        }
                                    },
                                    (tx, error) => {
                                        console.log('Error retrieving quiz answers:', error);
                                        reject(error);
                                    }
                                );
                            }
                        } else {
                            console.log('No unsynced quiz responses found');
                            resolve([]);
                        }
                    },
                    (tx, error) => {
                        console.log('Error retrieving unsynced quiz responses:', error);
                        reject(error);
                    }
                );
            });
        } catch (e) {
            console.log('Error fetching unsynced quiz responses: ', e);
            reject(e);
        }
    });
};

export const addVitalToDB = async (vital: { vital_type: string; value: string, unit?: string | undefined, createdAt?:string }): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                `INSERT INTO vitals (vital_type, value, unit, createdAt, lastSync) 
                 VALUES (?, ?, ?, ?, ?);`,
                [
                    vital.vital_type,
                    vital.value || null,
                    vital.unit || null,
                    vital.createdAt ?? new Date().toISOString(),
                    null,
                ],
                (tx, results) => {
                    console.log('Vital added successfully:', results);
                    resolve(results);
                },
                (tx, error) => {
                    console.log('Error adding vital:', error);
                    reject(error);
                }
            );
        });
    });
};


export const addStatusRecord = async (
    description: string,
    icon: number,
    status_type: string,
    filePath: string
): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `INSERT INTO status (description, icon, status_type, filePath, createdAt, lastSync) VALUES (?, ?, ?, ?, ?, ?)`,
            [description, icon, status_type, filePath, new Date().toISOString(), null]
        );
    });
};

export const deleteStatusRecord = async (id: number): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            `DELETE FROM status WHERE id = ?`,
            [id],
            (_, result) => console.log('Delete success:', result),
            (_, error) => {
                console.error('Delete failed:', error);
                return false;
            }
        );
    });
};

export const insertQuestions = async (questions: any[]): Promise<any> => {
    try {
        const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

        return db.transaction((tx) => {
            questions.forEach((question) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO questions (id, text, description, type, placeholder, answer, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        question.id,
                        question.text,
                        question.description,
                        question.type,
                        question.placeholder,
                        JSON.stringify(question.answer), // Convert array to JSON string
                        question.createdAt,
                        question.updatedAt
                    ],
                    (tx, result) => {
                        console.log('Question inserted successfully:', result);
                    },
                    (tx, error) => {
                        console.log('Error inserting question:', error);
                    }
                );
            });
        });
    } catch (e) {
        console.log('Error inserting questions: ', e);
    }
};

export const insertQuizResponse = async (response: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

            db.transaction((tx) => {
                // Insert the quiz response metadata with lastSync
                tx.executeSql(
                    `INSERT INTO quiz_responses (createdAt, updatedAt, lastSync) 
                     VALUES (?, ?, ?)`,
                    [new Date().toISOString(), new Date().toISOString(), null],
                    (tx, result) => {
                        const quizId = result.insertId;
                        console.log('Quiz response inserted successfully:', result);

                        // Insert the answers for each question with lastSync
                        response.responses.forEach((question: any) => {
                            tx.executeSql(
                                `INSERT INTO quiz_answers (quizId, questionId, answer) 
                                 VALUES (?, ?, ?)`,
                                [quizId, question.questionId, JSON.stringify(question.answers)],
                                (tx, result) => {
                                    console.log('Answer inserted successfully:', result);
                                },
                                (tx, error) => {
                                    console.log('Error inserting answer:', error);
                                    reject(error);
                                }
                            );
                        });
                    },
                    (tx, error) => {
                        console.log('Error inserting quiz response:', error);
                        reject(error);
                    }
                );
            },
                (error) => {
                    console.error('Transaction error:', error);
                    reject(error);
                },
                () => {
                    console.log('All responses and answers inserted successfully');
                    resolve(true);
                });
        } catch (e) {
            console.log('Error inserting quiz response: ', e);
            reject(e);
        }
    });
};

export const updateQuizResponse = async (quizId: number, responses: any[]): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

            db.transaction((tx) => {
                // Update the quiz response metadata (if needed)
                tx.executeSql(
                    `UPDATE quiz_responses SET updatedAt = ? WHERE id = ?`,
                    [new Date().toISOString(), quizId],
                    (tx, result) => {
                        console.log('Quiz response metadata updated successfully:', result);

                        // Delete existing answers for the quiz
                        tx.executeSql(
                            `DELETE FROM quiz_answers WHERE quizId = ?`,
                            [quizId],
                            (tx, result) => {
                                console.log('Existing answers deleted successfully:', result);

                                // Insert the updated answers for each question
                                responses.forEach((question: any) => {
                                    tx.executeSql(
                                        `INSERT INTO quiz_answers (quizId, questionId, answer) 
                                         VALUES (?, ?, ?)`,
                                        [quizId, question.questionId, JSON.stringify(question.answers)],
                                        (tx, result) => {
                                            console.log('Answer updated successfully:', result);
                                        },
                                        (tx, error) => {
                                            console.log('Error updating answer:', error);
                                            reject(error);
                                        }
                                    );
                                });
                            },
                            (tx, error) => {
                                console.log('Error deleting existing answers:', error);
                                reject(error);
                            }
                        );
                    },
                    (tx, error) => {
                        console.log('Error updating quiz response metadata:', error);
                        reject(error);
                    }
                );
            },
                (error) => {
                    console.error('Transaction error:', error);
                    reject(error);
                },
                () => {
                    console.log('Quiz response and answers updated successfully');
                    resolve(true);
                });
        } catch (e) {
            console.log('Error updating quiz response: ', e);
            reject(e);
        }
    });
};

export const getQuizResponse = async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

            db.transaction((tx) => {
                // Retrieve the most recent quiz response
                tx.executeSql(
                    `SELECT * FROM quiz_responses ORDER BY createdAt DESC LIMIT 1;`,
                    [],
                    (tx, result) => {
                        if (result.rows.length > 0) {
                            let quizResponse = result.rows.item(0);

                            // Retrieve all answers for the quiz
                            tx.executeSql(
                                `SELECT * FROM quiz_answers WHERE quizId = ?`,
                                [quizResponse.id],
                                (tx, answersResult) => {
                                    let responses = [];
                                    console.log(answersResult.rows);

                                    let len = answersResult.rows.length;

                                    for (let i = 0; i < len; i++) {
                                        let answerRow = answersResult.rows.item(i);

                                        console.log(answerRow);


                                        let answers;

                                        // Ensure the answers field is not null or undefined before parsing
                                        try {
                                            answers = answerRow ? JSON.parse(answerRow.answer) : [];
                                        } catch (e) {
                                            console.log('JSON Parse error:', e);
                                            answers = [];
                                        }

                                        responses.push({
                                            questionId: answerRow.questionId,
                                            answers: answers
                                        });
                                    }

                                    // Construct the full response object
                                    const fullQuizResponse = {
                                        id: quizResponse.id,
                                        responses: responses,
                                        createdAt: quizResponse.createdAt,
                                        updatedAt: quizResponse.updatedAt
                                    };

                                    resolve(fullQuizResponse);
                                },
                                (tx, error) => {
                                    console.log('Error retrieving quiz answers:', error);
                                    reject(error);
                                }
                            );
                        } else {
                            console.log('Quiz not found');
                            resolve(null);
                        }
                    },
                    (tx, error) => {
                        console.log('Error retrieving quiz response:', error);
                        reject(error);
                    }
                );
            });
        } catch (e) {
            console.log('Error fetching quiz response: ', e);
            reject(e);
        }
    });
};

// export const getVitalsFromDB = async (): Promise<Vital[]> => {
//     return new Promise<Vital[]>((resolve, reject) => {
//         db.transaction((tx: SQLiteTransaction) => {
//             tx.executeSql(
//                 'SELECT * FROM vitals;',
//                 [],
//                 (tx, results: SQLiteResultSet) => {
//                     const vitals: Vital[] = [];
//                     for (let i = 0; i < results.rows.length; i++) {
//                         vitals.push(results.rows.item(i) as Vital);
//                     }
//                     resolve(vitals);
//                 },
//                 (tx, error) => {
//                     console.log('Error fetching vitals: ', error);
//                     reject(error);
//                 }
//             );
//         });
//     });
// };


export const getVitalsFromDB = async (): Promise<{ id: number; vital_type: string; value: string; createdAt: string; lastSync: string | null }[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                'SELECT * FROM vitals;',
                [],
                (tx, results: SQLiteResultSet) => {
                    const vitals = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        const row = results.rows.item(i);
                        vitals.push({
                            id: row.id,
                            vital_type: row.vital_type,
                            value: row.value,
                            createdAt: row.createdAt,
                            lastSync: row.lastSync,
                        });
                    }
                    resolve(vitals);
                },
                (tx, error) => {
                    console.log('Error fetching vitals: ', error);
                    reject(error);
                }
            );
        });
    });
};

export const getStatusFromDB = async (): Promise<Status[]> => {
    return new Promise<Status[]>((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                'SELECT * FROM status;',
                [],
                (tx, results: SQLiteResultSet) => {
                    const status: Status[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        status.push(results.rows.item(i) as Status);
                    }
                    resolve(status);
                },
                (tx, error) => {
                    console.log('Error fetching vitals: ', error);
                    reject(error);
                }
            );
        });
    });
};

export const getQuestions = async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

            db.transaction((tx) => {
                tx.executeSql(
                    `SELECT * FROM questions;`,
                    [],
                    (tx, results) => {
                        const questions = [];
                        let len = results.rows.length;
                        if (len > 0) {
                            for (let i = 0; i < len; i++) {
                                let row = results.rows.item(i);
                                questions.push(row); // Store each row in an array
                            }
                            resolve(questions); // Resolve the promise with the questions array
                        } else {
                            resolve([]); // Resolve with an empty array if no data is found
                        }
                    },
                    (tx, error) => {
                        console.error('Error retrieving questions:', error);
                        reject(error); // Reject if there's an error in the query
                    }
                );
            });
        } catch (e) {
            console.error('Error fetching questions:', e);
            reject(e); // Reject if there's an error with opening the database
        }
    });
};

export const getLatestStatusFromDB = async (): Promise<Status[]> => {
    return new Promise<Status[]>((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                'SELECT * FROM status ORDER BY createdAt DESC LIMIT 15;',
                [],
                (tx, results: SQLiteResultSet) => {
                    const status: Status[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        status.push(results.rows.item(i) as Status);
                    }
                    resolve(status);
                },
                (tx, error) => {
                    console.log('Error fetching status: ', error);
                    reject(error);
                }
            );
        });
    });
};

export const deleteVitalFromDB = async (id: number): Promise<any> => {
    return db.transaction((tx: SQLiteTransaction) => {
        tx.executeSql(
            'DELETE FROM vitals WHERE id = ?;',
            [id],
            (tx, results) => {
                console.log('Vital deleted successfully');
            },
            (tx, error) => {
                console.log('Error deleting vital: ', error);
            }
        );
    });
};

// export const updateVitalInDB = async (vital: Vital): Promise<any> => {
//     return db.transaction((tx: SQLiteTransaction) => {
//         tx.executeSql(
//             `UPDATE vitals SET 
//                 vital_type = ?, 
//                 systolic_bp = ?, 
//                 diastolic_bp = ?, 
//                 heart_rate = ?, 
//                 heart_rate_v = ? 
//                 WHERE id = ?;`,
//             [
//                 vital.vital_type,
//                 vital.systolic_bp || null,
//                 vital.diastolic_bp || null,
//                 vital.heart_rate || null,
//                 vital.heart_rate_v || null,
//                 vital.id,
//             ],
//             (tx, results) => {
//                 console.log('Vital updated successfully');
//             },
//             (tx, error) => {
//                 console.log('Error updating vital: ', error);
//             }
//         );
//     });
// };

export const updateVitalInDB = async (vital: {
    id: number;
    vital_type: string;
    value: string | number | null;
}): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: SQLiteTransaction) => {
            let query = `UPDATE vitals SET vital_type = ?, value = ?, lastSync = ? WHERE id = ?`;
            let values: any[] = [
                vital.vital_type,
                vital.value || null,
                new Date().toISOString(),
                vital.id
            ];

            tx.executeSql(
                query,
                values,
                (tx, results) => {
                    console.log('Vital updated successfully:', results);
                    resolve(results);
                },
                (tx, error) => {
                    console.log('Error updating vital:', error);
                    reject(error);
                }
            );
        });
    });
};


// Initialize the database and create notifications table
export const initializeNotificationsTable = async (): Promise<any> => {
    try {
        db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

        return db.transaction((tx) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titleText TEXT NOT NULL,
                    time TEXT NOT NULL,
                    everyDay BOOLEAN NOT NULL,
                    selectedDays TEXT,
                    icon TEXT,
                    createdAt TEXT NOT NULL
                );`,
                [],
                () => console.log('Notifications table created successfully'),
                (tx, error) => console.log('Error creating notifications table: ', error)
            );
        });
    } catch (e) {
        console.log('Error opening database: ', e);
    }
};

// Function to insert a notification into the notifications table
export const addNotification = async (notification: {
    titleText: string;
    time: string;
    everyDay: boolean;
    selectedDays: number[];
    icon: string;
    createdAt: string;
}): Promise<any> => {
    if (!db) {
        console.log('Database not initialized');
        return;
    }

    return db.transaction((tx) => {
        tx.executeSql(
            `INSERT INTO notifications (titleText, time, everyDay, selectedDays, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                notification.titleText,
                notification.time,
                notification.everyDay ? 1 : 0, // store as 1 or 0 for boolean compatibility
                JSON.stringify(notification.selectedDays), // store array as JSON
                notification.icon,
                notification.createdAt
            ],
            (tx, result) => {
                console.log(`Notification inserted successfully with ID: ${result.insertId}`);
            },
            (tx, error) => {
                console.log('Error inserting notification: ', error);
            }
        );
    });
};

// Function to get all notifications from the notifications table
export const getAllNotifications = async (): Promise<any[]> => {
    if (!db) {
        console.log('Database not initialized');
        return [];
    }

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM notifications ORDER BY createdAt DESC;`,
                [],
                (tx, result) => {
                    const notifications = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        notifications.push(result.rows.item(i));
                    }
                    resolve(notifications);
                },
                (tx, error) => {
                    console.log('Error fetching notifications: ', error);
                    reject(error);
                }
            );
        });
    });
};

// Function to update notifications days from the notifications table
export const updateNotificationDays = async (id: number, selectedDays: number[]): Promise<void> => {
    if (!db) {
        console.log('Database not initialized');
        return;
    }

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                `UPDATE notifications SET selectedDays = ? WHERE id = ?`,
                [JSON.stringify(selectedDays), id], // Store the array as JSON
                (tx, result) => {
                    if (result.rowsAffected > 0) {
                        console.log(`Notification with ID: ${id} updated successfully.`);
                        resolve();
                    } else {
                        console.log(`No notification found with ID: ${id}.`);
                        resolve(); // Resolve even if no rows were updated
                    }
                },
                (tx, error) => {
                    console.log('Error updating notification: ', error);
                    reject(error); // Reject the promise if there's an error
                }
            );
        });
    });
};


// Function to delete all notifications from the notifications table
export const deleteAllNotifications = async (): Promise<void> => {
    if (!db) {
        console.log('Database not initialized');
        return;
    }

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                `DELETE FROM notifications;`,
                [],
                () => {
                    console.log('All notifications deleted successfully');
                    resolve();
                },
                (tx, error) => {
                    console.log('Error deleting notifications: ', error);
                    reject(error);
                }
            );
        });
    });
};

// Function to delete a notification by its ID from the notifications table
export const deleteNotificationById = async (id: number): Promise<void> => {
    if (!db) {
        console.log('Database not initialized');
        return;
    }

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                `DELETE FROM notifications WHERE id = ?;`,
                [id],
                () => {
                    console.log(`Notification with ID ${id} deleted successfully`);
                    resolve();
                },
                (tx, error) => {
                    console.log('Error deleting notification: ', error);
                    reject(error);
                }
            );
        });
    });
};
