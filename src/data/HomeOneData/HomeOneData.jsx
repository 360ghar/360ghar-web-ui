
// Banner One
import BannerImg from '/assets/images/thumbs/banner-img.png'; 
export const bannerContent = {
    subtitle: 'AI + VR REAL ESTATE',
    title: 'India\'s VR-First Way to',
    gradientTitle: 'Find a Home',
    desc: 'Browse verified properties in Gurugram with immersive 360° guided walkthroughs. Every listing is physically verified by our on-site team. Zero upfront fees, no fake listings — just transparency.',
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
    title: 'Your Expert Guide to Finding Home',
    desc: '360Ghar is India\'s first AI + VR real estate platform. Browse verified properties in Gurugram with studio-quality 360° guided walkthroughs, inspected by our on-site team. Your dedicated Relationship Manager ensures complete transparency — zero upfront fees, no misleading info.'
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
        desc: 'India\'s first AI-powered platform with studio-quality 360° guided walkthroughs. Every property inspected by our on-site team—verified details, exact locations, no misleading photos.'
    },
    {
        icon: propertyTypeIcon2,
        title: 'Dedicated Relationship Manager',
        desc: 'Unlike traditional brokers, we assign you a Relationship Manager who handles everything end-to-end—property search to documentation. Total transparency, zero hassle.'
    },
    {
        icon: propertyTypeIcon3,
        title: 'Complete Transparency & Value',
        desc: 'Zero upfront fees, no partnered-inventory push, complete transparency. We show genuine, verified properties with full visibility. Get real value, not just expensive brokerage.'
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
        text: 'Relationship Managers'
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
        desc: 'Discover luxury apartments, independent houses, and villas in prime locations across Gurugram with immersive 360° guided walkthroughs.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
    {
        thumb: portfolioThumb2,
        title: 'Commercial Spaces',
        desc: 'Find the perfect office spaces, retail outlets, and commercial complexes for your business needs in Gurugram.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
    {
        thumb: portfolioThumb3,
        title: 'Investment Properties',
        desc: 'Explore high-yield investment opportunities in Gurugram\'s growing real estate market with expert market analysis.',
        btnIcon: <i className="fas fa-arrow-right"></i>
    },
    {
        thumb: portfolioThumb4,
        title: 'Rental Properties',
        desc: 'Browse through a wide selection of verified rental properties including apartments, houses, and PG accommodations in Gurugram.',
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
        desc: 'I used to pay lakhs in brokerage for minimal service. 360Ghar gave me a dedicated RM, verified on-site inspections, and complete visibility with zero upfront fees. This is real value.',
        quote: quoteIcon
    },
]


// Blog data removed. Use blogService to fetch posts dynamically.


// Tool Features Data
export const toolFeatures = [
    {
        icon: "/assets/images/icons/service1.svg",
        title: "3D Floor Plan Builder",
        desc: "Design your dream home with our interactive 3D floor plan tool. Create, customize, and visualize room layouts.",
        btnText: "Try Now",
        btnLink: "/design-blueprint"
    },
    {
        icon: "/assets/images/icons/service2.svg",
        title: "AI Vastu Checker",
        desc: "Get AI-powered Vastu compliance analysis for your floor plan. Upload your design and receive instant insights.",
        btnText: "Try Now",
        btnLink: "/vastu-checker"
    },
    {
        icon: "/assets/images/icons/service3.svg",
        title: "AI Design Studio",
        desc: "Generate stunning interior and exterior designs with AI. Create from scratch or reimagine your photos.",
        btnText: "Try Now",
        btnLink: "/ai-design-studio"
    }
];
