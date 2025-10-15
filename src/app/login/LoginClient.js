'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';
import { Eye, EyeOff } from 'lucide-react'

export default function LoginClient({ redirect, reason }) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const emailRef = useRef(null);

  useEffect(() => {

    if (emailRef.current) emailRef.current.focus();
    if (reason === 'unauthorized') {
      setErr('คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้');
    }

    const cookie = typeof document !== 'undefined' ? document.cookie : '';
    const m = cookie.match(/(?:^|;\s*)auth_msg=([^;]+)/);
    if (m) {
      try {
        const msg = decodeURIComponent(m[1]);
        if (msg) setErr(msg);
      } catch {}
      document.cookie = 'auth_msg=; Max-Age=0; path=/';
    }
  }, [reason]);

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/login?redirect=${encodeURIComponent(redirect)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // backend ใช้ username → map จาก email
        body: JSON.stringify({ username: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      router.replace(data.redirect || '/dashboard');
    } catch {
      setErr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      setLoading(false);
    }
  }

  function onPwKeyUp(e) {
    if (typeof e.getModifierState === 'function') {
      setCapsOn(!!e.getModifierState('CapsLock'));
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.headerBand}>
        <img src="/logo.png" alt="" className={styles.logo} />
        <div>
          <h1 className={styles.title}>PPK</h1>
          <p className={styles.subtitle}>โรงพยาบาลพระปกเกล้า</p>
        </div>
      </div>

      <section className={styles.card} aria-labelledby="formTitle">
        <h2 id="formTitle" className={styles.formTitle}>ลงชื่อเข้าใช้</h2>

        <form onSubmit={handleLogin} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>อีเมล</label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="name@example.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!err}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>รหัสผ่าน</label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onPwKeyUp}
                required
                aria-invalid={!!err}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                onClick={() => setShowPw((s) => !s)}
                >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {capsOn && <div className={styles.hintWarn}>เปิด CapsLock อยู่</div>}
          </div>

          {err && <div className={styles.errorBox} role="alert">{err}</div>}

          <div className={styles.actions}>
           <button type="submit" className={styles.submitBtn}>
            เข้าสู่ระบบ
            <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className={styles.disclaimer}>
            ระบบนี้ใช้สำหรับบุคลากรที่ได้รับอนุญาตเท่านั้น
          </p>
        </form>
      </section>

      <footer className={styles.footer}>
        <small>© {new Date().getFullYear()} โรงพยาบาลพระปกเกล้า</small>
      </footer>
    </main>
  );
}
