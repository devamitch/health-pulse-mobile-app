import SQLite from 'react-native-sqlite-storage';
import { addStatusRecord } from "./vitals";
import { SQLiteResultSet, SQLiteTransaction, Status } from './interface';

const deleteDatabase = async (name: string) => {
    try {
        await SQLite.deleteDatabase({name: name, location: 'default'});
    } catch (error) {
        console.error(error);
    }
}

const getRandomStatusType = (): any => {
    const statusTypes = ["BP", "HR", "HRV"];
    const randomIndex = Math.floor(Math.random() * statusTypes.length);
    return statusTypes[randomIndex];
};

const getDescriptionForStatusType = (statusType: string): string => {
    const descriptionMap: { [key: string]: string } = {
        BP: "Your BP is a bit elevated. This might be due to higher than normal stress over the past two days. Consider taking some time to relax.",
        HR: "Your HR is a bit elevated. This might be due to higher than normal stress over the past two days. Consider taking some time to relax.",
        HRV: "Your HRV is a bit elevated. This might be due to higher than normal stress over the past two days. Consider taking some time to relax.",
    };
    return descriptionMap[statusType] || "No description available.";
};

export const deleteAllDatabase = async () => {
    try {
        const db_names = ['messages.db', 'vitals.db'];
        for (const db_name of db_names) {
            await deleteDatabase(db_name);
        }
    } catch (error) {
        console.log(error);
    }
}

export const addStatus = async (filePath: string) => {
    try {
        const status = getRandomStatusType(); // Get random status type
        const description = getDescriptionForStatusType(status); // Get description based on status type
        const passData = {
            description,
            status,
            filePath
        };

        await addStatusRecord(description, 0, 'popup', passData.filePath);

        console.log("Status added successfully:", passData);
    } catch (error) {
        console.error("Error adding status:", error);
    }
};

export const getThreeTypesFirstData = async (): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            const vitalTypes = ['BP', 'HR', 'HRV']; // Define the types you want to fetch
            const resultsArray: any[] = [];
            let completedQueries = 0;

            vitalTypes.forEach((type) => {
                tx.executeSql(
                    `SELECT * FROM vitals WHERE vital_type = ? ORDER BY createdAt DESC LIMIT 1;`,
                    [type],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            const row = results.rows.item(0);
                            resultsArray.push({
                                type: row.vital_type,
                                value: row.value || '0',
                                createdAt: row.createdAt || '',
                            });
                        } else {
                            // If no data found, push default values
                            resultsArray.push({
                                type: type,
                                value: '0',
                                createdAt: '',
                            });
                        }

                        completedQueries += 1;

                        // Resolve the promise once all queries are complete
                        if (completedQueries === vitalTypes.length) {
                            resolve(resultsArray);
                        }
                    },
                    (tx, error) => {
                        console.log('Error fetching vitals:', error);
                        reject(error);
                    }
                );
            });
        });
    });
};

export const getPrioritizedVitalData = async (vitalTypes: string[]): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            const resultsArray: any[] = [];
            let completedQueries = 0;

            vitalTypes.forEach((type) => {
                tx.executeSql(
                    `SELECT * FROM vitals WHERE vital_type = ? ORDER BY createdAt DESC LIMIT 1;`,
                    [type],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            const row = results.rows.item(0);
                            resultsArray.push({
                                type: row.vital_type,
                                value: row.value || '0',
                                createdAt: row.createdAt || '',
                            });
                        } else {
                            // If no data found, push default values
                            resultsArray.push({
                                type: type,
                                value: '0',
                                createdAt: '',
                            });
                        }

                        completedQueries += 1;

                        // Resolve the promise once all queries are complete
                        if (completedQueries === vitalTypes.length) {
                            resolve(resultsArray);
                        }
                    },
                    (tx, error) => {
                        console.log('Error fetching vitals:', error);
                        reject(error);
                    }
                );
            });
        });
    });
};

export const getVitalStatistics = async (type: string, timeframe: string, date?: Date): Promise<any> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT * FROM vitals WHERE vital_type = ?`;
            const params: any[] = [type];
            const now = date || new Date();

            // Timeframe-specific filtering
            if (timeframe === 'daily') {
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
                query += ` AND createdAt >= ? AND createdAt < ?`;
                params.push(startOfDay, endOfDay);
            } else if (timeframe === 'weekly') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 7);
                query += ` AND createdAt >= ? AND createdAt < ?`;
                params.push(startOfWeek.toISOString(), endOfWeek.toISOString());
            } else if (timeframe === 'monthly') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
                query += ` AND createdAt >= ? AND createdAt < ?`;
                params.push(startOfMonth, endOfMonth);
            } else if (timeframe === 'yearly') {
                const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
                const endOfYear = new Date(now.getFullYear() + 1, 0, 1).toISOString();
                query += ` AND createdAt >= ? AND createdAt < ?`;
                params.push(startOfYear, endOfYear);
            }

            query += ` ORDER BY createdAt DESC;`;

            tx.executeSql(
                query,
                params,
                (tx, results) => {
                    const rows = results.rows;
                    const values: number[] = [];
                    const rowCount = rows.length;

                    // Initialize graph result based on timeframe
                    let graphResult: any[] = [];

                    if (timeframe === 'daily') {
                        graphResult = [
                            "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
                            "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"
                        ].map(label => ({
                            stacks: [
                                { value: 0, color: "transparent" },
                                { value: 0, color: "#FE568D" }
                            ],
                            label: label
                        }));
                    } else if (timeframe === 'weekly') {
                        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        graphResult = daysOfWeek.map((day) => ({
                            stacks: [
                                { value: 0, color: "transparent" },
                                { value: 0, color: "#FE568D" }
                            ],
                            label: day
                        }));
                    } else if (timeframe === 'monthly') {
                        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                        graphResult = Array.from({ length: daysInMonth }, (_, index) => ({
                            stacks: [
                                { value: 0, color: "transparent" },
                                { value: 0, color: "#FE568D" }
                            ],
                            label: (index + 1).toString()
                        }));
                    } else if (timeframe === 'yearly') {
                        const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
                        graphResult = months.map((month) => ({
                            stacks: [
                                { value: 0, color: "transparent" },
                                { value: 0, color: "#FE568D" }
                            ],
                            label: month
                        }));
                    }

                    // Process database results
                    for (let i = 0; i < rowCount; i++) {
                        const row = rows.item(i);
                        const value = parseFloat(row.value) || 0;
                        const timestamp = new Date(row.createdAt);

                        // Determine graph index
                        let index = -1;
                        if (timeframe === 'daily') {
                            const hour = timestamp.getHours();
                            const label = `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`;
                            index = graphResult.findIndex(item => item.label === label);
                        } else if (timeframe === 'weekly') {
                            const dayOfWeek = timestamp.getDay();
                            const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            index = graphResult.findIndex(item => item.label === daysOfWeek[dayOfWeek]);
                        } else if (timeframe === 'monthly') {
                            const day = timestamp.getDate();
                            index = graphResult.findIndex(item => parseInt(item.label) === day);
                        } else if (timeframe === 'yearly') {
                            const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
                            const month = timestamp.getMonth();
                            index = graphResult.findIndex(item => item.label === months[month]);
                        }

                        // Update graph if index matches
                        if (index !== -1) {
                            if (type === 'BP') {
                                // Example split for BP
                                graphResult[index].stacks[0].value = value - 20;
                                graphResult[index].stacks[1].value = 20;
                            } else {
                                graphResult[index].stacks[0].value = value - 5;
                                graphResult[index].stacks[1].value = 5;
                            }
                        }

                        values.push(value);
                    }

                    console.log(values, 'values');


                    // Calculate vital statistics
                    const latestValue = values[0] || 0;
                    const low = Math.min(...values) || 0;
                    const high = Math.max(...values) || 0;
                    const average = values.reduce((acc, val) => acc + val, 0) / values.length || 0;

                    // Format latestDate
                    const latestDate = rows.item(0)?.createdAt;
                    const formattedLatestDate = latestDate ? new Date(latestDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    }) : '';

                    resolve({
                        latestValue,
                        low,
                        high,
                        average: average.toFixed(2),
                        graphResult,
                        latestDate: formattedLatestDate
                    });
                },
                (tx, error) => {
                    console.error('Error getting vital statistics:', error);
                    reject(error);
                }
            );
        });
    });
};

export const getVitalHistory = async (timeframe: string, date?: Date): Promise<any[]> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    const vitalTypes = ['BP', 'HR', 'HRV'];

    // Fetch status data
    const fetchStatus = () => {
        return new Promise<Status[]>((resolve, reject) => {
            db.transaction((tx: SQLiteTransaction) => {
                let query = 'SELECT * FROM status';
                const params: any[] = [];
                const now = date || new Date();

                if (timeframe === 'daily') {
                    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfDay);
                } else if (timeframe === 'weekly') {
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString(); // Sunday
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfWeek);
                } else if (timeframe === 'monthly') {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfMonth);
                } else if (timeframe === 'yearly') {
                    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfYear);
                }

                query += ' ORDER BY createdAt DESC LIMIT 15;';

                tx.executeSql(
                    query,
                    params,
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

    // Fetch status data first
    const statusList = await fetchStatus();
    const totalRecords = Math.min(statusList.length, 15); // Ensure we don't exceed 15 records
    const totalVitals = vitalTypes.length;

    // Calculate how many status records each vital type should get
    const recordsPerVital = Math.floor(totalRecords / totalVitals);
    const extraRecords = totalRecords % totalVitals;

    let extraRecordsAssigned = 0;

    // Distribute records to each vital type
    const getStatusForVital = (vitalIndex: number) => {
        let numRecords = recordsPerVital;
        if (extraRecordsAssigned < extraRecords) {
            numRecords++;
            extraRecordsAssigned++;
        }
        const startIndex = vitalIndex * recordsPerVital + Math.min(vitalIndex, extraRecords);
        return statusList.slice(startIndex, startIndex + numRecords);
    };

    return Promise.all(
        vitalTypes.map(async (type, index) => {
            const statusForVital = getStatusForVital(index);

            return new Promise((resolve, reject) => {
                db.transaction((tx) => {
                    let query = `SELECT * FROM vitals WHERE vital_type = ?`;
                    const params: any[] = [type];
                    const now = date || new Date();

                    if (timeframe === 'daily') {
                        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfDay, endOfDay);
                    } else if (timeframe === 'weekly') {
                        const startOfWeek = new Date(now); // Create a new date instance for the current date
                        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday
                        const endOfWeek = new Date(startOfWeek); // Clone startOfWeek
                        endOfWeek.setDate(startOfWeek.getDate() + 7);
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfWeek.toISOString(), endOfWeek.toISOString());
                    } else if (timeframe === 'monthly') {
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(); // Start of the next month
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfMonth, endOfMonth);
                    } else if (timeframe === 'yearly') {
                        const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
                        const endOfYear = new Date(now.getFullYear() + 1, 0, 1).toISOString(); // Start of the next year
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfYear, endOfYear);
                    } else {
                        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfDay, endOfDay);
                    }

                    query += ` ORDER BY createdAt DESC;`;

                    tx.executeSql(
                        query,
                        params,
                        (tx, results) => {
                            const rows = results.rows;
                            const values: any[] = [];
                            const rowCount = rows.length;

                            // Initialize graph result based on timeframe
                            let graphResult: any[] = [];

                            if (timeframe === 'daily') {
                                graphResult = [
                                    "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
                                    "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"
                                ].map(label => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: label
                                }));
                            } else if (timeframe === 'weekly') {
                                const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                graphResult = daysOfWeek.map((day) => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: day
                                }));
                            } else if (timeframe === 'monthly') {
                                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                                graphResult = Array.from({ length: daysInMonth }, (_, index) => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: (index + 1).toString() // Label for each day of the month
                                }));
                            } else if (timeframe === 'yearly') {
                                const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
                                graphResult = months.map((month) => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: month // Label for each month
                                }));
                            }

                            // Process database results
                            const records: any[] = [];
                            for (let i = 0; i < rowCount; i++) {
                                const row = rows.item(i);
                                const timestamp = new Date(row.createdAt);

                                let index = -1;
                                if (timeframe === 'daily') {
                                    const hour = timestamp.getHours();
                                    const label = `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`;
                                    index = graphResult.findIndex(item => item.label === label);
                                } else if (timeframe === 'weekly') {
                                    const dayOfWeek = timestamp.getDay();
                                    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                    index = graphResult.findIndex(item => item.label === daysOfWeek[dayOfWeek]);
                                } else if (timeframe === 'monthly') {
                                    const day = timestamp.getDate();
                                    index = graphResult.findIndex(item => parseInt(item.label) === day);
                                } else if (timeframe === 'yearly') {
                                    const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
                                    const month = timestamp.getMonth();
                                    index = graphResult.findIndex(item => item.label === months[month]);
                                }

                                if (index !== -1) {
                                    const value = parseFloat(row.value || '0') || 0;
                                    if (type === 'BP') {
                                        const [systolic_bp, diastolic_bp] = (row.value || '').split('/').map(Number);
                                        graphResult[index].stacks[0].value = diastolic_bp || 0;
                                        graphResult[index].stacks[1].value = (systolic_bp || 0) - (diastolic_bp || 0);
                                    } else if (type === 'HR' || type === 'HRV') {
                                        graphResult[index].stacks[0].value = value - 5;
                                        graphResult[index].stacks[1].value = 5;
                                    }
                                }

                                // Collect vital values
                                if (type === 'BP') {
                                    const [systolic_bp, diastolic_bp] = (row.value || '').split('/').map(Number);
                                    values.push({
                                        systolic: systolic_bp || 0,
                                        diastolic: diastolic_bp || 0,
                                    });
                                } else {
                                    const value = parseFloat(row.value || '0') || 0;
                                    values.push({
                                        value: value,
                                    });
                                }
                            }

                            // Calculate averages
                            const average = values.reduce((acc, curr) => {
                                if (type === 'BP') {
                                    return {
                                        systolic: acc.systolic + (curr.systolic || 0),
                                        diastolic: acc.diastolic + (curr.diastolic || 0),
                                        count: acc.count + 1,
                                    };
                                } else {
                                    return {
                                        value: acc.value + (curr.value || 0),
                                        count: acc.count + 1,
                                    };
                                }
                            }, { systolic: 0, diastolic: 0, value: 0, count: 0 });

                            const latestValue = values[0] || { systolic: 0, diastolic: 0, value: 0 };
                            const low = values.reduce((min, curr) => ({
                                systolic: Math.min(min.systolic || Infinity, curr.systolic || Infinity),
                                diastolic: Math.min(min.diastolic || Infinity, curr.diastolic || Infinity),
                                value: Math.min(min.value || Infinity, curr.value || Infinity),
                            }), { systolic: Infinity, diastolic: Infinity, value: Infinity });
                            const high = values.reduce((max, curr) => ({
                                systolic: Math.max(max.systolic || -Infinity, curr.systolic || -Infinity),
                                diastolic: Math.max(max.diastolic || -Infinity, curr.diastolic || -Infinity),
                                value: Math.max(max.value || -Infinity, curr.value || -Infinity),
                            }), { systolic: -Infinity, diastolic: -Infinity, value: -Infinity });

                            const averageValue = type === 'BP' ? {
                                systolic: (average.systolic / average.count).toFixed(2),
                                diastolic: (average.diastolic / average.count).toFixed(2)
                            } : {
                                value: (average.value / average.count).toFixed(2)
                            };

                            resolve({
                                vital_type: type,
                                data: {
                                    chartName: type === 'BP' ? 'Blood pressure' : type === 'HR' ? 'Heart rate' : 'Heart rate variability',
                                    latestValue: type === 'BP' ? `${latestValue.systolic}/${latestValue.diastolic}` :
                                        `${latestValue.value}`,
                                    low: type === 'BP' ? `${low.systolic}/${low.diastolic}` : `${low.value}`,
                                    average: type === "BP" ? `${averageValue.systolic}/${averageValue.diastolic}` :
                                        `${averageValue.value}`,
                                    high: type === "BP" ? `${high.systolic}/${high.diastolic}` : `${high.value}`,
                                    statusList: statusList, // Use the full status list
                                    graphResult,
                                    latestDate: rows.length > 0 ? rows.item(0).createdAt : ''
                                }
                            })
                        },
                        (tx, error) => {
                            console.error('Error getting vital history:', error);
                            reject(error);
                        }
                    );
                });


            });
        })
    );
};

export const getPrioritizedVitalHistory = async (vitalTypes: string[], timeframe: string, date?: Date): Promise<any[]> => {
    const db = await SQLite.openDatabase({ name: 'vitals.db', location: 'default' });

    // Fetch status data
    const fetchStatus = () => {
        return new Promise<Status[]>((resolve, reject) => {
            db.transaction((tx: SQLiteTransaction) => {
                let query = 'SELECT * FROM status';
                const params: any[] = [];
                const now = date || new Date();

                if (timeframe === 'daily') {
                    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfDay);
                } else if (timeframe === 'weekly') {
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString(); // Sunday
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfWeek);
                } else if (timeframe === 'monthly') {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfMonth);
                } else if (timeframe === 'yearly') {
                    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
                    query += ' WHERE createdAt >= ?';
                    params.push(startOfYear);
                }

                query += ' ORDER BY createdAt DESC LIMIT 15;';

                tx.executeSql(
                    query,
                    params,
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

    // Fetch status data first
    const statusList = await fetchStatus();
    const totalRecords = Math.min(statusList.length, 15); // Ensure we don't exceed 15 records
    const totalVitals = vitalTypes.length;

    // Calculate how many status records each vital type should get
    const recordsPerVital = Math.floor(totalRecords / totalVitals);
    const extraRecords = totalRecords % totalVitals;

    let extraRecordsAssigned = 0;

    // Distribute records to each vital type
    const getStatusForVital = (vitalIndex: number) => {
        let numRecords = recordsPerVital;
        if (extraRecordsAssigned < extraRecords) {
            numRecords++;
            extraRecordsAssigned++;
        }
        const startIndex = vitalIndex * recordsPerVital + Math.min(vitalIndex, extraRecords);
        return statusList.slice(startIndex, startIndex + numRecords);
    };

    return Promise.all(
        vitalTypes.map(async (type, index) => {
            const statusForVital = getStatusForVital(index);

            return new Promise((resolve, reject) => {
                db.transaction((tx) => {
                    let query = `SELECT * FROM vitals WHERE vital_type = ?`;
                    const params: any[] = [type];
                    const now = date || new Date();

                    if (timeframe === 'daily') {
                        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfDay, endOfDay);
                    } else if (timeframe === 'weekly') {
                        const startOfWeek = new Date(now); // Create a new date instance for the current date
                        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday
                        const endOfWeek = new Date(startOfWeek); // Clone startOfWeek
                        endOfWeek.setDate(startOfWeek.getDate() + 7);
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfWeek.toISOString(), endOfWeek.toISOString());
                    } else if (timeframe === 'monthly') {
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(); // Start of the next month
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfMonth, endOfMonth);
                    } else if (timeframe === 'yearly') {
                        const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
                        const endOfYear = new Date(now.getFullYear() + 1, 0, 1).toISOString(); // Start of the next year
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfYear, endOfYear);
                    } else {
                        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
                        query += ` AND createdAt >= ? AND createdAt < ?`;
                        params.push(startOfDay, endOfDay);
                    }

                    query += ` ORDER BY createdAt DESC;`;

                    tx.executeSql(
                        query,
                        params,
                        (tx, results) => {
                            const rows = results.rows;
                            const values: any[] = [];
                            const rowCount = rows.length;

                            // Initialize graph result based on timeframe
                            let graphResult: any[] = [];

                            if (timeframe === 'daily') {
                                graphResult = [
                                    "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
                                    "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"
                                ].map(label => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: label
                                }));
                            } else if (timeframe === 'weekly') {
                                const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                graphResult = daysOfWeek.map((day) => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: day
                                }));
                            } else if (timeframe === 'monthly') {
                                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                                graphResult = Array.from({ length: daysInMonth }, (_, index) => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: (index + 1).toString() // Label for each day of the month
                                }));
                            } else if (timeframe === 'yearly') {
                                const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
                                graphResult = months.map((month) => ({
                                    stacks: [
                                        { value: 0, color: "transparent" },
                                        { value: 0, color: "#FE568D" }
                                    ],
                                    label: month // Label for each month
                                }));
                            }

                            // Process database results
                            const records: any[] = [];
                            for (let i = 0; i < rowCount; i++) {
                                const row = rows.item(i);
                                const timestamp = new Date(row.createdAt);

                                let index = -1;
                                if (timeframe === 'daily') {
                                    const hour = timestamp.getHours();
                                    const label = `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`;
                                    index = graphResult.findIndex(item => item.label === label);
                                } else if (timeframe === 'weekly') {
                                    const dayOfWeek = timestamp.getDay();
                                    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                    index = graphResult.findIndex(item => item.label === daysOfWeek[dayOfWeek]);
                                } else if (timeframe === 'monthly') {
                                    const day = timestamp.getDate();
                                    index = graphResult.findIndex(item => parseInt(item.label) === day);
                                } else if (timeframe === 'yearly') {
                                    const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
                                    const month = timestamp.getMonth();
                                    index = graphResult.findIndex(item => item.label === months[month]);
                                }

                                if (index !== -1) {
                                    const value = parseFloat(row.value || '0') || 0;
                                    if (type === 'BP') {
                                        const [systolic_bp, diastolic_bp] = (row.value || '').split('/').map(Number);
                                        graphResult[index].stacks[0].value = diastolic_bp || 0;
                                        graphResult[index].stacks[1].value = (systolic_bp || 0) - (diastolic_bp || 0);
                                    } else if (type === 'HR' || type === 'HRV') {
                                        graphResult[index].stacks[0].value = value - 5;
                                        graphResult[index].stacks[1].value = 5;
                                    }
                                }

                                // Collect vital values
                                if (type === 'BP') {
                                    const [systolic_bp, diastolic_bp] = (row.value || '').split('/').map(Number);
                                    values.push({
                                        systolic: systolic_bp || 0,
                                        diastolic: diastolic_bp || 0,
                                    });
                                } else {
                                    const value = parseFloat(row.value || '0') || 0;
                                    values.push({
                                        value: value,
                                    });
                                }
                            }

                            // Calculate averages
                            const average = values.reduce((acc, curr) => {
                                if (type === 'BP') {
                                    return {
                                        systolic: acc.systolic + (curr.systolic || 0),
                                        diastolic: acc.diastolic + (curr.diastolic || 0),
                                        count: acc.count + 1,
                                    };
                                } else {
                                    return {
                                        value: acc.value + (curr.value || 0),
                                        count: acc.count + 1,
                                    };
                                }
                            }, { systolic: 0, diastolic: 0, value: 0, count: 0 });

                            const latestValue = values[0] || { systolic: 0, diastolic: 0, value: 0 };
                            const low = values.reduce((min, curr) => ({
                                systolic: Math.min(min.systolic || Infinity, curr.systolic || Infinity),
                                diastolic: Math.min(min.diastolic || Infinity, curr.diastolic || Infinity),
                                value: Math.min(min.value || Infinity, curr.value || Infinity),
                            }), { systolic: Infinity, diastolic: Infinity, value: Infinity });
                            const high = values.reduce((max, curr) => ({
                                systolic: Math.max(max.systolic || -Infinity, curr.systolic || -Infinity),
                                diastolic: Math.max(max.diastolic || -Infinity, curr.diastolic || -Infinity),
                                value: Math.max(max.value || -Infinity, curr.value || -Infinity),
                            }), { systolic: -Infinity, diastolic: -Infinity, value: -Infinity });

                            const averageValue = type === 'BP' ? {
                                systolic: (average.systolic / average.count).toFixed(2),
                                diastolic: (average.diastolic / average.count).toFixed(2)
                            } : {
                                value: (average.value / average.count).toFixed(2)
                            };

                            resolve({
                                vital_type: type,
                                data: {
                                    chartName: type === 'BP' ? 'Blood pressure' : type === 'HR' ? 'Heart rate' : 'Heart rate variability',
                                    latestValue: type === 'BP' ? `${latestValue.systolic}/${latestValue.diastolic}` :
                                        `${latestValue.value}`,
                                    low: type === 'BP' ? `${low.systolic}/${low.diastolic}` : `${low.value}`,
                                    average: type === "BP" ? `${averageValue.systolic}/${averageValue.diastolic}` :
                                        `${averageValue.value}`,
                                    high: type === "BP" ? `${high.systolic}/${high.diastolic}` : `${high.value}`,
                                    statusList: statusList, // Use the full status list
                                    graphResult,
                                    latestDate: rows.length > 0 ? rows.item(0).createdAt : ''
                                }
                            })
                        },
                        (tx, error) => {
                            console.error('Error getting vital history:', error);
                            reject(error);
                        }
                    );
                });


            });
        })
    );
};