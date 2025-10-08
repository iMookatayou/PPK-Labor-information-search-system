const mysql = require('mysql2/promise');
require('dotenv').config({path: '.env.local' }); 

function need(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

(async () => {
  try {
    const host = need('DB_HOST');
    const port = Number(process.env.DB_PORT || 3306);
    const user = need('DB_USER');
    const password = process.env.DB_PASS || '';
    const dbName = need('DB_NAME');

    if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
      throw new Error('DB_NAME must be alphanumeric/underscore only');
    }

    const conn = await mysql.createConnection({
      host, port, user, password,
      multipleStatements: true,
    });

    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.query(`USE \`${dbName}\`;`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','user') NOT NULL DEFAULT 'user',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database and users table are ready');
    await conn.end();
  } catch (err) {
    console.error('❌ Error initializing DB:', err);
    process.exit(1);
  }
})();
