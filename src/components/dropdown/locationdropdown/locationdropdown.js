'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { fetchLocations } from '@/app/api/apiService/route';

/**
 * ปิด SSR ของ react-select กัน hydration mismatch
 * และโชว์ skeleton ชั่วคราวระหว่างโหลด
 */
const Select = dynamic(() => import('react-select'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 40,
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        background: '#f9fafb',
      }}
    />
  ),
});

export default function MultiLocationDropdown({ value = [], onChange, maxSelect = 10 }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);

  // โหลดข้อมูลห้องตรวจครั้งแรก
  useEffect(() => {
    let alive = true;
    const loadLocations = async () => {
      setLoading(true);
      try {
        const res = await fetchLocations();
        const list = res?.data ?? res;
        if (!alive) return;
        const filtered = Array.isArray(list)
          ? list.filter((loc) => loc && loc.id !== undefined && loc.id !== null)
          : [];
        setLocations(filtered);
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องตรวจ:', err);
        if (alive) setLocations([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    loadLocations();
    return () => {
      alive = false;
    };
  }, []);

  // ตั้ง portal target หลัง mount (กัน hydration mismatch)
  useEffect(() => {
    setPortalTarget(typeof document !== 'undefined' ? document.body : null);
  }, []);

  // แปลงเป็น options ของ react-select
  const options = useMemo(() => {
    const seen = new Set();
    return locations
      .filter((loc) => {
        if (seen.has(loc.id)) return false;
        seen.add(loc.id);
        return true;
      })
      .map((loc) => ({
        value: String(loc.id),
        label: `${loc.shortname || 'ไม่ระบุ'}${loc.detailtext ? ` - ${loc.detailtext}` : ''} (${loc.id})`,
      }));
  }, [locations]);

  // map จาก value → option[]
  const selectedOptions = useMemo(() => {
    if (!value || value.length === 0) return [];
    if (typeof value[0] === 'object') return value; // กรณีส่ง object[] มา
    const valSet = new Set(value.map(String));
    return options.filter((opt) => valSet.has(opt.value));
  }, [value, options]);

  // handle change (จำกัดเลือกไม่เกิน maxSelect)
  const handleChange = useCallback(
    (selected) => {
      if (selected && selected.length > maxSelect) {
        alert(`เลือกได้ไม่เกิน ${maxSelect} รายการเท่านั้น`);
        return;
      }
      onChange?.(selected || []);
    },
    [onChange, maxSelect]
  );

  return (
    <div className="w-full" suppressHydrationWarning>
      <Select
        instanceId="multi-location-select"
        inputId="react-select-multi-location-select-input"
        isMulti
        isSearchable
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        isLoading={loading}
        placeholder="ค้นหาห้องตรวจหรือ ID"
        noOptionsMessage={() => 'ไม่พบห้องตรวจ'}
        closeMenuOnSelect={false}
        menuPortalTarget={portalTarget}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#2684FF' : '#ccc',
            boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : 'none',
            '&:hover': { borderColor: '#2684FF' },
            minHeight: 40,
            minWidth: 300,
            fontFamily: 'Sarabun, sans-serif',
            fontSize: '0.95rem',
          }),
          multiValue: (p) => ({
            ...p,
            backgroundColor: '#2684FF',
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '90%',
          }),
          multiValueLabel: (p) => ({ ...p, color: '#fff', padding: '0 4px' }),
          multiValueRemove: (p) => ({
            ...p,
            color: '#fff',
            cursor: 'pointer',
            transition: 'transform .2s ease, background-color .2s ease',
            ':hover': { backgroundColor: '#1a5fd6', color: '#fff', transform: 'scale(1.2) rotate(18deg)' },
          }),
          placeholder: (p) => ({ ...p, color: '#999' }),
        }}
      />
    </div>
  );
}
