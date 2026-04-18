import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LOAD_APPLIANCES,
  type LoadRowState,
  getTypeOption,
  lineTotalWatts,
  totalLoadWatts,
  totalLoadKw,
  estimateSolarPanelCount,
  DEFAULT_PANEL_WATTS,
  PANEL_WATTAGE_OPTIONS,
} from '@/constants/loadCalculator';
import {
  getBoundsForSegment,
  type PropertySegmentValue,
} from '@/constants/propertySegments';
interface LoadCalculatorSectionProps {
  rows: LoadRowState[];
  onRowsChange: (rows: LoadRowState[]) => void;
  propertySegment: PropertySegmentValue;
  onApplySuggestedKw: (kw: number) => void;
  disabled?: boolean;
}
export function LoadCalculatorSection({
  rows,
  onRowsChange,
  propertySegment,
  onApplySuggestedKw,
  disabled = false,
}: LoadCalculatorSectionProps) {
  const updateRow = (index: number, patch: Partial<LoadRowState>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onRowsChange(next);
  };
  const handleTypeChange = (
    index: number,
    applianceId: LoadRowState['applianceId'],
    typeKey: string,
  ) => {
    const opt = getTypeOption(applianceId, typeKey);
    const watts = opt && opt.watts > 0 ? String(opt.watts) : '';
    updateRow(index, { typeKey, watts });
  };
  const totalW = totalLoadWatts(rows);
  const totalKwPeak = totalLoadKw(rows);
  const [panelWatts, setPanelWatts] = useState<number>(DEFAULT_PANEL_WATTS);
  const { minKw, maxKw } = getBoundsForSegment(propertySegment);
  const suggestedKw =
    totalW <= 0
      ? 0
      : (() => {
          const est = totalKwPeak;
          return Math.round(Math.min(maxKw, Math.max(minKw, est)) * 10) / 10;
        })();
  const panelCount = suggestedKw > 0 ? estimateSolarPanelCount(suggestedKw, panelWatts) : 0;

  // Keep system size synced with selected load rows automatically.
  useEffect(() => {
    if (suggestedKw > 0) {
      onApplySuggestedKw(suggestedKw);
    }
  }, [suggestedKw, onApplySuggestedKw]);
  return (
    <div className="rounded-lg border border-dashed border-gray-200 p-4 space-y-4 bg-gray-50/80">
      <div className="space-y-3 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
        {LOAD_APPLIANCES.map((def) => {
          const index = rows.findIndex((r) => r.applianceId === def.id);
          if (index < 0) return null;
          const row = rows[index];
          const line = lineTotalWatts(row);
          return (
            <div
              key={def.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-gray-100 pb-3 last:border-0"
            >
              <div className="sm:col-span-3">
                <Label className="text-xs text-gray-600">{def.label}</Label>
                <Select
                  value={row.typeKey}
                  onValueChange={(v) => handleTypeChange(index, def.id, v)}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {def.types.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                        {t.watts > 0 ? ` (${t.watts} W)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`w-${def.id}`} className="text-xs text-gray-600">
                  Watts (each)
                </Label>
                <Input
                  id={`w-${def.id}`}
                  type="number"
                  min={0}
                  step={1}
                  className="h-9 mt-1"
                  placeholder="W"
                  value={row.watts}
                  onChange={(e) => updateRow(index, { watts: e.target.value })}
                  disabled
                  readOnly
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`q-${def.id}`} className="text-xs text-gray-600">
                  Quantity
                </Label>
                <Input
                  id={`q-${def.id}`}
                  type="number"
                  min={0}
                  step={1}
                  className="h-9 mt-1"
                  placeholder="0"
                  value={row.qty}
                  onChange={(e) => updateRow(index, { qty: e.target.value })}
                  disabled={disabled}
                />
              </div>
              <div className="sm:col-span-5 text-sm text-gray-700 flex items-center pb-2">
                {line > 0 ? (
                  <span>
                    Total: <strong>{line} W</strong>
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-gray-100 pb-3 last:border-0">
          <div className="sm:col-span-3">
            <Label htmlFor="panelWattage" className="text-xs text-gray-600">
              Solar plate
            </Label>
            <Select
              value={String(panelWatts)}
              onValueChange={(value) => setPanelWatts(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger id="panelWattage" className="h-9 mt-1 bg-white">
                <SelectValue placeholder="Select wattage" />
              </SelectTrigger>
              <SelectContent>
                {PANEL_WATTAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} W
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
        </div>
      </div>
      <div className="rounded-md bg-white border border-gray-200 p-3 space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <span className="text-gray-600">Total load: </span>
            <strong>{totalKwPeak.toFixed(2)} kW</strong>
          </span>
          <span>
            <span className="text-gray-600">System required: </span>
            <strong>{suggestedKw.toFixed(1)} kW</strong>
          </span>
          <span>
            <span className="text-gray-600">Plates required: </span>
            <strong>{panelCount}</strong>
          </span>
        </div>
        {totalW <= 0 && <p className="text-xs text-gray-500">Enter appliance quantity to estimate system.</p>}
      </div>
    </div>
  );
}
