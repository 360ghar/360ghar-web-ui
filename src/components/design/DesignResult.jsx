import { useCallback }  from 'react';

/**
 * DesignResult - Display generated image with actions
 */
const DesignResult = ({
  imageUrl,
  prompt,
  settings,
  onRegenerate,
  onSaveToGallery,
  onReset,
  isSaved = false,
}) => {
  const handleDownload = useCallback(() => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `360ghar-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  const handleShare = useCallback(async () => {
    if (!imageUrl || !navigator.share) return;

    try {
      // Convert data URL to blob for sharing
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'design.png', { type: 'image/png' });

      await navigator.share({
        title: '360Ghar AI Design',
        text: 'Check out this AI-generated design!',
        files: [file],
      });
    } catch {
      // User cancelled or share failed
    }
  }, [imageUrl]);

  return (
    <div className="design-result">
      <div className="result-header mb-4">
        <h3 className="result-title">
          <i className="fas fa-check-circle text-success me-2"></i>
          Design Generated!
        </h3>
        <p className="result-subtitle text-muted">
          Your AI-powered design is ready. Download, save, or generate a new variation.
        </p>
      </div>

      <div className="result-image-container">
        <img
          src={imageUrl}
          alt="AI Generated Design"
          className="result-image"
        />
      </div>

      {/* Settings summary */}
      {settings && (
        <div className="result-settings mt-3">
          <div className="settings-badges">
            {settings.designType && (
              <span className="badge bg-light text-dark me-2">
                <i className="fas fa-palette me-1"></i>
                {settings.designType === 'interior' ? 'Interior' : 'Exterior'}
              </span>
            )}
            {settings.roomType && (
              <span className="badge bg-light text-dark me-2">
                <i className="fas fa-cube me-1"></i>
                {settings.roomType}
              </span>
            )}
            {settings.style && (
              <span className="badge bg-light text-dark me-2">
                <i className="fas fa-paint-brush me-1"></i>
                {settings.style}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="result-actions mt-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <button
            onClick={handleDownload}
            className="btn btn-main"
          >
            <i className="fas fa-download me-2"></i>
            Download
          </button>

          <button
            onClick={onSaveToGallery}
            className="btn btn-outline-main"
            disabled={isSaved}
          >
            {isSaved ? (
              <>
                <i className="fas fa-check me-2"></i>
                Saved
              </>
            ) : (
              <>
                <i className="fas fa-bookmark me-2"></i>
                Save to Gallery
              </>
            )}
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="btn btn-outline-secondary"
            >
              <i className="fas fa-share-alt me-2"></i>
              Share
            </button>
          )}

          <button
            onClick={onRegenerate}
            className="btn btn-outline-secondary"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Regenerate
          </button>

          <button
            onClick={onReset}
            className="btn btn-outline-secondary"
          >
            <i className="fas fa-redo me-2"></i>
            New Design
          </button>
        </div>
      </div>

      {/* Prompt used */}
      {prompt && (
        <div className="result-prompt mt-4">
          <details className="prompt-details">
            <summary className="text-muted small">
              <i className="fas fa-info-circle me-1"></i>
              View prompt used
            </summary>
            <div className="prompt-text bg-light p-3 rounded mt-2">
              <code>{prompt}</code>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default DesignResult;
