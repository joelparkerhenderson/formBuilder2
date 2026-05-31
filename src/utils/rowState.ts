export interface RowWithId {
  id: number;
}

export const getNextRowId = <T extends RowWithId>(rows: T[]) =>
  Math.max(0, ...rows.map((row) => row.id)) + 1;

export const appendRow = <T extends RowWithId>(
  rows: T[],
  createRow: (id: number) => T,
) => [...rows, createRow(getNextRowId(rows))];

export const removeRowIfMultiple = <T extends RowWithId>(rows: T[], id: number) =>
  rows.length > 1 ? rows.filter((row) => row.id !== id) : rows;

export const updateRowById = <T extends RowWithId>(
  rows: T[],
  id: number,
  updateRow: (row: T) => T,
) => rows.map((row) => (row.id === id ? updateRow(row) : row));
