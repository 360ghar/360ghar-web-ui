import { useState } from 'react';
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

  return (
    <>
      <SEO
        title="Online Floor Planner & 3D Blueprint Designer India | 360Ghar"
        description="Free online floor planner and 3D blueprint designer by 360Ghar. Create 2D & 3D floor plans, visualize your dream home, and plan interior layouts. Perfect for Indian homes."
        keywords="floor planner India, 3D home design tool, online blueprint designer, free floor plan creator, interior design software India, virtual home staging, 360ghar tools, 2D 3D floor planner"
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
                Loading blueprint designer…
              </div>
            )}

            <iframe
              className="design-blueprint-iframe"
              src={DESIGNER_SRC}
              title="360Ghar Blueprint Designer"
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
