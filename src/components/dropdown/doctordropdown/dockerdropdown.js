'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { fetchDoctors } from '@/app/api/apiService/route';

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

const NONE_OPTION = { value: '0', label: 'ไม่ระบุแพทย์' };

export default function DoctorDropdown({
  value = [],
  onChange,
  options,
  minWidth = 300,
  isDisabled = false,
  placeholder = 'ค้นหาแพทย์หรือ ID',
}) {
  const [doctors, setDoctors] = useState(options || []);
  const [loading, setLoading] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null); 

  useEffect(() => {
    if (options && options.length > 0) {
      setDoctors(options);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const fetched = await fetchDoctors();
        if (!alive) return;
        setDoctors(Array.isArray(fetched) ? fetched : []);
      } catch (err) {
        console.error('โหลดรายชื่อแพทย์ล้มเหลว:', err);
        if (alive) setDoctors([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [options]);

  useEffect(() => {
    setPortalTarget(typeof document !== 'undefined' ? document.body : null);
  }, []);

  const doctorOptions = useMemo(() => {
    const seen = new Set();
    const list = [];

    if (Array.isArray(doctors)) {
      for (const doc of doctors) {
        const id =
          doc?.doctorid !== undefined && doc?.doctorid !== null
            ? String(doc.doctorid)
            : null;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        list.push({
          value: id,
          label: doc?.doctorFullname || `แพทย์ไม่มีชื่อ (${id})`,
        });
      }
    }
    return [NONE_OPTION, ...list];
  }, [doctors]);

  const selectedOptions = useMemo(() => {
    if (!Array.isArray(value) || value.length === 0) return [];
    const setVal = new Set(value.map(String));
    return doctorOptions.filter((opt) => setVal.has(opt.value));
  }, [value, doctorOptions]);

  const handleChange = useCallback(
    (selected) => {
      const ids = Array.isArray(selected) ? selected.map((o) => o.value) : [];
      if (ids.length === 0) return onChange?.([]);

      if (ids.includes('0')) {
        onChange?.(['0']);
        return;
      }
      onChange?.(ids.filter((v) => v !== '0'));
    },
    [onChange]
  );

  return (
    <div className="w-full" suppressHydrationWarning>
      <Select
        instanceId="doctor-dropdown"                
        inputId="react-select-doctor-dropdown-input" 
        isMulti
        isSearchable
        isDisabled={isDisabled}
        options={doctorOptions}
        value={selectedOptions}
        onChange={handleChange}
        isLoading={loading}
        placeholder={placeholder}
        noOptionsMessage={() => 'ไม่พบแพทย์'}
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
            minWidth,
            fontFamily: 'Sarabun, sans-serif',
            fontSize: '0.95rem',
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#2684FF',
            color: '#fff',
            maxWidth: 220,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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

