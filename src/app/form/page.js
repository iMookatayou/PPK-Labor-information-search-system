'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './InteractiveFormLayout.module.css';
import GanttChart from './Ganttcomponents/GanttChart';
import DoctorDropdown from '../components/dropdown/doctordropdown/MultiDoctorSelectDropdown';
import LocationDropdown from '../components/dropdown/locationdropdown/MultiLocationSelectDropDown';
import DatePicker from '../components/datepicker/DatePicker';
import SearchButtons from '../components/searchbuttons/SearchButtons';
import { fetchDoctors, fetchLocations, fetchContact } from '../api/apiService';
import { UserRound, Hospital } from 'lucide-react';

export default function Page() {
  // เก็บ selected เป็น array ของ {value,label} โดยตรง
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactData, setContactData] = useState([]);

  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [doctorList, locationList] = await Promise.all([
          fetchDoctors(),
          fetchLocations(),
        ]);

        const defaultDoctor = { doctorid: '0', doctorFullname: 'ไม่ระบุแพทย์' };

        const doctorsWithStringIDs = (doctorList || []).map(doc => ({
          ...doc,
          doctorid: doc.doctorid.toString(),
        }));

        setDoctors([defaultDoctor, ...doctorsWithStringIDs]);
        setLocations(locationList || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('โหลดข้อมูลแพทย์หรือห้องตรวจล้มเหลว');
        setDoctors([]);
        setLocations([]);
      }
    };

    loadInitialData();
  }, []);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleClear = () => {
    setSelectedDoctors([]);
    setSelectedLocations([]);
    setSelectedDateRange({ startDate: '', endDate: '' });
    setIsSearching(false);
    setContactData([]);
    setError(null);
  };

  // สร้าง options สำหรับ Dropdown
  const doctorOptions = doctors.map(doc => ({
    value: doc.doctorid,
    label: doc.doctorFullname,
  }));

  const locationOptions = locations.map(loc => ({
    value: loc.id.toString(),
    label: loc.detailtext,
  }));

  // onChange สำหรับ Doctor Dropdown
  const handleDoctorChange = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedDoctors([]);
      setIsSearching(false);
      return;
    }

    // ถ้ามี '0' (ไม่ระบุแพทย์) อยู่กับตัวอื่น เลือกแค่ '0' เท่านั้น
    const values = selectedOptions.map(opt => opt.value);
    if (values.includes('0') && values.length > 1) {
      setSelectedDoctors([doctorOptions.find(opt => opt.value === '0')]);
    } else {
      setSelectedDoctors(selectedOptions);
    }
    setIsSearching(false);
  };

  // onChange สำหรับ Location Dropdown
  const handleLocationChange = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(selectedOptions);
    }
    setIsSearching(false);
  };

  const handleSearch = async () => {
    setLoading(true);

    // แปลง selected objects เป็น array ids string
    const selectedDoctorIDs = selectedDoctors.map(d => d.value);
    const selectedLocationIDs = selectedLocations.map(l => l.value);

    // กรณีไม่ระบุแพทย์ ให้เคลียร์ array
    const filteredDoctorIDs = selectedDoctorIDs.includes('0') ? [] : selectedDoctorIDs;

    if (filteredDoctorIDs.length === 0 && selectedLocationIDs.length === 0) {
      setError('กรุณาเลือกแพทย์หรือห้องตรวจอย่างน้อยหนึ่งรายการ');
      setLoading(false);
      return;
    }

    const defaultDate = '2025-05-08';
    const beginDate = selectedDateRange.startDate || defaultDate;
    const endDate = selectedDateRange.endDate || defaultDate;

    try {
      const payload = {
        beginDate,
        endDate,
        locationID: selectedLocationIDs,
        mainDoctorID: filteredDoctorIDs,
      };

      const response = await fetchContact(payload);
      setContactData(Array.isArray(response) ? response : []);
      setIsSearching(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching contact data:', err);
      setError('ดึงข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <Image
          src="/images/prapokklaologo.png"
          alt="Prapokklao Logo"
          width={50}
          height={50}
          className={styles.logo}
        />
        <h1 className={styles.title}>P R A P O K K L A O - API</h1>
      </div>

      {/* Form Content */}
      <div className={styles.content}>
        <div className={`${styles.row} ${styles.horizontalGroup} ${styles.grayBackground}`}>
          {/* Doctor Dropdown */}
          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserRound size={16} />
                <label htmlFor="doctor" className={styles.label}>เลือกแพทย์</label>
              </div>
              <DoctorDropdown
                value={selectedDoctors}  // array object
                onChange={handleDoctorChange}
                options={doctorOptions}
                isDisabled={doctors.length === 0}
              />
            </div>
          </div>

          {/* Location Dropdown */}
          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hospital size={16} />
                <label htmlFor="location" className={styles.label}>เลือกห้องตรวจ</label>
              </div>
              <LocationDropdown
                value={selectedLocations}  // array object
                onChange={handleLocationChange}
                options={locationOptions}
                isDisabled={locations.length === 0}
              />
            </div>
          </div>

          {/* Date Picker */}
          <DatePicker
            startDate={selectedDateRange.startDate}
            endDate={selectedDateRange.endDate}
            onStartDateChange={(val) =>
              setSelectedDateRange(prev => ({ ...prev, startDate: val }))
            }
            onEndDateChange={(val) =>
              setSelectedDateRange(prev => ({ ...prev, endDate: val }))
            }
          />
        </div>

        {/* Buttons */}
        <SearchButtons
          onSearch={handleSearch}
          onClear={handleClear}
          disabled={doctors.length === 0 || locations.length === 0 || loading}
        />

        {/* Loading/Error/Chart */}
        {loading && <div>กำลังโหลดข้อมูล...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {isSearching && !loading && (
          <GanttChart
            mainDoctorID={selectedDoctors.some(d => d.value === '0') ? [] : selectedDoctors.map(d => Number(d.value))}
            locationID={selectedLocations.map(l => Number(l.value))}
            data={contactData}
            beginDate={selectedDateRange.startDate}
            endDate={selectedDateRange.endDate}
          />
        )}
      </div>
    </div>
  );
}
