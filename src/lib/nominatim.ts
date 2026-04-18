import { api } from '@/api/axios.config';

const MAX_LOCATION_LEN = 500;

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  try {
    const { data } = await api.get<{ displayName: string | null }>(
      '/geocode/reverse',
      { params: { lat, lon } },
    );
    const name = data.displayName;
    return name ? name.slice(0, MAX_LOCATION_LEN) : null;
  } catch {
    return null;
  }
}

export async function searchPlace(query: string): Promise<{
  lat: number;
  lon: number;
  displayName: string;
} | null> {
  const q = query.trim();
  if (q.length < 2) return null;
  try {
    const { data } = await api.get<{
      lat: number | null;
      lon: number | null;
      displayName: string | null;
    }>('/geocode/search', { params: { q } });
    if (
      data.displayName == null ||
      data.lat == null ||
      data.lon == null ||
      !Number.isFinite(Number(data.lat)) ||
      !Number.isFinite(Number(data.lon))
    ) {
      return null;
    }
    return {
      lat: Number(data.lat),
      lon: Number(data.lon),
      displayName: data.displayName.slice(0, MAX_LOCATION_LEN),
    };
  } catch {
    return null;
  }
}

export { MAX_LOCATION_LEN };
