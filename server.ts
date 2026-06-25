import dotenv from "dotenv";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = Number(process.env.PORT || 3000);
const useMockDb = process.env.FORMBUILDER2_MOCK_DB === "true";
const mockDbPath = path.resolve(process.env.FORMBUILDER2_MOCK_DB_PATH || "D:/formBuilder2MockDB/formbuilder2-mock-db.json");
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = new Set(["draft", "final", "scheduled"]);
const eventKinds = new Set(["Document", "Event"]);

const formTables: Record<string, string> = {
  waiting_list_card: "waiting_list_cards",
  waiting_list_cards: "waiting_list_cards",
  operation_note: "operation_notes",
  operation_notes: "operation_notes",
  outpatient_outcome: "outpatient_outcomes",
  outpatient_outcomes: "outpatient_outcomes",
  treatment_summary: "treatment_summaries",
  treatment_summaries: "treatment_summaries",
  cardiology_test_request: "cardiology_test_requests",
  cardiology_test_requests: "cardiology_test_requests",
};

const canonicalFormTypes: Record<string, string> = {
  waiting_list_cards: "waiting_list_card",
  operation_notes: "operation_note",
  outpatient_outcomes: "outpatient_outcome",
  treatment_summaries: "treatment_summary",
  cardiology_test_requests: "cardiology_test_request",
};

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl && !useMockDb) {
  console.error("[Backend] DATABASE_URL is missing. Add it to .env.local or the process environment.");
}

const requiresSsl =
  !!dbUrl &&
  (dbUrl.includes("sslmode") ||
    dbUrl.includes("ssl=") ||
    dbUrl.includes("supabase") ||
    dbUrl.includes("azure") ||
    dbUrl.includes("elephantsql") ||
    dbUrl.includes("74.220.19.171"));
const connectionString = requiresSsl ? dbUrl?.split("?")[0] : dbUrl;

const pool = new pg.Pool({
  connectionString,
  ssl: requiresSsl || (dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1"))
    ? { rejectUnauthorized: false }
    : undefined,
  connectionTimeoutMillis: 8000,
  query_timeout: 8000,
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes("*") || allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: "2mb" }));

app.use((req, _res, next) => {
  if (req.url === "/formBuilder2/api") {
    req.url = "/api";
  } else if (req.url.startsWith("/formBuilder2/api/")) {
    req.url = req.url.replace(/^\/formBuilder2\/api/, "/api");
  }
  next();
});

app.post("/api/dev/restart", (req, res) => {
  if (process.env.FORMBUILDER2_ALLOW_RESTART !== "true") {
    res.status(403).json({ error: "Server restart endpoint is disabled" });
    return;
  }
  const exitCode = Number(process.env.FORMBUILDER2_RESTART_EXIT_CODE || 42);
  console.log(`[formBuilder2] restart requested from ${req.ip}; exiting with code ${exitCode}`);
  res.status(202).json({ success: true, restarting: true, exitCode });
  setTimeout(() => process.exit(exitCode), 100);
});

type MockDesignerUser = {
  user_uuid: string;
  user_email: string;
  password_plain?: string;
  salt: string;
  password_hash: string;
  email_verified: string | null;
  prefs?: Record<string, unknown>;
};

type MockSession = {
  token: string;
  user_uuid: string;
  expires_at: string;
  remember: boolean;
};

type MockDb = {
  designAuth: MockDesignerUser[];
  designData: Array<{
    user_uuid: string;
    designed_form_uuid: string;
    random_hex: string;
    datetime_saved: string;
    json_spec: any;
  }>;
  emailVerificationsInProgress: Array<{
    user_email: string;
    verification_code: string;
    datetime_code_sent: string;
  }>;
  designSessions: MockSession[];
  clinicalForms: Record<string, any[]>;
  formsIndex: any[];
  appointments: any[];
  patients: any[];
};

function normalizeEmail(value: unknown) {
  return requiredText(value, "email", 320).toLowerCase();
}

function emptyMockDb(): MockDb {
  const patientUuid = "fd55880a-7ada-47a8-adbb-65850af6f7e2";
  return {
    designAuth: [],
    designData: [],
    emailVerificationsInProgress: [],
    designSessions: [],
    clinicalForms: {
      waiting_list_cards: [],
      operation_notes: [],
      outpatient_outcomes: [],
      treatment_summaries: [],
      cardiology_test_requests: [],
    },
    formsIndex: [],
    appointments: [],
    patients: [{
      id: 1,
      uuid: patientUuid,
      version: 1,
      nhs_number: "0000000000",
      surname: "Duck",
      forenames: "Donald",
      title: "Mr",
      crn: "D000001",
      date_of_birth: "1934-06-09",
      sex: "Male",
      updated_at: new Date().toISOString(),
    }],
  };
}

function readMockDb(): MockDb {
  if (!fs.existsSync(mockDbPath)) return emptyMockDb();
  const parsed = JSON.parse(fs.readFileSync(mockDbPath, "utf8"));
  return {
    ...emptyMockDb(),
    ...parsed,
    clinicalForms: { ...emptyMockDb().clinicalForms, ...(parsed.clinicalForms || {}) },
  };
}

function writeMockDb(db: MockDb) {
  fs.mkdirSync(path.dirname(mockDbPath), { recursive: true });
  fs.writeFileSync(mockDbPath, JSON.stringify(db, null, 2));
}

function publicMockUser(user: MockDesignerUser) {
  return { success: true, prefs: user.prefs || {} };
}

const transientDesignerSessionMs = 10 * 60 * 1000;
const rememberedDesignerSessionMs = 10 * 365 * 24 * 60 * 60 * 1000;

function createMockSession(db: MockDb, userUuid: string, remember: boolean) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (remember ? rememberedDesignerSessionMs : transientDesignerSessionMs)).toISOString();
  db.designSessions = db.designSessions.filter((session) => new Date(session.expires_at).getTime() > Date.now());
  db.designSessions.push({ token, user_uuid: userUuid, expires_at: expiresAt, remember });
  return { token, expiresAt };
}

function mockPasswordMatches(user: MockDesignerUser, password: string) {
  if (typeof user.password_plain === "string") return user.password_plain === password;
  return passwordHash(password, user.salt) === user.password_hash;
}

function getMockSessionUser(db: MockDb, token: unknown) {
  if (typeof token !== "string" || !token.trim()) return null;
  const session = db.designSessions.find((candidate) => candidate.token === token);
  if (!session || new Date(session.expires_at).getTime() <= Date.now()) return null;
  session.expires_at = new Date(Date.now() + (session.remember ? rememberedDesignerSessionMs : transientDesignerSessionMs)).toISOString();
  return db.designAuth.find((user) => user.user_uuid === session.user_uuid) || null;
}

function authenticateMockDesignRequest(db: MockDb, body: any) {
  const sessionUser = getMockSessionUser(db, body?.sessionToken);
  if (sessionUser) return sessionUser;
  const email = normalizeEmail(body?.email);
  const password = requiredText(body?.password, "password", 200);
  const user = db.designAuth.find((row) => row.user_email === email);
  if (!user || !mockPasswordMatches(user, password) || !user.email_verified) return null;
  return user;
}

function registerMockRoutes() {
  app.get("/api/health/db", (_req, res) => {
    res.json({ ok: true, mock: true });
  });

  app.post(["/api/composer-auth/register-start", "/api/controller-auth/register-start", "/api/designer-auth/register-start"], (req, res) => {
    const db = readMockDb();
    const email = normalizeEmail(req.body?.email);
    const password = requiredText(req.body?.password, "password", 200);
    validateDesignerCredentials(email, password);
    const code = "123456";
    db.emailVerificationsInProgress = db.emailVerificationsInProgress.filter((row) => row.user_email !== email);
    db.emailVerificationsInProgress.push({ user_email: email, verification_code: code, datetime_code_sent: new Date().toISOString() });
    writeMockDb(db);
    res.json({ success: true, mock: true, code });
  });

  app.post(["/api/composer-auth/register-resend", "/api/controller-auth/register-resend", "/api/designer-auth/register-resend"], (req, res) => {
    const db = readMockDb();
    const email = normalizeEmail(req.body?.email);
    const password = requiredText(req.body?.password, "password", 200);
    validateDesignerCredentials(email, password);
    db.emailVerificationsInProgress = db.emailVerificationsInProgress.filter((row) => row.user_email !== email);
    db.emailVerificationsInProgress.push({ user_email: email, verification_code: "123456", datetime_code_sent: new Date().toISOString() });
    writeMockDb(db);
    res.json({ success: true, mock: true, code: "123456" });
  });

  app.post(["/api/composer-auth/register-verify", "/api/controller-auth/register-verify", "/api/designer-auth/register-verify"], (req, res) => {
    const db = readMockDb();
    const email = normalizeEmail(req.body?.email);
    const password = requiredText(req.body?.password, "password", 200);
    const code = requiredText(req.body?.code, "code", 6);
    validateDesignerCredentials(email, password);
    const verification = db.emailVerificationsInProgress.find((row) => row.user_email === email);
    if (!verification || verification.verification_code !== code) {
      res.status(400).json({ error: "The verification code is incorrect", code: "incorrect" });
      return;
    }
    const salt = crypto.randomBytes(16).toString("base64");
    const existing = db.designAuth.find((user) => user.user_email === email);
    if (existing) {
      existing.salt = salt;
      existing.password_plain = password;
      existing.password_hash = passwordHash(password, salt);
      existing.email_verified = new Date().toISOString();
    } else {
      db.designAuth.push({
        user_uuid: crypto.randomUUID(),
        user_email: email,
        password_plain: password,
        salt,
        password_hash: passwordHash(password, salt),
        email_verified: new Date().toISOString(),
        prefs: {},
      });
    }
    db.emailVerificationsInProgress = db.emailVerificationsInProgress.filter((row) => row.user_email !== email);
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });

  app.post(["/api/composer-auth/login", "/api/controller-auth/login", "/api/designer-auth/login"], (req, res) => {
    const db = readMockDb();
    const email = normalizeEmail(req.body?.email);
    const password = requiredText(req.body?.password, "password", 200);
    const remember = Boolean(req.body?.remember);
    const user = db.designAuth.find((row) => row.user_email === email);
    if (!user || !mockPasswordMatches(user, password) || !user.email_verified) {
      res.status(401).json({ error: "Invalid controller credentials" });
      return;
    }
    const session = createMockSession(db, user.user_uuid, remember);
    writeMockDb(db);
    res.json({ ...publicMockUser(user), mock: true, sessionToken: session.token, expiresAt: session.expiresAt });
  });

  app.post(["/api/composer-auth/session", "/api/controller-auth/session", "/api/designer-auth/session"], (req, res) => {
    const db = readMockDb();
    const token = req.body?.sessionToken;
    const user = getMockSessionUser(db, token);
    if (!user) {
      writeMockDb(db);
      res.status(401).json({ error: "Session expired" });
      return;
    }
    const session = db.designSessions.find((candidate) => candidate.token === token);
    writeMockDb(db);
    res.json({ ...publicMockUser(user), mock: true, email: user.user_email, expiresAt: session?.expires_at });
  });

  app.post(["/api/composer-auth/logout", "/api/controller-auth/logout", "/api/designer-auth/logout"], (req, res) => {
    const db = readMockDb();
    const token = req.body?.sessionToken;
    db.designSessions = db.designSessions.filter((candidate) => candidate.token !== token);
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });

  app.post(["/api/composer-auth/prefs", "/api/controller-auth/prefs", "/api/designer-auth/prefs"], (req, res) => {
    const db = readMockDb();
    const user = getMockSessionUser(db, req.body?.sessionToken);
    if (!user) {
      writeMockDb(db);
      res.status(401).json({ error: "Session expired" });
      return;
    }
    user.prefs = req.body?.prefs && typeof req.body.prefs === "object" ? req.body.prefs : {};
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });

  app.post("/api/designs/session/list", (req, res) => {
    const db = readMockDb();
    const user = getMockSessionUser(db, req.body?.sessionToken);
    if (!user) {
      writeMockDb(db);
      res.status(401).json({ error: "Session expired" });
      return;
    }
    const latest = new Map<string, any>();
    db.designData
      .filter((row) => row.user_uuid === user.user_uuid)
      .sort((a, b) => b.datetime_saved.localeCompare(a.datetime_saved))
      .forEach((row) => {
        if (!latest.has(row.designed_form_uuid)) latest.set(row.designed_form_uuid, { json_spec: row.json_spec });
      });
    writeMockDb(db);
    res.json(Array.from(latest.values()));
  });

  app.post("/api/designs/list", (req, res) => {
    const db = readMockDb();
    const email = normalizeEmail(req.body?.email);
    const password = requiredText(req.body?.password, "password", 200);
    const user = db.designAuth.find((row) => row.user_email === email);
    if (!user || !mockPasswordMatches(user, password) || !user.email_verified) {
      res.status(401).json({ error: "Invalid designer credentials" });
      return;
    }
    const latest = new Map<string, any>();
    db.designData
      .filter((row) => row.user_uuid === user.user_uuid)
      .sort((a, b) => b.datetime_saved.localeCompare(a.datetime_saved))
      .forEach((row) => {
        if (!latest.has(row.designed_form_uuid)) latest.set(row.designed_form_uuid, { json_spec: row.json_spec });
      });
    res.json(Array.from(latest.values()));
  });

  app.post("/api/designs", (req, res) => {
    const db = readMockDb();
    const user = authenticateMockDesignRequest(db, req.body);
    if (!user) {
      res.status(401).json({ error: "Invalid controller credentials" });
      return;
    }
    const design = req.body?.design;
    assertUuid(design?.id, "design id");
    const publicId = requiredText(design.publicId, "publicId", 64);
    db.designData = db.designData.filter((row) => row.random_hex !== publicId);
    db.designData.push({
      user_uuid: user.user_uuid,
      designed_form_uuid: design.id,
      random_hex: publicId,
      datetime_saved: new Date().toISOString(),
      json_spec: design,
    });
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });

  app.post("/api/designs/delete", (req, res) => {
    const db = readMockDb();
    const user = authenticateMockDesignRequest(db, req.body);
    if (!user) {
      res.status(401).json({ error: "Invalid controller credentials" });
      return;
    }
    const designId = req.body?.designId;
    const publicId = req.body?.publicId;
    db.designData = db.designData.filter((row) =>
      row.user_uuid !== user.user_uuid ||
      (designId && row.designed_form_uuid !== designId) ||
      (publicId && row.random_hex !== publicId)
    );
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });

  app.get("/api/designs/public/:publicId", (req, res) => {
    const db = readMockDb();
    const publicId = requiredText(req.params.publicId, "public id", 64);
    const row = db.designData.filter((item) => item.random_hex === publicId).sort((a, b) => b.datetime_saved.localeCompare(a.datetime_saved))[0];
    if (!row) {
      res.status(404).json({ error: "Design not found" });
      return;
    }
    res.json(row.json_spec);
  });

  app.get("/api/patients", (_req, res) => res.json(readMockDb().patients));
  app.post("/api/patients/search", (req, res) => {
    const query = String(req.body?.searchQuery || "").toLowerCase();
    res.json(readMockDb().patients.filter((patient) => JSON.stringify(patient).toLowerCase().includes(query)));
  });
  app.get("/api/patients/:uuid", (req, res) => {
    const patient = readMockDb().patients.find((row) => row.uuid === req.params.uuid);
    if (!patient) res.status(404).json({ error: "Patient not found" });
    else res.json(patient);
  });
  app.get("/api/patients/:uuid/forms", (req, res) => res.json(readMockDb().formsIndex.filter((row) => row.patient_uuid === req.params.uuid)));
  app.get("/api/patients/:uuid/appointments", (req, res) => res.json(readMockDb().appointments.filter((row) => row.patient_uuid === req.params.uuid)));
  app.get("/api/patients/:uuid/appointments/unlinked", (req, res) => res.json(readMockDb().appointments.filter((row) => row.patient_uuid === req.params.uuid && !row.outcome_form_uuid)));
  app.post("/api/appointments/by-uuids", (req, res) => res.json(readMockDb().appointments.filter((row) => Array.isArray(req.body?.uuids) && req.body.uuids.includes(row.uuid))));
  app.get("/api/appointments/:uuid", (req, res) => {
    const appointment = readMockDb().appointments.find((row) => row.uuid === req.params.uuid);
    if (!appointment) res.status(404).json({ error: "Appointment not found" });
    else res.json(appointment);
  });
  app.patch("/api/appointments/:uuid", (req, res) => {
    const db = readMockDb();
    db.appointments = db.appointments.map((row) => row.uuid === req.params.uuid ? { ...row, outcome_form_uuid: req.body?.outcome_form_uuid || null } : row);
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });
  app.get("/api/forms/:formType/:uuid/latest-version", (req, res) => {
    const table = formTable(req.params.formType);
    const rows = readMockDb().clinicalForms[table].filter((row) => row.uuid === req.params.uuid);
    res.json({ version: rows.length ? Math.max(...rows.map((row) => Number(row.version || 0))) : null });
  });
  app.get("/api/forms/:formType/:uuid", (req, res) => {
    const table = formTable(req.params.formType);
    const row = readMockDb().clinicalForms[table].filter((item) => item.uuid === req.params.uuid).sort((a, b) => Number(b.version) - Number(a.version))[0];
    if (!row) res.status(404).json({ error: "Clinical form not found" });
    else res.json(row);
  });
  app.get("/api/forms/:formType/:uuid/versions/:version", (req, res) => {
    const table = formTable(req.params.formType);
    const row = readMockDb().clinicalForms[table].find((item) => item.uuid === req.params.uuid && Number(item.version) === Number(req.params.version));
    if (!row) res.status(404).json({ error: "Clinical form version not found" });
    else res.json(row);
  });
  app.get("/api/forms-index/:uuid/history", (req, res) => res.json(readMockDb().formsIndex.filter((row) => row.form_uuid === req.params.uuid)));
  app.post("/api/forms/:formType", (req, res) => {
    const db = readMockDb();
    const table = formTable(req.params.formType);
    db.clinicalForms[table].push(req.body);
    writeMockDb(db);
    res.json({ success: true, mock: true, uuid: req.body?.uuid, version: req.body?.version });
  });
  app.post("/api/forms-index", (req, res) => {
    const db = readMockDb();
    db.formsIndex.push(req.body);
    writeMockDb(db);
    res.json({ success: true, mock: true });
  });
}

if (useMockDb) {
  console.log(`[formBuilder2] using mock database at ${mockDbPath}`);
  registerMockRoutes();
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function assertUuid(value: unknown, field: string) {
  if (!isUuid(value)) {
    const error = new Error(`${field} must be a valid UUID`);
    (error as any).status = 400;
    throw error;
  }
}

function nullableUuid(value: unknown, field: string) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  assertUuid(value, field);
  return value;
}

function textOrNull(value: unknown, maxLength: number) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  if (typeof value !== "string") {
    const error = new Error("Expected a string value");
    (error as any).status = 400;
    throw error;
  }
  return value.trim().slice(0, maxLength);
}

function requiredText(value: unknown, field: string, maxLength: number) {
  const clean = textOrNull(value, maxLength);
  if (!clean) {
    const error = new Error(`${field} is required`);
    (error as any).status = 400;
    throw error;
  }
  return clean;
}

function dateOrNow(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const clinicalMatch = value.trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (clinicalMatch) {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const day = Number(clinicalMatch[1]);
    const month = monthNames.indexOf(clinicalMatch[2].toLowerCase());
    let year = Number(clinicalMatch[3]);
    if (year < 100) year += 2000;
    const clinicalDate = new Date(Date.UTC(year, month, day));
    if (
      month >= 0 &&
      clinicalDate.getUTCFullYear() === year &&
      clinicalDate.getUTCMonth() === month &&
      clinicalDate.getUTCDate() === day
    ) {
      return clinicalDate.toISOString();
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error("Date/time value is invalid");
    (error as any).status = 400;
    throw error;
  }
  return parsed.toISOString();
}

function versionNumber(value: unknown) {
  const version = Number(value ?? 0);
  if (!Number.isInteger(version) || version < 0 || version > 1000000) {
    const error = new Error("version must be a non-negative integer");
    (error as any).status = 400;
    throw error;
  }
  return version;
}

function formTable(type: string) {
  const table = formTables[type];
  if (!table) {
    const error = new Error("Invalid clinical form type");
    (error as any).status = 400;
    throw error;
  }
  return table;
}

function canonicalFormType(type: string) {
  const table = formTable(type);
  return canonicalFormTypes[table];
}

let clinicalSchemaReady = false;
async function ensureClinicalFormSchema() {
  if (useMockDb || clinicalSchemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cardiology_test_requests (
      uuid UUID NOT NULL,
      version INT NOT NULL,
      patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
      event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
      form_status VARCHAR(20) NOT NULL,
      highly_sensitive BOOLEAN DEFAULT false NOT NULL,
      organisation VARCHAR(100),
      hospital VARCHAR(100),
      senior_responsible_clinician VARCHAR(150),
      speciality VARCHAR(100),
      form_data JSONB NOT NULL,
      PRIMARY KEY (uuid, version)
    )
  `);
  for (const table of [
    "waiting_list_cards",
    "operation_notes",
    "outpatient_outcomes",
    "treatment_summaries",
    "cardiology_test_requests",
    "forms_index",
  ]) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS highly_sensitive BOOLEAN DEFAULT false NOT NULL`);
  }
  await pool.query(`
    CREATE OR REPLACE VIEW forms_index_current AS
    SELECT DISTINCT ON (form_uuid) *
      FROM forms_index
     ORDER BY form_uuid, form_version DESC, id DESC
  `);
  clinicalSchemaReady = true;
}

function asyncRoute(
  handler: (req: express.Request, res: express.Response) => Promise<void>,
) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res).catch(next);
  };
}

async function ensureDesignerTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "designAuth" (
      user_uuid UUID PRIMARY KEY,
      user_email VARCHAR(320) NOT NULL,
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified TIMESTAMP WITH TIME ZONE,
      datetime_registered TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
      datetime_password_changed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
      datetime_last_save_operation TIMESTAMP WITH TIME ZONE
    )`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS "designAuth_user_email_key" ON "designAuth" (user_email)`);
  await pool.query(`ALTER TABLE "designAuth" ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP WITH TIME ZONE`);
  await pool.query(`ALTER TABLE "designAuth" ADD COLUMN IF NOT EXISTS prefs JSONB NOT NULL DEFAULT '{}'::jsonb`);
  await pool.query(`UPDATE "designAuth" SET user_email = lower(user_email)`);
  await pool.query(`UPDATE "designAuth" SET email_verified = COALESCE(datetime_registered, now()) WHERE email_verified IS NULL`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "designData" (
      user_uuid UUID NOT NULL REFERENCES "designAuth"(user_uuid) ON DELETE CASCADE,
      designed_form_uuid UUID NOT NULL,
      random_hex VARCHAR(64) NOT NULL,
      datetime_saved TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
      json_spec JSONB NOT NULL,
      PRIMARY KEY (user_uuid, designed_form_uuid, datetime_saved)
    )`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS "designData_random_hex_key" ON "designData" (random_hex)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "emailVerificationsInProgress" (
      user_email VARCHAR(320) PRIMARY KEY,
      verification_code VARCHAR(6) NOT NULL,
      datetime_code_sent TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "designSessions" (
      session_token UUID PRIMARY KEY,
      user_uuid UUID NOT NULL REFERENCES "designAuth"(user_uuid) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      remember BOOLEAN NOT NULL DEFAULT false,
      datetime_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
      datetime_last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
    )`);
}

function passwordHash(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, Buffer.from(salt, "base64"), 120000, 32, "sha256").toString("base64");
}

function validateDesignerCredentials(email: string, password: string) {
  if (!email.endsWith("@wales.nhs.uk")) {
    const error = new Error("email must end with @wales.nhs.uk");
    (error as any).status = 400;
    throw error;
  }
  if (password.length < 12) {
    const error = new Error("password must be at least 12 characters");
    (error as any).status = 400;
    throw error;
  }
}

async function authenticateDesigner(body: any) {
  await ensureDesignerTables();
  const email = normalizeEmail(body?.email);
  const password = requiredText(body?.password, "password", 200);
  const { rows } = await pool.query(
    `SELECT user_uuid, salt, password_hash, email_verified FROM "designAuth" WHERE user_email = $1 LIMIT 1`,
    [email],
  );
  if (!rows[0] || passwordHash(password, rows[0].salt) !== rows[0].password_hash || !rows[0].email_verified) {
    const error = new Error("Invalid designer credentials");
    (error as any).status = 401;
    throw error;
  }
  return rows[0].user_uuid as string;
}

async function createDesignerSession(userUuid: string, remember: boolean) {
  await ensureDesignerTables();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (remember ? rememberedDesignerSessionMs : transientDesignerSessionMs)).toISOString();
  await pool.query(`DELETE FROM "designSessions" WHERE expires_at <= now()`);
  await pool.query(
    `INSERT INTO "designSessions" (session_token, user_uuid, expires_at, remember) VALUES ($1, $2, $3, $4)`,
    [token, userUuid, expiresAt, remember],
  );
  return { token, expiresAt };
}

async function authenticateDesignerSession(sessionToken: unknown) {
  await ensureDesignerTables();
  assertUuid(sessionToken, "sessionToken");
  const { rows } = await pool.query(
    `SELECT s.session_token, s.user_uuid, s.remember, s.expires_at, a.user_email, a.prefs
       FROM "designSessions" s
       JOIN "designAuth" a ON a.user_uuid = s.user_uuid
      WHERE s.session_token = $1
        AND s.expires_at > now()
      LIMIT 1`,
    [sessionToken],
  );
  if (!rows[0]) {
    const error = new Error("Session expired");
    (error as any).status = 401;
    throw error;
  }
  const expiresAt = new Date(Date.now() + (rows[0].remember ? rememberedDesignerSessionMs : transientDesignerSessionMs)).toISOString();
  await pool.query(
    `UPDATE "designSessions"
        SET expires_at = $2, datetime_last_seen = now()
      WHERE session_token = $1`,
    [sessionToken, expiresAt],
  );
  return { ...rows[0], expires_at: expiresAt } as { session_token: string; user_uuid: string; user_email: string; prefs: any; expires_at: string };
}

async function authenticateDesignerForDesignRequest(body: any) {
  if (isUuid(body?.sessionToken)) {
    const session = await authenticateDesignerSession(body.sessionToken);
    return session.user_uuid;
  }
  return authenticateDesigner(body);
}

async function startDesignerRegistration(body: any) {
  await ensureDesignerTables();
  const email = normalizeEmail(body?.email);
  const password = requiredText(body?.password, "password", 200);
  validateDesignerCredentials(email, password);
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  await pool.query(
    `INSERT INTO "emailVerificationsInProgress" (user_email, verification_code, datetime_code_sent)
     VALUES ($1, $2, now())
     ON CONFLICT (user_email) DO UPDATE SET verification_code = EXCLUDED.verification_code, datetime_code_sent = now()`,
    [email, code],
  );
  console.log(`[Designer] Verification code generated for ${email}. SWAS Java sends the email in production.`);
}

app.post(["/api/composer-auth/register-start", "/api/controller-auth/register-start", "/api/designer-auth/register-start"], asyncRoute(async (req, res) => {
  await startDesignerRegistration(req.body);
  res.json({ success: true });
}));

app.post(["/api/composer-auth/register-resend", "/api/controller-auth/register-resend", "/api/designer-auth/register-resend"], asyncRoute(async (req, res) => {
  await startDesignerRegistration(req.body);
  res.json({ success: true });
}));

app.post(["/api/composer-auth/register-verify", "/api/controller-auth/register-verify", "/api/designer-auth/register-verify"], asyncRoute(async (req, res) => {
  await ensureDesignerTables();
  const email = normalizeEmail(req.body?.email);
  const password = requiredText(req.body?.password, "password", 200);
  const code = requiredText(req.body?.code, "code", 6);
  validateDesignerCredentials(email, password);
  const { rows } = await pool.query(
    `SELECT verification_code, datetime_code_sent
       FROM "emailVerificationsInProgress"
      WHERE user_email = $1
      LIMIT 1`,
    [email],
  );
  if (!rows[0]) {
    res.status(400).json({ error: "The verification code is incorrect", code: "incorrect" });
    return;
  }
  if (Date.now() - new Date(rows[0].datetime_code_sent).getTime() > 10 * 60 * 1000) {
    res.status(400).json({ error: "The verification code is no longer valid", code: "expired" });
    return;
  }
  if (rows[0].verification_code !== code) {
    res.status(400).json({ error: "The verification code is incorrect", code: "incorrect" });
    return;
  }
  const salt = crypto.randomBytes(16).toString("base64");
  await pool.query(
    `INSERT INTO "designAuth" (user_uuid, user_email, salt, password_hash, email_verified, datetime_registered, datetime_password_changed, datetime_last_save_operation)
     VALUES ($1, $2, $3, $4, now(), now(), now(), now())
     ON CONFLICT (user_email) DO UPDATE SET salt = EXCLUDED.salt, password_hash = EXCLUDED.password_hash, email_verified = now(), datetime_password_changed = now()`,
    [crypto.randomUUID(), email, salt, passwordHash(password, salt)],
  );
  await pool.query(`DELETE FROM "emailVerificationsInProgress" WHERE user_email = $1`, [email]);
  res.json({ success: true });
}));

app.post(["/api/composer-auth/register", "/api/controller-auth/register", "/api/designer-auth/register"], asyncRoute(async (req, res) => {
  await startDesignerRegistration(req.body);
  res.json({ success: true });
}));

app.post(["/api/composer-auth/login", "/api/controller-auth/login", "/api/designer-auth/login"], asyncRoute(async (req, res) => {
  const userUuid = await authenticateDesigner(req.body);
  const session = await createDesignerSession(userUuid, Boolean(req.body?.remember));
  const { rows } = await pool.query(`SELECT prefs FROM "designAuth" WHERE user_uuid = $1`, [userUuid]);
  res.json({ success: true, sessionToken: session.token, expiresAt: session.expiresAt, prefs: rows[0]?.prefs || {} });
}));

app.post(["/api/composer-auth/session", "/api/controller-auth/session", "/api/designer-auth/session"], asyncRoute(async (req, res) => {
  const session = await authenticateDesignerSession(req.body?.sessionToken);
  res.json({ success: true, email: session.user_email, prefs: session.prefs || {}, expiresAt: session.expires_at });
}));

app.post(["/api/composer-auth/logout", "/api/controller-auth/logout", "/api/designer-auth/logout"], asyncRoute(async (req, res) => {
  await ensureDesignerTables();
  const sessionToken = req.body?.sessionToken;
  if (isUuid(sessionToken)) {
    await pool.query(`DELETE FROM "designSessions" WHERE session_token = $1`, [sessionToken]);
  }
  res.json({ success: true });
}));

app.post(["/api/composer-auth/prefs", "/api/controller-auth/prefs", "/api/designer-auth/prefs"], asyncRoute(async (req, res) => {
  const session = await authenticateDesignerSession(req.body?.sessionToken);
  const prefs = req.body?.prefs && typeof req.body.prefs === "object" ? req.body.prefs : {};
  await pool.query(`UPDATE "designAuth" SET prefs = $2::jsonb WHERE user_uuid = $1`, [session.user_uuid, JSON.stringify(prefs)]);
  res.json({ success: true });
}));

app.post("/api/designs/list", asyncRoute(async (req, res) => {
  const userUuid = await authenticateDesigner(req.body);
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (designed_form_uuid) json_spec
       FROM "designData"
      WHERE user_uuid = $1
      ORDER BY designed_form_uuid, datetime_saved DESC`,
    [userUuid],
  );
  res.json(rows);
}));

app.post("/api/designs/session/list", asyncRoute(async (req, res) => {
  const session = await authenticateDesignerSession(req.body?.sessionToken);
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (designed_form_uuid) json_spec
       FROM "designData"
      WHERE user_uuid = $1
      ORDER BY designed_form_uuid, datetime_saved DESC`,
    [session.user_uuid],
  );
  res.json(rows);
}));

app.post("/api/designs", asyncRoute(async (req, res) => {
  const userUuid = await authenticateDesignerForDesignRequest(req.body);
  const design = req.body?.design;
  if (!design || typeof design !== "object") {
    res.status(400).json({ error: "design is required" });
    return;
  }
  assertUuid(design.id, "design id");
  const publicId = requiredText(design.publicId, "publicId", 64);
  await pool.query(`UPDATE "designAuth" SET datetime_last_save_operation = now() WHERE user_uuid = $1`, [userUuid]);
  await pool.query(
    `INSERT INTO "designData" (user_uuid, designed_form_uuid, random_hex, datetime_saved, json_spec)
     VALUES ($1, $2, $3, now(), $4::jsonb)
     ON CONFLICT (random_hex) DO UPDATE SET user_uuid = EXCLUDED.user_uuid, designed_form_uuid = EXCLUDED.designed_form_uuid, datetime_saved = now(), json_spec = EXCLUDED.json_spec`,
    [userUuid, design.id, publicId, JSON.stringify(design)],
  );
  res.json({ success: true });
}));

app.post("/api/designs/delete", asyncRoute(async (req, res) => {
  const userUuid = await authenticateDesignerForDesignRequest(req.body);
  const designId = req.body?.designId;
  const publicId = req.body?.publicId;
  if (designId) assertUuid(designId, "designId");
  const publicIdText = publicId ? requiredText(publicId, "publicId", 64) : null;
  if (!designId && !publicIdText) {
    res.status(400).json({ error: "designId or publicId is required" });
    return;
  }
  await pool.query(
    `DELETE FROM "designData"
      WHERE user_uuid = $1
        AND ($2::uuid IS NULL OR designed_form_uuid = $2::uuid)
        AND ($3::text IS NULL OR random_hex = $3::text)`,
    [userUuid, designId || null, publicIdText],
  );
  res.json({ success: true });
}));

app.get("/api/designs/public/:publicId", asyncRoute(async (req, res) => {
  await ensureDesignerTables();
  const publicId = requiredText(req.params.publicId, "public id", 64);
  const { rows } = await pool.query(
    `SELECT json_spec FROM "designData" WHERE random_hex = $1 ORDER BY datetime_saved DESC LIMIT 1`,
    [publicId],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Design not found" });
    return;
  }
  res.json(rows[0].json_spec);
}));

app.get("/api/health/db", asyncRoute(async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
}));

app.get("/api/patients", asyncRoute(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT *
       FROM (
         SELECT DISTINCT ON (uuid) *
         FROM patients
         ORDER BY uuid, version DESC
       ) current_patients
      ORDER BY surname ASC, forenames ASC, date_of_birth ASC`,
  );
  res.json(rows);
}));

app.post("/api/patients/search", asyncRoute(async (req, res) => {
  const searchQuery = requiredText(req.body?.searchQuery, "searchQuery", 200);
  if (!searchQuery) {
    res.json([]);
    return;
  }

  const { rows } = await pool.query(
    "SELECT * FROM search_patients_fuzzy($1) LIMIT 50",
    [searchQuery],
  );
  res.json(rows);
}));

app.get("/api/patients/:uuid", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "patient uuid");
  const { rows } = await pool.query(
    `SELECT * FROM patients
      WHERE uuid = $1
      ORDER BY version DESC
      LIMIT 1`,
    [req.params.uuid],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(rows[0]);
}));

app.get("/api/patients/:uuid/forms", asyncRoute(async (req, res) => {
  await ensureClinicalFormSchema();
  assertUuid(req.params.uuid, "patient uuid");
  const { rows } = await pool.query(
    `SELECT *
       FROM forms_index_current
      WHERE patient_uuid = $1
      ORDER BY event_datetime DESC NULLS LAST, id DESC`,
    [req.params.uuid],
  );
  res.json(rows);
}));

app.get("/api/patients/:uuid/appointments", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "patient uuid");
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (uuid) *
       FROM outpatient_appointments
      WHERE patient_uuid = $1
      ORDER BY uuid, version DESC`,
    [req.params.uuid],
  );
  res.json(rows);
}));

app.get("/api/patients/:uuid/appointments/unlinked", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "patient uuid");
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (uuid) *
       FROM outpatient_appointments
      WHERE patient_uuid = $1
        AND outcome_form_uuid IS NULL
      ORDER BY uuid, version DESC`,
    [req.params.uuid],
  );
  res.json(rows);
}));

app.post("/api/appointments/by-uuids", asyncRoute(async (req, res) => {
  const uuids = req.body?.uuids;
  if (!Array.isArray(uuids) || uuids.length > 200) {
    res.status(400).json({ error: "uuids must be an array containing at most 200 UUIDs" });
    return;
  }
  uuids.forEach((uuid) => assertUuid(uuid, "appointment uuid"));

  const { rows } = await pool.query(
    `SELECT DISTINCT ON (uuid) *
       FROM outpatient_appointments
      WHERE uuid = ANY($1::uuid[])
      ORDER BY uuid, version DESC`,
    [uuids],
  );
  res.json(rows);
}));

app.get("/api/appointments/:uuid", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "appointment uuid");
  const { rows } = await pool.query(
    `SELECT *
       FROM outpatient_appointments
      WHERE uuid = $1
      ORDER BY version DESC
      LIMIT 1`,
    [req.params.uuid],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(rows[0]);
}));

app.patch("/api/appointments/:uuid", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "appointment uuid");
  const outcomeFormUuid = nullableUuid(req.body?.outcome_form_uuid, "outcome_form_uuid");

  const { rowCount } = await pool.query(
    `UPDATE outpatient_appointments
        SET outcome_form_uuid = $1
      WHERE uuid = $2`,
    [outcomeFormUuid, req.params.uuid],
  );
  res.json({ success: true, updated: rowCount });
}));

app.get("/api/forms/:formType/:uuid/latest-version", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "form uuid");
  const table = formTable(req.params.formType);
  const { rows } = await pool.query(
    `SELECT version
       FROM ${table}
      WHERE uuid = $1
      ORDER BY version DESC
      LIMIT 1`,
    [req.params.uuid],
  );
  res.json({ version: rows[0]?.version ?? null });
}));

app.get("/api/forms/:formType/:uuid", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "form uuid");
  const table = formTable(req.params.formType);
  const { rows } = await pool.query(
    `SELECT *
       FROM ${table}
      WHERE uuid = $1
      ORDER BY version DESC
      LIMIT 1`,
    [req.params.uuid],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Clinical form not found" });
    return;
  }
  res.json(rows[0]);
}));

app.get("/api/forms/:formType/:uuid/versions/:version", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "form uuid");
  const table = formTable(req.params.formType);
  const version = versionNumber(req.params.version);
  const { rows } = await pool.query(
    `SELECT *
       FROM ${table}
      WHERE uuid = $1
        AND version = $2
      LIMIT 1`,
    [req.params.uuid, version],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Clinical form version not found" });
    return;
  }
  res.json(rows[0]);
}));

app.get("/api/forms-index/:uuid/history", asyncRoute(async (req, res) => {
  assertUuid(req.params.uuid, "form uuid");
  const { rows } = await pool.query(
    `SELECT
       form_version,
       event_datetime,
       document_datetime,
       COALESCE(details, '') AS details,
       NULLIF(details, '') AS saved_by
     FROM forms_index
     WHERE form_uuid = $1
     ORDER BY form_version DESC`,
    [req.params.uuid],
  );
  res.json(rows);
}));

app.post("/api/forms/:formType", asyncRoute(async (req, res) => {
  await ensureClinicalFormSchema();
  const table = formTable(req.params.formType);
  const body = req.body || {};
  assertUuid(body.uuid, "form uuid");
  const patientUuid = nullableUuid(body.patient_uuid, "patient_uuid");
  const version = versionNumber(body.version);
  const eventDatetime = dateOrNow(body.event_datetime);
  const formStatus = requiredText(body.form_status || "draft", "form_status", 20);
  if (!statuses.has(formStatus)) {
    res.status(400).json({ error: "form_status is invalid" });
    return;
  }
  const formData = body.form_data && typeof body.form_data === "object" ? body.form_data : {};
  const highlySensitive = Boolean(body.highly_sensitive ?? formData.highlySensitive);

  if (table === "operation_notes") {
    await pool.query(
      `INSERT INTO operation_notes (
         uuid, version, patient_uuid, event_datetime, form_status, highly_sensitive, form_data,
         organisation, hospital, senior_responsible_clinician, speciality
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)`,
      [
        body.uuid,
        version,
        patientUuid,
        eventDatetime,
        formStatus,
        highlySensitive,
        JSON.stringify(formData),
        textOrNull(body.organisation, 100),
        textOrNull(body.hospital, 100),
        textOrNull(body.senior_responsible_clinician, 150),
        textOrNull(body.speciality, 100),
      ],
    );
  } else if (table === "outpatient_outcomes") {
    await pool.query(
      `INSERT INTO outpatient_outcomes (
         uuid, version, patient_uuid, event_datetime, form_status, highly_sensitive, form_data, appointment_uuid, linked_waiting_list_card_uuid
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
      [
        body.uuid,
        version,
        patientUuid,
        eventDatetime,
        formStatus,
        highlySensitive,
        JSON.stringify(formData),
        nullableUuid(body.appointment_uuid, "appointment_uuid"),
        nullableUuid(body.linked_waiting_list_card_uuid, "linked_waiting_list_card_uuid"),
      ],
    );
  } else if (table === "waiting_list_cards") {
    await pool.query(
      `INSERT INTO waiting_list_cards (
         uuid, version, patient_uuid, event_datetime, form_status, highly_sensitive, form_data
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [body.uuid, version, patientUuid, eventDatetime, formStatus, highlySensitive, JSON.stringify(formData)],
    );
  } else if (table === "cardiology_test_requests") {
    await pool.query(
      `INSERT INTO cardiology_test_requests (
         uuid, version, patient_uuid, event_datetime, form_status, highly_sensitive, form_data,
         organisation, hospital, senior_responsible_clinician, speciality
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)`,
      [
        body.uuid,
        version,
        patientUuid,
        eventDatetime,
        formStatus,
        highlySensitive,
        JSON.stringify(formData),
        textOrNull(body.organisation, 100),
        textOrNull(body.hospital, 100),
        textOrNull(body.senior_responsible_clinician, 150),
        textOrNull(body.speciality, 100),
      ],
    );
  } else {
    await pool.query(
      `INSERT INTO treatment_summaries (
         uuid, version, patient_uuid, event_datetime, form_status, highly_sensitive, form_data
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [body.uuid, version, patientUuid, eventDatetime, formStatus, highlySensitive, JSON.stringify(formData)],
    );
  }

  res.json({ success: true, uuid: body.uuid, version });
}));

app.post("/api/forms-index", asyncRoute(async (req, res) => {
  await ensureClinicalFormSchema();
  const body = req.body || {};
  assertUuid(body.form_uuid, "form_uuid");
  const patientUuid = nullableUuid(body.patient_uuid, "patient_uuid");
  const formVersion = versionNumber(body.form_version);
  const formType = canonicalFormType(requiredText(body.form_type, "form_type", 50));
  const eventDatetime = dateOrNow(body.event_datetime);
  const documentDatetime = body.document_datetime ? dateOrNow(body.document_datetime) : null;
  const formStatus = requiredText(body.form_status, "form_status", 20);
  const eventOrDocument = requiredText(body.event_or_document || "Document", "event_or_document", 20);

  if (!statuses.has(formStatus)) {
    res.status(400).json({ error: "form_status is invalid" });
    return;
  }
  if (!eventKinds.has(eventOrDocument)) {
    res.status(400).json({ error: "event_or_document is invalid" });
    return;
  }

  await pool.query(
    `INSERT INTO forms_index (
       form_uuid, form_version, form_type, patient_uuid, event_datetime,
       document_datetime, form_status, speciality, organisation, hospital,
       senior_responsible_clinician, details, event_or_document, highly_sensitive
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      body.form_uuid,
      formVersion,
      formType,
      patientUuid,
      eventDatetime,
      documentDatetime,
      formStatus,
      textOrNull(body.speciality, 100),
      textOrNull(body.organisation, 100),
      textOrNull(body.hospital, 100),
      textOrNull(body.senior_responsible_clinician, 150),
      textOrNull(body.details, 2000),
      eventOrDocument,
      Boolean(body.highly_sensitive),
    ],
  );
  res.json({ success: true });
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const svelteDistCandidates = [
  path.resolve(__dirname, "svelte", "dist"),
  path.resolve(__dirname, "..", "svelte", "dist"),
];
const svelteDistPath = svelteDistCandidates.find((candidate) => fs.existsSync(path.join(candidate, "index.html")));

function sendSvelteIndex(res: express.Response) {
  if (!svelteDistPath) {
    res.status(404).send("Svelte frontend has not been built. Run the Svelte build first.");
    return;
  }
  res.sendFile(path.join(svelteDistPath, "index.html"));
}

if (svelteDistPath) {
  app.use("/formBuilder2/svelte", express.static(svelteDistPath));
  app.use("/svelte", express.static(svelteDistPath));
}

const docsPath = path.resolve(process.cwd(), "docs");
app.use("/formBuilder2/docs", express.static(docsPath));
app.use("/docs", express.static(docsPath));

app.get(["/formBuilder2/svelte", "/formBuilder2/svelte/"], (_req, res) => {
  sendSvelteIndex(res);
});

app.get(["/svelte", "/svelte/"], (_req, res) => {
  sendSvelteIndex(res);
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname);
  app.use("/formBuilder2", express.static(distPath));
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/formBuilder2/svelte") || req.path.startsWith("/svelte")) {
      sendSvelteIndex(res);
      return;
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use((req, _res, next) => {
    if (req.url === "/formBuilder2") {
      req.url = "/";
    } else if (req.url.startsWith("/formBuilder2/") && !req.url.startsWith("/formBuilder2/svelte/")) {
      req.url = req.url.replace(/^\/formBuilder2/, "");
    }
    next();
  });
  app.use(vite.middlewares);
}

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = Number(error?.status || 500);
  if (status >= 500) {
    console.error("[API]", error);
  }
  res.status(status).json({ error: error?.message || "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[formBuilder2] listening on http://0.0.0.0:${PORT}`);
});
