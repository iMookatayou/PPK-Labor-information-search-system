'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import { fetchLocations } from '../../../api/apiService';

export default function MultiLocationDropdown({ value = [], onChange }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true);
      try {
        const res = await fetchLocations();
        const list = res?.data ?? res;
        const filtered = list.filter(
          (loc) => loc && loc.id !== undefined && loc.id !== null
        );
        setLocations(filtered);
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องตรวจ:', err);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const options = useMemo(() => {
    const seen = new Set();
    return locations
      .filter((loc) => {
        if (seen.has(loc.id)) return false;
        seen.add(loc.id);
        return true;
      })
      .map((loc) => ({
        value: loc.id.toString(),
        label: `${loc.shortname || 'ไม่ระบุ'}${loc.detailtext ? ` - ${loc.detailtext}` : ''} (${loc.id})`,
      }));
  }, [locations]);

  const selectedOptions = useMemo(() => {
    if (!value || value.length === 0) return [];
    if (typeof value[0] === 'object') return value;
    return options.filter((opt) => value.includes(opt.value));
  }, [value, options]);

  const handleChange = useCallback(
    (selected) => {
      if (selected && selected.length > 10) {
        alert('เลือกได้ไม่เกิน 10 รายการเท่านั้น');
        return; 
      }
      if (!selected || selected.length === 0) {
        onChange([]);
      } else {
        onChange(selected);
      }
    },
    [onChange]
  );

  return (
    <div className="w-full">
      <Select
        instanceId="multi-location-select"
        isMulti
        isSearchable
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        isLoading={loading}
        placeholder="ค้นหาห้องตรวจหรือ ID"
        noOptionsMessage={() => 'ไม่พบห้องตรวจ'}
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
            width: 'auto',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '90%',
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
            transition: 'transform 0.2s ease, backgroundColor 0.2s ease',
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
