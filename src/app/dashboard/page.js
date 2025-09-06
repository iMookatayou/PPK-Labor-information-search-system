'use client'

import { useRouter } from 'next/navigation'
import styles from './Dashboard.module.css'

export default function Page() {
  const router = useRouter()

  const buttons = [
    {
      label: 'ไปที่แบบฟอร์ม',
      path: '/form',
      kind: 'primary',
      desc: 'เปิดฟอร์มคัดกรอง/ส่งตรวจ',
    },
    {
      label: 'ประวัติผู้ป่วย',
      path: '/history',
      kind: 'secondary',
      desc: 'ค้นหาประวัติ/รายการล่าสุด',
    },
    {
      label: 'แดชบอร์ดคิว',
      path: '/queue',
      kind: 'secondary',
      desc: 'ดูสถานะคิวและห้องตรวจ',
    },
  ]

  return (
    <main className={styles.wrap}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>เมนูหลัก</h1>
          <p className={styles.subtitle}>เลือกการทำงานที่ต้องการ</p>
        </header>

        <section className={styles.grid}>
          {buttons.map((b, i) => (
            <button
              key={i}
              className={`${styles.card} ${
                b.kind === 'primary' ? styles.primary : styles.secondary
              }`}
              onClick={() => router.push(b.path)}
              aria-label={b.label}
            >
              <span className={styles.cardLabel}>{b.label}</span>
              {b.desc && <span className={styles.cardDesc}>{b.desc}</span>}
            </button>
          ))}
        </section>

        <footer className={styles.footer}>
          <button
            className={styles.ghost}
            onClick={() => router.push('/login')}
            aria-label="ย้อนกลับ"
          >
            ย้อนกลับ
          </button>
        </footer>
      </div>
    </main>
  )
}
