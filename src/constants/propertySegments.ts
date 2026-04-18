export type PropertySegmentValue =
  | 'residential_small'
  | 'residential_medium'
  | 'residential_large'
  | 'commercial_small'
  | 'commercial_large'
  | 'industrial';

/** Install form: three user-facing types mapped to residential segment bounds. */
export const USER_PROPERTY_TYPE_OPTIONS: {
  value: PropertySegmentValue;
  label: string;
}[] = [
  { value: 'residential_small', label: 'Flat' },
  { value: 'residential_medium', label: 'House' },
  { value: 'residential_large', label: 'Institution / Office' },
];

export function normalizeInstallPropertySegment(
  segment: PropertySegmentValue,
): PropertySegmentValue {
  if (
    segment === 'residential_small' ||
    segment === 'residential_medium' ||
    segment === 'residential_large'
  ) {
    return segment;
  }
  return 'residential_medium';
}

export function installPropertyTypeLabel(segment: string): string {
  const row = USER_PROPERTY_TYPE_OPTIONS.find((o) => o.value === segment);
  if (row) return row.label;
  return PROPERTY_SEGMENTS.find((s) => s.value === segment)?.label || segment.replace(/_/g, ' ');
}

export const PROPERTY_SEGMENTS: {
  value: PropertySegmentValue;
  label: string;
  description: string;
  minKw: number;
  maxKw: number;
}[] = [
  {
    value: 'residential_small',
    label: 'Flat / small home',
    description: 'Typical apartments and compact homes',
    minKw: 2,
    maxKw: 15,
  },
  {
    value: 'residential_medium',
    label: 'Medium home (3–4 bedrooms / bungalow)',
    description: 'Larger homes and spacious bungalows',
    minKw: 5,
    maxKw: 30,
  },
  {
    value: 'residential_large',
    label: 'Large residential',
    description: 'Very large homes, farmhouses, small guest houses',
    minKw: 10,
    maxKw: 50,
  },
  {
    value: 'commercial_small',
    label: 'Small commercial',
    description: 'Shops, offices, small businesses',
    minKw: 20,
    maxKw: 200,
  },
  {
    value: 'commercial_large',
    label: 'Large commercial',
    description: 'Malls, warehouses, campuses',
    minKw: 50,
    maxKw: 500,
  },
  {
    value: 'industrial',
    label: 'Industrial',
    description: 'Factories and heavy industry',
    minKw: 100,
    maxKw: 5000,
  },
];
export function getBoundsForSegment(
  segment: PropertySegmentValue,
): { minKw: number; maxKw: number } {
  const row = PROPERTY_SEGMENTS.find((s) => s.value === segment);
  return row ? { minKw: row.minKw, maxKw: row.maxKw } : { minKw: 2, maxKw: 15 };
}
/** Rough suggested DC kW from average monthly consumption (kWh). Not a substitute for a site survey. */
export function estimateKwFromMonthlyUnits(monthlyKwh: number): number {
  if (!monthlyKwh || monthlyKwh <= 0) return 0;
  const annualKwh = monthlyKwh * 12;
  const equivalentHours = 365 * 4.5;
  return annualKwh / equivalentHours;
}
/** Very rough roof limit: ~2.5 kW per marla (Pakistan), capped by segment max externally. */
export function estimateKwFromMarla(marla: number): number {
  if (!marla || marla <= 0) return 0;
  return marla * 2.5;
}
