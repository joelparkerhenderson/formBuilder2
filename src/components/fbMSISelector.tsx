import React from 'react';
import { parseServerResponse } from '../utils/shadesOfPaleParser';

interface MSISelectorProps {
  name: string;
  value: string;
  onChange: (value: string, coded: boolean) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  required?: boolean;
  coded?: boolean;
  placeholder?: string;
  hasLabel?: boolean;
}

export const fbMSISelector: React.FC<MSISelectorProps> = ({ 
  name, 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  required, 
  coded,
  placeholder = "Type to search staff index",
  hasLabel = true
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>(value);
  const [results, setResults] = React.useState<Array<{score: number, ie: {line: string}}>>([]);
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const [dropdownLeft, setDropdownLeft] = React.useState<number>(0);
  const [dropdownTop, setDropdownTop] = React.useState<number>(0);
  const [dropdownMaxHeight, setDropdownMaxHeight] = React.useState<number>(300);
  const [justSelected, setJustSelected] = React.useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = React.useState<boolean>(false);
  const [lastSelectedValue, setLastSelectedValue] = React.useState<string>(value);

  React.useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value);
      setLastSelectedValue(value);
    }
  }, [value]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const performSearch = () => {
    if (searchTerm.length > 0) {
      setIsLoading(true);
      const authHeader = 'Basic ' + btoa('dhcw:dhcw');

      fetch(`https://www.shadesofpale.net/MSISearch?st=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      })
        .then(response => response.text())
        .then(text => {
          try {
            const data = parseServerResponse(text);
            setResults(data || []);
            if (hasInteracted) {
              setShowDropdown(true);
            }
            setHighlightedIndex(-1);
          } catch (e) {
            console.error('Failed to parse response:', e);
            setResults([]);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('MSISearch error:', error);
          setResults([]);
          setIsLoading(false);
        });
    } else {
      setResults([]);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  React.useEffect(() => {
    if (!justSelected) {
      performSearch();
    }
  }, [searchTerm]);

  const updateDropdownPosition = React.useCallback(() => {
    if (containerRef.current) {
      const dropdownWidthPx = 45 * 16;
      const maxDropdownWidth = Math.min(dropdownWidthPx, window.innerWidth - 40);
      const containerRect = containerRef.current.getBoundingClientRect();

      const spaceBelow = window.innerHeight - containerRect.bottom - 20;
      const spaceAbove = containerRect.top - 20;
      const preferredHeight = 300;

      let topPos: number;
      let maxHeight: number;

      if (spaceBelow >= preferredHeight || spaceBelow >= spaceAbove) {
        topPos = containerRect.bottom + 2;
        maxHeight = Math.min(preferredHeight, Math.max(100, spaceBelow));
      } else {
        maxHeight = Math.min(preferredHeight, Math.max(100, spaceAbove));
        topPos = containerRect.top - maxHeight - 2;
      }

      setDropdownTop(topPos);
      setDropdownMaxHeight(maxHeight);

      const dropdownRight = containerRect.left + maxDropdownWidth;

      if (dropdownRight > window.innerWidth) {
        const shift = dropdownRight - window.innerWidth + 20;
        setDropdownLeft(containerRect.left - shift);
      } else {
        setDropdownLeft(containerRect.left);
      }
    }
  }, []);

  React.useEffect(() => {
    if (showDropdown && results.length > 0) {
      setHighlightedIndex(-1);
      updateDropdownPosition();

      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updateDropdownPosition);
        return () => {
          scrollContainer.removeEventListener('scroll', updateDropdownPosition);
        };
      }
    } else if (!showDropdown) {
      setHighlightedIndex(-1);
    }
  }, [showDropdown, results, updateDropdownPosition]);

  const handleSelect = (line: string) => {
    setJustSelected(true);
    setSearchTerm(line);
    onChange(line, true);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    setLastSelectedValue(line);
    setTimeout(() => setJustSelected(false), 100);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('', false);
    setShowDropdown(false);
    setResults([]);
    setHighlightedIndex(-1);
    setLastSelectedValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        if (prev === -1) return 0;
        return Math.min(prev + 1, results.length - 1);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        return Math.max(prev - 1, -1);
      });
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightedIndex].ie.line);
    }
  };

  const renderContent = () => {
    return (
      <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: '0.3rem'}}>
        <div ref={containerRef} style={{position: 'relative', flex: 1}}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <input
              ref={inputRef}
              type="text"
              name={name}
              value={searchTerm}
              onChange={(e) => {
                setHasInteracted(true);
                setSearchTerm(e.target.value);
                onChange(e.target.value, false);
              }}
              onFocus={(e) => {
                setHasInteracted(true);
                if (results.length > 0 && !justSelected) setShowDropdown(true);
                if (onFocus) onFocus(e);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowDropdown(false);
                  if (onBlur) onBlur();
                }, 200);
              }}
              onKeyDown={handleKeyDown}
              className="w-full p-2 fb-hide-border-in-rov fb-msi-selector-input"
              style={{
                border: '0.1rem solid silver',
                borderRadius: '0.4rem',
                paddingRight: '2.5rem',
                height: '2rem',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
              required={required}
              placeholder={placeholder}
              autoComplete="off"
            />
            <div style={{
              position: 'absolute',
              right: '0.2rem',
              display: 'flex',
              gap: '0.1rem',
              alignItems: 'center'
            }}>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
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
              <button
                type="button"
                onClick={() => {
                  setHasInteracted(true);
                  if (showDropdown) {
                    setShowDropdown(false);
                    setHighlightedIndex(-1);
                  } else {
                    setHighlightedIndex(-1);
                    if (results.length > 0) {
                      setShowDropdown(true);
                    } else {
                      performSearch();
                    }
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '1rem',
                  padding: '0.1rem',
                  lineHeight: 1
                }}
              >
                {showDropdown ? '▲' : '▼'}
              </button>
            </div>
          </div>
          {showDropdown && results.length > 0 && (
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: `${dropdownTop}px`,
                left: `${dropdownLeft}px`,
                width: '45rem',
                maxWidth: '100vw',
                maxHeight: `${dropdownMaxHeight}px`,
                overflowY: 'auto',
                overflowX: 'auto',
                backgroundColor: 'white',
                border: '0.1rem solid silver',
                borderRadius: '0.4rem',
                zIndex: 10000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {results.map((result, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleSelect(result.ie.line)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    backgroundColor: highlightedIndex === index ? '#ffffcc' : 'white',
                    transition: 'background-color 0.2s',
                    lineHeight: '1.2'
                  }}
                >
                  {result.ie.line}
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div style={{
              position: 'absolute',
              right: '2.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              Searching...
            </div>
          )}
        </div>
        {searchTerm && (coded !== undefined ? coded : (searchTerm === lastSelectedValue)) && (
          <span className="material-icons" style={{
            color: '#008000',
            fontSize: '1.2rem'
          }} title="Coded">
            check_circle_outline
          </span>
        )}
        {searchTerm && !(coded !== undefined ? coded : (searchTerm === lastSelectedValue)) && (
          <span className="material-icons" style={{
            color: '#fd8a10',
            fontSize: '1.2rem'
          }} title="Not coded">
            warning
          </span>
        )}
      </div>
    );
  };

  if (required && !hasLabel) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, width: '100%' }}>
          {renderContent()}
        </div>
        <span style={{ color: '#d50000', fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.2rem', marginTop: '0.15rem', display: 'inline-block', userSelect: 'none' }}>*</span>
      </div>
    );
  }

  return renderContent();
};
