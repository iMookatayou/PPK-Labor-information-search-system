const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local'}); // ถ้าเก็บใน .env.local ใช้: require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
 
    const username = 'admin';
    const plain = '123456'; 
    const hash = await bcrypt.hash(plain, 10);

    await conn.execute(
      `INSERT INTO users (username, password_hash, role, is_active)
       VALUES (?, ?, 'admin', 1)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [username, hash]
    );

    console.log('✅ Seeded admin user:', username, `(password: ${plain})`);
    await conn.end();
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  }
})();
