import { publicApi } from './api';

const normalizePagePayload = (rawPayload) => {
  if (!rawPayload) return null;
  if (rawPayload.data) {
    if (rawPayload.data.page) {
      return rawPayload.data.page;
    }
    return rawPayload.data;
  }
  return rawPayload;
};

export const pageService = {
  getPublicPage: async (uniqueName) => {
    if (!uniqueName) {
      throw new Error('uniqueName is required to fetch a public page');
    }

    const response = await publicApi.get(`/pages/${uniqueName}/public`);
    return normalizePagePayload(response?.data) ?? null;
  },

  getManyPublicPages: async (uniqueNames = []) => {
    if (!Array.isArray(uniqueNames)) {
      throw new Error('uniqueNames must be an array');
    }

    const settledResults = await Promise.allSettled(
      uniqueNames.map((name) => pageService.getPublicPage(name))
    );

    return settledResults.reduce((accumulator, result, index) => {
      const slug = uniqueNames[index];
      if (result.status === 'fulfilled') {
        accumulator[slug] = { page: result.value, error: null };
      } else {
        accumulator[slug] = { page: null, error: result.reason };
      }
      return accumulator;
    }, {});
  },
};

