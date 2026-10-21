/** Root of a data hub island: the shared query client and the error boundary. */
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { QueryProvider } from '@/lib/query';
import { IslandBoundary } from '@/ui/react/IslandBoundary';

export function Island({ locale, compact, children }: { locale: Locale; compact?: boolean; children: ReactNode }) {
  return (
    <QueryProvider>
      <IslandBoundary locale={locale} compact={compact}>
        {children}
      </IslandBoundary>
    </QueryProvider>
  );
}
