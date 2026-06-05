import * as React from 'react';
import { fbSmallerButton as FbSmallerButton } from './fbSmallerButton';
import { fbViewOldVersion as FbViewOldVersion } from './fbViewOldVersion';
import { fbTableHeaderCell as FbTableHeaderCell } from './fbTable';

export interface fbFormHistoryItem {
  form_version: number;
  document_datetime?: string | null;
  event_datetime?: string | null;
  saved_by?: string | null;
}

interface fbFormHistoryMenuProps {
  history: fbFormHistoryItem[];
  anchorRect: DOMRect | null;
  onViewVersion: (version: number) => void;
  onClose: () => void;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate().toString().padStart(2, '0')}-${monthNames[date.getMonth()]}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const fbFormHistoryMenu: React.FC<fbFormHistoryMenuProps> = ({
  history,
  anchorRect,
  onViewVersion,
  onClose,
}) => {
  const width = Math.min(44 * 16, Math.max(22 * 16, window.innerWidth - 16));
  const left = Math.max(8, Math.min(anchorRect?.left ?? 16, window.innerWidth - width - 8));
  const bottom = anchorRect ? Math.max(8, window.innerHeight - anchorRect.top + 4) : 16;
  const maxHeight = anchorRect ? Math.max(12 * 16, anchorRect.top - 12) : Math.max(12 * 16, window.innerHeight - 32);

  return (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.25)',
      zIndex: 10000,
    }}
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div
      style={{
        position: 'fixed',
        bottom,
        left,
        backgroundColor: 'white',
        border: '0.1rem solid #1b6ec2',
        borderRadius: '0.4rem',
        padding: '0.8rem',
        width,
        maxHeight,
        overflow: 'auto',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <h2 style={{ fontSize: '1.2rem', fontWeight: 500, margin: '0 0 0.6rem 0' }}>History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <FbTableHeaderCell>Date and time</FbTableHeaderCell>
            <FbTableHeaderCell>Saved by</FbTableHeaderCell>
            <FbTableHeaderCell></FbTableHeaderCell>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: '0.6rem 0.3rem', borderBottom: '0.1rem solid #eee', fontStyle: 'italic' }}>
                No saved versions found
              </td>
            </tr>
          ) : (
            history.map((item) => (
              <tr key={item.form_version}>
                <td style={{ padding: '0.3rem', borderBottom: '0.1rem solid #eee' }}>
                  {formatDateTime(item.document_datetime || item.event_datetime)}
                </td>
                <td style={{ padding: '0.3rem', borderBottom: '0.1rem solid #eee' }}>
                  {item.saved_by || ''}
                </td>
                <td style={{ padding: '0.3rem', borderBottom: '0.1rem solid #eee', textAlign: 'right' }}>
                  <FbViewOldVersion onClick={() => onViewVersion(item.form_version)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.8rem' }}>
        <FbSmallerButton onClick={onClose}>Close</FbSmallerButton>
      </div>
    </div>
  </div>
  );
};
