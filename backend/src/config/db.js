import mysql from 'mysql2/promise';
import '../setupEnv.js';
import logger from '../utils/logger.js';

const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Connection pool optimization
  idleTimeout: 60000, // 60 seconds
  maxIdle: 10, // Maximum idle connections
  // Performance settings
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
  // Charset
  charset: 'utf8mb4',
};

const pool = mysql.createPool(poolConfig);

// Test connection on startup
pool.getConnection()
  .then(connection => {
    logger.info('Database connection established successfully');
    connection.release();
  })
  .catch(err => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Monitor pool status
setInterval(() => {
  const status = pool.pool;
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Pool status:', {
      totalConnections: status._allConnections.length,
      freeConnections: status._freeConnections.length,
      queuedRequests: status._connectionQueue.length,
    });
  }
}, 300000); // Every 5 minutes

/**
 * Execute a query with logging
 */
export async function query(sql, params = []) {
  const startTime = Date.now();

  try {
    const [rows] = await pool.query(sql, params);
    const duration = Date.now() - startTime;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow query detected:', {
        sql: sql.substring(0, 100),
        duration: `${duration}ms`,
        params: params.length,
      });
    }

    // Log all queries in development
    if (process.env.NODE_ENV === 'development' && process.env.LOG_QUERIES === 'true') {
      logger.debug('Query executed:', {
        sql: sql.substring(0, 100),
        duration: `${duration}ms`,
      });
    }

    return rows;
  } catch (error) {
    logger.error('Database query error:', {
      sql: sql.substring(0, 100),
      error: error.message,
      code: error.code,
    });
    throw error;
  }
}

/**
 * Execute a transaction
 */
export async function transaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Graceful shutdown
 */
let isClosing = false;
export async function closePool() {
  if (isClosing) return;
  isClosing = true;

  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    if (error.message !== "Can't add new command when connection is in closed state") {
      logger.error('Error closing database pool:', error);
    }
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  closePool().then(() => process.exit(0));
});
process.on('SIGINT', () => {
  closePool().then(() => process.exit(0));
});

export default pool;

