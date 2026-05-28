import React from 'react';

interface AddFormMenuProps {
  onSelectFormType: (formType: 'outpatient_outcome' | 'waiting_list' | 'operation_note') => void;
  onCancel: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const fbAddFormMenu: React.FC<AddFormMenuProps> = ({ onSelectFormType, onCancel, buttonRef }) => {
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  React.useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top - 4, // Position above button with small gap
        left: rect.left
      });
    }
  }, [buttonRef]);

  return (
    <>
      {/* Overlay to close menu on outside click */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1999
        }}
      />

      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          transform: 'translateY(-100%)',
          backgroundColor: 'white',
          border: '0.2rem solid rgb(27, 110, 194)',
          borderRadius: '0.4rem',
          padding: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 2000,
          fontFamily: "'Roboto', sans-serif",
          minWidth: '200px'
        }}
      >
        <button
          type="button"
          onClick={() => onSelectFormType('outpatient_outcome')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
            transition: 'background-color 0.2s ease-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          Outpatient outcome form
        </button>
        <button
          type="button"
          onClick={() => onSelectFormType('waiting_list')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
            transition: 'background-color 0.2s ease-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          Waiting list card
        </button>
        <button
          type="button"
          onClick={() => onSelectFormType('operation_note')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
            transition: 'background-color 0.2s ease-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          Operation note
        </button>
        <div style={{ borderTop: '1px solid silver', margin: '0.5rem 0' }} />
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
            transition: 'background-color 0.2s ease-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
};
