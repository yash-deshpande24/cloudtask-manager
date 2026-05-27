const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'cloudtask',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(200) NOT NULL,
        description TEXT,
        status      VARCHAR(20) DEFAULT 'todo'   CHECK (status   IN ('todo','in_progress','done')),
        priority    VARCHAR(10) DEFAULT 'medium'  CHECK (priority IN ('low','medium','high')),
        user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database tables ready');
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
