import NotificationTable from "./notifications"

export const createAllTables = async () => {
    await NotificationTable.createTable();
}

export * from './notifications';