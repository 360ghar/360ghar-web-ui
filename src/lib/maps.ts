/**
 * Google Maps JS loader (Places API New). Loads once, on first use, so pages
 * that never touch a map or the place search never download it.
 */
type Google = typeof globalThis & { google?: { maps: { importLibrary: (name: string) => Promise<unknown> } } };

let loading: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  const key = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) return Promise.reject(new Error('PUBLIC_GOOGLE_MAPS_API_KEY is not set'));
  if ((globalThis as unknown as { google?: { maps?: { importLibrary?: unknown } } }).google?.maps?.importLibrary) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const cb = `__gmaps_${Date.now()}`;
    (window as unknown as Record<string, () => void>)[cb] = () => resolve();
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&region=IN&language=en&callback=${cb}`;
    s.async = true;
    s.onerror = () => {
      loading = null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.append(s);
  });
  return loading;
}

export async function importLibrary<T>(name: 'places' | 'maps' | 'marker' | 'core'): Promise<T> {
  await loadMaps();
  return (globalThis as Google).google!.maps.importLibrary(name) as Promise<T>;
}

export type PlaceHit = { id: string; main: string; secondary: string; prediction: unknown };
export type Place = { lat: number; lng: number; name: string };

type PlacesLib = {
  AutocompleteSessionToken: new () => unknown;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (req: Record<string, unknown>) => Promise<{
      suggestions: {
        placePrediction: {
          placeId: string;
          mainText?: { text: string };
          secondaryText?: { text: string };
          text: { text: string };
          toPlace: () => { fetchFields: (o: { fields: string[] }) => Promise<void>; location?: { lat: () => number; lng: () => number }; formattedAddress?: string; displayName?: string };
        } | null;
      }[];
    }>;
  };
};

let token: unknown = null;

/** Suggestions biased to Gurugram, limited to India. */
export async function suggestPlaces(input: string): Promise<PlaceHit[]> {
  const lib = await importLibrary<PlacesLib>('places');
  token ??= new lib.AutocompleteSessionToken();
  const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken: token,
    includedRegionCodes: ['in'],
    locationBias: { center: { lat: 28.4595, lng: 77.0266 }, radius: 50000 },
  });
  return suggestions
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 6)
    .map((p) => ({ id: p.placeId, main: p.mainText?.text ?? p.text.text, secondary: p.secondaryText?.text ?? '', prediction: p }));
}

export async function resolvePlace(hit: PlaceHit): Promise<Place | null> {
  const p = hit.prediction as { toPlace: () => { fetchFields: (o: { fields: string[] }) => Promise<void>; location?: { lat: () => number; lng: () => number }; displayName?: string; formattedAddress?: string } };
  const place = p.toPlace();
  await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] });
  token = null; // A session ends when a place is picked.
  if (!place.location) return null;
  return { lat: place.location.lat(), lng: place.location.lng(), name: hit.main };
}
