import * as React from 'react';

interface DateControlProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLInputElement>) => void;
}

export const fbDateControl: React.FC<DateControlProps> = ({
  name,
  value = '',
  onChange,
  placeholder,
  required,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [displayMonth, setDisplayMonth] = React.useState<number>(new Date().getMonth());
  const [displayYear, setDisplayYear] = React.useState<number>(new Date().getFullYear());
  const [calendarTop, setCalendarTop] = React.useState<number>(0);
  const [calendarLeft, setCalendarLeft] = React.useState<number>(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Sync internal inputValue with external value prop
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const parseDate = (dateStr: string): { date: Date | null, precision: 'day' | 'month' | 'year' | null } => {
    if (!dateStr.trim()) return { date: null, precision: null };

    const str = dateStr.trim();

    // Try dd-Mmm-yyyy or dd-Mmm-yy
    let match = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
    if (match) {
      const day = parseInt(match[1]);
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === match[2].toLowerCase());
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      if (monthIndex >= 0 && day >= 1 && day <= 31) {
        return { date: new Date(year, monthIndex, day), precision: 'day' };
      }
    }

    // Try Mmm-yyyy or Mmm-yy
    match = str.match(/^([A-Za-z]{3})-(\d{2,4})$/);
    if (match) {
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === match[1].toLowerCase());
      let year = parseInt(match[2]);
      if (year < 100) year += 2000;
      if (monthIndex >= 0) {
        return { date: new Date(year, monthIndex, 1), precision: 'month' };
      }
    }

    // Try yyyy or yy
    match = str.match(/^(\d{2,4})$/);
    if (match) {
      let year = parseInt(match[1]);
      if (year < 100) year += 2000;
      return { date: new Date(year, 0, 1), precision: 'year' };
    }

    // Try dd/mm/yyyy or dd/mm/yy
    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { date: new Date(year, month, day), precision: 'day' };
      }
    }

    // Try mm/yyyy or mm/yy
    match = str.match(/^(\d{1,2})\/(\d{2,4})$/);
    if (match) {
      const month = parseInt(match[1]) - 1;
      let year = parseInt(match[2]);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11) {
        return { date: new Date(year, month, 1), precision: 'month' };
      }
    }

    // Try dd.mm.yyyy or dd.mm.yy
    match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { date: new Date(year, month, day), precision: 'day' };
      }
    }

    // Try mm.yyyy or mm.yy
    match = str.match(/^(\d{1,2})\.(\d{2,4})$/);
    if (match) {
      const month = parseInt(match[1]) - 1;
      let year = parseInt(match[2]);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11) {
        return { date: new Date(year, month, 1), precision: 'month' };
      }
    }

    return { date: null, precision: null };
  };

  const formatDate = (date: Date, precision: 'day' | 'month' | 'year'): string => {
    if (precision === 'day') {
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day.toString().padStart(2, '0')}-${month}-${year}`;
    } else if (precision === 'month') {
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month}-${year}`;
    } else {
      return date.getFullYear().toString();
    }
  };

  const handleBlur = () => {
    const { date, precision } = parseDate(inputValue);
    if (inputValue && !date) {
      setError('Invalid date');
    } else if (date && precision) {
      const formatted = formatDate(date, precision);
      setInputValue(formatted);
      onChange(formatted);
      setSelectedDate(date);
      setError('');
    }
    setTimeout(() => setShowCalendar(false), 200);
  };

  const updateCalendarPosition = React.useCallback(() => {
    if (containerRef.current && calendarRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const calendarHeight = calendarRef.current.offsetHeight || 350;
      const calendarWidth = calendarRef.current.offsetWidth || 300;

      const spaceBelow = window.innerHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;

      let topPos: number;
      if (spaceBelow >= calendarHeight + 10) {
        topPos = containerRect.bottom + 2;
      } else if (spaceAbove >= calendarHeight + 10) {
        topPos = containerRect.top - calendarHeight - 2;
      } else {
        topPos = containerRect.bottom + 2;
      }

      let leftPos = containerRect.left;
      const spaceRight = window.innerWidth - containerRect.left;

      if (spaceRight < calendarWidth + 20) {
        leftPos = Math.max(10, window.innerWidth - calendarWidth - 20);
      }

      setCalendarTop(topPos);
      setCalendarLeft(leftPos);
    }
  }, []);

  React.useEffect(() => {
    if (showCalendar) {
      updateCalendarPosition();
      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updateCalendarPosition);
        return () => scrollContainer.removeEventListener('scroll', updateCalendarPosition);
      }
    }
  }, [showCalendar, updateCalendarPosition]);

  const setDateAndFormat = (date: Date, precision: 'day' | 'month' | 'year', closeCalendar: boolean = false) => {
    setSelectedDate(date);
    setDisplayMonth(date.getMonth());
    setDisplayYear(date.getFullYear());
    const formatted = formatDate(date, precision);
    setInputValue(formatted);
    onChange(formatted);
    setError('');
    if (closeCalendar) {
      setShowCalendar(false);
    }
  };

  const handleYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    setDateAndFormat(date, 'day', true);
  };

  const handleToday = () => {
    setDateAndFormat(new Date(), 'day', true);
  };

  const handleTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    setDateAndFormat(date, 'day', true);
  };

  const addDays = (days: number) => {
    const date = selectedDate || new Date();
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDateAndFormat(newDate, 'day', false);
  };

  const addMonths = (months: number) => {
    const date = selectedDate || new Date();
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    setDateAndFormat(newDate, 'day', false);
  };

  const addYears = (years: number) => {
    const date = selectedDate || new Date();
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    setDateAndFormat(newDate, 'day', false);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const today = new Date();
    const days = [];

    const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
    const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(prevYear, prevMonth, day);
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === prevMonth &&
        selectedDate.getFullYear() === prevYear;

      days.push(
        <div
          key={`prev-${day}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setSelectedDate(date);
            setDisplayMonth(date.getMonth());
            setDisplayYear(date.getFullYear());
            const formatted = formatDate(date, 'day');
            setInputValue(formatted);
            onChange(formatted);
          }}
          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffcc'; }}
          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white'; }}
          style={{
            padding: '0.2rem',
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: isSelected ? 'bold' : 300,
            letterSpacing: '0.01rem',
            lineHeight: '1rem',
            backgroundColor: isSelected ? '#008000' : 'white',
            color: isSelected ? 'white' : 'silver',
            border: '1px solid transparent',
            borderRadius: '0.2rem',
            transition: 'background-color 0.2s ease-out'
          }}
        >
          {day}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayYear, displayMonth, day);
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === displayMonth &&
        selectedDate.getFullYear() === displayYear;
      const isToday = today.getDate() === day &&
        today.getMonth() === displayMonth &&
        today.getFullYear() === displayYear;

      days.push(
        <div
          key={day}
          onMouseDown={(e) => {
            e.preventDefault();
            setSelectedDate(date);
            setDisplayMonth(date.getMonth());
            setDisplayYear(date.getFullYear());
            const formatted = formatDate(date, 'day');
            setInputValue(formatted);
            onChange(formatted);
          }}
          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffcc'; }}
          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white'; }}
          style={{
            padding: isToday ? '0.1rem' : '0.2rem',
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: isSelected ? 'bold' : 300,
            letterSpacing: '0.01rem',
            lineHeight: '1rem',
            backgroundColor: isSelected ? '#008000' : 'white',
            color: isSelected ? 'white' : 'black',
            border: isToday 
              ? (isSelected ? '0.2rem solid #00bf00' : '0.2rem solid #008000') 
              : '1px solid transparent',
            borderRadius: '0.2rem',
            transition: 'background-color 0.2s ease-out'
          }}
        >
          {day}
        </div>
      );
    }

    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;

    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(nextYear, nextMonth, day);
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === nextMonth &&
        selectedDate.getFullYear() === nextYear;

      days.push(
        <div
          key={`next-${day}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setSelectedDate(date);
            setDisplayMonth(date.getMonth());
            setDisplayYear(date.getFullYear());
            const formatted = formatDate(date, 'day');
            setInputValue(formatted);
            onChange(formatted);
          }}
          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffcc'; }}
          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white'; }}
          style={{
            padding: '0.2rem',
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: isSelected ? 'bold' : 300,
            letterSpacing: '0.01rem',
            lineHeight: '1rem',
            backgroundColor: isSelected ? '#008000' : 'white',
            color: isSelected ? 'white' : 'silver',
            border: '1px solid transparent',
            borderRadius: '0.2rem',
            transition: 'background-color 0.2s ease-out'
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const buttonStyle: React.CSSProperties = {
    height: '1.0rem',
    margin: '0.2rem',
    border: '0.1rem solid #1b6ec2',
    borderRadius: '0.4rem',
    padding: '0 0.5rem',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '0.6rem',
    fontWeight: 300,
    letterSpacing: '0.01rem',
    textAlign: 'center',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    backgroundColor: 'white',
    color: '#1b6ec2',
    cursor: 'pointer',
    transition: 'background-color 1s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSelectedDate(null);
    setError('');
    setShowCalendar(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && !showCalendar) {
      e.preventDefault();
      setShowCalendar(true);
      const { date } = parseDate(inputValue);
      if (date) {
        setSelectedDate(date);
        setDisplayMonth(date.getMonth());
        setDisplayYear(date.getFullYear());
      }
    }
  };

  return (
    <div ref={containerRef} style={{position: 'relative', width: '100%'}}>
      <div style={{position: 'relative', width: '100%', maxWidth: '11rem'}}>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          onClick={() => {
            if (!showCalendar) {
              setShowCalendar(true);
              const { date } = parseDate(inputValue);
              if (date) {
                setSelectedDate(date);
                setDisplayMonth(date.getMonth());
                setDisplayYear(date.getFullYear());
              }
            }
          }}
          onFocus={(e) => {
            setShowCalendar(true);
            const { date } = parseDate(inputValue);
            if (date) {
              setSelectedDate(date);
              setDisplayMonth(date.getMonth());
              setDisplayYear(date.getFullYear());
            }
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            handleBlur();
            if (onBlur) onBlur(e);
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onKeyDown={handleKeyDown}
          className="border rounded fb-hide-border-in-rov fb-date-control-input text-black"
          placeholder={placeholder || 'dd-Mmm-yyyy'}
          required={required}
          autoComplete="off"
          style={{
            borderColor: error ? '#d50000' : undefined,
            paddingRight: inputValue ? '2rem' : undefined,
            width: '100%',
            height: '2rem',
            paddingLeft: '0.5rem',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
            boxSizing: 'border-box'
          }}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#666',
              fontSize: '0.9rem',
              padding: '0.1rem',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        )}
      </div>
      {error && <div style={{color: '#d50000', fontSize: '0.8rem', marginTop: '0.2rem'}}>{error}</div>}
      {showCalendar && (
        <div
          ref={calendarRef}
          style={{
            position: 'fixed',
            top: `${calendarTop}px`,
            left: `${calendarLeft}px`,
            width: '20rem',
            backgroundColor: 'white',
            border: '0.1rem solid silver',
            borderRadius: '0.4rem',
            padding: '0.5rem',
            zIndex: 10000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{display: 'flex'}}>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleYesterday(); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Yesterday
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleToday(); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Today
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleTomorrow(); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Tomorrow
            </button>
          </div>

          <div style={{display: 'flex'}}>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); addDays(7); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Next week
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); addDays(42); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              +Six weeks
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); addMonths(3); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              +Three months
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); addYears(1); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              +1 year
            </button>
          </div>

          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
            <div style={{border: '0.1rem solid silver', borderRadius: '0.4rem', padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem'}}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setDisplayMonth(m => m === 0 ? 11 : m - 1); if (displayMonth === 0) setDisplayYear(y => y - 1); }} style={buttonStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                -
              </button>
              <span style={{fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.01rem', padding: '0 0.3rem'}}>{monthNames[displayMonth]}</span>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setDisplayMonth(m => m === 11 ? 0 : m + 1); if (displayMonth === 11) setDisplayYear(y => y + 1); }} style={buttonStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                +
              </button>
            </div>
            <div style={{border: '0.1rem solid silver', borderRadius: '0.4rem', padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem'}}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setDisplayYear(y => y - 1); }} style={buttonStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                -
              </button>
              <span style={{fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.01rem', padding: '0 0.3rem'}}>{displayYear}</span>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setDisplayYear(y => y + 1); }} style={buttonStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                +
              </button>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.1rem', margin: '0.2rem'}}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} style={{textAlign: 'center', fontSize: '0.8rem', fontWeight: 300, letterSpacing: '0.01rem', lineHeight: '1rem', padding: '0.2rem', color: 'silver', borderBottom: '0.1rem solid silver'}}>
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          <div style={{display: 'flex'}}>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); if (selectedDate) setDateAndFormat(selectedDate, 'day', false); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Select exact date
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); if (selectedDate) setDateAndFormat(selectedDate, 'month', false); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Select month
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); if (selectedDate) setDateAndFormat(selectedDate, 'year', false); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Select year
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowCalendar(false); }} style={{...buttonStyle, flex: 1}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffcc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
