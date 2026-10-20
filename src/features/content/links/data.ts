/**
 * Verified 360Ghar profiles from the old socialLinksData.js (`verified: true`
 * only; the 10 "coming soon" entries are left out). Order and groups as before.
 */
import type { BrandName } from '@/ui/icons/paths';

/** Brand marks missing from ui/icons/paths.ts, from Simple Icons v15 (CC0). */
export const EXTRA_BRANDS = {
  reddit: 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z',
  pinterest: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z',
  googleplay: 'M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z',
} as const;

export type LinkIcon = BrandName | keyof typeof EXTRA_BRANDS;
type SocialLink = { platform: string; url: string; handle: string; icon: LinkIcon; group: 'follow' | 'review' | 'app' };

export const LINKS: SocialLink[] = [
  { platform: 'Instagram', url: 'https://www.instagram.com/360ghar/', handle: '@360ghar', icon: 'instagram', group: 'follow' },
  { platform: 'Facebook', url: 'https://www.facebook.com/people/360-Ghar/61581822088042/', handle: '360 Ghar', icon: 'facebook', group: 'follow' },
  { platform: 'YouTube', url: 'https://www.youtube.com/@360Ghar', handle: '@360Ghar', icon: 'youtube', group: 'follow' },
  { platform: 'X (Twitter)', url: 'https://x.com/360Ghar', handle: '@360Ghar', icon: 'x', group: 'follow' },
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/360ghar/', handle: '360ghar', icon: 'linkedin', group: 'follow' },
  { platform: 'Reddit', url: 'https://www.reddit.com/user/360ghar/', handle: 'u/360ghar', icon: 'reddit', group: 'follow' },
  { platform: 'Pinterest', url: 'https://in.pinterest.com/360ghar/', handle: '@360ghar', icon: 'pinterest', group: 'follow' },
  { platform: 'Instagram (360 Flatmates)', url: 'https://www.instagram.com/360flatmates/', handle: '@360flatmates', icon: 'instagram', group: 'follow' },
  { platform: 'Google Business Profile', url: 'https://www.google.com/search?q=360Ghar+Reviews#lrd=0x390d172407f3e11f:0x1c1fef0917d13d5e,3,,,,', handle: 'Write a review', icon: 'google', group: 'review' },
  { platform: 'Google Play Store', url: 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360', handle: 'Write a review', icon: 'googleplay', group: 'review' },
  { platform: 'Google Play Store (360 Flatmates)', url: 'https://play.google.com/store/apps/details?id=com.the360ghar.flatmates360', handle: 'Write a review', icon: 'googleplay', group: 'review' },
  { platform: 'Android app', url: 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360', handle: '360Ghar on Google Play', icon: 'googleplay', group: 'app' },
  { platform: 'Android app (360 Flatmates)', url: 'https://play.google.com/store/apps/details?id=com.the360ghar.flatmates360', handle: '360 Flatmates on Google Play', icon: 'googleplay', group: 'app' },
];
