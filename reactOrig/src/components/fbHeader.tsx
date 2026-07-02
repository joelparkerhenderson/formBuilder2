import React from 'react';
import { fbAddressograph as Addressograph } from './fbAddressograph';
import { fbBadgeDraft as DraftBadge } from './fbBadgeDraft';
import { fbBadgeHighlySensitive as HighlySensitiveBadge } from './fbBadgeHighlySensitive';

interface fbHeaderProps {
  title: string;
  patient: any;
  formStatus: 'draft' | 'final' | string;
  badgeText?: string;
  highlySensitive?: boolean;
  style?: React.CSSProperties;
}

export const fbHeader: React.FC<fbHeaderProps> = ({
  title,
  patient,
  formStatus,
  badgeText = 'Draft',
  highlySensitive = false,
  style,
}) => {
  return (
    <div
      className="fb-header-with-divider"
      style={{
        backgroundColor: 'white',
        borderBottom: '0.2rem solid #1b6ec2',
        padding: '0.4rem 0.8rem',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Title area with document badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', minHeight: formStatus === 'draft' || highlySensitive ? undefined : 0 }}>
            {formStatus === 'draft' && <DraftBadge text={badgeText} />}
            {highlySensitive && <HighlySensitiveBadge />}
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#333',
              margin: 0,
              lineHeight: '2rem',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Dynamic patient address block on the right */}
        {patient && (
          <div className="fb-addressograph-container" style={{ minWidth: '22rem' }}>
            <Addressograph patient={patient} />
          </div>
        )}
      </div>
    </div>
  );
};
