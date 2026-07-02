import type { CntStore } from './cntStore';
import { styles } from './fbcntPageComponents';

export function PatientChooser({ store }: { store: CntStore }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.panelTitle}>Patients in simulated index</h2>
      <p>Open a patient from Patient search or Patient registry.</p>
      <div style={styles.grid}>
        {store.patients.map((patient) => (
          <div key={patient.uuid} style={styles.miniCard}>
            <strong>{patient.name}</strong>
            <div>NHS {patient.nhsNumber}</div>
            <div>Hospital {patient.hospitalNumber}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
