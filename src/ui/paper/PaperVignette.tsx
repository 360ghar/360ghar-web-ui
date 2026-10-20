import { vignetteArt, type VignetteTheme } from '@/lib/paper/vignettes';
import { PaperArt } from './PaperArt';

type Props = {
  theme: VignetteTheme;
  seed?: string;
  frame?: 'cut' | 'square' | 'none';
  fit?: 'meet' | 'slice';
  label?: string;
  className?: string;
  /** Draw this art's own filters (for a standalone file without the page's PaperDefs). */
  ownFilters?: boolean;
};

/** React twin of PaperVignette.astro, for islands. */
export function PaperVignette({ theme, seed = '1', frame = 'cut', fit = 'meet', label, className, ownFilters }: Props) {
  return (
    <PaperArt {...vignetteArt(theme, seed, frame)} fit={fit} label={label} className={className} ownFilters={ownFilters} />
  );
}
