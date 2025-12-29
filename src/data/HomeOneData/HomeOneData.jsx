import React from 'react'; 

// Banner One
import BannerImg from '/assets/images/thumbs/banner-img.png'; 
export const bannerContent = {
    subtitle: '360 WALKTHROUGH',
    title: 'India\'s first 360° ',
    gradientTitle: 'Home Platform',
    desc: 'Unlock the power of virtual reality in real estate. Easily Rent, Buy, and Sell properties with immersive 360° walkthroughs across Gurgaon.',
    thumb: BannerImg
}

// Filter Tabs
export const filterTabs = [
    {
        id: 1,
        text: 'Rent'
    },
    {
        id: 2,
        text: 'Buy'
    },
    {
        id: 3,
        text: 'Sell'
    },
]
  

// About One Content
export const aboutStatistics = {
    icon: <i className="fas fa-users text-gradient"></i>,
    number: '4000+',
    text: 'Satisfied Clients'
}
import aboutContentThumb from '/assets/images/thumbs/about-img.png';
import aboutContentIcon from '/assets/images/icons/about-icon.svg'; 
export const aboutContent = {
    thumb: aboutContentThumb,
    icon: aboutContentIcon,
    title: 'Your Dream Home Awaits',
    desc: '360Ghar revolutionizes the way you experience real estate with immersive 360° virtual tours. Our platform connects buyers, sellers, and renters across Gurgaon, making property transactions seamless and transparent.'
}


// Property data removed. Use API-driven properties everywhere.


// Property Type Data
import propertyTypeIcon1 from '/assets/images/icons/property-type-icon1.svg';
import propertyTypeIcon2 from '/assets/images/icons/property-type-icon2.svg';
import propertyTypeIcon3 from '/assets/images/icons/property-type-icon3.svg';
export const propertyTypes = [
    {
        icon: propertyTypeIcon1,
        title: 'AI-Enabled Virtual Tours',
        desc: 'India\'s first AI-powered platform with verified 360° tours. Every property inspected by our on-site team—authentic details, no misleading photos.'
    },
    {
        icon: propertyTypeIcon2,
        title: 'Dedicated Relationship Manager',
        desc: 'Unlike traditional brokers, we assign you a Relationship Manager who handles everything end-to-end—property search to documentation. Total transparency, zero hassle.'
    },
    {
        icon: propertyTypeIcon3,
        title: 'Complete Transparency & Value',
        desc: 'No upfront cost, no gaslighting, no partnered-inventory push. We show genuine properties with full visibility. Get real value, not just expensive brokerage.'
    },
]


// CountUp Data
export const counts = [
    {
        number: '5000+',
        text: 'Properties Listed'
    },
    {
        number: '2000+',
        text: 'Happy Customers'
    },
    {
        number: '50+',
        text: 'Expert Agents'
    },
    {
        number: '10',
        text: 'Cities Covered'
    },
]


// portfolio  Data
import portfolioThumb1 from '/assets/images/thumbs/portfolio1.png';
import portfolioThumb2 from '/assets/images/thumbs/portfolio2.png';
import portfolioThumb3 from '/assets/images/thumbs/portfolio3.png';
import portfolioThumb4 from '/assets/images/thumbs/portfolio4.png'; 
export const portfolios = [
    {
        thumb: portfolioThumb1,
        title: 'Residential Properties',
        desc: 'Discover luxury apartments, independent houses, and villas in prime locations across Gurgaon with 360° virtual tours.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
    {
        thumb: portfolioThumb2,
        title: 'Commercial Spaces',
        desc: 'Find the perfect office spaces, retail outlets, and commercial complexes for your business needs in Gurgaon.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
    {
        thumb: portfolioThumb3,
        title: 'Investment Properties',
        desc: 'Explore high-yield investment opportunities in Gurgaon\'s growing real estate market with expert market analysis.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
    {
        thumb: portfolioThumb4,
        title: 'Rental Properties',
        desc: 'Browse through a wide selection of rental properties including apartments, houses, and PG accommodations in Gurgaon.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
]


// Testimonial Data
import quoteIcon from '/assets/images/icons/quote.svg';
export const testimonials = [
    {
        name: 'Aman Sharma',
        designation: 'Home Buyer – Gurugram',
        desc: 'Tired of brokers pushing only partnered properties? 360Ghar\'s AI-powered platform showed me genuine verified listings. My Relationship Manager guided me through everything—total transparency, no hidden costs.',
        quote: quoteIcon
    },
    {
        name: 'Rajesh Kumar',
        designation: 'Property Investor',
        desc: 'I used to pay lakhs in brokerage for minimal service. 360Ghar gave me a dedicated RM, verified on-site inspections, and complete visibility at no upfront cost. This is real value.',
        quote: quoteIcon
    },
]


// Blog data removed. Use blogService to fetch posts dynamically.
