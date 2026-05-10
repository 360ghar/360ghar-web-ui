import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import Cta from '../../components/ui/Cta';

const CELEBRITY_HOMES = [
  {
    name: 'Akshay Kumar',
    slug: 'akshay-kumars-house-in-juhu-a-verified-look-at-the-prime-beach-residence',
    location: 'Juhu, Mumbai',
    type: 'Sea-facing Bungalow',
    highlights: 'Prime Beach Residence, Juhu beachfront',
  },
  {
    name: 'Allu Arjun',
    slug: 'inside-allu-arjuns-100-crore-mansion-a-blueprint-for-luxury-living',
    location: 'Jubilee Hills, Hyderabad',
    type: '₹100 Crore Mansion',
    highlights: 'Iconic Jubilee Hills estate',
  },
  {
    name: 'Hardik Pandya',
    slug: 'inside-hardik-pandyas-real-estate-portfolio-a-look-at-his-mumbai-and-vadodara-homes',
    location: 'Mumbai & Vadodara',
    type: 'Multi-city Portfolio',
    highlights: 'Mumbai penthouse + Vadodara family home',
  },
  {
    name: 'Shubman Gill',
    slug: 'shubman-gills-fazilka-residence-a-real-estate-case-study-in-lifestyle-and-location',
    location: 'Fazilka, Punjab',
    type: 'Family Residence',
    highlights: 'Punjab roots, growing portfolio',
  },
  {
    name: 'Vikram (Chiyaan)',
    slug: 'decoding-the-design-and-location-of-vikrams-chennai-residence-a-360-ghar-insight',
    location: 'Besant Nagar, Chennai',
    type: 'Waterfront Villa',
    highlights: 'Chennai coastline luxury',
  },
  {
    name: 'Kriti Sanon',
    slug: 'inside-kriti-sanons-mumbai-residence-a-case-study-in-premium-real-estate',
    location: 'Mumbai',
    type: 'Premium Apartment',
    highlights: 'Bollywood luxury living',
  },
  {
    name: 'Rashmika Mandanna',
    slug: 'inside-rashmika-mandannas-real-estate-portfolio-lessons-in-luxury-and-diversification',
    location: 'Hyderabad & Mumbai',
    type: 'Multi-city Portfolio',
    highlights: 'Pan-India property strategy',
  },
  {
    name: 'Nayanthara',
    slug: 'nayantharas-real-estate-portfolio-a-look-at-the-lady-superstars-100-crore-property-investments',
    location: 'Chennai & Hyderabad',
    type: '₹100 Cr+ Portfolio',
    highlights: 'South India\'s biggest star investor',
  },
  {
    name: 'Sharad Kelkar',
    slug: 'sharad-kelkars-malad-west-residence-a-look-at-real-estate-net-worth-and-career-highlights',
    location: 'Malad West, Mumbai',
    type: 'Suburban Residence',
    highlights: 'Mumbai suburban real estate value',
  },
  {
    name: 'Ananya Panday',
    slug: 'inside-ananya-pandays-bandra-west-home-a-benchmark-for-luxury-living',
    location: 'Bandra West, Mumbai',
    type: 'Luxury Apartment',
    highlights: 'Bandra premium living',
  },
  {
    name: 'Siddhant Chaturvedi',
    slug: 'siddhant-chaturvedis-home-a-detailed-look-at-his-juhu-residence-net-worth-lifestyle',
    location: 'Juhu, Mumbai',
    type: 'Juhu Residence',
    highlights: 'Rising star, premium location',
  },
  {
    name: 'Milind Soman',
    slug: 'inside-milind-somans-prabhadevi-residence-a-blend-of-luxury-and-wellness',
    location: 'Prabhadevi, Mumbai',
    type: 'Wellness-focused Home',
    highlights: 'Health meets luxury design',
  },
  {
    name: 'Keerthy Suresh',
    slug: 'inside-keerthy-sureshs-chennai-residence-a-look-at-modern-luxury-and-design',
    location: 'Chennai',
    type: 'Modern Villa',
    highlights: 'South Indian design excellence',
  },
  {
    name: 'Anupam Kher',
    slug: 'anupam-khers-homes-a-look-at-real-estate-choices-across-mumbai-shimla-and-new-york',
    location: 'Mumbai, Shimla, New York',
    type: 'Global Portfolio',
    highlights: '3-city international portfolio',
  },
  {
    name: 'Suniel Shetty',
    slug: 'inside-suniel-shettys-real-estate-portfolio-a-case-study-in-luxury-and-strategic-investment',
    location: 'Mumbai',
    type: 'Investment Portfolio',
    highlights: 'Strategic real estate investor',
  },
  {
    name: 'Cristiano Ronaldo',
    slug: 'inside-cristiano-ronaldos-turin-villa-a-masterclass-in-luxury-real-estate',
    location: 'Turin, Italy',
    type: 'Italian Villa',
    highlights: 'International luxury benchmark',
  },
];

const CelebrityHomesHub = () => {
  const { t } = useTranslation();
  const [tSeo] = useTranslation('seo');
  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: 'Celebrity Homes', url: 'https://360ghar.com/celebrity-homes' },
  ]);

  return (
    <>
      <SEO
        title={tSeo('celebrityHomes.title')}
        description={tSeo('celebrityHomes.description')}
        keywords="celebrity homes India, Bollywood star houses, cricketer homes, Akshay Kumar house, Allu Arjun mansion, Hardik Pandya property, celebrity real estate India, 360Ghar celebrity homes"
        canonical="/celebrity-homes"
        type="website"
        structuredData={[breadcrumbSchema]}
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="padding-y-120">
          <div className="container container-two">
            <div className="section-heading text-center mb-5">
              <h1>Celebrity Homes in India (2026)</h1>
              <p className="section-heading__desc">
                Verified insights into the homes of India&apos;s biggest Bollywood stars, cricketers, and business icons. Explore locations, property values, and real estate investment lessons.
              </p>
            </div>

            <div className="row g-4">
              {CELEBRITY_HOMES.map((celeb) => (
                <div className="col-md-6 col-lg-4 col-xl-3" key={celeb.slug}>
                  <I18nLink
                    to={`/blog/${celeb.slug}`}
                    className="d-block p-4 rounded-3 bg-white border text-decoration-none h-100"
                    style={{ color: 'inherit', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                  >
                    <div className="mb-2">
                      <span className="badge bg-main text-white me-1">{celeb.type}</span>
                    </div>
                    <h3 className="h5 mb-1">{celeb.name}</h3>
                    <p className="text-muted small mb-1">
                      <i className="fas fa-map-marker-alt text-main me-1" />
                      {celeb.location}
                    </p>
                    <p className="text-muted small mb-0">{celeb.highlights}</p>
                  </I18nLink>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-light rounded-3 border">
              <h2 className="h5 mb-2">Why Celebrity Homes Matter for Real Estate</h2>
              <p>
                Celebrity property purchases signal neighborhood desirability and future price appreciation.
                When stars invest in an area, infrastructure, security, and amenities follow — driving up values
                for surrounding properties. Our verified case studies analyze not just the homes, but the
                real estate logic behind each purchase decision.
              </p>
            </div>

            <div className="mt-5 p-4 bg-light rounded-3 border">
              <h2 className="h5 mb-2">Top Celebrity Real Estate Localities in India</h2>
              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <h3 className="h6">Mumbai</h3>
                  <ul className="list-unstyled small text-muted">
                    <li>Juhu — Akshay Kumar, Dharmendra</li>
                    <li>Bandra West — Ananya Panday, Shah Rukh Khan</li>
                    <li>Prabhadevi — Milind Soman</li>
                    <li>Malad West — Sharad Kelkar</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h3 className="h6">Hyderabad</h3>
                  <ul className="list-unstyled small text-muted">
                    <li>Jubilee Hills — Allu Arjun, Prabhas</li>
                    <li>Banjara Hills — Nayanthara</li>
                    <li>Financial District — IT corridor growth</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h3 className="h6">Chennai</h3>
                  <ul className="list-unstyled small text-muted">
                    <li>Besant Nagar — Vikram</li>
                    <li>Adyar / ECR — Keerthy Suresh</li>
                    <li>ECR corridor — premium sea-facing villas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default CelebrityHomesHub;
