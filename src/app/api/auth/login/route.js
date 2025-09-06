// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getPool } from '@/lib/db'

/** บังคับให้รันบน Node (เพราะใช้ bcryptjs + DB) */
export const runtime = 'nodejs'

/** ค่าคงที่/ตั้งค่า JWT */
const ONE_DAY = 24 * 60 * 60 // seconds
const JWT_ISSUER = 'ppk-app'      // ปรับได้
const JWT_AUDIENCE = 'ppk-users'  // ปรับได้

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || !secret.trim()) throw new Error('JWT_SECRET is not set')
  return secret
}

/** รองรับ JWT_EXPIRES เป็นวินาทีหรือรูปแบบ 1d/12h/30m/45s */
function parseExpires(input, fallbackSec = ONE_DAY) {
  if (!input) return { jwtExpires: fallbackSec, cookieMaxAge: fallbackSec }
  const trimmed = String(input).trim()

  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed)
    return { jwtExpires: n, cookieMaxAge: n }
  }
  const m = trimmed.match(/^(\d+)\s*([dhms])$/i)
  if (m) {
    const val = Number(m[1]); const unit = m[2].toLowerCase()
    let sec = val
    if (unit === 'd') sec = val * 24 * 60 * 60
    else if (unit === 'h') sec = val * 60 * 60
    else if (unit === 'm') sec = val * 60
    else if (unit === 's') sec = val
    return { jwtExpires: trimmed, cookieMaxAge: sec }
  }
  return { jwtExpires: fallbackSec, cookieMaxAge: fallbackSec }
}

export async function POST(req) {
  try {
    const JWT_SECRET = requireJwtSecret()
    const { jwtExpires, cookieMaxAge } = parseExpires(process.env.JWT_EXPIRES, ONE_DAY)

    /* -------- อ่าน credential จาก JSON หรือ FormData -------- */
    let username = ''
    let password = ''
    try {
      const ct = (req.headers.get('content-type') || '').toLowerCase()
      if (ct.includes('application/json')) {
        const body = await req.json().catch(() => ({}))
        username = (body?.username || body?.email || '').toString()
        password = (body?.password || '').toString()
      } else if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
        const form = await req.formData()
        username = String(form.get('username') || form.get('email') || '')
        password = String(form.get('password') || '')
      }
    } catch {}
    username = username.trim() // ถ้าต้องการไม่แคร์ตัวพิมพ์ใหญ่ ให้ .toLowerCase()

    if (!username || !password) {
      return NextResponse.json({ ok: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, { status: 400 })
    }

    /* -------------------- ตรวจสอบกับฐานข้อมูล -------------------- */
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, role, is_active FROM users WHERE username = ? LIMIT 1',
      [username]
    )
    const user = Array.isArray(rows) ? rows[0] : undefined
    if (!user) {
      return NextResponse.json({ ok: false, message: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 })
    }
    if (!user.is_active) {
      return NextResponse.json({ ok: false, message: 'บัญชีถูกปิดใช้งาน' }, { status: 403 })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return NextResponse.json({ ok: false, message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    /* ------------------------- ออก JWT ------------------------- */
    const { searchParams } = new URL(req.url)
    const redirect = searchParams.get('redirect') || '/dashboard'
    // หมายเหตุ: jwt.sign รองรับ expiresIn เป็นจำนวนวินาทีหรือ string (เช่น '1d')
    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: jwtExpires, issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    )

    /* ------------- เซ็ตคุกกี้ (รองรับ HTTP/HTTPS อัตโนมัติ) ------------- */
    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      new URL(req.url).protocol === 'https:'

    const res = NextResponse.json({
      ok: true,
      redirect,
      user: { id: user.id, username: user.username, role: user.role },
    })

    res.cookies.set('access_token', token, {
      httpOnly: true,
      secure: isHttps,                      // dev (HTTP) -> false, prod (HTTPS) -> true
      sameSite: isHttps ? 'none' : 'lax',   // ข้ามโดเมนจริง ใช้ none + secure:true
      path: '/',
      // domain: '.yourdomain.com',         // (ถ้าต้องแชร์คุกกี้ข้ามซับโดเมน ค่อยเปิด)
      maxAge: cookieMaxAge,
    })

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 })
  }
}
