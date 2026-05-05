import './SectionLoader.css';

const SectionLoader = ({ height = '200px', type = 'default' }) => {
  if (type === 'card') {
    return (
      <div className="section-loader" style={{ height }} role="status" aria-label="Loading section content" aria-live="polite">
        <div className="section-loader__card">
          <div className="section-loader__card-image"></div>
          <div className="section-loader__card-content">
            <div className="section-loader__line section-loader__line--title"></div>
            <div className="section-loader__line section-loader__line--subtitle"></div>
            <div className="section-loader__line section-loader__line--text"></div>
            <div className="section-loader__line section-loader__line--text section-loader__line--short"></div>
            <div className="section-loader__card-footer">
              <div className="section-loader__line section-loader__line--button"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="section-loader" style={{ height }} role="status" aria-label="Loading section content" aria-live="polite">
        <div className="section-loader__list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="section-loader__list-item">
              <div className="section-loader__line section-loader__line--icon"></div>
              <div className="section-loader__line section-loader__line--title"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="section-loader" style={{ height }} role="status" aria-label="Loading section content" aria-live="polite">
        <div className="section-loader__stats">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="section-loader__stat-item">
              <div className="section-loader__line section-loader__line--number"></div>
              <div className="section-loader__line section-loader__line--label"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'cta') {
    return (
      <div className="section-loader" style={{ height }} role="status" aria-label="Loading section content" aria-live="polite">
        <div className="section-loader__cta">
          <div className="section-loader__line section-loader__line--title" style={{ width: '50%', margin: '0 auto' }}></div>
          <div className="section-loader__line section-loader__line--text" style={{ width: '70%', margin: '8px auto 0' }}></div>
          <div className="section-loader__line section-loader__line--button" style={{ margin: '16px auto 0' }}></div>
        </div>
      </div>
    );
  }

  // Default shimmer skeleton
  return (
    <div className="section-loader" style={{ height }} role="status" aria-label="Loading section content" aria-live="polite">
      <div className="section-loader__shimmer">
        <div className="section-loader__block section-loader__block--large"></div>
        <div className="section-loader__block section-loader__block--medium"></div>
        <div className="section-loader__block section-loader__block--small"></div>
      </div>
    </div>
  );
};

export default SectionLoader;
