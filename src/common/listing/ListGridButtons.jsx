import { useMemo } from 'react';

const ListGridButtons = ({ viewMode = 'grid', onViewModeChange, className = 'me-4' }) => {
  const isListView = useMemo(() => viewMode === 'list', [viewMode]);

  return (
    <div className={`list-grid d-flex align-items-center gap-2 ${className}`}>
      <button
        type="button"
        className={`list-grid__button grid-button text-body ${!isListView ? 'active' : ''}`}
        onClick={() => onViewModeChange?.('grid')}
        aria-label="Show properties in grid view"
        aria-pressed={!isListView}
      >
        <i className="fas fa-th-large" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        className={`list-grid__button list-button text-body ${isListView ? 'active' : ''}`}
        onClick={() => onViewModeChange?.('list')}
        aria-label="Show properties in list view"
        aria-pressed={isListView}
      >
        <i className="fas fa-list" aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default ListGridButtons;
