import { Pool, PoolClient, QueryResult } from 'pg';

// Database configuration for PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = {
  /**
   * Execute a query that returns multiple rows
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } catch (error: any) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Execute a query that returns a single row or null
   */
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    try {
      const result = await this.query<T>(sql, params);
      return result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error('Database queryOne error:', error);
      throw error;
    }
  },

  /**
   * Execute a query (INSERT, UPDATE, DELETE) and return metadata
   */
  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } catch (error: any) {
      console.error('Database execute error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Execute multiple queries within a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    await pool.end();
  },

  /**
   * Get pool information for debugging
   */
  getPoolInfo() {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  }
};

export default db;