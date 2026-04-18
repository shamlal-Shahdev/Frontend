import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { reverseGeocode, searchPlace, MAX_LOCATION_LEN } from '@/lib/nominatim';
import { useToast } from '@/hooks/use-toast';
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const defaultLat =
  Number(import.meta.env.VITE_MAP_DEFAULT_LAT) || 24.8607;
const defaultLng =
  Number(import.meta.env.VITE_MAP_DEFAULT_LNG) || 67.0011;
function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 14));
  }, [center[0], center[1], map]);
  return null;
}
export interface InstallationLocationPickerProps {
  location: string;
  onLocationChange: (value: string) => void;
  latitude: number | null;
  longitude: number | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}
export function InstallationLocationPicker({
  location,
  onLocationChange,
  latitude,
  longitude,
  onCoordinatesChange,
  disabled = false,
}: InstallationLocationPickerProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number]>(() => {
    if (latitude != null && longitude != null) {
      return [latitude, longitude];
    }
    return [defaultLat, defaultLng];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitialGeocode = useRef(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted || didInitialGeocode.current) return;
    if (location.trim() || (latitude != null && longitude != null)) return;
    didInitialGeocode.current = true;
    let cancelled = false;
    (async () => {
      const name = await reverseGeocode(defaultLat, defaultLng);
      if (cancelled) return;
      onCoordinatesChange(defaultLat, defaultLng);
      if (name) onLocationChange(name);
      else
        onLocationChange(`${defaultLat.toFixed(5)}, ${defaultLng.toFixed(5)}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, location, latitude, longitude, onLocationChange, onCoordinatesChange]);
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMarkerPos([latitude, longitude]);
    }
  }, [latitude, longitude]);
  const runReverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setGeocoding(true);
        const name = await reverseGeocode(lat, lng);
        setGeocoding(false);
        onCoordinatesChange(lat, lng);
        if (name) {
          onLocationChange(name);
        } else {
          onLocationChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          toast({
            title: 'Address not found',
            description:
              'Coordinates saved; you can edit the text below if needed.',
            variant: 'destructive',
          });
        }
      }, 650);
    },
    [onLocationChange, onCoordinatesChange, toast],
  );
  const handleSearch = async () => {
    if (!searchQuery.trim() || disabled) return;
    setSearching(true);
    const hit = await searchPlace(searchQuery);
    setSearching(false);
    if (!hit) {
      toast({
        title: 'No results',
        description: 'Try a different place name or move the pin on the map.',
        variant: 'destructive',
      });
      return;
    }
    setMarkerPos([hit.lat, hit.lon]);
    onLocationChange(hit.displayName);
    onCoordinatesChange(hit.lat, hit.lon);
  };
  if (!mounted) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 h-[280px] flex items-center justify-center text-sm text-gray-500">
        Loading map…
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="mapSearch" className="sr-only">
            Search place
          </Label>
          <Input
            id="mapSearch"
            placeholder="Search city, area, or address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || searching}
          onClick={handleSearch}
          className="shrink-0"
        >
          <Search className="w-4 h-4 mr-2" />
          {searching ? 'Searching…' : 'Search'}
        </Button>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-200 relative z-0">
        <MapContainer
          center={markerPos}
          zoom={13}
          className="h-[280px] w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo center={markerPos} />
          <Marker
            position={markerPos}
            draggable={!disabled}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const p = m.getLatLng();
                setMarkerPos([p.lat, p.lng]);
                runReverseGeocode(p.lat, p.lng);
              },
            }}
          />
        </MapContainer>
        {geocoding && (
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-center">
            <span className="text-xs bg-white/90 px-2 py-1 rounded shadow border">
              Resolving address…
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="installationAddress">Address</Label>
        <Textarea
          id="installationAddress"
          rows={3}
          maxLength={MAX_LOCATION_LEN}
          value={location}
          onChange={(e) =>
            onLocationChange(e.target.value.slice(0, MAX_LOCATION_LEN))
          }
          disabled={disabled || geocoding}
          placeholder={
            geocoding
              ? 'Looking up address…'
              : 'Search or drag the pin — the address fills in here (you can edit it).'
          }
          className="resize-y min-h-[80px]"
        />
      </div>
    </div>
  );
}
