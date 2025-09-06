'use client';

import React from 'react';
import styles from './DatePicker.module.css';

export default function DatePicker({
  startDate = '',
  endDate = '',
  onStartDateChange = () => {},
  onEndDateChange = () => {},
  labelClassName = '',
}) {
  return (
    <div className={styles.datePickerRow}>
      {/* วันที่เริ่มต้น */}
      <div className={styles.formGroup}>
        <label htmlFor="start-date" className={`${labelClassName} ${styles.boldLabel}`}>
          วันที่เริ่มต้น
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {/* วันที่สิ้นสุด */}
      <div className={styles.formGroup}>
        <label htmlFor="end-date" className={`${labelClassName} ${styles.boldLabel}`}>
          วันที่สิ้นสุด
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={styles.dateInput}
        />
      </div>
    </div>
  );
}
