/**
 * Utility functions for form state tracking, normalization, and comparison.
 * Standardizes complex clinical form comparison logic to determine if a form has changed.
 */

/**
 * Normalizes and compares two nested formState objects.
 * Ignores the "uuid" property, treats null/undefined values as empty strings,
 * and sorts array values to ensure stable order-independent comparison.
 */
export const compareFormStatesObj = (objA: any, objB: any): boolean => {
  const sA = objA || {};
  const sB = objB || {};
  const allKeys = Array.from(new Set([...Object.keys(sA), ...Object.keys(sB)]));
  const resA: any = {};
  const resB: any = {};

  for (const key of allKeys) {
    if (key === "uuid") continue;

    let valA = sA[key];
    if (Array.isArray(valA)) {
      valA = [...valA].sort();
    } else if (valA === null || valA === undefined) {
      valA = "";
    }
    resA[key] = valA;

    let valB = sB[key];
    if (Array.isArray(valB)) {
      valB = [...valB].sort();
    } else if (valB === null || valB === undefined) {
      valB = "";
    }
    resB[key] = valB;
  }

  return JSON.stringify(resA) === JSON.stringify(resB);
};

/**
 * Normalizes an array of objects by extracting only defined fields and mapping
 * empty/null/undefined values cleanly to guarantee stable stringified comparison.
 */
export const cleanArrayOfObjects = (
  arr: any[] | undefined | null,
  fields: string[]
): any[] => {
  if (!arr) return [];
  return arr.map((item: any) => {
    const cleaned: any = {};
    for (const field of fields) {
      const val = item?.[field];
      if (typeof val === "boolean") {
        cleaned[field] = val;
      } else {
        cleaned[field] = val === null || val === undefined ? "" : val;
      }
    }
    return cleaned;
  });
};
