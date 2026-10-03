import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

const QuickCalculatorModal = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (display === '0' && digit !== '.') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEqual = () => {
    try {
      const fullExpr = equation + display;
      // Sanitize input to only numbers and standard operators
      if (!/^[0-9+\-*/. ]+$/.test(fullExpr)) {
        setDisplay('Error');
        return;
      }
      // eslint-disable-next-line no-eval
      const result = Function('"use strict";return (' + fullExpr + ')')();
      setDisplay(String(Number(result.toFixed(4))));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-800 rounded-lg shadow-2xl w-72 overflow-hidden text-slate-900 font-sans">
        {/* Title Bar */}
        <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wide">Quick Calculator</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 text-right">
          <div className="text-[11px] text-slate-500 font-mono h-4">{equation}</div>
          <div className="text-2xl font-black font-mono text-slate-900 tracking-wider truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-2 grid grid-cols-4 gap-1.5 bg-slate-200">
          <button
            onClick={handleClear}
            className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded border border-rose-800 cursor-pointer"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-xs rounded border border-slate-400 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOp('/')}
            className="py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-900 font-black text-sm rounded border border-slate-400 cursor-pointer"
          >
            ÷
          </button>
          <button
            onClick={() => handleOp('*')}
            className="py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-900 font-black text-sm rounded border border-slate-400 cursor-pointer"
          >
            ×
          </button>

          {['7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded border border-slate-400 shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('-')}
            className="py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-900 font-black text-sm rounded border border-slate-400 cursor-pointer"
          >
            −
          </button>

          {['4', '5', '6'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded border border-slate-400 shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className="py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-900 font-black text-sm rounded border border-slate-400 cursor-pointer"
          >
            +
          </button>

          {['1', '2', '3'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded border border-slate-400 shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleEqual}
            rowSpan="2"
            className="row-span-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-base rounded border border-slate-950 flex items-center justify-center cursor-pointer shadow-xs"
          >
            =
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded border border-slate-400 shadow-xs cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded border border-slate-400 shadow-xs cursor-pointer"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickCalculatorModal;