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
        featureList: cfg.featureList || cfg.keywords.split(', '),
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
        description: 'Free land area converter for Indian real estate. Convert Gaj to Acre, Sq Ft to Gaj, Bigha to Acre, Ground to Acre, and more. Instant and accurate area unit conversion for property buyers in India.',
        keywords: 'area converter india, sq ft to gaj, gaj to acre, bigha to acre, 4840 gaj in acre, 360 sq ft in gaj, 2400 gaj in acre, 2400 sq ft in gaj, bigha to acre calculator, bigha to acre conversion, gaj to bigha, 43560 sq ft to ground, ground to acre, land calculator india, bigha in acre, sq ft to gaj converter, gaj to sq ft, bigha converter, 1 acre to bigha in haryana, jamin calculator, 360 sq yard to gaj, land area converter India, acre to bigha, square feet to gaj, 1 gaj in bigha, 360ghar',
        category: 'UtilitiesApplication',
        route: '/area-converter'
    },
    areaCalculator: {
        name: 'Carpet Area Calculator',
        description: 'Free carpet area calculator to convert between carpet area, built-up area, and super built-up area. Calculate RERA carpet area, convert MOFA to RERA, and understand loading factor for properties in India. Accurate area conversion in square feet.',
        keywords: 'carpet area calculator, carpet area to built up area calculator, mofa to rera carpet conversion calculator, rera carpet area calculator, super built up area to carpet area calculator, carpet area to built-up area calculator India, built up area to carpet area calculator, carpet area in square feet calculator, how to calculate carpet area from super built up area, carpet area calculation formula, carpet area for flat calculator, loading factor calculator, RERA carpet area, carpet area converter, area calculation formula India, flat carpet area calculator, built up area vs carpet area, carpet area kya hota hai, 360ghar',
        category: 'UtilitiesApplication',
        route: '/area-calculator'
    },
    mofaToRera: {
        name: 'MOFA to RERA Carpet Area Converter',
        description: "Free MOFA to RERA carpet area converter for Maharashtra flats. Convert MOFA carpet area to RERA carpet area (or vice versa) instantly. RERA carpet is ~5-8% larger than MOFA carpet.",
        keywords: 'mofa to rera carpet conversion, mofa to rera calculator, mofa carpet area, rera carpet area, mofa vs rera carpet area, maharashtra carpet area calculator, mofa to rera conversion formula, rera carpet area calculator, carpet area converter mofa rera, mofa rera difference, 360ghar',
        category: 'UtilitiesApplication',
        route: '/mofa-to-rera-converter'
    },
    sqFtCalculator: {
        name: 'Carpet Area to Sq Ft Calculator',
        description: "Free carpet area to square feet calculator. Convert carpet area, sq m, sq yd, gaj, and acres to square feet instantly. Accurate area-to-sq-ft conversion for Indian property buyers.",
        keywords: 'carpet area to sq ft calculator, sq ft calculator, square feet calculator, sq m to sq ft, sq yd to sq ft, gaj to sq ft, carpet area in square feet, area to sq ft converter, property area calculator, square feet conversion India, 360ghar',
        category: 'UtilitiesApplication',
        route: '/sq-ft-calculator'
    },
    acreInGaj: {
        name: 'Acre to Gaj Converter (1 Acre = 4840 Gaj)',
        description: "Free acre to gaj converter. 1 acre equals 4840 gaj. Convert acres to gaj, square feet, or square yards instantly. Accurate land area conversion for Indian property.",
        keywords: '1 acre in gaj, acre in gaj, acre to gaj, 1 acre equal to gaj, acre to gaj converter, 4840 gaj in acre, acre to sq ft, gaj to sq ft, 1 acre how many gaj, acre gaj conversion, land area converter India, 360ghar',
        category: 'UtilitiesApplication',
        route: '/acre-in-gaj'
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
        description: 'Check Vastu of your house or flat online for free. Upload your floor plan and get an instant AI-powered Vastu score, room-by-room analysis, and practical remedies for kitchen, bedroom, and entrance. Free online Vastu checker and calculator.',
        keywords: 'Vastu checker, Vastu analysis, floor plan Vastu, Vastu compliance, vastu shastra checker, Vastu evaluation online, Vastu score calculator, Vastu for home, Vastu for flat, online Vastu consultation, vastu check Hindi, ghar ka vastu, flat vastu checker online, vastu for home India, vastu shastra consultation online, online vastu check free, vastu calculator, how to check vastu of house, AI vastu checker, vastu for apartment, vastu dosh remedies, vastu for kitchen, vastu for bedroom, vastu for entrance direction, vastu compliance score',
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
    rentReceipt: {
        name: 'Rent Receipt Generator',
        description: "Generate rent receipts for HRA tax exemption claims instantly. Free online rent receipt maker with landlord PAN, revenue stamp, and PDF download. Create monthly or full-year receipts for Income Tax submission.",
        keywords: 'rent receipt generator, HRA receipt, rent receipt for tax exemption, rent receipt download, generate rent receipt online, monthly rent receipt, HRA claim receipt, landlord PAN rent receipt, revenue stamp rent receipt, rent receipt PDF, kiraya rasid, किराया रसीद, rent receipt India, rent receipt format, HRA exemption receipt, rent receipt maker free',
        category: 'FinanceApplication',
        route: '/rent-receipt'
    },
    fakeListingChecker: {
        name: 'Fake Listing Checker',
        description: 'Check if a property listing from 99acres, MagicBricks, or other portals is fake. Paste the URL to get instant verification against 360Ghar\'s physically verified database.',
        keywords: 'fake property listing check, verify property listing, 99acres fake listing, MagicBricks fraud, property listing verification India, fake real estate listing detector',
        category: 'UtilitiesApplication',
        route: '/check-fake-listing'
    },
    bankAuctions: {
        name: 'Bank Auction Properties',
        description: 'Find bank auction properties at discounted prices across India. Browse foreclosed properties from SBI, HDFC, ICICI, PNB and other banks.',
        keywords: 'bank auction property, foreclosed property, SBI auction, HDFC auction, bank auction 2026, distressed property, NPA property sale',
        category: 'RealEstateTool',
        route: '/bank-auctions',
        featureList: 'Bank auction listings, Property search, Multi-bank auctions, Discounted properties'
    },
    circleRates: {
        name: 'Circle Rate Directory',
        description: 'Find circle rates (ready reckoner rates) for properties across Haryana. Compare stamp duty and registration charges by locality.',
        keywords: 'circle rate, ready reckoner rate, collector rate, Haryana circle rate, stamp duty, property valuation, circle rate gurugram, circle rate faridabad',
        category: 'RealEstateTool',
        route: '/circle-rates',
        featureList: 'Circle rate lookup, Locality-wise rates, Stamp duty calculation, Property valuation reference'
    },
    reraProjects: {
        name: 'RERA Project Directory',
        description: 'Browse RERA registered real estate projects in Haryana. Verify project details, builder information, and compliance status.',
        keywords: 'RERA registered projects, RERA Haryana, HRERA, real estate regulatory authority, RERA verification, builder RERA number',
        category: 'RealEstateTool',
        route: '/rera-projects',
        featureList: 'RERA project lookup, Builder verification, Project compliance check, Registration status'
    }
};
