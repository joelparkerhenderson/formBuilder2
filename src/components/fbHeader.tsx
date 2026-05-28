import React from 'react';
import { fbAddressograph as Addressograph } from './fbAddressograph';
import { fbDraftBadge as DraftBadge } from './fbDraftBadge';

interface fbHeaderProps {
  title: string;
  patient: any;
  formStatus: 'draft' | 'final' | string;
  badgeText?: string;
  style?: React.CSSProperties;
}

export const fbHeader: React.FC<fbHeaderProps> = ({
  title,
  patient,
  formStatus,
  badgeText = 'Draft',
  style,
}) => {
  return (
    <div
      className="form-header-with-divider"
      style={{
        backgroundColor: '#f8f9fa',
        borderBottom: '0.2rem solid #1b6ec2',
        padding: '0.4rem 0.8rem',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Title area with draft badge */}
        <div className="flex items-center gap-3">
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#333',
              margin: 0,
              lineHeight: '2.2rem',
            }}
          >
            {title}
          </h1>
          {formStatus === 'draft' && <DraftBadge text={badgeText} />}
        </div>

        {/* Dynamic patient address block on the right */}
        {patient && (
          <div className="addressograph-container" style={{ minWidth: '22rem' }}>
            <Addressograph patient={patient} />
          </div>
        )}
      </div>
    </div>
  );
};
