'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './InteractiveFormLayout.module.css';

import GanttChart from '@/app/form/tablecomponent/table';
import DoctorDropdown from '@/components/dropdown/doctordropdown/dockerdropdown';
import LocationDropdown from '@/components/dropdown/locationdropdown/locationdropdown';
import DatePicker from '@/components/datepicker/datepicker';
import SearchButtons from '@/components/searchbuttons/searchbuttons';
import { fetchDoctors, fetchLocations, fetchContact } from '@/app/api/apiService/route';
import { UserRound, Hospital } from 'lucide-react';

export default function Page() {
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // master data
  const [doctors, setDoctors] = useState([]);
  const [locations, setLocations] = useState([]);

  // ui state
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // result
  const [contactData, setContactData] = useState([]);

  // date range
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  /* ===================== Effects ===================== */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [doctorList, locationList] = await Promise.all([
          fetchDoctors(),
          fetchLocations(),
        ]);

        const defaultDoctor = { doctorid: '0', doctorFullname: 'ไม่ระบุแพทย์' };
        const doctorsWithStringIDs = (doctorList || []).map((doc) => ({
          ...doc,
          doctorid: String(doc.doctorid),
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

  const handleLogout = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const handleBackDashboard = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  const handleClear = useCallback(() => {
    setSelectedDoctors([]);
    setSelectedLocations([]);
    setSelectedDateRange({ startDate: '', endDate: '' });
    setIsSearching(false);
    setContactData([]);
    setError(null);
  }, []);

  const doctorOptions = useMemo(
    () =>
      doctors.map((doc) => ({
        value: doc.doctorid,
        label: doc.doctorFullname,
      })),
    [doctors]
  );

  const locationOptions = useMemo(
    () =>
      locations.map((loc) => ({
        value: String(loc.id),
        label: loc.detailtext,
      })),
    [locations]
  );

  const handleDoctorChange = useCallback(
    (selectedOptions) => {
      if (!selectedOptions || selectedOptions.length === 0) {
        setSelectedDoctors([]);
        setIsSearching(false);
        return;
      }

      const values = selectedOptions.map((opt) => opt.value);
      if (values.includes('0') && values.length > 1) {
        const onlyZero = doctorOptions.find((opt) => opt.value === '0');
        setSelectedDoctors(onlyZero ? [onlyZero] : []);
      } else {
        setSelectedDoctors(selectedOptions);
      }
      setIsSearching(false);
    },
    [doctorOptions]
  );

  const handleLocationChange = useCallback((selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(selectedOptions);
    }
    setIsSearching(false);
  }, []);
  
  const handleSearch = useCallback(async () => {
    setLoading(true);

    const selectedDoctorIDs = selectedDoctors.map((d) => d.value);
    const selectedLocationIDs = selectedLocations.map((l) => l.value);

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
  }, [selectedDoctors, selectedLocations, selectedDateRange]);

  const chartDoctorIDs = useMemo(
    () => (selectedDoctors.some((d) => d.value === '0') ? [] : selectedDoctors.map((d) => Number(d.value))),
    [selectedDoctors]
  );

  const chartLocationIDs = useMemo(
    () => selectedLocations.map((l) => Number(l.value)),
    [selectedLocations]
  );

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <img
          src="/images/prapokklaologo.png"
          alt="Prapokklao Logo"
          width={50}
          height={50}
          className={styles.logo}
        />
        <h1 className={styles.title}>P R A P O K K L A O - API</h1>

        {/* ปุ่มย้อนกลับ Dashboard */}
        <button type="button" className={styles.backBtn} onClick={handleBackDashboard}>
          ⬅ กลับ Dashboard
        </button>
      </div>

      {/* Form Content */}
      <div className={styles.content}>
        <div className={`${styles.row} ${styles.horizontalGroup} ${styles.grayBackground}`}>
          {/* Doctor */}
          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserRound size={16} />
                <label htmlFor="doctor" className={styles.label}>เลือกแพทย์</label>
              </div>
              <DoctorDropdown
                value={selectedDoctors}
                onChange={handleDoctorChange}
                options={doctorOptions}
                isDisabled={doctors.length === 0}
              />
            </div>
          </div>

          {/* Location */}
          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hospital size={16} />
                <label htmlFor="location" className={styles.label}>เลือกห้องตรวจ</label>
              </div>
              <LocationDropdown
                value={selectedLocations}
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
              setSelectedDateRange((prev) => ({ ...prev, startDate: val }))
            }
            onEndDateChange={(val) =>
              setSelectedDateRange((prev) => ({ ...prev, endDate: val }))
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
            mainDoctorID={chartDoctorIDs}
            locationID={chartLocationIDs}
            data={contactData}
            beginDate={selectedDateRange.startDate}
            endDate={selectedDateRange.endDate}
          />
        )}
      </div>
    </div>
  );
}
