export type ApplianceId =
  | 'fan'
  | 'tubelight'
  | 'ledBulb'
  | 'ledTv'
  | 'refrigerator'
  | 'washingMachine'
  | 'iron'
  | 'splitAc'
  | 'microwave'
  | 'computerLaptop';
export interface ApplianceTypeOption {
  key: string;
  label: string;
  /** 0 = user must enter watts (custom) */
  watts: number;
}
export interface ApplianceDefinition {
  id: ApplianceId;
  label: string;
  types: ApplianceTypeOption[];
}
export const LOAD_APPLIANCES: ApplianceDefinition[] = [
  {
    id: 'fan',
    label: 'Fan',
    types: [
      { key: 'ac_fan', label: 'AC fan', watts: 110 },
      { key: 'dc_fan', label: 'DC fan', watts: 55 },
      { key: 'inverter_fan', label: 'Inverter fan', watts: 30 },
    ],
  },
  {
    id: 'tubelight',
    label: 'Tube light',
    types: [
      { key: 'w36', label: '36W', watts: 36 },
      { key: 'w40', label: '40W', watts: 40 },
      { key: 'w60', label: '60W', watts: 60 },
    ],
  },
  {
    id: 'ledBulb',
    label: 'LED bulb',
    types: [
      { key: 'w5', label: '5W', watts: 5 },
      { key: 'w7', label: '7W', watts: 7 },
      { key: 'w12', label: '12W', watts: 12 },
      { key: 'w15', label: '15W', watts: 15 },
      { key: 'w18', label: '18W', watts: 18 },
    ],
  },
  {
    id: 'ledTv',
    label: 'LED TV',
    types: [
      { key: 'tv32', label: '32"', watts: 41 },
      { key: 'tv42', label: '42"', watts: 57 },
      { key: 'tv55', label: '55"', watts: 80 },
      { key: 'tv65', label: '65"', watts: 100 },
      { key: 'tv75', label: '75"', watts: 115 },
    ],
  },
  {
    id: 'refrigerator',
    label: 'Refrigerator',
    types: [
      { key: 'inverter', label: 'Inverter refrigerator', watts: 350 },
      { key: 'ac', label: 'AC refrigerator', watts: 780 },
    ],
  },
  {
    id: 'washingMachine',
    label: 'Washing machine',
    types: [
      { key: 'inverter', label: 'Inverter washing machine', watts: 500 },
      { key: 'ac', label: 'AC washing machine', watts: 1200 },
    ],
  },
  {
    id: 'iron',
    label: 'Iron',
    types: [
      { key: 'plastic_body', label: 'Plastic body', watts: 800 },
      { key: 'metal_body', label: 'Metal body', watts: 1200 },
    ],
  },
  {
    id: 'splitAc',
    label: 'Split AC',
    types: [
      { key: 'ton1', label: '1 ton', watts: 1250 },
      { key: 'ton15', label: '1.5 ton', watts: 2000 },
      { key: 'ton2', label: '2 ton', watts: 2500 },
    ],
  },
  {
    id: 'microwave',
    label: 'Microwave',
    types: [
      { key: 'standard', label: 'Standard', watts: 1500 },
    ],
  },
  {
    id: 'computerLaptop',
    label: 'Computer / laptop',
    types: [
      { key: 'computer', label: 'Computer', watts: 250 },
      { key: 'laptop', label: 'Laptop', watts: 100 },
    ],
  },
];
export interface LoadRowState {
  applianceId: ApplianceId;
  typeKey: string;
  watts: string;
  qty: string;
}
export function createInitialLoadRows(): LoadRowState[] {
  return LOAD_APPLIANCES.map((def) => {
    const first = def.types[0];
    return {
      applianceId: def.id,
      typeKey: first.key,
      watts: first.watts > 0 ? String(first.watts) : '',
      qty: '',
    };
  });
}
export function getTypeOption(
  applianceId: ApplianceId,
  typeKey: string,
): ApplianceTypeOption | undefined {
  const def = LOAD_APPLIANCES.find((a) => a.id === applianceId);
  return def?.types.find((t) => t.key === typeKey);
}
/** Subtotal watts for one row (0 if invalid). */
export function lineTotalWatts(row: LoadRowState): number {
  const w = parseFloat(row.watts);
  const q = parseInt(row.qty, 10);
  if (Number.isNaN(w) || w < 0 || Number.isNaN(q) || q < 0) return 0;
  return w * q;
}
export function totalLoadWatts(rows: LoadRowState[]): number {
  return rows.reduce((sum, r) => sum + lineTotalWatts(r), 0);
}
/** Peak kW if all listed loads ran at once (simplified). */
export function totalLoadKw(rows: LoadRowState[]): number {
  return totalLoadWatts(rows) / 1000;
}
/** Typical mono panel rating (W) for rough count — illustrative only. */
export const DEFAULT_PANEL_WATTS = 550;
export const PANEL_WATTAGE_OPTIONS = [540, 545, 550, 570, 660] as const;
export function estimateSolarPanelCount(
  kwDc: number,
  panelWatts: number = DEFAULT_PANEL_WATTS,
): number {
  if (!kwDc || kwDc <= 0) return 0;
  const validPanelWatts = panelWatts > 0 ? panelWatts : DEFAULT_PANEL_WATTS;
  return Math.max(1, Math.ceil((kwDc * 1000) / validPanelWatts));
}
