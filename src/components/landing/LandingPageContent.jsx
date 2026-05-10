/**
 * Content sections for landing pages to meet Google's helpful content depth requirements.
 * Renders neighborhood guides, price trends, buying tips, and legal checklists.
 */
import { useEffect } from 'react';
import { I18nLink } from '../../i18n/I18nLink';
import { getPriceRange } from '../../utils/internalLinks';
import landingTypeContext from '../../data/landingTypeContext.json';

const CITY_NEIGHBORHOODS = {
  gurgaon: [
    { name: 'DLF Phase 1-5', desc: 'Premium residential sectors with established social infrastructure, proximity to Cyber City and Golf Course Road. Best for executives seeking gated-community living with metro access.', relevantFor: ['apartment', 'villa', 'house'] },
    { name: 'Sohna Road', desc: 'Rapidly developing corridor with new launches from top builders. Good for mid-budget buyers seeking appreciation potential as the Sohna Elevated Road and DMIC progress.', relevantFor: ['apartment', 'plot'] },
    { name: 'Sector 49-56', desc: 'Well-planned sectors with metro connectivity via Sector 55-56 station. Popular among families for schools, hospitals, and daily markets within walking distance.', relevantFor: ['apartment', 'builder_floor', 'house'] },
    { name: 'Dwarka Expressway', desc: 'Newer micro-market with competitive pricing. Infrastructure catch-up underway with the expressway now operational. Suitable for long-term investors.', relevantFor: ['apartment', 'plot'] },
    { name: 'Sushant Lok 1-2', desc: 'Established neighborhoods near IFFCO Chowk metro. High rental demand, mature markets, and strong social fabric make these evergreen choices.', relevantFor: ['apartment', 'builder_floor', 'house'] },
  ],
  delhi: [
    { name: 'Dwarka', desc: 'Planned sub-city with metro connectivity, wide roads, and affordable apartments. Popular for 2-3 BHK units with growing social infrastructure.', relevantFor: ['apartment'] },
    { name: 'Rohini', desc: 'North Delhi hub with metro access and established markets. Good for families seeking well-connected, mid-budget housing.', relevantFor: ['apartment'] },
    { name: 'Vasant Kunj', desc: 'South Delhi enclave near the airport with premium apartments and strong connectivity to Gurugram via MG Road.', relevantFor: ['apartment'] },
    { name: 'Janakpuri', desc: 'West Delhi locality with metro, hospitals, and schools. Consistent rental demand and improving infrastructure.', relevantFor: ['apartment'] },
    { name: 'Lajpat Nagar', desc: 'Central Delhi market hub. High demand for rental units, strong connectivity via violet line metro.', relevantFor: ['apartment'] },
  ],
  noida: [
    { name: 'Sector 137', desc: 'Well-connected sector on Noida-Greater Noida Expressway with metro station. Premium apartments and strong IT corridor demand.', relevantFor: ['apartment'] },
    { name: 'Sector 62', desc: 'Established sector near Sector 62 metro with reputed schools and hospitals. Popular among families and working professionals.', relevantFor: ['apartment'] },
    { name: 'Sector 78', desc: 'Newer sector with competitive pricing, proximity to Sector 50 metro. Good for mid-budget buyers seeking modern amenities.', relevantFor: ['apartment'] },
    { name: 'Sector 50', desc: 'Premium sector near City Centre metro. Established social infrastructure and proximity to commercial hubs.', relevantFor: ['apartment'] },
    { name: 'Expressway Sectors', desc: 'Sectors 128-150 along the expressway with newer projects from top developers. Strong appreciation potential as infrastructure matures.', relevantFor: ['apartment', 'plot'] },
  ],
  faridabad: [
    { name: 'Sector 14-15', desc: 'Well-planned sectors near Old Faridabad metro. Established markets and good social infrastructure at competitive pricing.', relevantFor: ['apartment'] },
    { name: 'Surajkund', desc: 'Premium enclave near the Aravallis with green surroundings and proximity to South Delhi. Best for buyers seeking luxury in a natural setting.', relevantFor: ['apartment', 'villa'] },
    { name: 'NIT Faridabad', desc: 'Central commercial and residential hub with strong connectivity. Consistent demand for mid-segment housing.', relevantFor: ['apartment'] },
  ],
  ghaziabad: [
    { name: 'Indirapuram', desc: 'Most developed area with metro via Vaishali station, malls, and schools. High rental demand from Delhi commuters.', relevantFor: ['apartment'] },
    { name: 'Vaishali', desc: 'Metro-connected locality with direct access to Delhi. Popular for affordable apartments with strong resale value.', relevantFor: ['apartment'] },
    { name: 'Crossing Republik', desc: 'Large township on NH-24 with integrated amenities. Budget-friendly with improving infrastructure as NH-24 widening completes.', relevantFor: ['apartment'] },
  ],
};

const CITY_TIPS = {
  buy: {
    gurgaon: [
      'Check H-RERA registration before booking any under-construction project in Gurgaon.',
      'Circle rates in Gurgaon are revised annually — factor in stamp duty at 5-7% of circle rate or sale price, whichever is higher.',
      'Sector 49-56 areas have best metro access; Dwarka Expressway for appreciation play.',
      'Always verify the actual built-up area vs. super area in builder floors — the difference can be 25-35%.',
      'Gurgaon property registration now requires Aadhaar-based biometric verification at the tehsil.',
    ],
    delhi: [
      'Delhi has DDA flats and cooperative group housing — verify society status before purchase.',
      'Stamp duty in Delhi is 4% for women and 6% for men — register in a woman\'s name for savings.',
      'Check unauthorised colony status carefully — regularization is ongoing but incomplete.',
      'MCD mutation is separate from registry — budget for both.',
      'Power of attorney sales are risky in Delhi — insist on proper sale deeds.',
    ],
    noida: [
      'UP-RERA covers all Noida projects — always verify the project RERA number online.',
      'Noida Authority transfer fees apply on resale — budget approximately ₹500-1000/sq ft.',
      'Stamp duty in UP is 5% for men, 4% for women — register jointly for the lower rate.',
      'Check for land dispute status with Noida Authority before purchasing in newer sectors.',
      'Golf Course Road extension connectivity will impact Sector 137-150 pricing significantly.',
    ],
    faridabad: [
      'Verify H-RERA registration — many Faridabad projects are still unregistered.',
      'Violet Line metro extension has significantly improved Faridabad-Delhi connectivity.',
      'Circle rates in Faridabad are lower than Gurgaon — but stamp duty remains 5-7%.',
      'Check for CLU (Change of Land Use) status for properties near agricultural zones.',
      'Faridabad Master Plan 2031 designates new sectors — check alignment before buying.',
    ],
    ghaziabad: [
      'UP-RERA registration is mandatory — check status for all Ghaziabad projects.',
      'Red Line metro connects Vaishali/Indirapuram to Delhi — drives premium pricing.',
      'NH-24 widening is complete — Crossing Republik and Raj Nagar Extension benefit directly.',
      'Check GDA (Ghaziabad Development Authority) approval for all group housing.',
      'Stamp duty in UP: 5% for men, 4% for women — similar to Noida rules.',
    ],
  },
  rent: {
    gurgaon: [
      'Typical security deposit is 2-3 months rent for unfurnished, 1 month for PG/co-living.',
      'Register your rent agreement — unregistered agreements lack legal protection in Haryana.',
      'Check for maintenance charges separately — some societies charge ₹2-5/sq ft monthly.',
      'Verify water supply source — many sectors depend on tanker supply in summer.',
      'Lock-in period of 6 months is standard — negotiate for 3 months if possible.',
    ],
    delhi: [
      'Delhi rent agreements must be registered for terms over 11 months.',
      'Check DDA flat maintenance charges — older societies may have high maintenance.',
      'Power backup charges vary ₹8-15/unit in Delhi societies — ask before signing.',
      'Parking is scarce in central Delhi — verify allotted parking spots.',
      'Subletting without landlord consent can lead to eviction in Delhi.',
    ],
    noida: [
      'Noida rent agreements should be registered to protect both parties.',
      'Society maintenance in Noida varies ₹1.5-4/sq ft — confirm before moving in.',
      'Check for shuttle services to nearest metro — common in Sector 137, 143.',
      'Water supply is generally consistent in Noida — unlike some Gurgaon sectors.',
      'Security deposit typically 2 months — higher deposits indicate competitive demand.',
    ],
    faridabad: [
      'Faridabad rents are 30-40% lower than Gurgaon — good value for budget renters.',
      'Check metro proximity — Violet Line stations significantly improve commute.',
      'Verify water and power backup availability before signing.',
      'Security deposit is typically 1-2 months — lower than Gurgaon norms.',
      'Many societies have dedicated maintenance staff — confirm charges.',
    ],
    ghaziabad: [
      'Indirapuram and Vaishali have highest rental demand due to metro access.',
      'Security deposit typically 1-2 months — negotiate based on market conditions.',
      'Crossing Republik has shuttle services to Vaishali metro — check frequency.',
      'Society maintenance ₹1.5-3/sq ft is standard in Ghaziabad townships.',
      'Power backup charges vary — check per-unit rates in your society.',
    ],
  },
  pg: {
    gurgaon: [
      'PG accommodation near metro stations (Sector 55-56, IFFCO Chowk) commands 20-30% premium.',
      'Double-sharing PGs start at ₹7,000/month; single occupancy from ₹12,000/month in Gurgaon.',
      'Most PGs include meals, WiFi, and housekeeping — verify specifics before paying token.',
      'Check notice period — 15-30 days is standard in Gurgaon PGs.',
      'Verify landlord has proper fire safety and occupancy certificates for the building.',
    ],
    delhi: [
      'Delhi PGs near universities (North Campus, JNU) have highest demand and rates.',
      'Single rooms in Delhi PGs start at ₹8,000/month; sharing from ₹5,000.',
      'Check if curfew timings apply — many Delhi PGs enforce 10-11 PM curfews.',
      'Visitor policies vary — some PGs don\'t allow guests at all.',
      'Electricity is often metered separately — confirm if included in rent.',
    ],
  },
};

const LEGAL_CHECKLIST = [
  { icon: 'fa-file-contract', label: 'RERA Registration', desc: 'Verify project/builder is registered with state RERA authority.' },
  { icon: 'fa-indian-rupee-sign', label: 'Circle Rates', desc: 'Check current circle rates for stamp duty calculation.' },
  { icon: 'fa-scale-balanced', label: 'Stamp Duty', desc: 'Budget 5-7% of property value for stamp duty + registration.' },
  { icon: 'fa-key', label: 'Possession Letter', desc: 'Ensure possession letter is issued before final payment.' },
  { icon: 'fa-building', label: 'Completion Certificate', desc: 'Verify CC from municipal authority for ready-to-move properties.' },
  { icon: 'fa-map', label: 'Land Use Check', desc: 'Confirm residential land use with development authority.' },
];

/**
 * LandingPageContent component — renders SEO-rich content sections
 * to meet Google's helpful content depth requirements.
 *
 * @param {object} props
 * @param {string} props.citySlug - Canonical city slug (e.g., 'gurgaon')
 * @param {string} props.city - Pretty city name (e.g., 'Gurgaon')
 * @param {string} props.intent - 'buy' | 'rent' | 'pg'
 * @param {string} props.facet - Property type label (e.g., 'Apartment')
 * @param {string} props.canonicalType - Canonical property type (e.g., 'apartment')
 */
const LandingPageContent = ({ citySlug, city, intent, facet, canonicalType, onTypeFaqs }) => {
  const typeContext = landingTypeContext[citySlug]?.[intent]?.[canonicalType] || null;
  const neighborhoods = (CITY_NEIGHBORHOODS[citySlug] || [])
    .filter((n) => !n.relevantFor || n.relevantFor.includes(canonicalType));
  const tips = CITY_TIPS[intent]?.[citySlug] || CITY_TIPS.buy[citySlug] || [];
  const priceRange = getPriceRange(citySlug, intent, canonicalType);
  const verb = intent === 'rent' ? 'renting' : intent === 'pg' ? 'PG' : 'buying';

  // Notify parent of type-specific FAQs for structured data
  useEffect(() => {
    if (typeContext?.localityFaqs?.length && onTypeFaqs) {
      onTypeFaqs(typeContext.localityFaqs);
    }
  }, [typeContext?.localityFaqs, onTypeFaqs]);

  return (
    <>
      {/* Property Type Snapshot — unique per type */}
      {typeContext && (
        <section className="padding-y-60">
          <div className="container container-two">
            <h2 className="h5 mb-2">{facet} in {city} — Quick Overview</h2>
            <div className="row g-3">
              {typeContext.topSocieties && (
                <div className="col-md-6">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <h3 className="h6 mb-2">Top Societies & Projects</h3>
                    <ul className="mb-0" style={{ fontSize: '0.875rem' }}>
                      {typeContext.topSocieties.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {typeContext.typicalConfiguration && (
                <div className="col-md-6">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <h3 className="h6 mb-2">Typical Configuration</h3>
                    <p className="mb-0" style={{ fontSize: '0.875rem' }}>{typeContext.typicalConfiguration}</p>
                  </div>
                </div>
              )}
              {typeContext.metroAccess && (
                <div className="col-md-6">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <h3 className="h6 mb-2"><i className="fas fa-subway text-gradient me-1" />Metro Access</h3>
                    <p className="mb-0" style={{ fontSize: '0.875rem' }}>{typeContext.metroAccess}</p>
                  </div>
                </div>
              )}
              {typeContext.officeHubAccess && (
                <div className="col-md-6">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <h3 className="h6 mb-2"><i className="fas fa-building text-gradient me-1" />Office Hub Access</h3>
                    <p className="mb-0" style={{ fontSize: '0.875rem' }}>{typeContext.officeHubAccess}</p>
                  </div>
                </div>
              )}
            </div>

            {typeContext.priceBands && typeContext.priceBands.length > 0 && (
              <div className="mt-4">
                <h3 className="h6 mb-2">{facet} Price Bands in {city}</h3>
                <div className="row g-3">
                  {typeContext.priceBands.map((band) => (
                    <div className="col-md-4" key={band.label}>
                      <div className="p-3 rounded-3 bg-white border text-center h-100">
                        <strong className="d-block text-main">{band.range}</strong>
                        <small className="text-muted">{band.label}</small>
                        <small className="d-block text-muted mt-1">{band.localities}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typeContext.reraNote && (
              <div className="mt-4 p-3 rounded-3 border bg-white">
                <h3 className="h6 mb-2"><i className="fas fa-gavel text-gradient me-1" />RERA & Legal Context</h3>
                <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>{typeContext.reraNote}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Neighborhood Guide */}
      {neighborhoods.length > 0 && (
        <section className="padding-y-60 bg-light">
          <div className="container container-two">
            <h2 className="h5 mb-2">Top Neighborhoods for {facet} {intent === 'pg' ? 'in' : `for ${verb}`} {city}</h2>
            <p className="text-muted mb-4">
              Choosing the right locality in {city} depends on your commute, budget, and lifestyle. Here are the top areas to consider when {intent === 'pg' ? 'looking for accommodation' : verb} a {facet.toLowerCase()}.
            </p>
            <div className="row g-4">
              {neighborhoods.map((n) => (
                <div className="col-md-6 col-lg" key={n.name}>
                  <div className="p-3 rounded-3 bg-white border h-100">
                    <h3 className="h6 mb-2">{n.name}</h3>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Price Trends & Market Overview */}
      {priceRange && (
        <section className="padding-y-60">
          <div className="container container-two">
            <h2 className="h5 mb-2">{city} {facet} Price Trends</h2>
            <p className="mb-3">
              Understanding price ranges in {city} is critical before making a decision. Current average prices for {facet.toLowerCase()} in {city} range from <strong>{priceRange}</strong>. These rates vary significantly by locality, floor, furnishing status, and project reputation.
            </p>
            <p className="mb-3">
              {city === 'Gurgaon'
                ? 'Gurgaon has seen 8-12% annual appreciation in established sectors along Golf Course Road and Sohna Road. Newer Dwarka Expressway sectors offer lower entry prices with higher upside as connectivity improves.'
                : city === 'Delhi'
                ? 'Delhi property rates are among the highest in NCR but offer strong rental yields, especially near metro corridors. South Delhi and central locations command premium pricing.'
                : `${city} offers competitive pricing compared to Gurgaon, with improving infrastructure driving steady appreciation. Metro connectivity expansions continue to unlock new micro-markets.`
              }
            </p>
            <div className="d-flex flex-wrap gap-2">
              <I18nLink to="/emi-calculator" className="btn btn-outline-main btn-sm rounded-pill">
                <i className="fas fa-calculator me-1" /> Calculate EMI
              </I18nLink>
              <I18nLink to="/circle-rates" className="btn btn-outline-main btn-sm rounded-pill">
                <i className="fas fa-indian-rupee-sign me-1" /> Check Circle Rates
              </I18nLink>
              <I18nLink to="/stamp-duty-calculator" className="btn btn-outline-main btn-sm rounded-pill">
                <i className="fas fa-file-invoice me-1" /> Stamp Duty Calculator
              </I18nLink>
            </div>
          </div>
        </section>
      )}

      {/* Tips Section */}
      {tips.length > 0 && (
        <section className="padding-y-60 bg-light">
          <div className="container container-two">
            <h2 className="h5 mb-2">Tips for {intent === 'pg' ? 'Finding PG Accommodation' : verb === 'buying' ? 'Buying' : 'Renting'} a {facet} in {city}</h2>
            <p className="text-muted mb-4">
              Whether you are a first-time buyer or seasoned investor, these {city}-specific tips will help you navigate the local market.
            </p>
            <div className="row g-3">
              {tips.map((tip, idx) => (
                <div className="col-md-6 col-lg" key={idx}>
                  <div className="p-3 rounded-3 bg-white border h-100">
                    <div className="d-flex align-items-start gap-2">
                      <span className="badge bg-main rounded-pill flex-shrink-0">{idx + 1}</span>
                      <p className="mb-0" style={{ fontSize: '0.875rem' }}>{tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Legal Checklist */}
      <section className="padding-y-60">
        <div className="container container-two">
          <h2 className="h5 mb-2">Legal Checklist for {city} Property</h2>
          <p className="text-muted mb-4">
            Before finalizing any property transaction in {city}, make sure you have verified these essential legal requirements.
          </p>
          <div className="row g-3">
            {LEGAL_CHECKLIST.map((item) => (
              <div className="col-sm-6 col-lg-4 col-xl" key={item.label}>
                <div className="p-3 rounded-3 bg-light border h-100">
                  <i className={`fas ${item.icon} text-gradient me-2`} />
                  <strong className="d-block mb-1">{item.label}</strong>
                  <small className="text-muted">{item.desc}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Type-Specific FAQs */}
      {typeContext?.localityFaqs?.length > 0 && (
        <section className="padding-y-60 bg-light">
          <div className="container container-two">
            <h2 className="h5 mb-3">{facet} in {city} — Common Questions</h2>
            <div className="accordion" id="typeFaqAccordion">
              {typeContext.localityFaqs.map((faq, idx) => (
                <div className="accordion-item border-0 border-bottom" key={faq.q}>
                  <h3 className="accordion-header" id={`typeFaqHeading${idx}`}>
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#typeFaqCollapse${idx}`}>
                      {faq.q}
                    </button>
                  </h3>
                  <div id={`typeFaqCollapse${idx}`} className="accordion-collapse collapse" aria-labelledby={`typeFaqHeading${idx}`} data-bs-parent="#typeFaqAccordion">
                    <div className="accordion-body text-muted" style={{ fontSize: '0.875rem' }}>{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default LandingPageContent;
