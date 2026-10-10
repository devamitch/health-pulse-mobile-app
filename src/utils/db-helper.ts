import SQLite from 'react-native-sqlite-storage';

export type SQLiteDataType = 'NULL' | 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB';
export type DataObject = Record<string, any>;
export type Operator =
  | '='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'LIKE'
  | 'IN'
  | 'IS NULL'
  | 'IS NOT NULL';
export type SortDirection = 'ASC' | 'DESC';

export interface ConditionObject {
  key: string;
  value: any;
  operator: Operator;
}

export interface OrderByOption {
  column: string;
  direction?: SortDirection;
}

export interface ColumnDefinition {
  column_name: string;
  datatype: SQLiteDataType;
  isNull?: boolean;
  isPrimaryKey?: boolean;
  isAutoIncrement?: boolean;
  defaultValue?: string | number;
}

class DBHelper {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName: string;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor(dbName: string, location: SQLite.Location = 'default') {
    SQLite.DEBUG(false); // Set to false to reduce log noise
    SQLite.enablePromise(true);
    this.dbName = dbName;
    this.initPromise = this.initDB(dbName, location);
  }

  private async initDB(
    dbName: string,
    location: SQLite.Location,
  ): Promise<void> {
    try {
      if (this.initialized && this.db) {
        return;
      }

      this.db = await SQLite.openDatabase({
        name: `${dbName}.db`,
        location: location,
      });
      this.initialized = true;
      console.log(`Database ${dbName} opened successfully.`);
    } catch (error) {
      console.error('Database open error:', error);
      this.initialized = false;
      this.db = null;
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.initialized || !this.db) {
      throw new Error('Database not initialized');
    }
  }

  async createTable(
    tableName: string,
    columns: ColumnDefinition[],
  ): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const columnQuery = columns
        .map(col => {
          let columnDef = `${col.column_name} ${col.datatype}`;
          if (col.isPrimaryKey) {
            if (col.datatype === 'INTEGER' && col.isAutoIncrement) {
              columnDef += ' PRIMARY KEY AUTOINCREMENT';
            } else {
              columnDef += ' PRIMARY KEY';
            }
          }
          if (col.isNull === false) columnDef += ' NOT NULL';
          if (col.defaultValue !== undefined) {
            const defaultVal =
              typeof col.defaultValue === 'string'
                ? `'${col.defaultValue}'`
                : col.defaultValue;
            columnDef += ` DEFAULT ${defaultVal}`;
          }
          return columnDef;
        })
        .join(', ');

      const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnQuery});`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              [],
              () => {
                console.log(`Table ${tableName} created successfully.`);
                resolve(true);
              },
              (_, error) => {
                console.error(`Table creation failed: ${error.message}`);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(
              `Transaction error creating table ${tableName}:`,
              error,
            );
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error creating table '${tableName}':`, error);
      throw error;
    }
  }

  async insertRecord(tableName: string, data: DataObject): Promise<number> {
    try {
      await this.ensureInitialized();

      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map(() => '?').join(', ');

      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders});`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              values,
              (_, results) => {
                console.log(
                  `Record inserted into '${tableName}' successfully, insertId: ${results.insertId}`,
                );
                resolve(results.insertId || 0);
              },
              (_, error) => {
                const errorMessage =
                  error?.message ||
                  error?.toString() ||
                  'Unknown database error';
                console.error(`Insert error in '${tableName}':`, {
                  message: errorMessage,
                  query: query,
                  values: values,
                  error: error,
                });
                reject(new Error(`Insert failed: ${errorMessage}`));
                return false;
              },
            );
          },
          error => {
            const errorMessage =
              error?.message ||
              error?.toString() ||
              'Unknown transaction error';
            console.error(`Transaction error in '${tableName}':`, errorMessage);
            reject(new Error(`Transaction failed: ${errorMessage}`));
          },
        );
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Insert error in '${tableName}':`, errorMessage);
      throw new Error(`Insert operation failed: ${errorMessage}`);
    }
  }

  async updateRecord(
    tableName: string,
    data: DataObject,
    conditions: ConditionObject[],
  ): Promise<number> {
    try {
      await this.ensureInitialized();

      const updates = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(', ');
      const updateValues = Object.values(data);

      const whereClauseParts: string[] = [];
      const conditionValues: any[] = [];

      conditions.forEach(condition => {
        if (
          condition.operator === 'IS NULL' ||
          condition.operator === 'IS NOT NULL'
        ) {
          whereClauseParts.push(`${condition.key} ${condition.operator}`);
        } else if (
          condition.operator === 'IN' &&
          Array.isArray(condition.value)
        ) {
          const placeholders = condition.value.map(() => '?').join(', ');
          whereClauseParts.push(`${condition.key} IN (${placeholders})`);
          conditionValues.push(...condition.value);
        } else {
          whereClauseParts.push(`${condition.key} ${condition.operator} ?`);
          conditionValues.push(condition.value);
        }
      });

      const whereClause =
        whereClauseParts.length > 0 ? whereClauseParts.join(' AND ') : '1=1';

      const query = `UPDATE ${tableName} SET ${updates} WHERE ${whereClause};`;
      const values = [...updateValues, ...conditionValues];

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              values,
              (_, results) => {
                console.log(
                  `Record updated in '${tableName}', affected rows: ${results.rowsAffected}`,
                );
                resolve(results.rowsAffected);
              },
              (_, error) => {
                console.error(`Update error in '${tableName}':`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(`Transaction error updating '${tableName}':`, error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Update error in '${tableName}':`, error);
      throw error;
    }
  }

  async deleteRecord(
    tableName: string,
    conditions: ConditionObject[],
  ): Promise<number> {
    try {
      await this.ensureInitialized();

      const whereClauseParts: string[] = [];
      const values: any[] = [];

      conditions.forEach(condition => {
        if (
          condition.operator === 'IS NULL' ||
          condition.operator === 'IS NOT NULL'
        ) {
          whereClauseParts.push(`${condition.key} ${condition.operator}`);
        } else if (
          condition.operator === 'IN' &&
          Array.isArray(condition.value)
        ) {
          const placeholders = condition.value.map(() => '?').join(', ');
          whereClauseParts.push(`${condition.key} IN (${placeholders})`);
          values.push(...condition.value);
        } else {
          whereClauseParts.push(`${condition.key} ${condition.operator} ?`);
          values.push(condition.value);
        }
      });

      const whereClause =
        whereClauseParts.length > 0 ? whereClauseParts.join(' AND ') : '1=1';

      const query = `DELETE FROM ${tableName} WHERE ${whereClause};`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              values,
              (_, results) => {
                console.log(
                  `Record deleted from '${tableName}', affected rows: ${results.rowsAffected}`,
                );
                resolve(results.rowsAffected);
              },
              (_, error) => {
                console.error(`Delete error in '${tableName}':`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(
              `Transaction error deleting from '${tableName}':`,
              error,
            );
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Delete error in '${tableName}':`, error);
      throw error;
    }
  }

  async fetchRecords(
    tableName: string,
    conditions: ConditionObject[] = [],
    columns: string[] = ['*'],
    orderBy?: string | OrderByOption | OrderByOption[],
    limit?: number,
    offset?: number,
  ): Promise<any[]> {
    try {
      await this.ensureInitialized();

      const columnNames = columns.join(', ');

      const whereClauseParts: string[] = [];
      const values: any[] = [];

      conditions.forEach(condition => {
        if (
          condition.operator === 'IS NULL' ||
          condition.operator === 'IS NOT NULL'
        ) {
          whereClauseParts.push(`${condition.key} ${condition.operator}`);
        } else if (
          condition.operator === 'IN' &&
          Array.isArray(condition.value)
        ) {
          const placeholders = condition.value.map(() => '?').join(', ');
          whereClauseParts.push(`${condition.key} IN (${placeholders})`);
          values.push(...condition.value);
        } else {
          whereClauseParts.push(`${condition.key} ${condition.operator} ?`);
          values.push(condition.value);
        }
      });

      const whereClause =
        whereClauseParts.length > 0
          ? 'WHERE ' + whereClauseParts.join(' AND ')
          : '';

      let query = `SELECT ${columnNames} FROM ${tableName} ${whereClause}`;

      if (orderBy) {
        if (typeof orderBy === 'string') {
          query += ` ORDER BY ${orderBy}`;
        } else if (Array.isArray(orderBy)) {
          const orderByParts = orderBy.map(
            option => `${option.column} ${option.direction || 'ASC'}`,
          );
          query += ` ORDER BY ${orderByParts.join(', ')}`;
        } else {
          query += ` ORDER BY ${orderBy.column} ${orderBy.direction || 'ASC'}`;
        }
      }

      if (limit !== undefined) {
        query += ` LIMIT ${limit}`;

        if (offset !== undefined) {
          query += ` OFFSET ${offset}`;
        }
      }

      query += ';';

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              values,
              (_, results) => {
                const rows = results.rows;
                let data: any[] = [];
                for (let i = 0; i < rows.length; i++) {
                  data.push(rows.item(i));
                }
                resolve(data);
              },
              (_, error) => {
                console.error(
                  `Fetch error in '${tableName}':`,
                  error?.message || error,
                );
                reject(
                  new Error(
                    `Fetch failed: ${error?.message || 'Unknown error'}`,
                  ),
                );
                return false;
              },
            );
          },
          error => {
            console.error(
              `Transaction error fetching from '${tableName}':`,
              error,
            );
            reject(
              new Error(
                `Fetch transaction failed: ${
                  error?.message || 'Unknown error'
                }`,
              ),
            );
          },
        );
      });
    } catch (error) {
      console.error(`Error fetching records from '${tableName}':`, error);
      throw error;
    }
  }

  async deleteTable(tableName: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const query = `DROP TABLE IF EXISTS ${tableName};`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              [],
              () => {
                console.log(`Table '${tableName}' deleted successfully`);
                resolve(true);
              },
              (_, error) => {
                console.error(`Error deleting table '${tableName}':`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(
              `Transaction error deleting table '${tableName}':`,
              error,
            );
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error deleting table '${tableName}':`, error);
      throw error;
    }
  }

  async truncateTable(tableName: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const query = `DELETE FROM ${tableName};`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              [],
              () => {
                console.log(`Table '${tableName}' truncated successfully`);
                resolve(true);
              },
              (_, error) => {
                console.error(`Error truncating table '${tableName}':`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(
              `Transaction error truncating table '${tableName}':`,
              error,
            );
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error truncating table '${tableName}':`, error);
      throw error;
    }
  }

  async countRecords(
    tableName: string,
    conditions: ConditionObject[] = [],
  ): Promise<number> {
    try {
      await this.ensureInitialized();

      const whereClauseParts: string[] = [];
      const values: any[] = [];

      conditions.forEach(condition => {
        if (
          condition.operator === 'IS NULL' ||
          condition.operator === 'IS NOT NULL'
        ) {
          whereClauseParts.push(`${condition.key} ${condition.operator}`);
        } else if (
          condition.operator === 'IN' &&
          Array.isArray(condition.value)
        ) {
          const placeholders = condition.value.map(() => '?').join(', ');
          whereClauseParts.push(`${condition.key} IN (${placeholders})`);
          values.push(...condition.value);
        } else {
          whereClauseParts.push(`${condition.key} ${condition.operator} ?`);
          values.push(condition.value);
        }
      });

      const whereClause =
        whereClauseParts.length > 0
          ? 'WHERE ' + whereClauseParts.join(' AND ')
          : '';

      const query = `SELECT COUNT(*) AS count FROM ${tableName} ${whereClause};`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              values,
              (_, results) => {
                if (results.rows.length === 0) {
                  console.warn(
                    `No rows returned for count query in '${tableName}'`,
                  );
                  resolve(0);
                  return;
                }

                const row = results.rows.item(0);
                if (!row) {
                  console.warn(
                    `Row is null/undefined for count query in '${tableName}'`,
                  );
                  resolve(0);
                  return;
                }

                const count = row.count ?? row.COUNT ?? row['COUNT(*)'] ?? 0;
                console.log(`Count result for '${tableName}':`, count);
                resolve(Number(count) || 0);
              },
              (_, error) => {
                console.error(
                  `Count error in '${tableName}':`,
                  error?.message || error,
                );
                reject(
                  new Error(
                    `Count failed: ${error?.message || 'Unknown error'}`,
                  ),
                );
                return false;
              },
            );
          },
          error => {
            console.error(
              `Transaction error counting in '${tableName}':`,
              error,
            );
            reject(
              new Error(
                `Count transaction failed: ${
                  error?.message || 'Unknown error'
                }`,
              ),
            );
          },
        );
      });
    } catch (error) {
      console.error(`Error counting records in '${tableName}':`, error);
      throw error;
    }
  }

  async executeCustomQuery(query: string, values: any[] = []): Promise<any> {
    try {
      await this.ensureInitialized();

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              values,
              (_, results) => {
                console.log(`Query executed successfully.`);
                resolve(results);
              },
              (_, error) => {
                console.error(`Error executing query:`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(`Transaction error executing custom query:`, error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error in executing the query:`, error);
      throw error;
    }
  }

  async tableExists(tableName: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              [tableName],
              (_, results) => {
                resolve(results.rows.length > 0);
              },
              (_, error) => {
                console.error(`Error checking if table exists:`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(`Transaction error checking table existence:`, error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error checking if table exists:`, error);
      throw error;
    }
  }

  async getTableInfo(tableName: string): Promise<any[]> {
    try {
      await this.ensureInitialized();

      const query = `PRAGMA table_info(${tableName});`;

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        this.db.transaction(
          tx => {
            tx.executeSql(
              query,
              [],
              (_, results) => {
                const rows = results.rows;
                let columns: any[] = [];
                for (let i = 0; i < rows.length; i++) {
                  columns.push(rows.item(i));
                }
                resolve(columns);
              },
              (_, error) => {
                console.error(`Error getting table info:`, error);
                reject(error);
                return false;
              },
            );
          },
          error => {
            console.error(`Transaction error getting table info:`, error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error getting table info:`, error);
      throw error;
    }
  }

  async closeDatabase(): Promise<void> {
    try {
      if (this.db) {
        await this.db.close();
        this.initialized = false;
        this.db = null;
        console.log('Database closed successfully');
      }
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }

  async deleteDatabase(): Promise<boolean> {
    try {
      if (this.initialized) {
        await this.closeDatabase();
      }

      return new Promise((resolve, reject) => {
        SQLite.deleteDatabase(
          {name: `${this.dbName}.db`, location: 'default'},
          () => {
            console.log(`Database '${this.dbName}' deleted successfully`);
            this.initialized = false;
            resolve(true);
          },
          error => {
            console.error(`Error deleting database '${this.dbName}':`, error);
            reject(error);
          },
        );
      });
    } catch (error) {
      console.error(`Error deleting database '${this.dbName}':`, error);
      return false;
    }
  }
}

export default DBHelper;
