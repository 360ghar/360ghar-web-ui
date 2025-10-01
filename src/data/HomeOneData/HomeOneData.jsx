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
        title: '360° Virtual Tours',
        desc: 'Experience properties like never before with our immersive 360° walkthroughs. See every detail from the comfort of your home.'
    },
    {
        icon: propertyTypeIcon2,
        title: 'Expert Property Guidance',
        desc: 'Our experienced real estate consultants provide personalized guidance to help you make informed property decisions in Gurgaon.'
    },
    {
        icon: propertyTypeIcon3,
        title: 'Comprehensive Property Solutions',
        desc: 'From property listings to legal documentation, we provide end-to-end solutions for all your real estate needs in one platform.'
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
        designation: 'Home Seeker – Gurugram',
        desc: '360Ghar completely transformed how I search for properties. The verified 360° tours saved me countless visits and made shortlisting effortless.',
        quote: quoteIcon
    },
    {
        name: 'Rajesh Kumar',
        designation: 'Property Investor',
        desc: '360Ghar helped me find the perfect investment property in Gurugram. The team’s verification and guidance gave me full confidence.',
        quote: quoteIcon
    },
]


// Blog data removed. Use blogService to fetch posts dynamically.
