import * as React from 'react';
import { parseServerResponse } from '../utils/shadesOfPaleParser';
import { fbQuestion as FbQuestion, fbQuestionRequiredMarkerContext } from './fbQuestion';
import { fbValueError as FbValueError } from './fbValueError';

type SCTSearchCommand = 'findDisorder' | 'findProcedure';
type SCTSelectorMode = 'diagnosis' | 'procedure';

interface fbSCTSelectorProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string, coded: boolean) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  requiredForAudit?: boolean;
  coded?: boolean;
  valueError?: string;
  labelStyle?: React.CSSProperties;
  searchCommand: SCTSearchCommand;
  mode: SCTSelectorMode;
  inputClassName?: string;
}

export const fbSCTSelector: React.FC<fbSCTSelectorProps> = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Type to search SNOMED CT',
  required,
  requiredForAudit,
  coded,
  valueError,
  labelStyle,
  searchCommand,
  mode,
  inputClassName = '',
}) => {
  const questionOwnsRequiredMarkers = React.useContext(fbQuestionRequiredMarkerContext);
  const renderRequiredMarkers = !questionOwnsRequiredMarkers;
  const [searchTerm, setSearchTerm] = React.useState<string>(value);
  const [results, setResults] = React.useState<string[]>([]);
  const [fullData, setFullData] = React.useState<any>(null);
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const [dropdownLeft, setDropdownLeft] = React.useState<number>(0);
  const [dropdownTop, setDropdownTop] = React.useState<number>(0);
  const [dropdownMaxHeight, setDropdownMaxHeight] = React.useState<number>(300);
  const [justSelected, setJustSelected] = React.useState<boolean>(false);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const [hasSelected, setHasSelected] = React.useState<boolean>(false);
  const [lastSelectedValue, setLastSelectedValue] = React.useState<string>(value);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [hasInteracted, setHasInteracted] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef<boolean>(true);
  const skipHistoryRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value);
      if (mode === 'procedure') {
        setLastSelectedValue(value);
      }
    }
  }, [value]);

  const performSearch = (term?: string, addToHistory: boolean = true) => {
    const searchValue = term !== undefined ? term : searchTerm;

    if (searchValue.length > 0) {
      setIsLoading(true);

      if (term !== undefined) {
        setSearchTerm(term);
      }

      if (addToHistory) {
        const newHistory = searchHistory.slice(0, historyIndex + 1);
        if (mode === 'procedure') {
          if (newHistory[newHistory.length - 1] !== searchValue) {
            newHistory.push(searchValue);
            setSearchHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
          }
        } else {
          newHistory.push(searchValue);
          setSearchHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }

      fetch(`https://www.shadesofpale.net/SCTSearch?cmd=${searchCommand}&st=${encodeURIComponent(searchValue)}&count=30`, {
        method: 'GET'
      })
        .then(response => response.text())
        .then(text => {
          try {
            const data = parseServerResponse(text);
            const matches = data.orderedMatches || [];
            setResults(matches);
            setFullData(data);
            if (hasInteracted) {
              setShowDropdown(matches.length > 0);
            }
            setHighlightedIndex(-1);
          } catch (e) {
            console.error('Failed to parse SCTSearch response:', e);
            setResults([]);
            setFullData(null);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('SCTSearch error:', error);
          setResults([]);
          setFullData(null);
          setIsLoading(false);
        });
    } else {
      setResults([]);
      setFullData(null);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!justSelected) {
      const addToHistory = mode === 'procedure' ? !skipHistoryRef.current : true;
      skipHistoryRef.current = false;
      performSearch(undefined, addToHistory);
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

  const handleSelect = (conceptName: string) => {
    setJustSelected(true);
    setSearchTerm(conceptName);
    onChange(conceptName, true);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    setHasSelected(true);
    setLastSelectedValue(conceptName);
    setSelectedId(fullData?.id || '');
    setTimeout(() => setJustSelected(false), 100);
  };

  const handleMatchClick = (conceptName: string) => {
    if (mode === 'procedure') {
      setSearchTerm(conceptName);
    } else {
      performSearch(conceptName, true);
      setHasSelected(false);
    }
    setSelectedId('');
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (mode === 'procedure') {
        skipHistoryRef.current = true;
        setSearchTerm(searchHistory[newIndex]);
      } else {
        performSearch(searchHistory[newIndex], false);
        setHasSelected(false);
      }
      setSelectedId('');
    }
  };

  const handleNext = () => {
    if (historyIndex < searchHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      if (mode === 'procedure') {
        skipHistoryRef.current = true;
        setSearchTerm(searchHistory[newIndex]);
      } else {
        performSearch(searchHistory[newIndex], false);
        setHasSelected(false);
      }
      setSelectedId('');
    }
  };

  const handleConceptClick = (conceptText: string) => {
    if (mode === 'procedure') {
      setSearchTerm(conceptText);
    } else {
      performSearch(conceptText, true);
      setHasSelected(false);
    }
    setSelectedId('');
  };

  const handleClose = () => {
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('', false);
    setShowDropdown(false);
    setResults([]);
    setHighlightedIndex(-1);
    setHasSelected(false);
    setLastSelectedValue('');
    setSelectedId('');
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
      handleSelect(results[highlightedIndex]);
    }
  };

  const isCoded = coded !== undefined
    ? coded
    : mode === 'procedure'
      ? searchTerm === lastSelectedValue
      : hasSelected;

  const renderContent = () => (
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
              setHasSelected(false);
              setSelectedId('');
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
            className={`w-full p-2 fb-hide-border-in-rov ${inputClassName}`}
            style={{
              border: '0.1rem solid silver',
              borderRadius: '0.4rem',
              paddingRight: '2.5rem',
              height: '2rem',
              boxSizing: 'border-box',
              backgroundColor: 'white'
            }}
            placeholder={placeholder}
            required={required}
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
                    performSearch(undefined, true);
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
        {showDropdown && results.length > 0 && fullData && (
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${dropdownTop}px`,
              left: `${dropdownLeft}px`,
              width: '45rem',
              maxWidth: '100vw',
              maxHeight: `${dropdownMaxHeight}px`,
              backgroundColor: 'white',
              border: '0.1rem solid silver',
              borderRadius: '0.4rem',
              zIndex: 10000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex'
            }}
          >
            <div style={{
              width: '33.333%',
              borderRight: '0.1rem solid silver',
              overflowY: 'auto',
              overflowX: 'auto'
            }}>
              {results.map((conceptName, index) => (
                <div
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMatchClick(conceptName);
                  }}
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
                  {conceptName}
                </div>
              ))}
            </div>

            <div style={{
              width: '66.666%',
              padding: '0.25rem',
              overflowY: 'hidden',
              fontSize: '0.9rem',
              lineHeight: 1.2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {fullData.parents && Array.isArray(fullData.parents) && fullData.parents.length > 0 && (
                <div style={{marginBottom: '0.25rem'}}>
                  <div style={{backgroundColor: '#8cd2e7', color: 'black', fontSize: '0.6rem', width: '100%', padding: '0.2rem 0.5rem'}}>
                    Parent concepts
                  </div>
                  <div style={{marginTop: '0.3rem'}}>
                    {fullData.parents.map((parent: any, idx: number) => (
                      <span key={idx}>
                        {idx > 0 && ' | '}
                        <span
                          className="fb-sct-popup-hoverable"
                          tabIndex={0}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleConceptClick(parent.pt);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleConceptClick(parent.pt);
                            }
                          }}
                          style={{color: '#1b6ec2', cursor: 'pointer', textDecoration: 'underline'}}
                        >
                          {parent.pt}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {fullData.fst && (
                <div style={{marginBottom: '0.25rem'}}>
                  <div style={{backgroundColor: '#8cd2e7', color: 'black', fontSize: '0.6rem', width: '100%', padding: '0.2rem 0.5rem'}}>
                    Concept
                  </div>
                  <div style={{fontSize: '1.5rem', margin: '0.25rem 0', fontWeight: 500}}>
                    {fullData.fst}
                  </div>
                </div>
              )}

              <div style={{margin: '0.25rem 0', display: 'flex', gap: '0.3rem'}}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (historyIndex > 0) handleBack();
                  }}
                  disabled={historyIndex <= 0}
                  className="fb-sct-popup-btn"
                  style={{ backgroundColor: '#1b6ec2' }}
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (historyIndex < searchHistory.length - 1) handleNext();
                  }}
                  disabled={historyIndex >= searchHistory.length - 1}
                  className="fb-sct-popup-btn"
                  style={{ backgroundColor: '#1b6ec2' }}
                >
                  &gt;
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (fullData.pt) handleSelect(fullData.pt);
                  }}
                  className="fb-sct-popup-btn"
                  style={{ backgroundColor: '#008000' }}
                >
                  Select
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleClose();
                  }}
                  className="fb-sct-popup-btn"
                  style={{ backgroundColor: '#d50000' }}
                >
                  Close
                </button>
              </div>

              <div style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                {fullData.synonyms && Array.isArray(fullData.synonyms) && fullData.synonyms.length > 0 && (
                  <div style={{marginBottom: '0.25rem'}}>
                    <div style={{backgroundColor: '#8cd2e7', color: 'black', fontSize: '0.6rem', width: '100%', padding: '0.2rem 0.5rem'}}>
                      Synonyms
                    </div>
                    <div style={{marginTop: '0.3rem'}}>
                      {fullData.synonyms.map((synonym: string, idx: number) => (
                        <span key={idx}>
                          {idx > 0 && ' | '}
                          <span
                            className="fb-sct-popup-hoverable"
                            tabIndex={0}
                            style={{ color: 'black' }}
                          >
                            {synonym}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {fullData.children && Array.isArray(fullData.children) && fullData.children.length > 0 && (
                  <div>
                    <div style={{backgroundColor: '#8cd2e7', color: 'black', fontSize: '0.6rem', width: '100%', padding: '0.2rem 0.5rem'}}>
                      Child concepts
                    </div>
                    <div style={{marginTop: '0.3rem'}}>
                      {fullData.children.map((child: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: '0.1rem' }}>
                          <span
                            className="fb-sct-popup-hoverable"
                            tabIndex={0}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleConceptClick(child.pt);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleConceptClick(child.pt);
                              }
                            }}
                            style={{color: '#1b6ec2', cursor: 'pointer', textDecoration: 'underline'}}
                          >
                            {child.pt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
      {searchTerm && isCoded && (
        <span className="material-icons" style={{
          color: '#008000',
          fontSize: '1.2rem'
        }} title={`Coded: ${selectedId}`}>
          check_circle_outline
        </span>
      )}
      {searchTerm && !isCoded && (
        <span className="material-icons" style={{
          color: '#fd8a10',
          fontSize: '1.2rem'
        }} title="Not coded">
          warning
        </span>
      )}
    </div>
  );

  if (label) {
    return (
      <FbQuestion label={label} required={required} requiredForAudit={requiredForAudit} valueError={valueError} labelStyle={labelStyle}>
        {renderContent()}
      </FbQuestion>
    );
  }

  const content = renderContent();
  if (!valueError && !required && !requiredForAudit) return content;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
      <FbValueError message={valueError} />
      {(required || requiredForAudit) && renderRequiredMarkers ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, width: '100%' }}>
            {content}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.1rem', marginTop: '0.15rem' }}>
            {requiredForAudit && <span style={{ backgroundColor: '#fd8a10', color: 'white', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1, padding: '0.05rem 0.2rem', display: 'inline-block', whiteSpace: 'nowrap' }}>RfA</span>}
            {required && <span style={{ color: '#d50000', fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.2rem', display: 'inline-block', userSelect: 'none' }}>*</span>}
          </span>
        </div>
      ) : content}
    </div>
  );
};
