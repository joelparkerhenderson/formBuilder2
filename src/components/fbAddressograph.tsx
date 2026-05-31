import React from 'react';

interface AddressographProps {
  nhsNumber?: string;
  surname?: string;
  forenames?: string;
  title?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  crn?: string;
  dateOfBirth?: string | Date;
  sex?: string;
}

export const fbAddressograph: React.FC<AddressographProps> = ({
  nhsNumber = '123 456 7890',
  surname = 'DUCK',
  forenames = 'Donald',
  title = 'Mr',
  addressLine1 = 'Duck House',
  addressLine2 = '1 Duck Close',
  addressLine3 = 'Fantasyland',
  addressLine4 = 'Disneyworld, FL3 1DC',
  crn = '012345678',
  dateOfBirth = new Date(1956, 3, 12),
  sex = 'Male'
}) => {
  // Convert dateOfBirth to Date object if it's a string
  const dobDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

  // Calculate age
  const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Format date as dd-Mmm-yyyy
  const formatDate = (date: Date): string => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const age = calculateAge(dobDate);
  const formattedDOB = formatDate(dobDate);

  return (
    <div className="fb-addressograph-card" style={{
      padding: '0.4rem',
      border: '0.1rem solid silver',
      borderRadius: '0.4rem',
      backgroundColor: 'white',
      fontFamily: 'Arial',
      fontSize: '11pt',
      width: '90mm'
    }}>
      <div style={{display: 'grid', gridTemplateColumns: 'auto auto', gap: '0.2rem 1rem'}}>
        {/* Left column */}
        <div style={{textAlign: 'left'}}>
          <div
            className="fb-addressograph-field"
            data-tooltip="NHS Number"
            title="NHS Number"
            style={{fontWeight: 'bold', transition: 'background-color 0.5s ease-out', padding: '0.1rem'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffcc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {nhsNumber}
          </div>
          <div
            className="fb-addressograph-field"
            data-tooltip="Surname, First names (Title)"
            style={{transition: 'background-color 0.5s ease-out', padding: '0.1rem'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffcc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{fontWeight: 'bold'}} title="Surname">{surname}</span>, <span title="First name(s)">{forenames}</span> <span title="Title">({title})</span>
          </div>
          <div
            className="fb-addressograph-field"
            data-tooltip="Address"
            title="Address"
            style={{transition: 'background-color 0.5s ease-out', padding: '0.1rem'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffcc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div title="Address">{addressLine1}</div>
            <div title="Address">{addressLine2}</div>
            <div title="Address">{addressLine3}</div>
            <div title="Address">{addressLine4}</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{textAlign: 'right'}}>
          <div
            className="fb-addressograph-field"
            data-tooltip="CRN"
            title="CRN"
            style={{transition: 'background-color 0.5s ease-out', padding: '0.1rem'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffcc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            CRN {crn}
          </div>
          <div
            className="fb-addressograph-field"
            data-tooltip="Date of Birth"
            style={{transition: 'background-color 0.5s ease-out', padding: '0.1rem'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffcc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span title="Date of birth">{formattedDOB}</span> <span title="Age">({age}y)</span>
          </div>
          <div
            className="fb-addressograph-field"
            data-tooltip="Sex"
            title="Sex"
            style={{transition: 'background-color 0.5s ease-out', padding: '0.1rem'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffcc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {sex}
          </div>
        </div>
      </div>
    </div>
  );
};
