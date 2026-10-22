/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    locale: import('@/lib/i18n/locale').Locale;
  }
}

interface ImportMetaEnv {
  readonly API_ORIGIN?: string;
  readonly PUBLIC_API_BASE?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
  readonly PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  readonly PUBLIC_GA_ID?: string;
  readonly PUBLIC_AI_OWNER_TOOLS?: string;
}
