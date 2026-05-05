import { api, publicApi } from './api';

export const dataHubService = {
  // ─── CIRCLE RATES ────────────────────────────────────────────────────────
  getCircleRates: (params = {}) =>
    publicApi.get('/data-hub/circle-rates', { params }).then(r => r.data),

  getCircleRateSectors: () =>
    publicApi.get('/data-hub/circle-rates/sectors').then(r => r.data),

  getCircleRateBySlug: (slug) =>
    publicApi.get(`/data-hub/circle-rates/${slug}`).then(r => r.data),

  calculateStampDuty: (data) =>
    publicApi.post('/data-hub/calculator/stamp-duty', data).then(r => r.data),

  // ─── RERA PROJECTS ────────────────────────────────────────────────────────
  getReraProjects: (params = {}) =>
    publicApi.get('/data-hub/rera-projects', { params }).then(r => r.data),

  getReraProject: (reraNumber) =>
    publicApi.get(`/data-hub/rera-projects/${reraNumber}`).then(r => r.data),

  verifyRera: (reraNumber) =>
    publicApi.get(`/data-hub/rera-projects/verify/${reraNumber}`).then(r => r.data),

  // ─── AUCTIONS ─────────────────────────────────────────────────────────────
  getAuctions: (params = {}) =>
    publicApi.get('/data-hub/auctions', { params }).then(r => r.data),

  getAuction: (id) =>
    publicApi.get(`/data-hub/auctions/${id}`).then(r => r.data),

  getAuctionBanks: () =>
    publicApi.get('/data-hub/auctions/banks').then(r => r.data),

  getAuctionCities: () =>
    publicApi.get('/data-hub/auctions/cities').then(r => r.data),

  getAuctionSourceCategories: () =>
    publicApi.get('/data-hub/auctions/source-categories').then(r => r.data),

  // Alert CRUD (auth required)
  createAuctionAlert: (data) =>
    api.post('/data-hub/auctions/alerts', data).then(r => r.data),

  getMyAuctionAlerts: () =>
    api.get('/data-hub/auctions/alerts/me').then(r => r.data),

  updateAuctionAlert: (id, data) =>
    api.put(`/data-hub/auctions/alerts/${id}`, data).then(r => r.data),

  deleteAuctionAlert: (id) =>
    api.delete(`/data-hub/auctions/alerts/${id}`),

  // ─── BANK RATES ───────────────────────────────────────────────────────────
  getBankRates: (params = {}) =>
    publicApi.get('/data-hub/bank-rates', { params }).then(r => r.data),

  // ─── JAMABANDI ────────────────────────────────────────────────────────────
  getJamabandiCaptcha: () =>
    api.get('/data-hub/jamabandi/captcha', { responseType: 'blob' }).then(r => r.data),

  lookupJamabandi: (data) =>
    api.post('/data-hub/jamabandi/lookup', data).then(r => r.data),

  // ─── ZONING ───────────────────────────────────────────────────────────────
  getZoningData: (params = {}) =>
    publicApi.get('/data-hub/zoning', { params }).then(r => r.data),

  getZoningBySlug: (slug) =>
    publicApi.get(`/data-hub/zoning/${slug}`).then(r => r.data),

  getZoningSectors: () =>
    publicApi.get('/data-hub/zoning/sectors').then(r => r.data),

  getColonyApprovals: (params = {}) =>
    publicApi.get('/data-hub/colony-approvals', { params }).then(r => r.data),

  // ─── GAZETTE ──────────────────────────────────────────────────────────────
  getGazetteNotifications: (params = {}) =>
    publicApi.get('/data-hub/gazette', { params }).then(r => r.data),

  getGazetteDetail: (id) =>
    publicApi.get(`/data-hub/gazette/${id}`).then(r => r.data),

  // ─── BUILDERS ─────────────────────────────────────────────────────────────
  getBuilders: (params = {}) =>
    publicApi.get('/data-hub/builders', { params }).then(r => r.data),

  getBuilder: (slug) =>
    publicApi.get(`/data-hub/builders/${slug}`).then(r => r.data),

  // ─── NEIGHBOURHOOD ────────────────────────────────────────────────────────
  getNeighbourhoodScore: (listingId) =>
    publicApi.get(`/data-hub/neighbourhood/${listingId}`).then(r => r.data),
};

