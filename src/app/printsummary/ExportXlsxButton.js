import { Download } from 'lucide-react';
import styles from './ExportXlsxButton.module.css';

export default function ExportXlsxButton({ data }) {
  const handleExport = () => {
    if (!Array.isArray(data) || data.length === 0) {
      alert('ยังไม่มีข้อมูลให้ Export');
      return;
    }

    try {
      const XLSX = require('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ข้อมูล');
      XLSX.writeFile(workbook, 'Export_Contacts.xlsx');
    } catch (error) {
      console.error('❌ Export error:', error);
      alert('เกิดข้อผิดพลาดระหว่างการ Export');
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`${styles.button} ${styles.export}`}
      title="Export XLSX"
    >
      <Download size={14} className={styles.icon} />
      Export XLSX
    </button>
  );
}
