// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();

const {
  PORT = 4000,
  JWT_SECRET,
  JWT_EXPIRES = 3600,
  COOKIE_NAME = 'access_token',
  NODE_ENV = 'development',
} = process.env;

if (!JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in .env');
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());

// เสิร์ฟไฟล์ static (login.html, dashboard.html)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * DEMO: ตรวจผู้ใช้แบบง่าย ๆ (ปรับให้เชื่อม DB/Backend จริงได้)
 * ในโปรดักชันควรเช็คกับฐานข้อมูล และใช้ bcrypt เปรียบเทียบรหัสผ่าน
 */
function verifyUser(username, password) {
  // ตัวอย่าง: user = admin / pass = 123456
  return username === 'admin' && password === '123456'
    ? { id: 1, username: 'admin', role: 'admin' }
    : null;
}

/** POST /api/login
 * รับ { username, password } -> ตรวจสอบ -> ออก JWT -> เซ็ต HttpOnly Cookie
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = verifyUser(username, password);

  if (!user) {
    return res.status(401).json({ ok: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  // ออก JWT
  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: Number(JWT_EXPIRES) } // วินาที
  );

  // เซ็ตคุกกี้แบบ HttpOnly
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production', // บน HTTPS เท่านั้นในโปรดักชัน
    sameSite: 'lax',
    path: '/',
    maxAge: Number(JWT_EXPIRES) * 1000, // มิลลิวินาที
  });

  return res.json({ ok: true });
});

/** POST /api/logout
 * เคลียร์คุกกี้
 */
app.post('/api/logout', (req, res) => {
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res.json({ ok: true });
});

/** GET /api/me (ต้องล็อกอิน) */
app.get('/api/me', auth, (req, res) => {
  // req.user ถูกเติมโดย middleware จาก payload ของ JWT
  return res.json({ ok: true, user: req.user });
});

/** ตัวอย่างหน้า protected (ส่ง JSON) */
app.get('/api/secret', auth, (req, res) => {
  return res.json({ ok: true, secret: 'This is protected resource.' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
