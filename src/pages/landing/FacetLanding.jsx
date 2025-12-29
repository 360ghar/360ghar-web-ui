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
const VALID_TYPES = ['flats','apartments','independent-house','builder-floor','villa','plots','land','office-space','shop'];
const VALID_BHKS = ['1-bhk','2-bhk','3-bhk','4-bhk','5-bhk'];
const VALID_BUDGETS = [
  'under-10k','under-15k','under-20k', // rent
  'under-50-lakhs','under-80-lakhs','under-1-crore' // buy
];

const FacetLanding = () => {
  const { citySlug, intent, type, bhk, budget, amenity } = useParams();

  const validCity = pretty(citySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const validType = VALID_TYPES.includes(type) ? type : 'flats';
  const isBhk = bhk && VALID_BHKS.includes(bhk);
  const isBudget = budget && VALID_BUDGETS.includes(budget);
  const isAmenity = Boolean(amenity);

  const facetText = pretty(validType);
  const bhkText = isBhk ? bhk.replace('-bhk', ' BHK').toUpperCase() : '';
  const budgetText = isBudget ? budget.replace(/-/g,' ') : '';

  const title = useMemo(() => {
    const verb = validIntent === 'rent' ? 'Rent' : validIntent === 'pg' ? 'PG' : 'Buy';
    const bits = [
      isBhk ? `${bhkText}` : null,
      facetText,
      'for', verb,
      'in', validCity,
      isBudget ? `| ${budgetText}` : null,
      isAmenity ? `| ${pretty(amenity)}` : null,
    ].filter(Boolean).join(' ');
    return `${bits} | 360Ghar`;
  }, [validCity, facetText, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const description = useMemo(() => {
    const parts = [
      `Explore verified ${facetText.toLowerCase()} in ${validCity} to ${validIntent}.`,
      isBhk ? `${bhkText} options available.` : null,
      isBudget ? `Budget: ${budgetText}.` : null,
      isAmenity ? `Amenity: ${pretty(amenity)}.` : null,
      'Verified by our on-site team. View photos, exact locations, 360° virtual tours. End-to-end service by dedicated Relationship Manager.'
    ].filter(Boolean);
    return parts.join(' ');
  }, [facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const keywords = useMemo(() => {
    const lcFacet = facetText.toLowerCase();
    const city = validCity;
    const tSyn = (() => {
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
    const iSyn = validIntent === 'buy'
      ? ['buy','purchase','for sale','resale','new launch','under construction','ready to move']
      : validIntent === 'rent'
        ? ['rent','on rent','for rent','lease','rental','without brokerage','no broker','owner']
        : ['pg','paying guest','co-living','hostel','boys pg','girls pg'];
    const bhkSyn = isBhk ? [bhkText, bhkText.toLowerCase()] : [];
    const budgetSyn = isBudget ? [budgetText, budgetText.replace('under','below')] : [];
    const base = [
      `${facetText} for ${validIntent} in ${city}`,
      ...tSyn.flatMap(t => iSyn.map(i => `${t} ${i} ${city}`)),
      ...bhkSyn.map(b => `${b} ${lcFacet} ${validIntent} in ${city}`),
      ...budgetSyn.map(b => `${lcFacet} ${validIntent} ${b} in ${city}`),
      isAmenity ? `${pretty(amenity)} ${lcFacet} ${validIntent} in ${city}` : null,
      'near metro', 'pet friendly', 'ready to move', 'no broker',
      'verified properties', '360 virtual tours', 'AI property search', 'on-site verified'
    ];
    return Array.from(new Set(base.filter(Boolean))).join(', ');
  }, [facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const canonicalPath = useMemo(() => {
    if (isBhk) return `/${citySlug}/${intent}/${type}/${bhk}`;
    if (isBudget) return `/${citySlug}/${intent}/${type}/budget/${budget}`;
    if (isAmenity) return `/${citySlug}/${intent}/${type}/amenity/${amenity}`;
    return `/${citySlug}/${intent}/${type}`;
  }, [isBhk, citySlug, intent, type, bhk, isBudget, budget, isAmenity, amenity]);

  const citySearchUrl = useMemo(() => {
    const u = new URL('https://360ghar.com/properties');
    u.searchParams.set('city', validCity);
    u.searchParams.set('intent', validIntent);
    return u.toString();
  }, [validCity, validIntent]);

  const breadcrumbs = useMemo(() => (
    [
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: validCity, url: citySearchUrl },
      { name: `${facetText} - ${pretty(validIntent)}`, url: `https://360ghar.com/${citySlug}/${intent}/${type}` },
      isBhk ? { name: bhkText, url: `https://360ghar.com/${citySlug}/${intent}/${type}/${bhk}` } : null,
      isBudget ? { name: budgetText, url: `https://360ghar.com/${citySlug}/${intent}/${type}/budget/${budget}` } : null,
      isAmenity ? { name: pretty(amenity), url: `https://360ghar.com/${citySlug}/${intent}/${type}/amenity/${amenity}` } : null,
    ].filter(Boolean)
  ), [validCity, citySearchUrl, facetText, validIntent, citySlug, intent, type, isBhk, bhkText, bhk, isBudget, budgetText, budget, isAmenity, amenity]);

  const targetUrl = () => {
    const u = new URL('https://360ghar.com/properties');
    u.searchParams.set('city', validCity);
    u.searchParams.set('intent', validIntent);
    u.searchParams.set('type', facetText);
    if (isBhk) u.searchParams.set('bhk', bhkText.replace(' BHK',''));
    if (isBudget) u.searchParams.set('budget', budget);
    if (isAmenity) u.searchParams.set('amenity', amenity);
    return `${u.pathname}${u.search}`.replace('https://360ghar.com','');
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonical={canonicalPath}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          { '@type': 'ItemList', name: title, description, url: `https://360ghar.com${canonicalPath}` }
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
              <h1 className="section-heading__title">{title.replace(' | 360Ghar','')}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <Link to={targetUrl()} className="btn btn-main">Browse Listings</Link>
            </div>

            <div className="mt-5">
              <h2 className="h5 mb-3">Popular searches</h2>
              <ul className="text-start">
                <li>{facetText} {validIntent} near metro in {validCity}</li>
                {isBhk && <li>{bhkText} {facetText} {validIntent} in {validCity}</li>}
                {isBudget && <li>{facetText} {validIntent} {budgetText} in {validCity}</li>}
                <li>Ready to move {facetText} for {validIntent} in {validCity}</li>
                <li>No broker {facetText} for {validIntent} in {validCity}</li>
                <li>Verified {facetText} with 360° virtual tours in {validCity}</li>
              </ul>
              <h2 className="h5 mb-3 mt-4">Why 360Ghar?</h2>
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

export default FacetLanding;
