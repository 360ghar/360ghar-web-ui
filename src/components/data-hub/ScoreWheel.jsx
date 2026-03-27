import React from 'react';

/**
 * Animated circular score wheel (0-100).
 * Colors: green ≥70, amber 40-69, red <40
 */
const ScoreWheel = ({ score = 0, size = 120, label = 'Score' }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: size * 0.22, fontWeight: 700, fill: color }}>
          {pct}
        </text>
      </svg>
      <span style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</span>
    </div>
  );
};

export default ScoreWheel;
