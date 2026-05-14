import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const WATERMARK_TEXT = '360Ghar.com';

const addWatermarkToImage = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(16, Math.round(canvas.width * 0.025));
      ctx.font = `bold ${fontSize}px "Josefin Sans", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const padding = fontSize * 1.2;
      const x = canvas.width - padding;
      const y = canvas.height - padding;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const textWidth = ctx.measureText(WATERMARK_TEXT).width;
      ctx.fillRect(x - textWidth - 8, y - fontSize - 4, textWidth + 16, fontSize + 12);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillText(WATERMARK_TEXT, x, y);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

const DesignResult = ({
  imageUrl,
  prompt,
  settings,
  onRegenerate,
  onSaveToGallery,
  onReset,
  isSaved = false,
}) => {
  const { t } = useTranslation('tools');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    try {
      const watermarkedUrl = await addWatermarkToImage(imageUrl);
      const link = document.createElement('a');
      link.href = watermarkedUrl;
      link.download = `360ghar-design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `360ghar-design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [imageUrl]);

  const handleShare = useCallback(async () => {
    if (!imageUrl || !navigator.share) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'design.png', { type: 'image/png' });

      await navigator.share({
        title: t('aiDesignStudio.shareTitle'),
        text: t('aiDesignStudio.shareText'),
        files: [file],
      });
    } catch {
      // User cancelled or share failed
    }
  }, [imageUrl, t]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${t('aiDesignStudio.shareText')} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [t, shareUrl]);

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(t('aiDesignStudio.shareText'));
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  }, [t, shareUrl]);

  const handleShareFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }, [shareUrl]);

  const handleShareLinkedIn = useCallback(() => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  }, [shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [shareUrl]);

  return (
    <div className="design-result">
      <div className="result-header mb-4">
        <h3 className="result-title">
          <i className="fas fa-check-circle text-success me-2"></i>
          {t('aiDesignStudio.designGenerated')}
        </h3>
        <p className="result-subtitle text-muted">
          {t('aiDesignStudio.designReady')}
        </p>
      </div>

      <div className="result-image-container">
        <img
          src={imageUrl}
          alt={t('aiDesignStudio.generatedAlt')}
          className="result-image"
        />
      </div>

      {settings && (
        <div className="result-settings mt-3">
          <div className="settings-badges">
            {settings.designType && (
              <span className="badge bg-light text-dark me-2">
                <i className="fas fa-palette me-1"></i>
                {settings.designType === 'interior' ? t('aiDesignStudio.typeInterior') : t('aiDesignStudio.typeExterior')}
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

      <div className="result-actions mt-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <button
            onClick={handleDownload}
            className="btn btn-main"
          >
            <i className="fas fa-download me-2"></i>
            {t('aiDesignStudio.download')}
          </button>

          <button
            onClick={onSaveToGallery}
            className="btn btn-outline-main"
            disabled={isSaved}
          >
            {isSaved ? (
              <>
                <i className="fas fa-check me-2"></i>
                {t('aiDesignStudio.saved')}
              </>
            ) : (
              <>
                <i className="fas fa-bookmark me-2"></i>
                {t('aiDesignStudio.saveToGallery')}
              </>
            )}
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="btn btn-outline-secondary"
            >
              <i className="fas fa-share-alt me-2"></i>
              {t('aiDesignStudio.share')}
            </button>
          )}

          <button
            onClick={onRegenerate}
            className="btn btn-outline-secondary"
          >
            <i className="fas fa-sync-alt me-2"></i>
            {t('aiDesignStudio.regenerate')}
          </button>

          <button
            onClick={onReset}
            className="btn btn-outline-secondary"
          >
            <i className="fas fa-redo me-2"></i>
            {t('aiDesignStudio.newDesign')}
          </button>
        </div>
      </div>

      <div className="social-share-bar mt-4">
        <span className="social-share-label me-3 text-muted small fw-semibold">
          <i className="fas fa-share-nodes me-1"></i>
          Share:
        </span>
        <button
          onClick={handleShareWhatsApp}
          className="social-share-btn social-share-btn--whatsapp"
          title="Share on WhatsApp"
          type="button"
        >
          <i className="fab fa-whatsapp" />
        </button>
        <button
          onClick={handleShareTwitter}
          className="social-share-btn social-share-btn--twitter"
          title="Share on Twitter"
          type="button"
        >
          <i className="fab fa-x-twitter" />
        </button>
        <button
          onClick={handleShareFacebook}
          className="social-share-btn social-share-btn--facebook"
          title="Share on Facebook"
          type="button"
        >
          <i className="fab fa-facebook-f" />
        </button>
        <button
          onClick={handleShareLinkedIn}
          className="social-share-btn social-share-btn--linkedin"
          title="Share on LinkedIn"
          type="button"
        >
          <i className="fab fa-linkedin-in" />
        </button>
        <button
          onClick={handleCopyLink}
          className="social-share-btn social-share-btn--copy"
          title="Copy link"
          type="button"
        >
          <i className={linkCopied ? 'fas fa-check' : 'fas fa-link'} />
        </button>
      </div>

      {prompt && (
        <div className="result-prompt mt-4">
          <details className="prompt-details">
            <summary className="text-muted small">
              <i className="fas fa-info-circle me-1"></i>
              {t('aiDesignStudio.viewPrompt')}
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
