#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  indexableStaticRoutes,
  noindexPrerenderRoutes,
  seedLandingPrerenderRoutes,
  seedLocalityPrerenderRoutes,
} from '../src/seo/indexationPolicy.js';
import { siteMetadata } from '../src/seo/siteMetadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outFile = path.join(__dirname, 'prerender-routes.json');

const routeOverrides = new Map([
  ['/', {
    waitForSelector: 'main',
    waitForTitle: siteMetadata.defaultTitle,
  }],
  ['/properties', {
    waitForText: 'Verified Property Search in Gurugram',
    waitForTitle: 'Properties in Gurugram | AI-Powered Search & Verified Listings | 360Ghar',
  }],
  ['/blog', {
    waitForText: 'Real Estate Guides for Gurugram and Delhi NCR',
    waitForTitle: 'Real Estate Blog | 360Ghar Insights',
  }],
  ['/localities', {
    waitForText: 'Explore Gurugram Localities with Verified Insights',
    waitForTitle: 'Discover Localities in Gurugram | 360Ghar',
  }],
  ['/for-ai', {
    waitForText: 'For AI Assistants',
    waitForTitle: 'For AI Assistants | 360Ghar',
  }],
  ['/login', { waitForTitle: 'Login | 360Ghar' }],
  ['/register', { waitForTitle: 'Register | 360Ghar' }],
  ['/account', { waitForTitle: 'Account | 360Ghar' }],
  ['/delete-account', { waitForTitle: 'Account Deletion Request | 360Ghar' }],
  ['/add-new-listing', { waitForTitle: 'Add Listing | 360Ghar' }],
  ['/post-property', { waitForTitle: 'Post a Property | 360Ghar' }],
  ['/mcp/login', { waitForTitle: 'Connect AI Assistant | 360Ghar' }],
  ['/locality/dlf-phase-1-gurgaon', {
    waitForText: 'DLF Phase 1',
    waitForTitle: 'DLF Phase 1 Gurgaon | properties | 360Ghar',
  }],
  ['/locality/golf-course-road-gurgaon', {
    waitForText: 'Golf Course Road',
    waitForTitle: 'Golf Course Road Gurgaon | properties | 360Ghar',
  }],
  ['/locality/sushant-lok-1-gurgaon', {
    waitForText: 'Sushant Lok 1',
    waitForTitle: 'Sushant Lok 1 Gurgaon | properties | 360Ghar',
  }],
  ['/gurgaon/buy/flats', {
    waitForText: 'Why 360Ghar?',
    waitForTitle: 'Apartment for Buy in Gurgaon | Gurgaon Real Estate | 360Ghar',
  }],
  ['/gurgaon/rent/flats', {
    waitForText: 'Why 360Ghar?',
    waitForTitle: 'Apartment for Rent in Gurgaon | Gurgaon Real Estate | 360Ghar',
  }],
  ['/gurgaon/pg/flats', {
    waitForText: 'Why 360Ghar?',
    waitForTitle: 'PG in Gurgaon | Gurgaon Paying Guest & Co-living | 360Ghar',
  }],
  ['/delhi/buy/flats', {
    waitForText: 'Why 360Ghar?',
    waitForTitle: 'Apartment for Buy in Delhi | Delhi Real Estate | 360Ghar',
  }],
  ['/noida/rent/flats', {
    waitForText: 'Why 360Ghar?',
    waitForTitle: 'Apartment for Rent in Noida | Noida Real Estate | 360Ghar',
  }],
]);

function buildRouteConfig(route) {
  const override = routeOverrides.get(route);

  return {
    route,
    waitForSelector: 'main',
    ...(override || {}),
  };
}

function uniqueRoutes(routes) {
  return [...new Set(routes)];
}

const routes = uniqueRoutes([
  ...indexableStaticRoutes,
  ...noindexPrerenderRoutes,
  ...seedLocalityPrerenderRoutes,
  ...seedLandingPrerenderRoutes,
]).map(buildRouteConfig);

fs.writeFileSync(outFile, JSON.stringify(routes, null, 2), 'utf8');
console.log(`Wrote ${routes.length} prerender routes to ${outFile}`);
