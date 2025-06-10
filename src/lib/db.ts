import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nextdash_b',
  ssl: process.env.DB_SSL === 'true' ? {} : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
};

const pool = mysql.createPool(dbConfig);

export const db = {
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    try {
      const [rows] = await pool.execute(sql, params);
      const result = rows as T[];
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    try {
      const [result] = await pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  },

  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async testConnection(): Promise<boolean> {
    try {
      await pool.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  async close(): Promise<void> {
    await pool.end();
  }
};

export default db;