// components/ResultRow.jsx
import React from 'react';
import { tdStyle, tdLabelStyle, mobileTdStyle, finalRowStyle } from '../styles';

const ResultRow = ({ label, value, colSpan = 1, isMobile = false }) => {
  return (
    <tr style={finalRowStyle}>
      <td style={{...tdStyle, ...tdLabelStyle, ...(isMobile ? mobileTdStyle : {})}}>
        {label}
      </td>
      <td colSpan={colSpan} style={{...tdStyle, ...(isMobile ? mobileTdStyle : {})}}>
        <span style={{
          color: '#166534',
          fontWeight: '600',
          fontSize: isMobile ? '16px' : '18px',
          backgroundColor: '#dcfce7',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #bbf7d0',
        }}>
          {value}
        </span>
      </td>
    </tr>
  );
};

export default ResultRow;


