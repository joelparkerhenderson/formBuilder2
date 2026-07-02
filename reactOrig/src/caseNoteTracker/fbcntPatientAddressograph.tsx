import { fbAddressograph as FbAddressograph } from '../components/fbAddressograph';
import type { CntPatient } from './cntStore';
import { styles } from './fbcntPageComponents';

export function PatientAddressograph({ patient }: { patient: CntPatient }) {
  return (
    <div style={styles.cntAddressographWrap}>
      <FbAddressograph
        nhsNumber={patient.nhsNumber}
        surname={patient.surname}
        forenames={patient.forenames}
        title={patient.title}
        addressLine1={patient.addressLine1}
        addressLine2={patient.addressLine2}
        addressLine3={patient.addressLine3}
        addressLine4={patient.addressLine4}
        hospitalNumber={patient.hospitalNumber}
        dateOfBirth={patient.dateOfBirth}
        sex={patient.sex}
      />
    </div>
  );
}
