export function compareFormStatesObj(objA: Record<string, unknown> | null | undefined, objB: Record<string, unknown> | null | undefined): boolean {
  const stateA = objA || {};
  const stateB = objB || {};
  const allKeys = Array.from(new Set([...Object.keys(stateA), ...Object.keys(stateB)]));
  const cleanedA: Record<string, unknown> = {};
  const cleanedB: Record<string, unknown> = {};

  for (const key of allKeys) {
    if (key === 'uuid') continue;
    cleanedA[key] = cleanValue(stateA[key]);
    cleanedB[key] = cleanValue(stateB[key]);
  }

  return JSON.stringify(cleanedA) === JSON.stringify(cleanedB);
}

export function cleanArrayOfObjects<T extends Record<string, unknown>>(rows: T[] | null | undefined, fields: string[]): Record<string, unknown>[] {
  if (!rows) return [];
  return rows.map((row) => {
    const cleaned: Record<string, unknown> = {};
    for (const field of fields) cleaned[field] = cleanValue(row?.[field]);
    return cleaned;
  });
}

function cleanValue(value: unknown): unknown {
  if (Array.isArray(value)) return [...value].map(cleanValue).sort();
  if (value === null || value === undefined) return '';
  return value;
}
