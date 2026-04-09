import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';

import './DesignBlueprint.css';

const DESIGNER_SRC = '/blueprint3d/index.html';

const DesignBlueprint = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslation('tools');

  return (
    <>
      <SEO
        title={t('designBlueprint.title')}
        description={t('designBlueprint.description')}
        keywords={t('designBlueprint.keywords')}
        canonical="/design-blueprint"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={generateToolSchema(toolSchemas.designBlueprint)}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg design-blueprint-shell">
        <Header
          headerClass="dark-header has-border"
          logoBlack={false}
          logoWhite
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="design-blueprint-content">
          <div className="design-blueprint-frame">
            {!isLoaded && (
              <div className="design-blueprint-loading" role="status" aria-live="polite">
                {t('designBlueprint.loading')}
              </div>
            )}

            <iframe
              className="design-blueprint-iframe"
              src={DESIGNER_SRC}
              title={t('designBlueprint.iframeTitle')}
              onLoad={() => setIsLoaded(true)}
              allow="fullscreen; clipboard-read; clipboard-write"
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default DesignBlueprint;
