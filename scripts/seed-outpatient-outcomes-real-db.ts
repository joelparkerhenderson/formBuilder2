import crypto from 'crypto';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const requiresSsl = dbUrl.includes('sslmode') || dbUrl.includes('ssl=') || dbUrl.includes('supabase') || dbUrl.includes('azure') || dbUrl.includes('elephantsql') || dbUrl.includes('74.220.19.171');
const connectionString = requiresSsl ? dbUrl.split('?')[0] : dbUrl;

function uuidFor(seed: string) {
  const hex = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0')}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

const users = [
  ['ow000105', 'Mr', 'Owain', 'Williams', 'Clinic coordinator', 'Princess of Wales Hospital'],
  ['em000410', 'Miss', 'Elen', 'Morgan', 'Consultant urologist', 'Princess of Wales Hospital'],
  ['re000411', 'Mr', 'Rhys', 'Evans', 'Consultant cardiologist', 'Royal Glamorgan Hospital'],
  ['ct000412', 'Ms', 'Carys', 'Thomas', 'Consultant general surgeon', 'Prince Charles Hospital'],
  ['demoUser', 'Mr', 'Demo', 'User', 'Prototype user', 'formBuilder2'],
];

const clinics = [
  { hb: 'Cwm Taf Morgannwg', facility: 'Princess of Wales Hospital', speciality: 'Urology', src: 'HURLE, Rhidian A, Mr (GMC:567890)', clinic: 'General urology' },
  { hb: 'Cwm Taf Morgannwg', facility: 'Royal Glamorgan Hospital', speciality: 'Cardiology', src: 'EVANS, Rhys, Mr - Consultant cardiologist - NADEX:re000411', clinic: 'Heart failure follow up' },
  { hb: 'Bae Glas University Health Board', facility: 'Ysbyty Abermawr', speciality: 'General Surgery', src: 'THOMAS, Carys, Ms - Consultant surgeon - NADEX:ct000412', clinic: 'General surgery review' },
  { hb: 'Dyffryn Aur Teaching Health Board', facility: 'Tref Afon Hospital', speciality: 'Respiratory medicine', src: 'MORGAN, Elen, Miss - Consultant - NADEX:em000410', clinic: 'Respiratory follow up' },
];

const surnames = ['Morgan', 'Evans', 'Thomas', 'Williams', 'Davies', 'Roberts', 'Lewis', 'Hughes', 'Jones', 'Griffiths'];
const forenames = ['Alys', 'Rhys', 'Carys', 'Gareth', 'Eleri', 'Dylan', 'Mair', 'Owain', 'Nia', 'Ieuan'];

function patient(index: number) {
  const surname = surnames[index % surnames.length];
  const forename = forenames[(index * 3) % forenames.length];
  return {
    uuid: uuidFor(`oo-patient-${index}`),
    nhs: `666${String(1000000 + index).slice(-7)}`,
    surname,
    forenames: `${forename} ${forenames[(index * 5 + 1) % forenames.length]}`,
    title: index % 2 ? 'Mr' : 'Ms',
    hospitalNumber: `OO${String(index + 1).padStart(5, '0')}`,
    dob: `${1945 + (index % 45)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    sex: index % 2 ? 'Male' : 'Female',
  };
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: requiresSsl || (!dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 8000,
    query_timeout: 8000,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_number VARCHAR(50)`);
    await client.query(`DROP FUNCTION IF EXISTS search_patients_fuzzy(TEXT)`);
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'patients' AND column_name = 'crn'
        ) THEN
          UPDATE patients SET hospital_number = crn WHERE hospital_number IS NULL AND crn IS NOT NULL;
          ALTER TABLE patients DROP COLUMN crn;
        END IF;
      END $$
    `);
    await client.query(`
      CREATE OR REPLACE FUNCTION search_patients_fuzzy(search_term TEXT)
      RETURNS SETOF patients AS $$
      BEGIN
        RETURN QUERY
        SELECT * FROM patients
        ORDER BY similarity(
          coalesce(nhs_number, '') || ', ' ||
          coalesce(surname, '') || ', ' ||
          coalesce(forenames, '') || ', ' ||
          coalesce(title, '') || ', ' ||
          coalesce(address_line1, '') || ', ' ||
          coalesce(address_line2, '') || ', ' ||
          coalesce(address_line3, '') || ', ' ||
          coalesce(address_line4, '') || ', ' ||
          coalesce(hospital_number, '') || ', ' ||
          coalesce(date_of_birth::text, '') || ', ' ||
          coalesce(sex, ''),
          search_term
        ) DESC;
      END;
      $$ LANGUAGE plpgsql
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS treatment_summaries (
        uuid UUID NOT NULL,
        version INT NOT NULL,
        patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
        event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
        form_status VARCHAR(20) NOT NULL,
        highly_sensitive BOOLEAN DEFAULT false NOT NULL,
        form_data JSONB NOT NULL,
        PRIMARY KEY (uuid, version)
      )
    `);
    for (const table of ['waiting_list_cards', 'operation_notes', 'outpatient_outcomes', 'treatment_summaries', 'cardiology_test_requests', 'forms_index']) {
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS highly_sensitive BOOLEAN DEFAULT false NOT NULL`);
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS final_requested_at TIMESTAMP WITH TIME ZONE`);
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS cooling_off_period_minutes INT`);
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS cooling_off_expires_at TIMESTAMP WITH TIME ZONE`);
    }
    await client.query(`ALTER TABLE outpatient_appointments ADD COLUMN IF NOT EXISTS outcome_actioned_date DATE`);
    await client.query(`ALTER TABLE outpatient_appointments ADD COLUMN IF NOT EXISTS outcome_actioned_user_id VARCHAR(100)`);
    await client.query(`CREATE TABLE IF NOT EXISTS user_lookup (nadex_id VARCHAR(100) PRIMARY KEY, title VARCHAR(50), first_names VARCHAR(150), surname VARCHAR(150), role VARCHAR(150), facility VARCHAR(200), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now())`);

    for (const user of users) {
      await client.query(
        `INSERT INTO user_lookup (nadex_id, title, first_names, surname, role, facility)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (nadex_id) DO UPDATE SET title=EXCLUDED.title, first_names=EXCLUDED.first_names, surname=EXCLUDED.surname, role=EXCLUDED.role, facility=EXCLUDED.facility, updated_at=now()`,
        user,
      );
    }

    for (let index = 0; index < 80; index += 1) {
      const p = patient(index);
      await client.query(
        `INSERT INTO patients (uuid, version, nhs_number, surname, forenames, title, hospital_number, date_of_birth, sex)
         VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (uuid) DO UPDATE SET nhs_number=EXCLUDED.nhs_number, surname=EXCLUDED.surname, forenames=EXCLUDED.forenames, title=EXCLUDED.title, hospital_number=EXCLUDED.hospital_number, date_of_birth=EXCLUDED.date_of_birth, sex=EXCLUDED.sex, updated_at=now()`,
        [p.uuid, p.nhs, p.surname, p.forenames, p.title, p.hospitalNumber, p.dob, p.sex],
      );
    }

    for (let index = 0; index < 120; index += 1) {
      const p = patient(index % 80);
      const clinic = clinics[index % clinics.length];
      const appointmentUuid = uuidFor(`oo-appointment-${index}`);
      const outcomeUuid = uuidFor(`oo-outcome-${index}`);
      const appointmentDate = addDays(new Date(Date.UTC(2026, 5, 1)), -(index % 40));
      const appointmentTime = `${String(8 + (index % 8)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`;
      const actioned = index % 3 === 0;
      const actionedUser = users[index % users.length][0];
      const formData = {
        uuid: outcomeUuid,
        organisation: clinic.hb,
        speciality: clinic.speciality,
        site: clinic.facility,
        seniorClinician: clinic.src,
        clinicName: clinic.clinic,
        date: isoDate(appointmentDate),
        time: appointmentTime,
        attendedOption: 'attended',
        usc: index % 5 === 0 ? 'yes' : 'no',
        workingDiagnosis: 'Fictitious outpatient review diagnosis',
        discharged: index % 4 === 0,
        fuOPA: index % 4 !== 0,
        interval: '6 months',
        finalChecked: true,
        generatedFrom: 'scripts/seed-outpatient-outcomes-real-db.ts',
      };

      await client.query(`DELETE FROM forms_index WHERE form_uuid = $1::uuid`, [outcomeUuid]);
      await client.query(`DELETE FROM outpatient_outcomes WHERE uuid = $1::uuid`, [outcomeUuid]);
      await client.query(`DELETE FROM outpatient_appointments WHERE uuid = $1::uuid`, [appointmentUuid]);

      await client.query(
        `INSERT INTO outpatient_appointments (uuid, version, patient_uuid, updated_by, organisation, site, speciality, senior_clinician, clinic_name, date, time, outcome_form_uuid, outcome_actioned_date, outcome_actioned_user_id)
         VALUES ($1::uuid,1,$2::uuid,'seed-outpatient-outcomes',$3,$4,$5,$6,$7,$8,$9,$10::uuid,$11::date,$12)`,
        [appointmentUuid, p.uuid, clinic.hb, clinic.facility, clinic.speciality, clinic.src, clinic.clinic, isoDate(appointmentDate), appointmentTime, outcomeUuid, actioned ? isoDate(addDays(appointmentDate, 1)) : null, actioned ? actionedUser : null],
      );
      await client.query(
        `INSERT INTO outpatient_outcomes (uuid, version, patient_uuid, event_datetime, form_status, highly_sensitive, form_data, appointment_uuid)
         VALUES ($1::uuid,1,$2::uuid,$3::timestamptz,'final',false,$4::jsonb,$5::uuid)`,
        [outcomeUuid, p.uuid, `${isoDate(appointmentDate)}T${appointmentTime}:00Z`, JSON.stringify(formData), appointmentUuid],
      );
      await client.query(
        `INSERT INTO forms_index (form_uuid, form_version, form_type, patient_uuid, event_datetime, document_datetime, form_status, highly_sensitive, speciality, organisation, hospital, senior_responsible_clinician, event_or_document, details)
         VALUES ($1::uuid,1,'outpatient_outcome',$2::uuid,$3::timestamptz,now(),'final',false,$4,$5,$6,$7,'Document','fictitious outpatient outcome seed')`,
        [outcomeUuid, p.uuid, `${isoDate(appointmentDate)}T${appointmentTime}:00Z`, clinic.speciality, clinic.hb, clinic.facility, clinic.src],
      );
    }

    await client.query('COMMIT');
    console.log('Seeded 120 fictitious outpatient outcomes.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
