import { useEffect, useState } from 'react';
import { initAuth, useAuthStore } from '@/features/auth/store';
import { describeError } from '@/lib/api/errors';
import { haptic } from '@/lib/haptics';
import type { Locale } from '@/lib/i18n/locale';
import { loginHref } from '@/features/auth/flows';
import { Icon } from '@/ui/icons/Icon';
import { toast } from '@/ui/react/Toaster';
import { loadFavourites, toggleFavourite, useFavourites } from './store';
import { IslandBoundary } from '@/ui/react/IslandBoundary';

type Props = { propertyId: number; locale?: Locale; initial?: boolean; variant?: 'overlay' | 'inline' };

const T = {
  en: { save: 'Save to shortlist', saved: 'Saved to your shortlist', removed: 'Removed from your shortlist', label: 'Saved' },
  hi: { save: 'शॉर्टलिस्ट में सेव करें', saved: 'आपकी शॉर्टलिस्ट में सेव हो गया', removed: 'शॉर्टलिस्ट से हटा दिया', label: 'सेव किया' },
};

function Button({ propertyId, locale = 'en', initial = false, variant = 'overlay' }: Props) {
  const t = T[locale];
  const liked = useFavourites((s) => s.liked.has(propertyId));
  const status = useAuthStore((s) => s.status);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initial) useFavourites.getState().set(propertyId, true);
    void loadFavourites();
  }, [initial, propertyId]);

  const onClick = async () => {
    if (pending) return;
    // A click before initAuth() settles is not a signed-out click: wait, then read the store again.
    if (status === 'unknown') await initAuth();
    if (useAuthStore.getState().status !== 'authed') {
      window.location.assign(loginHref(locale));
      return;
    }
    const on = !liked;
    setPending(true);
    try {
      await toggleFavourite(propertyId, on);
      haptic('tap');
      toast(on ? t.saved : t.removed, 'success', on ? undefined : { label: locale === 'hi' ? 'वापस लाएँ' : 'Undo', run: () => void toggleFavourite(propertyId, true).catch((e) => toast(describeError(e, locale).title, 'error')) });
    } catch (error) {
      toast(describeError(error, locale).title, 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={variant === 'overlay' ? 'btn btn-icon fav-overlay' : 'btn'}
      aria-pressed={liked}
      aria-label={t.save}
      aria-busy={pending || undefined}
      onClick={() => void onClick()}
    >
      <Icon name={liked ? 'heart-solid' : 'heart'} className={liked ? 'text-kesar-600' : undefined} />
      {variant === 'inline' ? <span>{liked ? t.label : t.save}</span> : null}
    </button>
  );
}

/** A crash hides the heart; the card around it keeps working. */
export default function FavouriteButton(props: Props) {
  return (
    <IslandBoundary locale={props.locale} fallback={null}>
      <Button {...props} />
    </IslandBoundary>
  );
}
