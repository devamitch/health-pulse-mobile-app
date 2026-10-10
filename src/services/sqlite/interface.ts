export interface Vital {
    id: number;
    vital_type: 'BP' | 'HR' | 'HRV';
    systolic_bp?: string;
    diastolic_bp?: string;
    heart_rate?: string;
    heart_rate_v?: string;
    createdAt: string; // ISO 8601 date string
    lastSync: string; // ISO 8601 date string
    type?: string;
    value?: string;
}

export interface Status {
    description: string;
    status_type: string;
    filePath: string;
    createdAt: string; // ISO 8601 date string
    lastSync: string; // ISO 8601 date string
}

export interface SQLiteResultSet {
    rows: {
        length: number;
        item: (index: number) => any;
    };
}

export interface SQLiteTransaction {
    executeSql: (
        sqlStatement: string,
        args?: (string | number | null)[],
        callback?: (tx: SQLiteTransaction, resultSet: SQLiteResultSet) => void,
        errorCallback?: (tx: SQLiteTransaction, error: Error) => void
    ) => void;
}

export interface SQLiteDatabase {
    transaction: (
        callback: (tx: SQLiteTransaction) => void,
        errorCallback?: (error: Error) => void,
        successCallback?: () => void
    ) => void;
}