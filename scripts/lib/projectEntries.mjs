import { projectCatalog } from '../../src/data/projectCatalog.js';

export function getProjectEntries() {
  return projectCatalog.map(({ id, slug, title }) => ({
    id,
    slug,
    title,
  }));
}
