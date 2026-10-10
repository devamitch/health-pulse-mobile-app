import DBHelper, { ColumnDefinition, ConditionObject, OrderByOption, DataObject } from "@/utils/db-helper";

const AuraCoreDB = new DBHelper('AuraCore');

type TableNames = 'notification'

const TableOperations = {
    createTable: async (tableName: TableNames, columns: ColumnDefinition[]) => 
        await AuraCoreDB.createTable(tableName, columns),
    deleteTable: async (tableName: TableNames) => 
        await AuraCoreDB.deleteTable(tableName),
    truncateTable: async (tableName: TableNames) => 
        await AuraCoreDB.truncateTable(tableName),
    tableExists: async (tableName: TableNames) => 
        await AuraCoreDB.tableExists(tableName),
    getTableInfo: async (tableName: TableNames) => 
        await AuraCoreDB.getTableInfo(tableName),
}

const DataOperations = {
    insertRecord: async (tableName: TableNames, data: DataObject) => 
        await AuraCoreDB.insertRecord(tableName, data),
    
    fetchRecords: async (
        tableName: TableNames, 
        conditions: ConditionObject[] = [], 
        columns: string[] = ['*'], 
        orderBy?: string | OrderByOption | OrderByOption[], 
        limit?: number, 
        offset?: number
    ) => await AuraCoreDB.fetchRecords(tableName, conditions, columns, orderBy, limit, offset),
    
    fetchAllRecords: async (tableName: TableNames) => 
        await AuraCoreDB.fetchRecords(tableName),
    
    fetchRecordById: async (tableName: TableNames, id: number | string, idColumn: string = 'id') => 
        await AuraCoreDB.fetchRecords(tableName, [{ key: idColumn, value: id, operator: '=' }]),
    
    updateRecord: async (tableName: TableNames, data: DataObject, conditions: ConditionObject[]) => 
        await AuraCoreDB.updateRecord(tableName, data, conditions),
    
    updateRecordById: async (tableName: TableNames, data: DataObject, id: number | string, idColumn: string = 'id') => 
        await AuraCoreDB.updateRecord(tableName, data, [{ key: idColumn, value: id, operator: '=' }]),
    
    deleteRecord: async (tableName: TableNames, conditions: ConditionObject[]) => 
        await AuraCoreDB.deleteRecord(tableName, conditions),
    
    deleteRecordById: async (tableName: TableNames, id: number | string, idColumn: string = 'id') => 
        await AuraCoreDB.deleteRecord(tableName, [{ key: idColumn, value: id, operator: '=' }]),
    
    countRecords: async (tableName: TableNames, conditions: ConditionObject[] = []) => 
        await AuraCoreDB.countRecords(tableName, conditions),
    
    countAllRecords: async (tableName: TableNames) => 
        await AuraCoreDB.countRecords(tableName),
}

const DatabaseOperations = {
    executeCustomQuery: async (query: string, values: any[] = []) => 
        await AuraCoreDB.executeCustomQuery(query, values),
    
    closeDatabase: async () => 
        await AuraCoreDB.closeDatabase(),
    
    deleteDatabase: async () => 
        await AuraCoreDB.deleteDatabase(),
}

const UtilityOperations = {
    recordExists: async (tableName: TableNames, conditions: ConditionObject[]): Promise<boolean> => {
        const count = await AuraCoreDB.countRecords(tableName, conditions);
        return count > 0;
    },
    recordExistsById: async (tableName: TableNames, id: number | string, idColumn: string = 'id'): Promise<boolean> => {
        const count = await AuraCoreDB.countRecords(tableName, [{ key: idColumn, value: id, operator: '=' }]);
        return count > 0;
    },
    getFirstRecord: async (tableName: TableNames, conditions: ConditionObject[] = [], columns: string[] = ['*']) => {
        const records = await AuraCoreDB.fetchRecords(tableName, conditions, columns, undefined, 1);
        return records.length > 0 ? records[0] : null;
    },
    getLastRecord: async (tableName: TableNames, orderByColumn: string = 'id', columns: string[] = ['*']) => {
        const records = await AuraCoreDB.fetchRecords(tableName, [], columns, { column: orderByColumn, direction: 'DESC' }, 1);
        return records.length > 0 ? records[0] : null;
    },
    upsertRecord: async (tableName: TableNames, data: DataObject, uniqueConditions: ConditionObject[]): Promise<number> => {
        const exists = await UtilityOperations.recordExists(tableName, uniqueConditions);
        if (exists) {
            await AuraCoreDB.updateRecord(tableName, data, uniqueConditions);
            return 0; // Return 0 for update (no new insert ID)
        } else {
            return await AuraCoreDB.insertRecord(tableName, data);
        }
    },
    batchInsert: async (tableName: TableNames, dataArray: DataObject[]): Promise<number[]> => {
        const insertIds: number[] = [];
        for (const data of dataArray) {
            const insertId = await AuraCoreDB.insertRecord(tableName, data);
            insertIds.push(insertId);
        }
        return insertIds;
    },
    searchRecords: async (
        tableName: TableNames, 
        searchColumn: string, 
        searchTerm: string, 
        columns: string[] = ['*'],
        orderBy?: string | OrderByOption | OrderByOption[]
    ) => {
        return await AuraCoreDB.fetchRecords(
            tableName, 
            [{ key: searchColumn, value: `%${searchTerm}%`, operator: 'LIKE' }], 
            columns, 
            orderBy
        );
    },
}

export {
    TableOperations,
    DataOperations,
    DatabaseOperations,
    UtilityOperations,
};