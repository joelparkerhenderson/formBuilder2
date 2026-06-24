import * as React from 'react';
import { fbAddressograph as Addressograph } from './fbAddressograph';
import { fbButton as FbButton } from './fbButton';
import { fbBadgeDraft as DraftBadge } from './fbBadgeDraft';
import { fbBadgeSuperseded as SupersededBadge } from './fbBadgeSuperseded';
import { fbBadgeHighlySensitive as HighlySensitiveBadge } from './fbBadgeHighlySensitive';

interface fbRoVPatient {
  nhs_number: string;
  surname: string;
  forenames: string;
  title: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_line4: string;
  crn: string;
  date_of_birth: string;
  sex: string;
}

interface fbRoVHeaderProps {
  title: string;
  patient: fbRoVPatient | null;
  formStatus: string;
  superseded?: boolean;
  highlySensitive?: boolean;
}

interface fbRoVFooterProps {
  username: string;
  reachedByRoVButton?: boolean;
  onSwitchToEV: () => void;
  onBack: () => void;
  backLabel?: string;
  superseded?: boolean;
  onHistory?: (anchorRect: DOMRect) => void;
}

export const fbRoVHeader: React.FC<fbRoVHeaderProps> = ({
  title,
  patient,
  formStatus,
  superseded,
  highlySensitive,
}) => (
  <div className="fb-rov-header">
    <div className="flex justify-between items-center">
      <div>
        {(superseded || formStatus === 'draft' || highlySensitive) && (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
            {superseded && <SupersededBadge />}
            {formStatus === 'draft' && <DraftBadge />}
            {highlySensitive && <HighlySensitiveBadge />}
          </div>
        )}
        <h1 className="fb-rov-title">{title}</h1>
      </div>
      {patient ? (
        <Addressograph
          nhsNumber={patient.nhs_number}
          surname={patient.surname}
          forenames={patient.forenames}
          title={patient.title}
          addressLine1={patient.address_line1}
          addressLine2={patient.address_line2}
          addressLine3={patient.address_line3}
          addressLine4={patient.address_line4}
          crn={patient.crn}
          dateOfBirth={patient.date_of_birth}
          sex={patient.sex}
        />
      ) : (
        <Addressograph />
      )}
    </div>
  </div>
);

export const fbRoVFooter: React.FC<fbRoVFooterProps> = ({
  username,
  reachedByRoVButton,
  onSwitchToEV,
  onBack,
  backLabel = 'Back',
  superseded,
  onHistory,
}) => {
  const historyButtonRef = React.useRef<HTMLSpanElement>(null);

  return (
  <div className="fb-rov-footer">
    <div className="fb-rov-footer-row" style={{ paddingLeft: '0.2rem' }}>
      {reachedByRoVButton && (
        <FbButton
          variant="primary"
          onClick={onSwitchToEV}
          style={{ marginRight: '0.4rem' }}
        >
          EV
        </FbButton>
      )}
      {onHistory && !superseded && (
        <span ref={historyButtonRef} style={{ display: 'inline-block', marginLeft: reachedByRoVButton ? '0.2rem' : 0 }}>
          <FbButton
            variant="primary"
            onClick={() => {
              if (historyButtonRef.current) {
                onHistory(historyButtonRef.current.getBoundingClientRect());
              }
            }}
          >
            History
          </FbButton>
        </span>
      )}
      <div className="flex-1"></div>
      <div className="fb-rov-footer-username">
        {username}
      </div>
      {superseded ? (
        <FbButton
          variant="primary"
          onClick={onBack}
          style={{ marginLeft: '0.4rem' }}
        >
          {backLabel}
        </FbButton>
      ) : !reachedByRoVButton && (
        <>
          <FbButton
            variant="primary"
            onClick={onSwitchToEV}
            style={{ marginLeft: '0.4rem' }}
          >
            Edit
          </FbButton>
          <FbButton
            variant="primary"
            onClick={onBack}
            style={{ marginLeft: '0.4rem' }}
          >
            {backLabel}
          </FbButton>
        </>
      )}
    </div>
  </div>
  );
};
