import React, { useEffect } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useLocationStore } from './store/locationStore';

import HomeOne from './pages/HomeOne';
import HomeTwo from './pages/HomeTwo';
import HomeThree from './pages/HomeThree';
import HomeFour from './pages/HomeFour';
import HomeFive from './pages/HomeFive';
import HomeSix from './pages/HomeSix';
import HomeSeven from './pages/HomeSeven';
import ScrollToTop from './common/ScrollToTop';
import Property from './pages/Property';
import PropertySidebar from './pages/PropertySidebar';
import PropertyDetails from './pages/PropertyDetails';
import AddListing from './pages/AddListing';
import MapLocation from './pages/MapLocation';
import AboutUs from './pages/AboutUs';
import FaqPage from './pages/FaqPage';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Account from './pages/Account';
import Project from './pages/Project';
import ProjectDetails from './pages/ProjectDetails';
import BlogClassic from './pages/BlogClassic';
import BlogDetails from './pages/BlogDetails';
import Contact from './pages/Contact';
import PostProperty from './pages/PostProperty';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Policies from './pages/Policies';
import PolicyDetails from './pages/PolicyDetails';

function App() {
  const fetchBrowserLocation = useLocationStore((state) => state.fetchBrowserLocation);

  useEffect(() => {
    fetchBrowserLocation();
  }, [fetchBrowserLocation]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeOne />} />
          <Route path="/home-two" element={<HomeTwo />} />
          <Route path="/home-three" element={<HomeThree />} />
          <Route path="/home-four" element={<HomeFour />} />
          <Route path="/home-five" element={<HomeFive />} />
          <Route path="/home-six" element={<HomeSix />} />
          <Route path="/home-seven" element={<HomeSeven />} />
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
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/project" element={<Project />} />
          <Route path="/project/:title" element={<ProjectDetails />} />

          <Route path="/blog" element={<BlogClassic />} />
          <Route path="/blog/:title" element={<BlogDetails />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/policies/:slug" element={<PolicyDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <ScrollToTop/>
    </>
  );
}

export default App;
