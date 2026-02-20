import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
// Toast CSS is now lazy-loaded via LazyToast.jsx
import { useLocationStore } from './store/locationStore';
import { useAuthStore } from './store';
import PageLoader from './common/PageLoader';
import ScrollToTop from './common/ScrollToTop';
import SEO from './common/SEO';
import { realEstateStructuredData } from './seo/structuredData';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const HomeTwo = lazy(() => import('./pages/unused/HomeTwo'));
const HomeThree = lazy(() => import('./pages/unused/HomeThree'));
const PropertySidebar = lazy(() => import('./pages/properties/PropertySidebar'));
const Property = lazy(() => import('./pages/properties/Property'));
const PropertyDetails = lazy(() => import('./pages/properties/PropertyDetails'));
const AddListing = lazy(() => import('./pages/properties/AddListing'));
const MapLocation = lazy(() => import('./pages/MapLocation'));
const AboutUs = lazy(() => import('./pages/core/AboutUs'));
const FaqPage = lazy(() => import('./pages/core/FaqPage'));
const Checkout = lazy(() => import('./pages/unused/Checkout'));
const Cart = lazy(() => import('./pages/unused/Cart'));
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

// Locality pages dynamic template
const LocalityTemplate = lazy(() => import('./pages/localities/LocalityTemplate'));
const LocalitiesDirectory = lazy(() => import('./pages/localities/LocalitiesDirectory'));

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
      <BrowserRouter>
        <SEO structuredData={globalSchemas} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home-two" element={<HomeTwo />} />
            <Route path="/home-three" element={<HomeThree />} />
            <Route path="/properties" element={<Property />} />
            <Route path="/property-sidebar" element={<PropertySidebar />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/add-new-listing" element={<AddListing />} />
            <Route path="/map-location" element={<MapLocation />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mcp/login" element={<McpLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/project" element={<Project />} />
            <Route path="/project/:title" element={<ProjectDetails />} />

            <Route path="/blog" element={<BlogClassic />} />
            <Route path="/blog/:title" element={<BlogDetails />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/delete-account" element={<AccountDeletionRequest />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/policies/:slug" element={<PolicyDetails />} />
            <Route path="/emi-calculator" element={<EmiCalculator />} />
            <Route path="/area-converter" element={<AreaConverter />} />
            <Route path="/loan-eligibility-calculator" element={<LoanEligibilityCalculator />} />
            <Route path="/area-calculator" element={<AreaCalculator />} />
            <Route path="/property-document-checklist" element={<PropertyChecklist />} />
            <Route path="/capital-gains-tax-calculator" element={<CapitalGainsCalculator />} />
            <Route path="/design-blueprint" element={<DesignBlueprint />} />
            <Route path="/vastu-checker" element={<VastuChecker />} />
            <Route path="/ai-design-studio" element={<AIDesignStudio />} />

            {/* Locality pages dynamic route handling 1000+ locations */}
            <Route path="/localities" element={<LocalitiesDirectory />} />
            <Route path="/locality/:slug-gurgaon" element={<LocalityTemplate />} />
            <Route path="/gurugram-real-estate-guide" element={<GurugramGuide />} />
            <Route path="/property-investment-gurugram" element={<PropertyInvestment />} />
            <Route path="/for-ai" element={<ForAI />} />
            {/* Facet landings: BHK and Budget */}
            <Route path="/:citySlug/:intent/:type/:bhk" element={<FacetLanding />} />
            <Route path="/:citySlug/:intent/:type/budget/:budget" element={<FacetLanding />} />
            <Route path="/:citySlug/:intent/:type/amenity/:amenity" element={<FacetLanding />} />
            {/* Programmatic SEO landing pages: /city/intent/type */}
            <Route path="/:citySlug/:intent/:type" element={<Landing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <ScrollToTop />
    </>
  );
}

export default App;
