// components/AnalogInput.jsx
import React from 'react';
import { inputStyle, mobileInputStyle, valueDisplayStyle, mobileValueDisplayStyle, inputGroupStyle } from '../styles';

const AnalogInput = React.memo(({ value, onChange, step = '0.01', min, placeholder, resultValue, isMobile = false, label }) => {
  const inputStyles = { ...inputStyle, ...(isMobile ? mobileInputStyle : {}) };
  const valueDisplayStyles = { ...valueDisplayStyle, ...(isMobile ? mobileValueDisplayStyle : {}) };

  return (
    <div style={inputGroupStyle}>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyles}
      />
    </div>
  );
});

export default AnalogInput;


