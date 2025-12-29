import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const VALID_INTENTS = ['buy', 'rent', 'pg'];

const Landing = () => {
  const { citySlug, intent, type } = useParams();
  const city = pretty(citySlug);
  const facet = pretty(type);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';

  const citySearchUrl = useMemo(() => {
    const u = new URL('https://360ghar.com/properties');
    u.searchParams.set('city', city);
    u.searchParams.set('intent', validIntent);
    return u.toString();
  }, [city, validIntent]);

  const title = useMemo(() => {
    const verb = validIntent === 'rent' ? 'Rent' : validIntent === 'pg' ? 'PG' : 'Buy';
    if (validIntent === 'pg') return `PG in ${city} | ${city} Paying Guest & Co-living | 360Ghar`;
    return `${facet} for ${verb} in ${city} | ${city} Real Estate | 360Ghar`;
  }, [city, facet, validIntent]);

  const description = useMemo(() => {
    const base = `Browse verified ${facet.toLowerCase()} in ${city} to ${validIntent}. All properties verified by our on-site team with 360° virtual tours. Enjoy end-to-end service by dedicated Relationship Manager.`;
    return base;
  }, [city, facet, validIntent]);

  const keywords = useMemo(() => {
    const lcFacet = facet.toLowerCase();
    const isRes = ['flats','apartments','independent house','builder floor','villa'].some(k => lcFacet.includes(k));
    const typeSyn = (() => {
      if (lcFacet.includes('apartment') || lcFacet.includes('flat')) return ['flats','apartments','society flats'];
      if (lcFacet.includes('independent')) return ['independent house','independent floor','house','kothi'];
      if (lcFacet.includes('builder')) return ['builder floor','independent floor'];
      if (lcFacet.includes('villa')) return ['villa','bungalow'];
      if (lcFacet.includes('plot')) return ['plots','residential plots','residential land'];
      if (lcFacet.includes('land')) return ['land','residential land','commercial land'];
      if (lcFacet.includes('office')) return ['office space','commercial office','coworking','co-working'];
      if (lcFacet.includes('shop')) return ['shop','retail shop','showroom'];
      return [lcFacet];
    })();
    const intentSyn = validIntent === 'buy'
      ? ['buy','purchase','for sale','resale','new launch','under construction','ready to move']
      : validIntent === 'rent'
        ? ['rent','on rent','for rent','lease','rental','without brokerage','no broker','owner']
        : ['pg','paying guest','co-living','hostel','boys pg','girls pg'];
    const basePhrases = [
      `${facet} for ${validIntent} in ${city}`,
      `${facet} ${validIntent} ${city}`,
      `${facet} in ${city}`,
      ...typeSyn.flatMap(t => intentSyn.map(i => `${t} ${i} ${city}`)),
      isRes ? `1 BHK ${facet} ${validIntent} in ${city}` : null,
      isRes ? `2 BHK ${facet} ${validIntent} in ${city}` : null,
      isRes ? `3 BHK ${facet} ${validIntent} in ${city}` : null,
      validIntent === 'rent' && isRes ? `furnished ${facet} for rent in ${city}` : null,
      validIntent === 'rent' && isRes ? `semi furnished ${facet} for rent in ${city}` : null,
      validIntent === 'buy' && isRes ? `ready to move ${facet} for sale in ${city}` : null,
      `near metro ${city}`,
      `pet friendly ${facet} ${validIntent} in ${city}`,
    ].filter(Boolean);
    const brandKeywords = ['verified properties', '360 virtual tours', 'AI property search', 'on-site verified'];
    return [...Array.from(new Set(basePhrases)), ...brandKeywords].join(', ');
  }, [city, facet, validIntent]);

  const breadcrumbs = useMemo(() => (
    [
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: city, url: citySearchUrl },
      { name: `${facet} - ${pretty(validIntent)}`, url: `https://360ghar.com/${citySlug}/${intent}/${type}` },
    ]
  ), [city, citySlug, citySearchUrl, facet, intent, type, validIntent]);

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonical={`/${citySlug}/${intent}/${type}`}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          {
            '@type': 'ItemList',
            name: title,
            description,
            url: `https://360ghar.com/${citySlug}/${intent}/${type}`,
          },
        ]}
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <Link
                to={`/properties?city=${encodeURIComponent(city)}&intent=${encodeURIComponent(validIntent)}&type=${encodeURIComponent(facet)}`}
                className="btn btn-main"
              >
                Browse Listings
              </Link>
            </div>

            <div className="mt-5">
              <h2 className="h5 mb-3">Why 360Ghar?</h2>
              <ul className="text-start">
                <li>India&apos;s first AI-Enabled and Virtual Tour first Real Estate Platform</li>
                <li>All properties verified by our on-site team with 360° virtual tours</li>
                <li>Dedicated Relationship Manager handles your end-to-end flow so you can relax</li>
                <li>Full visibility, convenience, and transparency for the same brokerage amount</li>
              </ul>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Landing;
