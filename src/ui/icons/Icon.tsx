import { brands, icons, type BrandName, type IconName } from './paths';

type Props = {
  name: IconName | `brand:${BrandName}`;
  size?: number;
  /** Accessible name. Without it the icon is decorative. */
  label?: string;
  className?: string;
};

export function Icon({ name, size = 20, label, className }: Props) {
  const d = name.startsWith('brand:') ? brands[name.slice(6) as BrandName] : icons[name as IconName];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ flex: 'none', display: 'inline-block', verticalAlign: 'middle' }}
      fill="currentColor"
      fillRule="evenodd"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
