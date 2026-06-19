import { useEffect } from 'react';

/**
 * AUDIT FIX (imp 5.3): reusable skeleton-screen primitive so callers can
 * replace generic spinners with skeleton blocks that match the content
 * layout, reducing perceived load time and layout shift.
 *
 * Usage:
 *   <Skeleton width="60%" height={20} />            // single line
 *   <Skeleton variant="circle" size={48} />         // avatar
 *   <SkeletonLines lines={3} />                     // paragraph block
 *   <SkeletonCard />                                // property card placeholder
 */
const baseStyle = {
  display: 'block',
  background:
    'linear-gradient(90deg, var(--bg-light, #f8f8f8) 25%, var(--border-color-light, #e0e6ed) 37%, var(--bg-light, #f8f8f8) 63%)',
  backgroundSize: '400% 100%',
  animation: 'skeleton-shimmer 1.4s ease infinite',
  borderRadius: '8px',
};

const keyframes = `@keyframes skeleton-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }`;

let keyframesInjected = false;

export function Skeleton({ width = '100%', height = 16, radius, style, className = '' }) {
  useEffect(() => {
    keyframesInjected = true;
  }, []);

  return (
    <>
      {!keyframesInjected && <style>{keyframes}</style>}
      <span
        className={`skeleton ${className}`}
        style={{ ...baseStyle, width, height, borderRadius: radius, ...style }}
        aria-hidden="true"
      />
    </>
  );
}

export function SkeletonCircle({ size = 48, style, className = '' }) {
  return (
    <Skeleton
      width={size}
      height={size}
      radius="50%"
      className={className}
      style={style}
    />
  );
}

export function SkeletonLines({ lines = 3, lineHeight = 16, gap = 8, className = '' }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`skeleton-card ${className}`}
      style={{
        background: 'var(--bg-white, #fff)',
        border: '1px solid var(--border-color-light, #e0e6ed)',
        borderRadius: '18px',
        padding: '16px',
        boxShadow: '0 12px 24px rgba(16, 24, 40, 0.04)',
      }}
      aria-hidden="true"
    >
      <Skeleton height={160} radius="12px" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="50%" />
        <Skeleton height={14} width="40%" />
      </div>
    </div>
  );
}

export default Skeleton;
