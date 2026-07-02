export function compareFormStatesObj(objA: Record<string, any> | null | undefined, objB: Record<string, any> | null | undefined): boolean {
  const stateA = objA || {};
  const stateB = objB || {};
  const allKeys = Array.from(new Set([...Object.keys(stateA), ...Object.keys(stateB)]));
  const cleanedA: Record<string, any> = {};
  const cleanedB: Record<string, any> = {};

  for (const key of allKeys) {
    if (key === 'uuid') continue;

    cleanedA[key] = cleanValue(stateA[key]);
    cleanedB[key] = cleanValue(stateB[key]);
  }

  return JSON.stringify(cleanedA) === JSON.stringify(cleanedB);
}

export function cleanArrayOfObjects<T extends Record<string, any>>(rows: T[] | null | undefined, fields: string[]): Record<string, any>[] {
  if (!rows) return [];
  return rows.map((row) => {
    const cleaned: Record<string, any> = {};
    for (const field of fields) {
      cleaned[field] = cleanValue(row?.[field]);
    }
    return cleaned;
  });
}

function cleanValue(value: any): any {
  if (Array.isArray(value)) return [...value].map(cleanValue).sort();
  if (value === null || value === undefined) return '';
  return value;
}
