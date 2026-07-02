export function calculateBmi(heightCm: string | number, weightKg: string | number): number | null {
  const height = Number(heightCm);
  const weight = Number(weightKg);
  if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) return null;
  const heightM = height / 100;
  return Math.round(weight / (heightM * heightM));
}
