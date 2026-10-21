import { useEffect, useState, type ReactNode } from 'react';

/** Renders children only after `ms` (default 150). Use it for skeletons. */
export function Delayed({ ms = 150, children }: { ms?: number; children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return show ? <>{children}</> : null;
}

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden="true" className={`skeleton ${className}`} style={style} />;
}
