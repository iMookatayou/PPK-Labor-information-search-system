'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import { fetchDoctors } from '../../../api/apiService';

const NONE_OPTION = {
  value: '0',
  label: 'ไม่ระบุแพทย์',
};

export default function DoctorDropdown({ value = [], onChange, options }) {
  const [doctors, setDoctors] = useState(options || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!options || options.length === 0) {
      const loadDoctors = async () => {
        setLoading(true);
        try {
          const fetched = await fetchDoctors();
          setDoctors(fetched || []);
        } catch (err) {
          console.error('เกิดข้อผิดพลาดในการโหลดรายชื่อแพทย์:', err);
          setDoctors([]);
        } finally {
          setLoading(false);
        }
      };
      loadDoctors();
    }
  }, [options]);

  const doctorOptions = useMemo(() => {
    const seen = new Set();
    const list = [];

    if (Array.isArray(doctors)) {
      doctors.forEach((doc) => {
        const id =
          doc?.doctorid !== undefined && doc?.doctorid !== null
            ? doc.doctorid.toString()
            : 'unknown';

        if (!seen.has(id)) {
          seen.add(id);
          list.push({
            value: id,
            label: doc?.doctorFullname || `แพทย์ไม่มีชื่อ (${id})`,
          });
        }
      });
    }

    return [NONE_OPTION, ...list];
  }, [doctors]);

  const selectedOptions = useMemo(() => {
    if (!value || value.length === 0) return [];
    return doctorOptions.filter((opt) => value.includes(opt.value));
  }, [value, doctorOptions]);

  const handleChange = useCallback(
    (selected) => {
      if (!selected || selected.length === 0) {
        onChange([]);
        return;
      }

      const selectedValues = selected.map((opt) => opt.value);

      if (selectedValues.includes('0')) {
        onChange(['0']);
      } else {
        const filtered = selectedValues.filter((val) => val !== '0');
        onChange(filtered);
      }
    },
    [onChange]
  );

  return (
    <div className="w-full">
      <Select
        instanceId="doctor-dropdown"
        isMulti
        isSearchable
        options={doctorOptions}
        value={selectedOptions}
        onChange={handleChange}
        isLoading={loading}
        placeholder="ค้นหาแพทย์หรือ ID"
        noOptionsMessage={() => 'ไม่พบแพทย์'}
        closeMenuOnSelect={false}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#2684FF' : '#ccc',
            boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : 'none',
            '&:hover': {
              borderColor: '#2684FF',
            },
            minHeight: '38px',
            minWidth: '300px',
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#2684FF',
            color: 'white',
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
            padding: '0 4px',
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            ':hover': {
              backgroundColor: '#1a5fd6',
              color: 'white',
              transform: 'scale(1.2) rotate(20deg)',
            },
          }),
          placeholder: (provided) => ({
            ...provided,
            color: '#999',
          }),
        }}
      />
    </div>
  );
}
