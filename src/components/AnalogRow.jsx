// components/AnalogRow.jsx
import React from 'react';
import { tdStyle, tdLabelStyle, mobileTdStyle, highlightRowStyle, resultRowStyle } from '../styles';
import AnalogInput from './AnalogInput';

const AnalogRow = ({ label, inputs, isHighlight = false, isResult = false, isMobile = false }) => {
  const rowStyle = {
    ...tdStyle,
    ...(isHighlight ? highlightRowStyle : {}),
    ...(isResult ? resultRowStyle : {}),
  };

  return (
    <tr style={isHighlight || isResult ? rowStyle : {}}>
      <td style={{...tdStyle, ...tdLabelStyle, ...(isMobile ? mobileTdStyle : {})}}>
        {label}
      </td>
      {inputs.map((input, i) => (
        <td key={i} style={{...tdStyle, ...(isMobile ? mobileTdStyle : {})}}>
          {input}
        </td>
      ))}
    </tr>
  );
};

export default AnalogRow;


