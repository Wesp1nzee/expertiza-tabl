// components/AnalogSelect.jsx
import React from 'react';
import { selectStyle } from '../styles';

const AnalogSelect = ({ value, onChange, options, placeholder = "Нет данных" }) => {
  return (
    <select value={value} onChange={onChange} style={selectStyle}>
      {options.length ? (
        options.map((opt) => <option key={opt} value={opt}>{opt}</option>)
      ) : (
        <option value="">{placeholder}</option>
      )}
    </select>
  );
};

export default AnalogSelect;


