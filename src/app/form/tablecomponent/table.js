'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const dt = dayjs.utc(dateStr).tz('Asia/Bangkok');
  return dt.isValid() ? dt.format('DD/MM/YYYY HH:mm') : '-';
};

export default function PatientRegistrationTable({ data = [] }) {
  
  const [highlightRow, setHighlightRow] = useState(null);

  const onMouseEnterRow = (rowIdx) => {
    setHighlightRow(rowIdx);
  };

  const onMouseLeaveTable = () => {
    setHighlightRow(null);
  };

  if (!Array.isArray(data) || data.length === 0) {
    return <div>ไม่พบข้อมูล</div>;
  }

  return (
    <>
      <div
        style={{
          overflowX: 'auto',
          fontFamily: 'Sarabun, sans-serif',
          fontSize: 14,
          position: 'relative',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            minWidth: 1100,
            userSelect: 'none',
          }}
          onMouseLeave={onMouseLeaveTable}
        >
          <thead>
            <tr style={{ backgroundColor: '#1976d2', color: 'white' }}>
              <th
                colSpan={4}
                style={{ padding: '10px', fontSize: '18px', textAlign: 'center' }}
              >
                Patient Registration
              </th>
            </tr>
            <tr style={{ backgroundColor: '#2196f3', color: 'white' }}>
              {['ข้อมูลผู้ป่วย', 'รายละเอียดการมาเยี่ยม', 'ข้อมูลสิทธิรักษา', 'ข้อมูล & นัดหมายต่อไป'].map(
                (header, colIdx) => (
                  <th
                    key={colIdx}
                    style={{
                      padding: '8px',
                      border: '1px solid #ddd',
                      width: '25%',
                    }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIdx) => {
              const isRowHighlighted = highlightRow === rowIdx;
              return (
                <tr
                  key={item.patregid || rowIdx}
                  style={{
                    borderBottom: '1px solid #ccc',
                    backgroundColor: isRowHighlighted
                      ? 'rgba(187, 222, 251, 0.5)' 
                      : rowIdx % 2 === 0
                      ? '#f9f9f9'
                      : 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={() => onMouseEnterRow(rowIdx)}
                >
                  <td
                    style={{
                      padding: '10px',
                      verticalAlign: 'top',
                      border: '1px solid #ddd',
                    }}
                  >
                    <div>
                      <strong>ID:</strong> {item.patregid || '-'}
                    </div>
                    <div>
                      <strong>Name:</strong>{' '}
                      {[item.prename, item.firstname, item.lastname]
                        .filter(Boolean)
                        .join(' ') || '-'}
                    </div>
                    <div>
                      <strong>Age:</strong> {item.Age_Y ? `${item.Age_Y} ปี` : '-'}
                    </div>
                    <div>
                      <strong>Gender:</strong> {item.c_sex || '-'}
                    </div>
                    <div>
                      <strong>Nationality:</strong> {item.c_citizenship_name || '-'}
                    </div>
                    <div>
                      <strong>Citizen ID:</strong> {item.citizencardno || '-'}
                    </div>
                    <div>
                      <strong>Other Card:</strong>{' '}
                      {item.c_othercardtypename
                        ? `${item.c_othercardtypename} : ${item.othercardno || '-'}`
                        : '-'}
                    </div>
                    <div>
                      <strong>Address:</strong> {item.pat_address || '-'}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      verticalAlign: 'top',
                      border: '1px solid #ddd',
                    }}
                  >
                    <div>
                      <strong>HN:</strong> {item.hn || '-'}
                    </div>
                    <div>
                      <strong>AN:</strong> {item.an || '-'}
                    </div>
                    <div>
                      <strong>Reg Date/Time:</strong> {formatDate(item.regdatetime)}
                    </div>
                    <div>
                      <strong>Start/End Time:</strong>
                      <div style={{ marginLeft: 10 }}>
                        <div>เริ่ม: {formatDate(item.startdatetime)}</div>
                        <div>สิ้นสุด: {formatDate(item.enddatetime)}</div>
                      </div>
                    </div>
                    <div>
                      <strong>Doctor Name:</strong>{' '}
                      {item.c_doctorname || item.doctorFullname || '-'}
                    </div>
                    <div>
                      <strong>Visit Status:</strong> {item.c_flag_reg || '-'}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      verticalAlign: 'top',
                      border: '1px solid #ddd',
                    }}
                  >
                    <div>
                      <strong>Coverage Type:</strong> {item.c_coveragemaster || '-'}
                    </div>
                    <div>
                      <strong>Coverage Code:</strong>{' '}
                      {item.c_coveragecode || '-'}
                    </div>
                    <div>
                      <strong>Coverage Card No:</strong> {item.coveragecardno || '-'}
                    </div>
                    <div>
                      <strong>Hospital Code:</strong> {item.c_hospcode || '-'}
                    </div>
                    <div>
                      <strong>Hospital Name:</strong> {item.c_hospname || '-'}
                    </div>
                    <div>
                      <strong>Claim Type:</strong> {item.c_claimtype || '-'}
                    </div>
                    <div>
                      <strong>Auth Code:</strong> {item.c_authencode || '-'}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      verticalAlign: 'top',
                      border: '1px solid #ddd',
                    }}
                  >
                    <div>
                      <strong>Contact Name:</strong> {item.contactFullname || '-'}
                    </div>
                    <div>
                      <strong>Relation Name:</strong>{' '}
                      {item.relationName || item.contactRelation || '-'}
                    </div>
                    <div>
                      <strong>Contact Address:</strong> {item.contactAddress || '-'}
                    </div>
                    <div>
                      <strong>Next Appointment:</strong> {formatDate(item.c_nextappoint)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
