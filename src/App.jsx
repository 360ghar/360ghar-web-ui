import React, { useEffect } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useLocationStore } from './store/locationStore';

import Home from './pages/Home';
import HomeTwo from './pages/unused/HomeTwo';
import HomeThree from './pages/unused/HomeThree';
import ScrollToTop from './common/ScrollToTop';
import Property from './pages/properties/Property';
import PropertySidebar from './pages/properties/PropertySidebar';
import PropertyDetails from './pages/properties/PropertyDetails';
import AddListing from './pages/properties/AddListing';
import MapLocation from './pages/MapLocation';
import AboutUs from './pages/core/AboutUs';
import FaqPage from './pages/core/FaqPage';
import Checkout from './pages/unused/Checkout';
import Cart from './pages/unused/Cart';
import Login from './pages/account/Login';
import Account from './pages/account/Account';
import Project from './pages/projects/Project';
import ProjectDetails from './pages/projects/ProjectDetails';
import BlogClassic from './pages/blogs/BlogClassic';
import BlogDetails from './pages/blogs/BlogDetails';
import Contact from './pages/core/Contact';
import PostProperty from './pages/properties/PostProperty';
import Register from './pages/account/Register';
import AccountDeletionRequest from './pages/account/AccountDeletionRequest';
import NotFound from './pages/core/NotFound';
import Policies from './pages/core/Policies';
import PolicyDetails from './pages/core/PolicyDetails';
import EmiCalculator from './pages/tools/EmiCalculator';
import Landing from './pages/landing/Landing';
import GurugramGuide from './pages/core/GurugramGuide';
import PropertyInvestment from './pages/core/PropertyInvestment';
import ForAI from './pages/core/ForAI';
import FacetLanding from './pages/landing/FacetLanding';
import McpLogin from './pages/account/McpLogin';

function App() {
  const initializeLocation = useLocationStore((state) => state.initializeLocation);

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  return (
    <>
      <BrowserRouter>
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
      </BrowserRouter>

      <ScrollToTop/>
    </>
  );
}

export default App;
