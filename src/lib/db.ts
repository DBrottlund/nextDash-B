import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nextdash_b',
  ssl: process.env.DB_SSL === 'true' ? {} : false,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  idleTimeout: 300000, // 5 minutes
  maxIdle: 5,
};

const pool = mysql.createPool(dbConfig);

export const db = {
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute(sql, params);
      return rows as T[];
    } catch (error: any) {
      console.error('Database query error:', error);
      
      // Handle connection limit exceeded with exponential backoff
      if (error.errno === 1927 || error.sqlMessage?.includes('max_user_connections')) {
        console.warn('Connection limit exceeded, waiting before retry...');
        
        // Try up to 3 times with increasing delays
        for (let attempt = 1; attempt <= 3; attempt++) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000)); // 2s, 4s, 6s
          
          try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(sql, params);
            return rows as T[];
          } catch (retryError: any) {
            console.error(`Database retry ${attempt} failed:`, retryError);
            if (connection) {
              connection.release();
              connection = undefined;
            }
            if (attempt === 3) throw retryError;
          }
        }
      }
      
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    try {
      const [rows] = await pool.execute(sql, params);
      const result = rows as T[];
      return result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error('Database query error:', error);
      
      // Handle connection limit exceeded
      if (error.errno === 1927 || error.sqlMessage?.includes('max_user_connections')) {
        console.warn('Connection limit exceeded, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const [rows] = await pool.execute(sql, params);
          const result = rows as T[];
          return result.length > 0 ? result[0] : null;
        } catch (retryError) {
          console.error('Database retry failed:', retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  },

  async execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    try {
      const [result] = await pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    } catch (error: any) {
      console.error('Database execute error:', error);
      
      // Handle connection limit exceeded
      if (error.errno === 1927 || error.sqlMessage?.includes('max_user_connections')) {
        console.warn('Connection limit exceeded, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const [result] = await pool.execute(sql, params);
          return result as mysql.ResultSetHeader;
        } catch (retryError) {
          console.error('Database retry failed:', retryError);
          throw retryError;
        }
      }
      
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