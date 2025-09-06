// src/lib/db.js
import mysql from 'mysql2/promise';

// ใช้ singleton pool ป้องกันการสร้าง connection pool ซ้ำตอน hot reload
let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      timezone: 'Z',
    });
  }
  return pool;
}
