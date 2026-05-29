class SupabaseQueryBuilder {
  private table: string;
  private filters: Array<{ field: string; value: any; op: string }> = [];
  private orderCriteria: Array<{ field: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private updateValues: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*") {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value, op: "eq" });
    return this;
  }

  in(field: string, value: any[]) {
    this.filters.push({ field, value, op: "in" });
    return this;
  }

  is(field: string, value: any) {
    this.filters.push({ field, value, op: "is" });
    return this;
  }

  ilike(field: string, pattern: string) {
    this.filters.push({ field, value: pattern, op: "ilike" });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderCriteria.push({
      field,
      ascending: options?.ascending !== false
    });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  update(values: any) {
    this.updateValues = values;
    return this;
  }

  // Intercept `.then` for await chaining
  async then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (err) {
      if (reject) {
        reject(err);
      } else {
        resolve({ data: null, error: err });
      }
    }
    return this;
  }

  private async execute() {
    const tableToUse = this.table === "patients_current" ? "patients" : this.table;

    // A. Query updates
    if (this.updateValues !== null) {
      if (tableToUse === "outpatient_appointments") {
        const uuidFilter = this.filters.find(f => f.field === "uuid" && f.op === "eq");
        const appUuid = uuidFilter ? uuidFilter.value : null;
        if (appUuid) {
          // If referencing an outpatient appointment linkage, store in sessionStorage so it binds to the outcome form submission
          const outcomeFormUuid = this.updateValues.outcome_form_uuid;
          if (outcomeFormUuid) {
            sessionStorage.setItem(`fb_link_appt_${outcomeFormUuid}`, appUuid);
          }
        }
      }
      return { data: this.updateValues, error: null };
    }

    // B. Query select fetches
    // 1. Patients demographics queries
    if (tableToUse === "patients") {
      const uuidFilter = this.filters.find(f => f.field === "uuid" && f.op === "eq");
      const patientUuid = uuidFilter ? uuidFilter.value : null;

      if (patientUuid) {
        const res = await fetch(`/api/patients/${patientUuid}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch patient detail: ${text}`);
        }
        const data = await res.json();
        return { data: this.isSingle ? data : [data], error: null };
      } else {
        const res = await fetch("/api/patients");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch patients list: ${text}`);
        }
        const data = await res.json();
        return { data, error: null };
      }
    }

    // 2. Patient registry / event timeline indexed forms
    if (tableToUse === "forms_index" || tableToUse === "forms_index_current") {
      const patientFilter = this.filters.find(f => f.field === "patient_uuid" && f.op === "eq");
      const patientUuid = patientFilter ? patientFilter.value : null;

      if (patientUuid) {
        const res = await fetch(`/api/patients/${patientUuid}/forms`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch patient forms timeline: ${text}`);
        }
        const data = await res.json();
        return { data, error: null };
      } else {
        return { data: [], error: null };
      }
    }

    // 3. Outpatient scheduled events
    if (tableToUse === "outpatient_appointments") {
      // 3.1: Targeted UUID array fetch
      const uidsFilter = this.filters.find(f => f.field === "uuid" && f.op === "in");
      if (uidsFilter && Array.isArray(uidsFilter.value)) {
        const res = await fetch("/api/appointments/targeted", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuids: uidsFilter.value })
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch targeted appointments: ${text}`);
        }
        const data = await res.json();
        return { data, error: null };
      }

      // 3.2: Unscheduled active appointments fetch for outcome dropdown lists
      const patientFilter = this.filters.find(f => f.field === "patient_uuid" && f.op === "eq");
      const patientUuid = patientFilter ? patientFilter.value : null;
      if (patientUuid) {
        const res = await fetch(`/api/patients/${patientUuid}/appointments/unlinked`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch unlinked clinic appointments: ${text}`);
        }
        const data = await res.json();
        return { data, error: null };
      }
    }

    // 4. Clinical form detailed read back (Waiting list, Operation, Outpatient Outcome)
    if (["waiting_list_cards", "operation_notes", "outpatient_outcomes"].includes(tableToUse)) {
      const uuidFilter = this.filters.find(f => f.field === "uuid" && f.op === "eq");
      const formUuid = uuidFilter ? uuidFilter.value : null;

      if (formUuid) {
        const typeMap: Record<string, string> = {
          "waiting_list_cards": "waiting_list_card",
          "operation_notes": "operation_note",
          "outpatient_outcomes": "outpatient_outcome"
        };
        const res = await fetch(`/api/forms/${typeMap[tableToUse]}/${formUuid}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch clinical form contents: ${text}`);
        }
        const data = await res.json();
        return { data: this.isSingle ? data : [data], error: null };
      }
    }

    return { data: [], error: null };
  }

  // Intercept inserts to construct and post transactional datasets to Express
  async insert(items: any | any[]) {
    const item = Array.isArray(items) ? items[0] : items;
    const tableToUse = this.table;

    // A. Intercept details insert and stage payload in storage
    if (["waiting_list_cards", "operation_notes", "outpatient_outcomes"].includes(tableToUse)) {
      sessionStorage.setItem(`fb_pending_form_${item.uuid}`, JSON.stringify(item));
      return { data: [item], error: null };
    }

    // B. Intercept index insert, consolidate staged payload details and post to transactional server hook
    if (tableToUse === "forms_index") {
      const formUuid = item.form_uuid;
      const indexFormType = item.form_type;

      // Pull document stage dataset
      const pendingFormRaw = sessionStorage.getItem(`fb_pending_form_${formUuid}`);
      if (!pendingFormRaw) {
        throw new Error(`Staged clinical form document data not found in session for UUID ${formUuid}`);
      }
      const pendingForm = JSON.parse(pendingFormRaw);

      // Check for appointment link reference
      const storedLinkAppUuid = sessionStorage.getItem(`fb_link_appt_${formUuid}`);
      const linkAppUuid = storedLinkAppUuid || pendingForm.appointment_uuid || null;

      const payload = {
        formUuid,
        version: item.form_version,
        patientUuid: item.patient_uuid,
        eventDatetime: item.event_datetime,
        formStatus: item.form_status,
        formData: pendingForm.form_data,
        indexDetails: {
          speciality: item.speciality,
          organisation: item.organisation,
          hospital: item.hospital,
          seniorClinician: item.senior_clinician,
          details: item.details,
          eventOrDocument: item.event_or_document || "Document"
        },
        linkAppointmentUuid: linkAppUuid
      };

      const res = await fetch(`/api/forms/${indexFormType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API transaction failed to write document: ${errText}`);
      }

      const resJson = await res.json();

      // Clean session state
      sessionStorage.removeItem(`fb_pending_form_${formUuid}`);
      sessionStorage.removeItem(`fb_link_appt_${formUuid}`);

      return { data: [item], error: null };
    }

    return { data: [item], error: null };
  }
}

export function createClient(url: string, key: string) {
  return {
    from: (table: string) => {
      return new SupabaseQueryBuilder(table);
    },
    rpc: (functionName: string, args: any) => {
      const run = async () => {
        if (functionName === "search_patients_fuzzy") {
          const searchTerm = args?.search_term || "";
          if (!searchTerm.trim()) {
            return { data: [], error: null };
          }
          const res = await fetch("/api/patients/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ searchQuery: searchTerm })
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Search request failed: ${text}`);
          }
          const data = await res.json();
          return { data, error: null };
        }
        return { data: null, error: new Error(`Unknown RPC function: ${functionName}`) };
      };

      const promise = run();
      return {
        then: (resolve: any) => promise.then(resolve),
        catch: (reject: any) => promise.catch(reject),
        promise
      };
    }
  };
}
