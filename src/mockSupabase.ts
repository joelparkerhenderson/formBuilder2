type ApiResult<T = any> = { data: T | null; error: Error | null };
type Filter = { field: string; op: "eq" | "in"; value: any };
type Order = { field: string; ascending: boolean };

const uuidFields = new Set([
  "uuid",
  "patient_uuid",
  "form_uuid",
  "appointment_uuid",
  "outcome_form_uuid",
]);

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function apiUrl(path: string) {
  if (apiBaseUrl.endsWith("/api") && path.startsWith("/api/")) {
    return `${apiBaseUrl}${path.slice(4)}`;
  }
  return `${apiBaseUrl}${path}`;
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

class SupabaseQueryBuilder {
  private table: string;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private limitCount: number | null = null;
  private singleResult = false;
  private selectedColumns = "*";
  private updateValues: Record<string, any> | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*") {
    this.selectedColumns = columns;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, op: "eq", value });
    return this;
  }

  in(field: string, value: any[]) {
    this.filters.push({ field, op: "in", value });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orders.push({ field, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  update(values: Record<string, any>) {
    this.updateValues = values;
    return this;
  }

  async insert(items: any | any[]): Promise<ApiResult> {
    try {
      const rows = Array.isArray(items) ? items : [items];
      const data = await Promise.all(rows.map((row) => this.insertOne(row)));
      return { data: Array.isArray(items) ? data : data[0], error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  }

  then(resolve: (value: ApiResult) => void, reject?: (reason: unknown) => void) {
    this.execute().then(resolve, reject);
    return this;
  }

  catch(reject: (reason: unknown) => void) {
    return this.execute().catch(reject);
  }

  private async execute(): Promise<ApiResult> {
    try {
      if (this.updateValues) {
        return { data: await this.executeUpdate(), error: null };
      }

      const data = await this.executeSelect();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  }

  private getFilter(field: string, op: "eq" | "in" = "eq") {
    return this.filters.find((filter) => filter.field === field && filter.op === op);
  }

  private async executeSelect() {
    const uuid = this.getFilter("uuid")?.value;
    const patientUuid = this.getFilter("patient_uuid")?.value;

    switch (this.table) {
      case "patients":
        if (uuid) return requestJson(`/api/patients/${encodeURIComponent(uuid)}`);
        return requestJson("/api/patients");

      case "patients_current":
        return requestJson("/api/patients");

      case "forms_index_current":
        if (!patientUuid) throw new Error("patient_uuid filter is required for forms_index_current");
        return requestJson(`/api/patients/${encodeURIComponent(patientUuid)}/forms`);

      case "outpatient_appointments": {
        const uuidList = this.getFilter("uuid", "in")?.value;
        if (Array.isArray(uuidList)) {
          return requestJson("/api/appointments/by-uuids", {
            method: "POST",
            body: JSON.stringify({ uuids: uuidList }),
          });
        }
        if (uuid) return requestJson(`/api/appointments/${encodeURIComponent(uuid)}`);
        if (patientUuid) {
          return requestJson(`/api/patients/${encodeURIComponent(patientUuid)}/appointments`);
        }
        throw new Error("A uuid, uuid list, or patient_uuid filter is required for appointments");
      }

      case "waiting_list_cards":
      case "operation_notes":
      case "outpatient_outcomes":
        if (!uuid) throw new Error(`uuid filter is required for ${this.table}`);
        if (this.selectedColumns.trim() === "version") {
          const result = await requestJson<{ version: number | null }>(
            `/api/forms/${this.table}/${encodeURIComponent(uuid)}/latest-version`,
          );
          const rows = result.version === null ? [] : [{ version: result.version }];
          return this.singleResult ? rows[0] || null : rows;
        }
        return requestJson(`/api/forms/${this.table}/${encodeURIComponent(uuid)}`);

      default:
        throw new Error(`Unsupported table: ${this.table}`);
    }
  }

  private async insertOne(row: any) {
    if (this.table === "forms_index") {
      return requestJson("/api/forms-index", {
        method: "POST",
        body: JSON.stringify(row),
      });
    }

    if (["waiting_list_cards", "operation_notes", "outpatient_outcomes"].includes(this.table)) {
      return requestJson(`/api/forms/${this.table}`, {
        method: "POST",
        body: JSON.stringify(row),
      });
    }

    throw new Error(`Insert is not supported for table: ${this.table}`);
  }

  private async executeUpdate() {
    if (this.table !== "outpatient_appointments") {
      throw new Error(`Update is not supported for table: ${this.table}`);
    }

    const uuid = this.getFilter("uuid")?.value;
    if (!uuid) throw new Error("uuid filter is required for appointment update");

    return requestJson(`/api/appointments/${encodeURIComponent(uuid)}`, {
      method: "PATCH",
      body: JSON.stringify(this.updateValues),
    });
  }
}

export function createClient(url: string, key: string) {
  void url;
  void key;

  return {
    from: (table: string) => new SupabaseQueryBuilder(table),
    rpc: (functionName: string, args: any) => {
      const run = async (): Promise<ApiResult> => {
        try {
          if (functionName !== "search_patients_fuzzy") {
            throw new Error(`Unsupported RPC function: ${functionName}`);
          }

          const data = await requestJson("/api/patients/search", {
            method: "POST",
            body: JSON.stringify({ searchQuery: args?.search_term || "" }),
          });

          return { data, error: null };
        } catch (error) {
          return { data: null, error: toError(error) };
        }
      };

      return {
        then: (resolve: (value: ApiResult) => void, reject?: (reason: unknown) => void) =>
          run().then(resolve, reject),
        catch: (reject: (reason: unknown) => void) => run().catch(reject),
      };
    },
  };
}

export const __uuidFieldsForServerParity = uuidFields;
