import { api, attempt } from '@/lib/api/client';

/** GET /pages/{name}/public. Never throws. Note: each call adds 1 to the page's view_count. */
export function loadPage(name: string) {
  return attempt(api.GET('/api/v1/pages/{unique_name}/public', { params: { path: { unique_name: name } } }));
}
