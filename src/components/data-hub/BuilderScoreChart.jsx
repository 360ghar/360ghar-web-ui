import React from 'react';
import ScoreWheel from './ScoreWheel';

const BuilderScoreChart = ({ score = 0, totalProjects = 0, totalComplaints = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <ScoreWheel score={Math.round(score)} size={100} label="Builder Score" />
    <div>
      <p style={{ margin: 0, fontSize: 14 }}>
        <strong>{totalProjects}</strong> registered projects
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 14 }}>
        <strong>{totalComplaints}</strong> RERA complaints
      </p>
    </div>
  </div>
);

export default BuilderScoreChart;
