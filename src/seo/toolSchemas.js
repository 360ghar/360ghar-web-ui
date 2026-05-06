import { siteMetadata } from './siteMetadata';

// SoftwareApplication schema generator for calculator tools
// Accepts either individual args (legacy) or a single tool config object
export const generateToolSchema = (toolNameOrConfig, description, keywords, category = 'BusinessApplication') => {
    const isConfig = typeof toolNameOrConfig === 'object';
    const cfg = isConfig ? toolNameOrConfig : { name: toolNameOrConfig, description, keywords, category };
    const downloadUrl = cfg.route
        ? `${siteMetadata.siteUrl}${cfg.route}`
        : `${siteMetadata.siteUrl}/${cfg.name.toLowerCase().replace(/\s+/g, '-')}`;

    return {
        '@type': 'SoftwareApplication',
        name: cfg.name,
        applicationCategory: cfg.category,
        operatingSystem: 'Web Browser',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR'
        },
        description: cfg.description,
        keywords: cfg.keywords,
        author: {
            '@type': 'Organization',
            name: '360Ghar'
        },
        publisher: {
            '@type': 'Organization',
            name: '360Ghar',
            url: siteMetadata.siteUrl
        },
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        softwareVersion: '1.0',
        applicationSuite: '360Ghar Real Estate Tools',
        inLanguage: ['en-IN', 'hi-IN'],
        downloadUrl,
        featureList: cfg.keywords.split(', '),
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: cfg.ratingValue || '4.8',
            reviewCount: cfg.reviewCount || '150',
            bestRating: '5',
            worstRating: '1',
        },
    };
};

// Tool-specific schema data
export const toolSchemas = {
    emiCalculator: {
        name: 'Home Loan EMI Calculator',
        description: "Calculate your Home Loan EMI instantly with 360Ghar's free EMI Calculator. Plan your budget, check monthly installments, and view amortization schedule for properties in Gurugram & India.",
        keywords: 'home loan EMI calculator India, housing loan calculator, mortgage calculator India, loan repayment schedule, EMI calculation, property loan calculator, SBI home loan EMI, HDFC home loan EMI, real estate finance tool, 360ghar financial tools, होम लोन EMI कैलकुलेटर, ghar loan calculator, home loan calculator Hindi, loan EMI calculator India Hindi, housing loan EMI Gurgaon',
        category: 'FinanceApplication',
        route: '/emi-calculator'
    },
    areaConverter: {
        name: 'Area Unit Converter',
        description: 'Convert area units instantly between Square Feet, Square Yard, Square Meter, Acres, Bigha, and other units commonly used in Indian real estate.',
        keywords: 'area converter, sq ft to sq yard, square feet converter, land area calculator, unit conversion, sq yard to sq ft, acre to bigha, hectare to acre, area unit converter India, gaj to sq ft converter, zameen converter, sq ft to sq yard India, area unit converter Hindi, gaj to sq ft, bigha converter India',
        category: 'UtilitiesApplication',
        route: '/area-converter'
    },
    areaCalculator: {
        name: 'Carpet Area Calculator',
        description: 'Calculate carpet area, built-up area, and super built-up area for your property. Understand actual usable area vs total area.',
        keywords: 'carpet area calculator, built-up area, super built-up area, property area calculation, usable area, RERA carpet area, area calculation formula, plinth area, super built up area calculation, carpet area to built up area, carpet area kya hota hai, built-up area calculator Hindi, super built up area meaning, RERA carpet area Hindi, area calculation India',
        category: 'UtilitiesApplication',
        route: '/area-calculator'
    },
    loanEligibility: {
        name: 'Home Loan Eligibility Calculator',
        description: 'Check your home loan eligibility based on income, existing EMIs, and other factors. Know how much loan you can get for buying property in India.',
        keywords: 'loan eligibility calculator, home loan eligibility, housing loan qualification, loan amount calculator, how much home loan can I get, home loan eligibility calculator India, SBI loan eligibility, HDFC loan eligibility, loan eligibility based on salary, loan kitna milega, home loan eligibility Hindi, kitna loan mil sakta hai, housing loan qualification India, home loan salary calculator',
        category: 'FinanceApplication',
        route: '/loan-eligibility-calculator'
    },
    capitalGains: {
        name: 'Capital Gains Tax Calculator',
        description: 'Calculate capital gains tax on property sale. Determine short-term vs long-term capital gains and indexation benefits for Indian real estate.',
        keywords: 'capital gains calculator, property tax calculator, capital gains tax India, indexation benefit, property sale tax, long term capital gains on property, short term capital gains tax, capital gains exemption, property sale tax calculation, property bechne par tax, capital gains tax Hindi, property sale tax India, indexation benefit Hindi, long term capital gains property India',
        category: 'FinanceApplication',
        route: '/capital-gains-tax-calculator'
    },
    propertyChecklist: {
        name: 'Property Document Checklist',
        description: 'Complete checklist of legal and financial documents required for buying property in India. Never miss important paperwork.',
        keywords: 'property documents checklist, buying property documents, legal documents for property, property registration documents, property buying documents India, property sale documents, flat purchase documents, property verification documents, property kharidne ke documents, property registration documents Hindi, flat purchase documents India, property verification documents list',
        category: 'BusinessApplication',
        route: '/property-document-checklist'
    },
    vastuChecker: {
        name: 'Vastu Compliance Checker',
        description: 'AI-powered Vastu Shastra analysis for floor plans. Upload your floor plan and get instant Vastu compliance score and recommendations.',
        keywords: 'Vastu checker, Vastu analysis, floor plan Vastu, Vastu compliance, vastu shastra checker, Vastu evaluation online, Vastu score calculator, Vastu for home, Vastu for flat, online Vastu consultation, vastu check Hindi, ghar ka vastu, flat vastu checker online, vastu for home India, vastu shastra consultation online',
        category: 'LifestyleApplication',
        route: '/vastu-checker'
    },
    designBlueprint: {
        name: '3D Blueprint Designer',
        description: 'Design your dream home with our interactive 3D blueprint tool. Create floor plans, arrange furniture, and visualize your space.',
        keywords: 'floor planner, 3D home design, blueprint designer, floor plan creator, home design tool, online floor plan, 3D floor plan creator, house layout designer, room planner, interior design tool, ghar ka naksha banana, floor plan designer India, ghar design online, 3D ghar design tool, home layout planner India',
        category: 'DesignApplication',
        route: '/design-blueprint'
    },
    stampDutyCalculator: {
        name: 'Stamp Duty Calculator Gurugram',
        description: 'Calculate stamp duty and registration charges for property purchase in Gurugram. Haryana stamp duty rates: 7% male, 5% female, 6% joint. Instant calculation.',
        keywords: 'stamp duty calculator Gurugram, stamp duty Haryana, property registration charges, stamp duty calculator India, Haryana stamp duty rate, property stamp duty, registration fee calculator, stamp duty on property purchase Gurgaon',
        category: 'FinanceApplication',
        route: '/stamp-duty-calculator'
    },
    verifyOwnership: {
        name: 'Property Ownership Verification',
        description: 'Verify property ownership in Gurugram using Haryana Jamabandi land records. Check owner names, area, mutation status, and encumbrance online.',
        keywords: 'property ownership verification Gurugram, Jamabandi land records Haryana, verify property owner, land record check Gurgaon, property ownership check online, Haryana land records, khasra number search, tehsil records Gurugram',
        category: 'BusinessApplication',
        route: '/verify-ownership'
    },
    aiDesignStudio: {
        name: 'AI Design Studio',
        description: 'Generate photorealistic interior and exterior designs with AI. Upload a room photo or describe your vision and get instant design visualizations. Free online tool by 360Ghar.',
        keywords: 'AI interior design, AI room designer, AI exterior design, room design generator, home design AI, reimagine room, free AI design tool, 360ghar',
        category: 'DesignApplication',
        route: '/ai-design-studio'
    },
    fakeListingChecker: {
        name: 'Fake Listing Checker',
        description: 'Check if a property listing from 99acres, MagicBricks, or other portals is fake. Paste the URL to get instant verification against 360Ghar\'s physically verified database.',
        keywords: 'fake property listing check, verify property listing, 99acres fake listing, MagicBricks fraud, property listing verification India, fake real estate listing detector',
        category: 'UtilitiesApplication',
        route: '/check-fake-listing'
    }
};
