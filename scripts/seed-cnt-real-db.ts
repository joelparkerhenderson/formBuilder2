import dotenv from 'dotenv';
import pg from 'pg';
import { createInitialCntStore } from '../src/caseNoteTracker/cntStore';

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

const store = createInitialCntStore();

const schemaSql = `
CREATE TABLE IF NOT EXISTS cnt_users (
  uuid UUID PRIMARY KEY,
  nadex_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  first_names TEXT NOT NULL,
  surname TEXT NOT NULL,
  role TEXT NOT NULL,
  speciality TEXT,
  facility TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_patients (
  uuid UUID PRIMARY KEY,
  nhs_number TEXT NOT NULL,
  hospital_number TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  surname TEXT NOT NULL,
  forenames TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  address_line3 TEXT,
  address_line4 TEXT,
  crn TEXT,
  date_of_birth DATE NOT NULL,
  sex TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_locations (
  uuid UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  health_board TEXT NOT NULL,
  locality TEXT NOT NULL,
  facility TEXT NOT NULL,
  department TEXT NOT NULL,
  extra TEXT,
  accepts_requests BOOLEAN NOT NULL,
  custodian_user_uuids UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS cnt_volumes (
  uuid UUID PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  rfid TEXT NOT NULL UNIQUE,
  patient_uuid UUID NOT NULL REFERENCES cnt_patients(uuid) ON DELETE CASCADE,
  patient_nhs_number TEXT NOT NULL,
  patient_hospital_number TEXT NOT NULL,
  health_board TEXT NOT NULL,
  locality TEXT NOT NULL,
  type TEXT NOT NULL,
  volume_number INTEGER NOT NULL,
  temporary BOOLEAN NOT NULL,
  current_location_uuid UUID REFERENCES cnt_locations(uuid),
  batch_uuid UUID
);

CREATE TABLE IF NOT EXISTS cnt_volume_events (
  uuid UUID PRIMARY KEY,
  volume_uuid UUID NOT NULL REFERENCES cnt_volumes(uuid) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  event_datetime TIMESTAMPTZ NOT NULL,
  from_location_uuid UUID REFERENCES cnt_locations(uuid),
  to_location_uuid UUID REFERENCES cnt_locations(uuid),
  user_uuid UUID REFERENCES cnt_users(uuid),
  note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_batches (
  uuid UUID PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  current_location_uuid UUID REFERENCES cnt_locations(uuid),
  intended_purpose TEXT NOT NULL,
  intended_destination_uuid UUID REFERENCES cnt_locations(uuid)
);

CREATE TABLE IF NOT EXISTS cnt_batch_volumes (
  batch_uuid UUID NOT NULL REFERENCES cnt_batches(uuid) ON DELETE CASCADE,
  volume_uuid UUID NOT NULL REFERENCES cnt_volumes(uuid) ON DELETE CASCADE,
  PRIMARY KEY (batch_uuid, volume_uuid)
);

CREATE TABLE IF NOT EXISTS cnt_tags (
  uuid UUID PRIMARY KEY,
  volume_uuid UUID NOT NULL REFERENCES cnt_volumes(uuid) ON DELETE CASCADE,
  patient_uuid UUID NOT NULL REFERENCES cnt_patients(uuid) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  location_uuid UUID REFERENCES cnt_locations(uuid),
  required_by TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by_user_uuid UUID REFERENCES cnt_users(uuid),
  forget_when_received_by_me BOOLEAN NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_clinics (
  uuid UUID PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  speciality TEXT NOT NULL,
  facility TEXT NOT NULL,
  holding_location_uuid UUID REFERENCES cnt_locations(uuid),
  clinician TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_clinic_instances (
  uuid UUID PRIMARY KEY,
  clinic_uuid UUID NOT NULL REFERENCES cnt_clinics(uuid) ON DELETE CASCADE,
  clinic_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  cancelled BOOLEAN NOT NULL,
  retriever_user_uuids UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS cnt_appointments (
  uuid UUID PRIMARY KEY,
  clinic_instance_uuid UUID NOT NULL REFERENCES cnt_clinic_instances(uuid) ON DELETE CASCADE,
  appointment_time TEXT NOT NULL,
  patient_uuid UUID NOT NULL REFERENCES cnt_patients(uuid) ON DELETE CASCADE,
  cancelled BOOLEAN NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_requests (
  uuid UUID PRIMARY KEY,
  volume_uuid UUID NOT NULL REFERENCES cnt_volumes(uuid) ON DELETE CASCADE,
  patient_uuid UUID NOT NULL REFERENCES cnt_patients(uuid) ON DELETE CASCADE,
  requested_by_user_uuid UUID REFERENCES cnt_users(uuid),
  required_by TIMESTAMPTZ NOT NULL,
  required_for TEXT NOT NULL,
  from_location_uuid UUID REFERENCES cnt_locations(uuid),
  to_location_uuid UUID REFERENCES cnt_locations(uuid),
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_pick_list (
  clinic_instance_uuid UUID NOT NULL REFERENCES cnt_clinic_instances(uuid) ON DELETE CASCADE,
  volume_uuid UUID NOT NULL REFERENCES cnt_volumes(uuid) ON DELETE CASCADE,
  received BOOLEAN NOT NULL,
  PRIMARY KEY (clinic_instance_uuid, volume_uuid)
);

CREATE TABLE IF NOT EXISTS cnt_preferences (
  user_uuid UUID PRIMARY KEY REFERENCES cnt_users(uuid) ON DELETE CASCADE,
  send_location_uuid UUID,
  batch_uuids UUID[] NOT NULL DEFAULT '{}',
  library_uuids UUID[] NOT NULL DEFAULT '{}',
  collapsed_keys TEXT[] NOT NULL DEFAULT '{}',
  health_board TEXT,
  locality TEXT,
  facility TEXT,
  recent_choices JSONB NOT NULL DEFAULT '{}'
);
`;

const resetSql = `
TRUNCATE TABLE
  cnt_pick_list,
  cnt_requests,
  cnt_appointments,
  cnt_clinic_instances,
  cnt_clinics,
  cnt_tags,
  cnt_batch_volumes,
  cnt_batches,
  cnt_volume_events,
  cnt_volumes,
  cnt_locations,
  cnt_patients,
  cnt_preferences,
  cnt_users
RESTART IDENTITY CASCADE;
`;

const invariantSql = `
CREATE UNIQUE INDEX IF NOT EXISTS cnt_appointments_one_patient_per_instance_idx
ON cnt_appointments (clinic_instance_uuid, patient_uuid);
`;

async function main() {
  const client = new Client({
    connectionString,
    ssl: requiresSsl || (!dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'))
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query(resetSql);
    await client.query(invariantSql);

    for (const user of store.users) {
      await client.query(
        `INSERT INTO cnt_users (uuid, nadex_id, title, first_names, surname, role, speciality, facility)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [user.uuid, user.nadexId, user.title, user.firstNames, user.surname, user.role, user.speciality || null, user.facility]
      );
    }

    for (const patient of store.patients) {
      await client.query(
        `INSERT INTO cnt_patients
          (uuid, nhs_number, hospital_number, name, title, surname, forenames, address_line1, address_line2, address_line3, address_line4, crn, date_of_birth, sex)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          patient.uuid,
          patient.nhsNumber,
          patient.hospitalNumber,
          patient.name,
          patient.title,
          patient.surname,
          patient.forenames,
          patient.addressLine1,
          patient.addressLine2,
          patient.addressLine3,
          patient.addressLine4,
          patient.crn,
          patient.dateOfBirth,
          patient.sex,
        ]
      );
      await client.query(
        `INSERT INTO patients
          (uuid, version, nhs_number, surname, forenames, title, address_line1, address_line2, address_line3, address_line4, crn, date_of_birth, sex)
         VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (uuid) DO UPDATE SET
          nhs_number = EXCLUDED.nhs_number,
          surname = EXCLUDED.surname,
          forenames = EXCLUDED.forenames,
          title = EXCLUDED.title,
          address_line1 = EXCLUDED.address_line1,
          address_line2 = EXCLUDED.address_line2,
          address_line3 = EXCLUDED.address_line3,
          address_line4 = EXCLUDED.address_line4,
          crn = EXCLUDED.crn,
          date_of_birth = EXCLUDED.date_of_birth,
          sex = EXCLUDED.sex,
          updated_at = timezone('utc'::text, now())`,
        [
          patient.uuid,
          patient.nhsNumber,
          patient.surname,
          patient.forenames,
          patient.title,
          patient.addressLine1,
          patient.addressLine2,
          patient.addressLine3,
          patient.addressLine4,
          patient.crn,
          patient.dateOfBirth,
          patient.sex,
        ]
      );
    }

    for (const location of store.locations) {
      await client.query(
        `INSERT INTO cnt_locations
          (uuid, code, health_board, locality, facility, department, extra, accepts_requests, custodian_user_uuids)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          location.uuid,
          location.code,
          location.healthBoard,
          location.locality,
          location.facility,
          location.department,
          location.extra,
          location.acceptsRequests,
          location.custodianUserUuids,
        ]
      );
    }

    for (const volume of store.volumes) {
      await client.query(
        `INSERT INTO cnt_volumes
          (uuid, barcode, rfid, patient_uuid, patient_nhs_number, patient_hospital_number, health_board, locality, type, volume_number, temporary, current_location_uuid, batch_uuid)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          volume.uuid,
          volume.barcode,
          volume.rfid,
          volume.patientUuid,
          volume.patientNhsNumber,
          volume.patientHospitalNumber,
          volume.healthBoard,
          volume.locality,
          volume.type,
          volume.volumeNumber,
          volume.temporary,
          volume.currentLocationUuid,
          volume.batchUuid || null,
        ]
      );
      for (const event of volume.events) {
        await client.query(
          `INSERT INTO cnt_volume_events
            (uuid, volume_uuid, kind, event_datetime, from_location_uuid, to_location_uuid, user_uuid, note)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            event.uuid,
            volume.uuid,
            event.kind,
            event.datetime,
            event.fromLocationUuid || null,
            event.toLocationUuid || null,
            event.userUuid,
            event.note,
          ]
        );
      }
    }

    for (const batch of store.batches) {
      await client.query(
        `INSERT INTO cnt_batches (uuid, barcode, current_location_uuid, intended_purpose, intended_destination_uuid)
         VALUES ($1,$2,$3,$4,$5)`,
        [batch.uuid, batch.barcode, batch.currentLocationUuid, batch.intendedPurpose, batch.intendedDestinationUuid]
      );
      for (const volumeUuid of batch.volumeUuids) {
        await client.query(
          `INSERT INTO cnt_batch_volumes (batch_uuid, volume_uuid) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [batch.uuid, volumeUuid]
        );
      }
    }

    for (const tag of store.tags) {
      await client.query(
        `INSERT INTO cnt_tags
          (uuid, volume_uuid, patient_uuid, purpose, location_uuid, required_by, expires_at, created_by_user_uuid, forget_when_received_by_me, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          tag.uuid,
          tag.volumeUuid,
          tag.patientUuid,
          tag.purpose,
          tag.locationUuid,
          tag.requiredBy,
          tag.expiresAt,
          tag.createdByUserUuid,
          tag.forgetWhenReceivedByMe,
          tag.status,
        ]
      );
    }

    for (const clinic of store.clinics) {
      await client.query(
        `INSERT INTO cnt_clinics (uuid, clinic_name, speciality, facility, holding_location_uuid, clinician)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [clinic.uuid, clinic.clinicName, clinic.speciality, clinic.facility, clinic.holdingLocationUuid, clinic.clinician]
      );
    }

    for (const instance of store.clinicInstances) {
      await client.query(
        `INSERT INTO cnt_clinic_instances
          (uuid, clinic_uuid, clinic_date, start_time, end_time, cancelled, retriever_user_uuids)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          instance.uuid,
          instance.clinicUuid,
          instance.date,
          instance.startTime,
          instance.endTime,
          instance.cancelled,
          instance.retrieverUserUuids,
        ]
      );
      for (const appointment of instance.appointments) {
        await client.query(
          `INSERT INTO cnt_appointments
            (uuid, clinic_instance_uuid, appointment_time, patient_uuid, cancelled, notes)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [appointment.uuid, instance.uuid, appointment.time, appointment.patientUuid, appointment.cancelled, appointment.notes]
        );
      }
    }

    for (const request of store.requests) {
      await client.query(
        `INSERT INTO cnt_requests
          (uuid, volume_uuid, patient_uuid, requested_by_user_uuid, required_by, required_for, from_location_uuid, to_location_uuid, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          request.uuid,
          request.volumeUuid,
          request.patientUuid,
          request.requestedByUserUuid,
          request.requiredBy,
          request.requiredFor,
          request.fromLocationUuid,
          request.toLocationUuid,
          request.status,
        ]
      );
    }

    for (const entry of store.cntPickList) {
      await client.query(
        `INSERT INTO cnt_pick_list (clinic_instance_uuid, volume_uuid, received) VALUES ($1,$2,$3)`,
        [entry.clinicInstanceUuid, entry.volumeUuid, entry.received]
      );
    }

    for (const [userUuid, prefs] of Object.entries(store.preferences)) {
      await client.query(
        `INSERT INTO cnt_preferences
          (user_uuid, send_location_uuid, batch_uuids, library_uuids, collapsed_keys, health_board, locality, facility, recent_choices)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          userUuid,
          prefs.sendLocationUuid || null,
          prefs.batchUuids || [],
          prefs.libraryUuids || [],
          prefs.collapsedKeys || [],
          prefs.healthBoard || null,
          prefs.locality || null,
          prefs.facility || null,
          JSON.stringify(prefs.recentChoices || {}),
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded CNT real database tables with ${store.patients.length} patients, ${store.volumes.length} volumes, ${store.locations.length} locations, and ${store.clinicInstances.length} clinic instances.`);
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
