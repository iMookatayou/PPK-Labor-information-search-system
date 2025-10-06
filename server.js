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
app.use(express.static(path.join(__dirname, 'public')));

function verifyUser(username, password) {
  return username === 'admin' && password === '123456'
    ? { id: 1, username: 'admin', role: 'admin' }
    : null;
}

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
    { expiresIn: Number(JWT_EXPIRES) } 
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production', 
    sameSite: 'lax',
    path: '/',
    maxAge: Number(JWT_EXPIRES) * 1000, 
  });

  return res.json({ ok: true });
});

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

app.get('/api/me', auth, (req, res) => {
  return res.json({ ok: true, user: req.user });
});

app.get('/api/secret', auth, (req, res) => {
  return res.json({ ok: true, secret: 'This is protected resource.' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
