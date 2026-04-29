import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ArrowUp, ArrowDown } from 'lucide-react';

const DatePicker = ({ isDark, label = '18 March, 2026' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 18));
  const [selectedDate, setSelectedDate] = useState(label);
  const dropdownRef = useRef(null);
  
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = [...Array(daysInMonth)].map((_, i) => i + 1);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer border ${
          isDark ? 'bg-[#212529] border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100 shadow-sm'
        }`}
      >
        <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedDate}</span>
        <Calendar size={14} className="opacity-60" />
      </div>

      {isOpen && (
        <div className={`absolute top-full right-0 mt-2 w-[280px] rounded-xl shadow-2xl z-50 overflow-hidden border p-4 animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{monthName}, {year}</span>
            <div className="flex gap-2">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"><ArrowUp size={16} className={`opacity-60 hover:opacity-100 ${isDark ? 'text-white' : 'text-slate-800'}`} /></button>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"><ArrowDown size={16} className={`opacity-60 hover:opacity-100 ${isDark ? 'text-white' : 'text-slate-800'}`} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map(d => <div key={d} className={`text-[10px] uppercase font-bold py-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>)}
            {calendarDays.map(d => {
              const dateStr = `${d} ${monthName}, ${year}`;
              const isSelected = selectedDate === dateStr;
              return (
                <div
                  key={d}
                  onClick={() => { setSelectedDate(dateStr); setIsOpen(false); }}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-brand text-white shadow-lg' : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
