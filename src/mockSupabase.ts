class SupabaseQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending !== false;
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

  private getData() {
    const key = `sb_${this.table}`;
    let data = JSON.parse(localStorage.getItem(key) || '[]');

    // If patients table is empty, initialize default patients
    if (this.table === 'patients' && data.length === 0) {
      data = [
        {
          id: 1,
          uuid: '12345678-1234-1234-1234-123456789012',
          version: 1,
          nhs_number: '123 456 7890',
          surname: 'DUCK',
          forenames: 'Donald',
          title: 'Mr',
          address_line1: 'Duck House',
          address_line2: '1 Duck Close',
          address_line3: 'Fantasyland',
          address_line4: 'Disneyworld, FL3 1DC',
          crn: '012345678',
          date_of_birth: '1956-04-12',
          sex: 'Male',
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          uuid: '22345678-1234-1234-1234-123456789012',
          version: 1,
          nhs_number: '123 456 7890',
          surname: 'SMITH',
          forenames: 'John',
          title: 'Mr',
          address_line1: '10 High Street',
          address_line2: 'Cardiff',
          address_line3: '',
          address_line4: 'CF10 1AB',
          crn: '112233445',
          date_of_birth: '1965-03-15',
          sex: 'Male',
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          uuid: '32345678-1234-1234-1234-123456789012',
          version: 1,
          nhs_number: '234 567 8901',
          surname: 'JOHNSON',
          forenames: 'Mary',
          title: 'Mrs',
          address_line1: '5 Queen Road',
          address_line2: 'Swansea',
          address_line3: '',
          address_line4: 'SA1 2CD',
          crn: '223344556',
          date_of_birth: '1958-07-22',
          sex: 'Female',
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          uuid: '42345678-1234-1234-1234-123456789012',
          version: 1,
          nhs_number: '345 678 9012',
          surname: 'WILLIAMS',
          forenames: 'Robert',
          title: 'Mr',
          address_line1: '12 Church Lane',
          address_line2: 'Newport',
          address_line3: '',
          address_line4: 'NP19 3EF',
          crn: '334455667',
          date_of_birth: '1972-11-08',
          sex: 'Male',
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(key, JSON.stringify(data));
    }

    if (this.table === 'forms_index_current') {
      // forms_index_current should load the latest version of forms from forms_index key
      const forms = JSON.parse(localStorage.getItem('sb_forms_index') || '[]');
      const grouped: Record<string, any> = {};
      forms.forEach((f: any) => {
        if (!grouped[f.form_uuid] || grouped[f.form_uuid].form_version < f.form_version) {
          grouped[f.form_uuid] = f;
        }
      });
      data = Object.values(grouped);
    }

    return data;
  }

  then(resolve: (value: any) => void) {
    let data = this.getData();

    // Apply filters
    for (const filter of this.filters) {
      data = data.filter(filter);
    }

    // Apply ordering
    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAscending;
      data.sort((a: any, b: any) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    // Handle single
    let result = data;
    if (this.isSingle) {
      result = data.length > 0 ? data[0] : null;
    }

    resolve({ data: result, error: null });
    return this;
  }

  async insert(items: any | any[]) {
    const key = `sb_${this.table}`;
    const currentData = JSON.parse(localStorage.getItem(key) || '[]');
    const itemsToAdd = Array.isArray(items) ? items : [items];

    itemsToAdd.forEach((item: any) => {
      if (!item.id) {
        item.id = currentData.length + 1;
      }
      currentData.push(item);
    });

    localStorage.setItem(key, JSON.stringify(currentData));
    return { data: items, error: null };
  }
}

export function createClient(url: string, key: string) {
  return {
    from: (table: string) => {
      return new SupabaseQueryBuilder(table);
    }
  };
}
