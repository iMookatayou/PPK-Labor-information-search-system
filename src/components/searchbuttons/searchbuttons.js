'use client';
import { Search, XCircle } from 'lucide-react';
import styles from './SearchButtons.module.css';

export default function SearchButtons({ onSearch, onClear, disabled }) {
  return (
    <div className={styles.buttonContainer}>
      <button
        onClick={onSearch}
        disabled={disabled}
        className={`${styles.button} ${styles.search}`}
      >
        <Search size={16} className={styles.icon} />
        ค้นหา
      </button>
      <button
        onClick={onClear}
        className={`${styles.button} ${styles.clear}`}
      >
        <XCircle size={16} className={styles.icon} />
        ล้างข้อมูล
      </button>
    </div>
  );
}
