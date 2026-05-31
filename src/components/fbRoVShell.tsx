import * as React from 'react';
import { fbAddressograph as Addressograph } from './fbAddressograph';
import { fbButton as FbButton } from './fbButton';
import { fbDraftBadge as DraftBadge } from './fbDraftBadge';

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
}

interface fbRoVFooterProps {
  username: string;
  reachedByRoVButton?: boolean;
  onSwitchToEV: () => void;
  onBack: () => void;
}

export const fbRoVHeader: React.FC<fbRoVHeaderProps> = ({
  title,
  patient,
  formStatus,
}) => (
  <div className="fb-rov-header">
    <div className="flex justify-between items-center">
      <div>
        {formStatus === 'draft' && (
          <>
            <DraftBadge />
            <br />
          </>
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
}) => (
  <div className="fb-rov-footer">
    <div className="fb-rov-footer-row">
      {reachedByRoVButton && (
        <FbButton
          variant="primary"
          onClick={onSwitchToEV}
          style={{ marginRight: '0.4rem' }}
        >
          EV
        </FbButton>
      )}
      <div className="flex-1"></div>
      <div className="fb-rov-footer-username">
        {username}
      </div>
      {!reachedByRoVButton && (
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
            Back
          </FbButton>
        </>
      )}
    </div>
  </div>
);
