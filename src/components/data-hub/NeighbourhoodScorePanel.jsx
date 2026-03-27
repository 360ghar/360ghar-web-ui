import React, { useEffect, useState } from 'react';
import ScoreWheel from './ScoreWheel';
import { dataHubService } from '../../services/dataHubService';

const CATEGORIES = ['transit', 'education', 'health', 'retail'];

const NeighbourhoodScorePanel = ({ listingId }) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    dataHubService.getNeighbourhoodScore(listingId)
      .then(setScore)
      .catch(() => setScore(null))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) return <div style={{ fontSize: 13, color: '#6b7280' }}>Loading neighbourhood score...</div>;
  if (!score) return null;

  const cats = score.category_scores || {};

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Neighbourhood Score</h4>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <ScoreWheel score={score.overall_score ?? 0} size={80} label="Overall" />
        {CATEGORIES.map((cat) => (
          <ScoreWheel key={cat} score={cats[cat] ?? 0} size={60}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)} />
        ))}
      </div>
    </div>
  );
};

export default NeighbourhoodScorePanel;
