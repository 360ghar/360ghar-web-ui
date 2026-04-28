import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import './App.css';
// Toast CSS is now lazy-loaded via LazyToast.jsx
import { useLocationStore } from './store/locationStore';
import { useAuthStore } from './store';
import useLocaleStore from './store/localeStore';
import i18n from './i18n';
import PageLoader from './common/PageLoader';
import ScrollToTop from './common/layout/ScrollToTop';
import SEO from './common/SEO';
import UIScrollLockEffect from './common/UIScrollLockEffect';
import { realEstateStructuredData } from './seo/structuredData';

const Home = lazy(() => import('./pages/Home'));
const PropertySidebar = lazy(() => import('./pages/properties/PropertySidebar'));
const Property = lazy(() => import('./pages/properties/Property'));
const PropertyDetails = lazy(() => import('./pages/properties/PropertyDetails'));
const AddListing = lazy(() => import('./pages/properties/AddListing'));
const MapLocation = lazy(() => import('./pages/MapLocation'));
const AboutUs = lazy(() => import('./pages/core/AboutUs'));
const FaqPage = lazy(() => import('./pages/core/FaqPage'));
const Login = lazy(() => import('./pages/account/Login'));
const Account = lazy(() => import('./pages/account/Account'));
const Project = lazy(() => import('./pages/projects/Project'));
const ProjectDetails = lazy(() => import('./pages/projects/ProjectDetails'));
const BlogClassic = lazy(() => import('./pages/blogs/BlogClassic'));
const BlogDetails = lazy(() => import('./pages/blogs/BlogDetails'));
const Contact = lazy(() => import('./pages/core/Contact'));
const PostProperty = lazy(() => import('./pages/properties/PostProperty'));
const Register = lazy(() => import('./pages/account/Register'));
const AccountDeletionRequest = lazy(() => import('./pages/account/AccountDeletionRequest'));
const NotFound = lazy(() => import('./pages/core/NotFound'));
const Policies = lazy(() => import('./pages/core/Policies'));
const PolicyDetails = lazy(() => import('./pages/core/PolicyDetails'));
const EmiCalculator = lazy(() => import('./pages/tools/EmiCalculator'));
const AreaConverter = lazy(() => import('./pages/tools/AreaConverter'));
const LoanEligibilityCalculator = lazy(() => import('./pages/tools/LoanEligibilityCalculator'));
const AreaCalculator = lazy(() => import('./pages/tools/AreaCalculator'));
const PropertyChecklist = lazy(() => import('./pages/tools/PropertyChecklist'));
const CapitalGainsCalculator = lazy(() => import('./pages/tools/CapitalGainsCalculator'));
const DesignBlueprint = lazy(() => import('./pages/tools/DesignBlueprint'));
const VastuChecker = lazy(() => import('./pages/tools/VastuChecker'));
const AIDesignStudio = lazy(() => import('./pages/tools/AIDesignStudio'));
const Landing = lazy(() => import('./pages/landing/Landing'));
const GurugramGuide = lazy(() => import('./pages/core/GurugramGuide'));
const PropertyInvestment = lazy(() => import('./pages/core/PropertyInvestment'));
const ForAI = lazy(() => import('./pages/core/ForAI'));
const FacetLanding = lazy(() => import('./pages/landing/FacetLanding'));
const McpLogin = lazy(() => import('./pages/account/McpLogin'));
const AIAgent = lazy(() => import('./pages/core/AIAgent'));
const LocalityTemplate = lazy(() => import('./pages/localities/LocalityTemplate'));
const LocalitiesDirectory = lazy(() => import('./pages/localities/LocalitiesDirectory'));
const ReferAndEarn = lazy(() => import('./pages/core/ReferAndEarn'));
const ChatBot = lazy(() => import('./components/chatbot/ChatBot'));

const VsNoBroker = lazy(() => import('./pages/compare/vs-nobroker'));
const VsMagicBricks = lazy(() => import('./pages/compare/vs-magicbricks'));
const Vs99acres = lazy(() => import('./pages/compare/vs-99acres'));
const VsHousing = lazy(() => import('./pages/compare/vs-housing'));
const VsCommonFloor = lazy(() => import('./pages/compare/vs-commonfloor'));
const VsPropTiger = lazy(() => import('./pages/compare/vs-proptiger'));
const VsSquareYards = lazy(() => import('./pages/compare/vs-squareyards'));
const VsNestAway = lazy(() => import('./pages/compare/vs-nestaway'));
const VsZolo = lazy(() => import('./pages/compare/vs-zolo'));
const VsStanzaLiving = lazy(() => import('./pages/compare/vs-stanza-living'));

const TruthNoBroker = lazy(() => import('./pages/truth/nobroker-listings'));
const TruthMagicBricks = lazy(() => import('./pages/truth/magicbricks-spam'));
const Truth99acres = lazy(() => import('./pages/truth/99acres-fake'));
const TruthNestAway = lazy(() => import('./pages/truth/nestaway-collapse'));
const TruthZolo = lazy(() => import('./pages/truth/zolo-issues'));

const CircleRateDirectory = lazy(() => import('./pages/data-hub/CircleRateDirectory'));
const CircleRateDetail = lazy(() => import('./pages/data-hub/CircleRateDetail'));
const StampDutyCalculator = lazy(() => import('./pages/data-hub/StampDutyCalculator'));
const ReraProjectDirectory = lazy(() => import('./pages/data-hub/ReraProjectDirectory'));
const BankAuctions = lazy(() => import('./pages/data-hub/BankAuctions'));
const BankAuctionDetail = lazy(() => import('./pages/data-hub/BankAuctionDetail'));
const VerifyOwnership = lazy(() => import('./pages/data-hub/VerifyOwnership'));
const ZoneChecker = lazy(() => import('./pages/data-hub/ZoneChecker'));
const ZoneCheckerDetail = lazy(() => import('./pages/data-hub/ZoneCheckerDetail'));
const RegulatoryUpdates = lazy(() => import('./pages/data-hub/RegulatoryUpdates'));
const BuilderReputation = lazy(() => import('./pages/data-hub/BuilderReputation'));
const BuilderReputationDetail = lazy(() => import('./pages/data-hub/BuilderReputationDetail'));

const propertyRoutes = [
  { path: '/properties', element: <Property /> },
  { path: '/property-sidebar', element: <PropertySidebar /> },
  { path: '/property/:id', element: <PropertyDetails /> },
  { path: '/add-new-listing', element: <AddListing /> },
  { path: '/post-property', element: <PostProperty /> },
  { path: '/map-location', element: <MapLocation /> },
];

const accountRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/mcp/login', element: <McpLogin /> },
  { path: '/register', element: <Register /> },
  { path: '/account', element: <Account /> },
  { path: '/delete-account', element: <AccountDeletionRequest /> },
];

const contentRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about-us', element: <AboutUs /> },
  { path: '/faq', element: <FaqPage /> },
  { path: '/project', element: <Project /> },
  { path: '/project/:title', element: <ProjectDetails /> },
  { path: '/blog', element: <BlogClassic /> },
  { path: '/blog/:title', element: <BlogDetails /> },
  { path: '/contact', element: <Contact /> },
  { path: '/policies', element: <Policies /> },
  { path: '/policies/:slug', element: <PolicyDetails /> },
  { path: '/gurugram-real-estate-guide', element: <GurugramGuide /> },
  { path: '/property-investment-gurugram', element: <PropertyInvestment /> },
  { path: '/refer-and-earn', element: <ReferAndEarn /> },
  { path: '/for-ai', element: <ForAI /> },
  { path: '/ai-agent', element: <AIAgent /> },
  { path: '/localities', element: <LocalitiesDirectory /> },
  { path: '/locality/:slug', element: <LocalityTemplate /> },
];

const toolRoutes = [
  { path: '/emi-calculator', element: <EmiCalculator /> },
  { path: '/area-converter', element: <AreaConverter /> },
  { path: '/loan-eligibility-calculator', element: <LoanEligibilityCalculator /> },
  { path: '/area-calculator', element: <AreaCalculator /> },
  { path: '/property-document-checklist', element: <PropertyChecklist /> },
  { path: '/capital-gains-tax-calculator', element: <CapitalGainsCalculator /> },
  { path: '/design-blueprint', element: <DesignBlueprint /> },
  { path: '/vastu-checker', element: <VastuChecker /> },
  { path: '/ai-design-studio', element: <AIDesignStudio /> },
];

const dataHubRoutes = [
  { path: '/circle-rates', element: <CircleRateDirectory /> },
  { path: '/circle-rate/:slug', element: <CircleRateDetail /> },
  { path: '/stamp-duty-calculator', element: <StampDutyCalculator /> },
  { path: '/rera-projects', element: <ReraProjectDirectory /> },
  { path: '/bank-auctions', element: <BankAuctions /> },
  { path: '/bank-auctions/:id', element: <BankAuctionDetail /> },
  { path: '/verify-ownership', element: <VerifyOwnership /> },
  { path: '/zone-checker', element: <ZoneChecker /> },
  { path: '/zone-checker/:slug', element: <ZoneCheckerDetail /> },
  { path: '/regulatory-updates', element: <RegulatoryUpdates /> },
  { path: '/builder-reputation', element: <BuilderReputation /> },
  { path: '/builder-reputation/:slug', element: <BuilderReputationDetail /> },
];

const comparisonRoutes = [
  { path: '/vs/nobroker', element: <VsNoBroker /> },
  { path: '/vs/magicbricks', element: <VsMagicBricks /> },
  { path: '/vs/99acres', element: <Vs99acres /> },
  { path: '/vs/housing', element: <VsHousing /> },
  { path: '/vs/commonfloor', element: <VsCommonFloor /> },
  { path: '/vs/proptiger', element: <VsPropTiger /> },
  { path: '/vs/squareyards', element: <VsSquareYards /> },
  { path: '/vs/nestaway', element: <VsNestAway /> },
  { path: '/vs/zolo', element: <VsZolo /> },
  { path: '/vs/stanza-living', element: <VsStanzaLiving /> },
];

const truthRoutes = [
  { path: '/truth/nobroker-listings', element: <TruthNoBroker /> },
  { path: '/truth/magicbricks-spam', element: <TruthMagicBricks /> },
  { path: '/truth/99acres-fake', element: <Truth99acres /> },
  { path: '/truth/nestaway-collapse', element: <TruthNestAway /> },
  { path: '/truth/zolo-issues', element: <TruthZolo /> },
];

const programmaticRoutes = [
  { path: '/:citySlug/:intent/:type/:bhk', element: <FacetLanding /> },
  { path: '/:citySlug/:intent/:type/budget/:budget', element: <FacetLanding /> },
  { path: '/:citySlug/:intent/:type/amenity/:amenity', element: <FacetLanding /> },
  { path: '/:citySlug/:intent/:type', element: <Landing /> },
];

const routeGroups = [
  ...contentRoutes,
  ...accountRoutes,
  ...propertyRoutes,
  ...toolRoutes,
  ...dataHubRoutes,
  ...comparisonRoutes,
  ...truthRoutes,
  ...programmaticRoutes,
];

// Scrolls window to top on every route change
function RouteScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Sets up i18next + Zustand locale based on the matched route tree
function LocaleGate({ locale }) {
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    setLocale(locale);
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [locale, setLocale]);

  return <Outlet />;
}

function App() {
  const initializeLocation = useLocationStore((state) => state.initializeLocation);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeLocation();
    initializeAuth();
  }, [initializeLocation, initializeAuth]);

  // Global schemas applied to every page
  const globalSchemas = [
    realEstateStructuredData.organization,
  ];

  return (
    <>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RouteScrollToTop />
        <UIScrollLockEffect />
        <SEO structuredData={globalSchemas} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Hindi routes — /hi/* prefix */}
            <Route path="/hi" element={<LocaleGate locale="hi" />}>
              <Route index element={<Home />} />
              {routeGroups.filter((route) => route.path !== '/').map((route) => {
                const strippedPath = route.path.startsWith('/') ? route.path.slice(1) : route.path;
                return (
                  <Route key={`hi-${route.path}`} path={strippedPath} element={route.element} />
                );
              })}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Default (English) routes — no prefix */}
            <Route path="/" element={<LocaleGate locale="en" />}>
              {routeGroups.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </BrowserRouter>

      <ScrollToTop />
    </>
  );
}

export default App;
