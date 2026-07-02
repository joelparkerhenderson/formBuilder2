import pg from 'pg';
const { Client } = pg;

// Connection string read from the environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  console.log("Please set the DATABASE_URL environment variable or supply a connection string.");
  process.exit(1);
}

const sqlSchema = `
-- Enable trigram similarity extension for clinical fuzzy queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Safely drop views and triggers if re-running
DROP VIEW IF EXISTS forms_index_current CASCADE;

-- 1. Patients demographics table
CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE,
  version INT DEFAULT 1 NOT NULL,
  nhs_number VARCHAR(20),
  surname VARCHAR(100) NOT NULL,
  forenames VARCHAR(100) NOT NULL,
  title VARCHAR(20),
  address_line1 VARCHAR(150),
  address_line2 VARCHAR(150),
  address_line3 VARCHAR(150),
  address_line4 VARCHAR(150),
  hospital_number VARCHAR(50),
  date_of_birth DATE NOT NULL,
  sex VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_number VARCHAR(50);
DROP FUNCTION IF EXISTS search_patients_fuzzy(TEXT);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'crn'
  ) THEN
    UPDATE patients SET hospital_number = crn WHERE hospital_number IS NULL AND crn IS NOT NULL;
    ALTER TABLE patients DROP COLUMN crn;
  END IF;
END $$;

-- SQL search function mirroring the high-performance trigram addressograph search
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
$$ LANGUAGE plpgsql;

-- 2. Audit journal and fast-lookup catalog index of clinical events
CREATE TABLE IF NOT EXISTS forms_index (
  id BIGSERIAL PRIMARY KEY,
  form_uuid UUID NOT NULL,
  form_version INT NOT NULL,
  form_type VARCHAR(50) NOT NULL, -- 'waiting_list_card' | 'operation_note' | 'outpatient_outcome' | 'outpatient_appointment'
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  document_datetime TIMESTAMP WITH TIME ZONE, -- nullable for Events
  form_status VARCHAR(20) NOT NULL, -- 'draft' | 'final' | 'scheduled'
  speciality VARCHAR(100),
  organisation VARCHAR(100),
  hospital VARCHAR(100),
  senior_responsible_clinician VARCHAR(150),
  details TEXT,
  event_or_document VARCHAR(20) DEFAULT 'Document' NOT NULL
);

-- Ensure event_or_document column and nullable document_datetime exist on forms_index if already existed
ALTER TABLE forms_index ADD COLUMN IF NOT EXISTS event_or_document VARCHAR(20) DEFAULT 'Document' NOT NULL;
ALTER TABLE forms_index ALTER COLUMN document_datetime DROP NOT NULL;

-- Safely handle renaming senior_clinician to senior_responsible_clinician if it exists on forms_index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='forms_index' AND column_name='senior_clinician'
  ) THEN
    ALTER TABLE forms_index RENAME COLUMN senior_clinician TO senior_responsible_clinician;
  ELSE
    ALTER TABLE forms_index ADD COLUMN IF NOT EXISTS senior_responsible_clinician VARCHAR(150);
  END IF;
END $$;

-- 3. Live document current-version lookup view
DROP VIEW IF EXISTS forms_index_current CASCADE;
CREATE OR REPLACE VIEW forms_index_current AS
SELECT DISTINCT ON (form_uuid) *
FROM forms_index
ORDER BY form_uuid, form_version DESC;

-- 4. Waiting List form data schema (Normalized with rich clinical playloads inside JSONB)
CREATE TABLE IF NOT EXISTS waiting_list_cards (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  form_data JSONB NOT NULL,
  PRIMARY KEY (uuid, version)
);

-- 5. Operation Note form data schema
CREATE TABLE IF NOT EXISTS operation_notes (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  form_data JSONB NOT NULL,
  organisation VARCHAR(100),
  hospital VARCHAR(100),
  senior_responsible_clinician VARCHAR(150),
  speciality VARCHAR(100),
  PRIMARY KEY (uuid, version)
);

-- Ensure columns exist on operation_notes if the table already existed
ALTER TABLE operation_notes ADD COLUMN IF NOT EXISTS organisation VARCHAR(100);
ALTER TABLE operation_notes ADD COLUMN IF NOT EXISTS hospital VARCHAR(100);
ALTER TABLE operation_notes ADD COLUMN IF NOT EXISTS senior_responsible_clinician VARCHAR(150);
ALTER TABLE operation_notes ADD COLUMN IF NOT EXISTS speciality VARCHAR(100);

-- 6. Outpatient Outcome form data schema
CREATE TABLE IF NOT EXISTS outpatient_outcomes (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  form_data JSONB NOT NULL,
  PRIMARY KEY (uuid, version)
);

-- Ensure appointment_uuid column exists on outpatient_outcomes table
ALTER TABLE outpatient_outcomes ADD COLUMN IF NOT EXISTS appointment_uuid UUID;

-- 7. Outpatient Appointments table
CREATE TABLE IF NOT EXISTS outpatient_appointments (
  uuid UUID NOT NULL,
  version INT DEFAULT 1 NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by VARCHAR(150),
  organisation VARCHAR(150) NOT NULL,
  speciality VARCHAR(150) NOT NULL,
  site VARCHAR(150) NOT NULL,
  senior_clinician VARCHAR(150) NOT NULL,
  clinic_name VARCHAR(150) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(20) NOT NULL,
  outcome_form_uuid UUID,
  PRIMARY KEY (uuid, version)
);

-- Ensure outcome_form_uuid column exists on outpatient_appointments if table already existed
ALTER TABLE outpatient_appointments ADD COLUMN IF NOT EXISTS outcome_form_uuid UUID;
`;

const patientsSeed = [
  {
    uuid: '12345678-1234-1234-1234-123456789012',
    nhs_number: '123 456 7890',
    surname: 'DUCK',
    forenames: 'Donald',
    title: 'Mr',
    address_line1: 'Duck House',
    address_line2: '1 Duck Close',
    address_line3: 'Fantasyland',
    address_line4: 'Disneyworld, FL3 1DC',
    hospital_number: '012345678',
    date_of_birth: '1956-04-12',
    sex: 'Male'
  },
  {
    uuid: '22345678-1234-1234-1234-123456789012',
    nhs_number: '123 456 7890',
    surname: 'SMITH',
    forenames: 'John',
    title: 'Mr',
    address_line1: '10 High Street',
    address_line2: 'Cardiff',
    address_line3: '',
    address_line4: 'CF10 1AB',
    hospital_number: '112233445',
    date_of_birth: '1965-03-15',
    sex: 'Male'
  },
  {
    uuid: '32345678-1234-1234-1234-123456789012',
    nhs_number: '234 567 8901',
    surname: 'JOHNSON',
    forenames: 'Mary',
    title: 'Mrs',
    address_line1: '5 Queen Road',
    address_line2: 'Swansea',
    address_line3: '',
    address_line4: 'SA1 2CD',
    hospital_number: '223344556',
    date_of_birth: '1958-07-22',
    sex: 'Female'
  },
  {
    uuid: '42345678-1234-1234-1234-123456789012',
    nhs_number: '345 678 9012',
    surname: 'WILLIAMS',
    forenames: 'Robert',
    title: 'Mr',
    address_line1: '12 Church Lane',
    address_line2: 'New Newport',
    address_line3: '',
    address_line4: 'NP19 3EF',
    hospital_number: '334455667',
    date_of_birth: '1972-11-08',
    sex: 'Male'
  }
];

async function initializeDatabase() {
  let cleanUrl = connectionString;
  let useSsl = false;
  if (
    connectionString.includes('sslmode') ||
    connectionString.includes('ssl=') ||
    connectionString.includes('supabase') ||
    connectionString.includes('azure') ||
    connectionString.includes('elephantsql') ||
    connectionString.includes('74.220.19.171')
  ) {
    useSsl = true;
    // Strip query params to prevent pg-connection-string from setting strict defaults
    cleanUrl = connectionString.split('?')[0];
  }

  const client = new Client({
    connectionString: cleanUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
  });

  console.log("Connecting securely to PostgreSQL database...");
  await client.connect();
  console.log("Connected! Applying standard medical schema layouts...");

  await client.query(sqlSchema);
  console.log("Clinical tables and dynamic version tracking views active.");

  console.log("Adding default test patient record entries...");
  for (const patient of patientsSeed) {
    const existCheck = await client.query('SELECT uuid FROM patients WHERE uuid = $1', [patient.uuid]);
    if (existCheck.rowCount === 0) {
      await client.query(
        `INSERT INTO patients (uuid, version, nhs_number, surname, forenames, title, address_line1, address_line2, address_line3, address_line4, hospital_number, date_of_birth, sex)
         VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          patient.uuid,
          patient.nhs_number,
          patient.surname,
          patient.forenames,
          patient.title,
          patient.address_line1,
          patient.address_line2,
          patient.address_line3,
          patient.address_line4,
          patient.hospital_number,
          patient.date_of_birth,
          patient.sex
        ]
      );
      console.log(`Successfully seeded patient: ${patient.forenames} ${patient.surname}`);
    } else {
      console.log(`Patient UUID ${patient.uuid} already exists. Skipping.`);
    }
  }

  console.log("Adding default outpatient appointments...");
  const appointmentSeeds = [
    {
      offsetDays: -420,
      time: '09:30',
      organisation: 'Cardiff and Vale University Health Board',
      site: 'University Hospital of Wales',
      speciality: 'Cardiology',
      clinicName: 'Rapid Access Chest Pain Clinic',
      seniorClinician: 'WHO, Doctor, Dr (GMC:999999)'
    },
    {
      offsetDays: -210,
      time: '11:15',
      organisation: 'Cwm Taf Morgannwg University Health Board',
      site: 'Princess of Wales Hospital',
      speciality: 'Urology',
      clinicName: 'Post-operative Urology Review',
      seniorClinician: 'HOUSE, Gregory, Dr (GMC:111111)'
    },
    {
      offsetDays: -45,
      time: '14:00',
      organisation: 'Swansea Bay University Health Board',
      site: 'Morriston Hospital',
      speciality: 'Orthopaedics',
      clinicName: 'Joint Replacement Clinic',
      seniorClinician: 'JEKYLL, Henry, Dr (GMC:222222)'
    },
    {
      offsetDays: 35,
      time: '15:45',
      organisation: 'Aneurin Bevan University Health Board',
      site: 'Royal Gwent Hospital',
      speciality: 'General Surgery',
      clinicName: 'Surgical Assessment Clinic',
      seniorClinician: 'FRANKENSTEIN, Victor, Dr (GMC:555555)'
    }
  ];

  for (let pIdx = 0; pIdx < patientsSeed.length; pIdx++) {
    const pat = patientsSeed[pIdx];
    const patBirthDate = new Date(pat.date_of_birth);

    for (let aIdx = 0; aIdx < appointmentSeeds.length; aIdx++) {
      const details = appointmentSeeds[aIdx];
      const appUuid = `50000000-0000-0000-0000-${String(pIdx).padStart(4, '0')}${String(aIdx).padStart(4, '0')}0000`;
      
      const appDate = new Date('2026-05-28T00:00:00Z');
      appDate.setDate(appDate.getDate() + details.offsetDays);
      
      // Ensure date is after patient birth
      if (appDate < patBirthDate) {
        appDate.setTime(patBirthDate.getTime() + (aIdx + 1) * 24 * 60 * 60 * 1000 * 365);
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${String(appDate.getDate()).padStart(2, '0')}-${monthNames[appDate.getMonth()]}-${appDate.getFullYear()}`;
      
      const appCheck = await client.query('SELECT uuid FROM outpatient_appointments WHERE uuid = $1', [appUuid]);
      if (appCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO outpatient_appointments (uuid, version, patient_uuid, updated_at, updated_by, organisation, speciality, site, senior_clinician, clinic_name, date, time)
           VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            appUuid,
            pat.uuid,
            new Date().toISOString(),
            'system',
            details.organisation,
            details.speciality,
            details.site,
            details.seniorClinician,
            details.clinicName,
            formattedDate,
            details.time
          ]
        );

        const isoDateTime = appDate.toISOString().split('T')[0] + `T${details.time}:00.000Z`;
        // Insert into forms_index
        await client.query(
          `INSERT INTO forms_index (form_uuid, form_version, form_type, patient_uuid, event_datetime, document_datetime, form_status, speciality, organisation, hospital, senior_responsible_clinician, details, event_or_document)
           VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            appUuid,
            'outpatient_appointment',
            pat.uuid,
            isoDateTime,
            null, // document_datetime is empty for events
            'scheduled',
            details.speciality,
            details.organisation,
            details.site,
            details.seniorClinician,
            `Clinic: ${details.clinicName}`,
            'Event'
          ]
        );
        console.log(`Successfully seeded outpatient appointment for ${pat.forenames} on ${formattedDate}`);
      }
    }
  }

  await client.end();
  console.log("PostgreSQL setup completed successfully!");
}

initializeDatabase().catch((err) => {
  console.error("Database setup failed with error:", err);
  process.exit(1);
});
