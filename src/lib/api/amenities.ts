import { api, call } from './client';
import { collectPages } from './pages';
import type { Amenity } from './types';

/** The amenity catalog (`GET /api/v1/amenities`) is a `CursorPage`: 20 rows by default, 100 at most per page, so every page is read. */
export const fetchAmenities = (): Promise<Amenity[]> =>
  collectPages((cursor) => call(api.GET('/api/v1/amenities', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } })));
