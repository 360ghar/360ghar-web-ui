/**
 * The 360 apps and their store pages: the one source for every store link on the site
 * (badges, the /app page, the footer, JSON-LD, the QR code). Set `ios` to the App Store URL
 * the day the 360Ghar iPhone app goes live; until then it stays null and no iOS badge shows.
 */
export const APPS = {
  ghar360: {
    name: '360Ghar',
    play: 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360',
    ios: null as string | null,
    bundleId: 'com.the360ghar.ghar360',
  },
  flatmates: {
    name: '360 FlatMates',
    play: 'https://play.google.com/store/apps/details?id=com.the360ghar.flatmates360',
    ios: 'https://apps.apple.com/in/app/360-flatmates/id6771899300' as string | null,
    itunesId: '6771899300',
  },
};

export type AppKey = keyof typeof APPS;
export const APP_KEYS = Object.keys(APPS) as AppKey[];

/** The Google Play page of the 360Ghar app. */
export const PLAY_STORE = APPS.ghar360.play;
