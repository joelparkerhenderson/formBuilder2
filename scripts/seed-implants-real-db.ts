import crypto from 'crypto';
import dotenv from 'dotenv';
import pg from 'pg';
import { facilities, healthBoards } from '../src/data/clinicalDestinations';
import { specialityLabels } from '../src/data/formLabels';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const requiresSsl =
  dbUrl.includes('sslmode')
  || dbUrl.includes('ssl=')
  || dbUrl.includes('supabase')
  || dbUrl.includes('azure')
  || dbUrl.includes('elephantsql')
  || dbUrl.includes('74.220.19.171');
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

function firstOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

const surnames = ['Morgan', 'Evans', 'Thomas', 'Williams', 'Davies', 'Roberts', 'Lewis', 'Hughes', 'Jones', 'Griffiths'];
const forenames = ['Alys', 'Rhys', 'Carys', 'Gareth', 'Eleri', 'Dylan', 'Mair', 'Owain', 'Nia', 'Ieuan'];
const surgeons = [
  { text: 'MORGAN, Elen, Miss - Consultant surgeon - NADEX:em000410', nadex: 'em000410' },
  { text: 'EVANS, Rhys, Mr - Consultant orthopaedic surgeon - NADEX:re000411', nadex: 're000411' },
  { text: 'THOMAS, Carys, Ms - Consultant vascular surgeon - NADEX:ct000412', nadex: 'ct000412' },
  { text: 'ROBERTS, Geraint, Mr - Consultant general surgeon - NADEX:gr000413', nadex: 'gr000413' },
  { text: 'LEWIS, Manon, Miss - Consultant breast surgeon - NADEX:ml000414', nadex: 'ml000414' },
  { text: 'HUGHES, Dafydd, Mr - Consultant urologist - NADEX:dh000415', nadex: 'dh000415' },
];
const implantTypes = [
  ['ORTH-PLATE', 'Locking compression plate and cortical screws'],
  ['ORTH-SCREW', 'Cannulated cancellous screw set'],
  ['ORTH-PIN', 'Kirschner wire fixation set'],
  ['GEN-MESH', 'Lightweight polypropylene mesh'],
  ['VASC-STENT', 'Self-expanding vascular stent'],
  ['UROL-STENT', 'Temporary ureteric stent'],
  ['BREAST-EXP', 'Temporary breast tissue expander'],
  ['ENT-GROM', 'Ventilation tube grommet'],
  ['CARD-LOOP', 'Implantable loop recorder'],
  ['CONTRA-IMP', 'Subdermal contraceptive implant'],
];
const specialties = Object.keys(specialityLabels).filter((key) => [
  'general-surgery',
  'orthopaedics',
  'trauma-and-orthopaedics',
  'vascular',
  'urology',
  'breast',
  'cardiology',
  'ent',
].includes(key));

function patientRow(index: number) {
  const surname = surnames[index % surnames.length];
  const forename = forenames[(index * 3) % forenames.length];
  const year = 1945 + (index % 45);
  return {
    uuid: uuidFor(`implant-review-patient-${index}`),
    nhsNumber: `555${String(1000000 + index).slice(-7)}`,
    surname,
    forenames: `${forename} ${forenames[(index * 5 + 1) % forenames.length]}`,
    title: index % 3 === 0 ? 'Ms' : index % 3 === 1 ? 'Mr' : 'Mx',
    hospitalNumber: `IMP${String(index + 1).padStart(5, '0')}`,
    dateOfBirth: `${year}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    sex: index % 2 === 0 ? 'Female' : 'Male',
  };
}

function implantRow(index: number) {
  const patient = patientRow(index % 80);
  const facility = facilities[index % facilities.length];
  const healthBoard = healthBoards.find((item) => item.value === facility.healthBoard) || healthBoards[0];
  const speciality = facility.specialities.find((item) => specialties.includes(item)) || specialties[index % specialties.length];
  const surgeon = surgeons[index % surgeons.length];
  const implantType = implantTypes[index % implantTypes.length];
  const inserted = addDays(new Date(Date.UTC(2023, 0, 1)), index * 5);
  const requiresRemoval = index % 5 !== 0;
  const alreadyRemoved = requiresRemoval && index % 4 === 0;
  const removeByBase = addDays(inserted, 45 + ((index % 18) * 30));
  const partialMode = index % 6;
  const removeByDate = requiresRemoval
    ? partialMode === 0
      ? `${removeByBase.getUTCFullYear()}-01-01`
      : partialMode === 1
        ? isoDate(firstOfMonth(removeByBase))
        : isoDate(removeByBase)
    : null;
  const removeByDisplay = requiresRemoval
    ? partialMode === 0
      ? String(removeByBase.getUTCFullYear())
      : partialMode === 1
        ? removeByBase.toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace(' ', '-')
        : isoDate(removeByBase)
    : null;
  return {
    operationNoteUuid: uuidFor(`implant-review-operation-note-${Math.floor(index / 2)}`),
    operationNoteVersion: 1,
    implantRowUuid: uuidFor(`implant-review-operation-note-${Math.floor(index / 2)}-row-${index % 2}`),
    healthBoard: healthBoard.value,
    healthBoardText: healthBoard.label,
    facilityCode: facility.value,
    facilityText: facility.label,
    surgeonText: surgeon.text,
    surgeonNadex: surgeon.nadex,
    speciality,
    patientUuid: patient.uuid,
    dateInserted: isoDate(inserted),
    implantId: `${implantType[0]}-${String(9000 + index)}`,
    implantDescription: implantType[1],
    removeByDate,
    removeByDisplay,
    dateRemoved: alreadyRemoved ? isoDate(addDays(removeByBase, 7 + (index % 21))) : null,
    sourceFormData: {
      fictitiousDataSet: 'implant-review',
      implantIndex: index,
      generatedFrom: 'scripts/seed-implants-real-db.ts',
    },
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
      CREATE TABLE IF NOT EXISTS implants (
        id BIGSERIAL PRIMARY KEY,
        operation_note_uuid UUID NOT NULL,
        operation_note_version INT NOT NULL,
        operation_note_implant_row_uuid UUID NOT NULL,
        health_board VARCHAR(100),
        health_board_text VARCHAR(200),
        facility_code VARCHAR(100),
        facility_text VARCHAR(200),
        surgeon_src_text VARCHAR(200),
        surgeon_src_nadex_id VARCHAR(100),
        speciality VARCHAR(100),
        patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
        date_inserted DATE,
        implant_id VARCHAR(200),
        implant_description TEXT,
        remove_by_date DATE,
        remove_by_display VARCHAR(100),
        date_removed DATE,
        superseded BOOLEAN NOT NULL DEFAULT false,
        source_form_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        UNIQUE (operation_note_uuid, operation_note_implant_row_uuid)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS implants_patient_uuid_idx ON implants (patient_uuid)`);
    await client.query(`CREATE INDEX IF NOT EXISTS implants_remove_by_date_idx ON implants (remove_by_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS implants_filters_idx ON implants (health_board, speciality, surgeon_src_nadex_id)`);

    for (let index = 0; index < 80; index += 1) {
      const patient = patientRow(index);
      await client.query(
        `INSERT INTO patients (
           uuid, nhs_number, surname, forenames, title, hospital_number, date_of_birth, sex
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (uuid) DO UPDATE
            SET nhs_number = EXCLUDED.nhs_number,
                surname = EXCLUDED.surname,
                forenames = EXCLUDED.forenames,
                title = EXCLUDED.title,
                hospital_number = EXCLUDED.hospital_number,
                date_of_birth = EXCLUDED.date_of_birth,
                sex = EXCLUDED.sex,
                updated_at = now()`,
        [patient.uuid, patient.nhsNumber, patient.surname, patient.forenames, patient.title, patient.hospitalNumber, patient.dateOfBirth, patient.sex],
      );
    }

    for (let index = 0; index < 200; index += 1) {
      const row = implantRow(index);
      await client.query(
        `INSERT INTO implants (
           operation_note_uuid, operation_note_version, operation_note_implant_row_uuid,
           health_board, health_board_text, facility_code, facility_text,
           surgeon_src_text, surgeon_src_nadex_id, speciality, patient_uuid, date_inserted,
           implant_id, implant_description, remove_by_date, remove_by_display, date_removed,
           superseded, source_form_data
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, false, $18::jsonb)
         ON CONFLICT (operation_note_uuid, operation_note_implant_row_uuid) DO UPDATE
            SET operation_note_version = EXCLUDED.operation_note_version,
                health_board = EXCLUDED.health_board,
                health_board_text = EXCLUDED.health_board_text,
                facility_code = EXCLUDED.facility_code,
                facility_text = EXCLUDED.facility_text,
                surgeon_src_text = EXCLUDED.surgeon_src_text,
                surgeon_src_nadex_id = EXCLUDED.surgeon_src_nadex_id,
                speciality = EXCLUDED.speciality,
                patient_uuid = EXCLUDED.patient_uuid,
                date_inserted = EXCLUDED.date_inserted,
                implant_id = EXCLUDED.implant_id,
                implant_description = EXCLUDED.implant_description,
                remove_by_date = EXCLUDED.remove_by_date,
                remove_by_display = EXCLUDED.remove_by_display,
                date_removed = EXCLUDED.date_removed,
                superseded = false,
                source_form_data = EXCLUDED.source_form_data,
                updated_at = now()`,
        [
          row.operationNoteUuid,
          row.operationNoteVersion,
          row.implantRowUuid,
          row.healthBoard,
          row.healthBoardText,
          row.facilityCode,
          row.facilityText,
          row.surgeonText,
          row.surgeonNadex,
          row.speciality,
          row.patientUuid,
          row.dateInserted,
          row.implantId,
          row.implantDescription,
          row.removeByDate,
          row.removeByDisplay,
          row.dateRemoved,
          JSON.stringify(row.sourceFormData),
        ],
      );
    }
    await client.query('COMMIT');
    console.log('Seeded 200 fictitious implant registry rows and 80 fictitious patients.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
