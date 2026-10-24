/* Copied from 360ghar-web-ui/src (SEO parity). Keep in sync; do not edit by hand without a reason. */
import { siteMetadata } from './siteMetadata.js';

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
        // Only emit AggregateRating when real values are provided — fabricated
        // 4.8/150 defaults violate Google's Review Snippet spam policies.
        ...(cfg.ratingValue != null && cfg.reviewCount != null
            ? {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: cfg.ratingValue,
                    reviewCount: cfg.reviewCount,
                    bestRating: '5',
                    worstRating: '1',
                },
            }
            : {}),
    };
};

// Tool-specific schema data
export const toolSchemas = {
    emiCalculator: {
        name: 'Home Loan EMI Estimate',
        description: 'Estimate monthly payments and interest from entered principal, annual rate and tenure. This is not a lender quote, eligibility decision or affordability assessment; fees and lender terms are not included.',
        keywords: 'home loan EMI estimate, housing loan calculation, mortgage payment estimate, principal and interest schedule, prepayment scenario, real estate finance tool, 360ghar financial tools, होम लोन EMI अनुमान, होम लोन गणना, EMI भुगतान अनुमान',
        category: 'FinanceApplication',
        route: '/emi-calculator'
    },
    areaConverter: {
        name: 'Area Unit Converter',
        description: 'Convert between supported land-area units. Check the selected units and locally used definitions before relying on a result.',
        keywords: 'area converter india, sq ft to gaj, gaj to acre, bigha to acre, 4840 gaj in acre, 360 sq ft in gaj, 2400 gaj in acre, 2400 sq ft in gaj, bigha to acre calculator, bigha to acre conversion, gaj to bigha, 43560 sq ft to ground, ground to acre, land calculator india, bigha in acre, sq ft to gaj converter, gaj to sq ft, bigha converter, 1 acre to bigha in haryana, jamin calculator, 360 sq yard to gaj, land area converter India, acre to bigha, square feet to gaj, 1 gaj in bigha, 360ghar',
        category: 'UtilitiesApplication',
        route: '/area-converter'
    },
    areaCalculator: {
        name: 'Illustrative Carpet Area Scenario Calculator',
        description: 'Explore carpet and built-up area estimates from entered assumptions. The result is not a measurement, official area figure, or property assessment.',
        keywords: 'illustrative carpet area scenario, area estimate, loading assumption, 360ghar',
        category: 'UtilitiesApplication',
        route: '/area-calculator'
    },
    mofaToRera: {
        name: 'MOFA and RERA Area Comparison',
        description: 'Compare entered MOFA and RERA area figures using an assumption supplied by the user. The output is illustrative, not an official conversion.',
        keywords: 'MOFA RERA area comparison, illustrative area calculator, user-entered area assumption, 360ghar',
        category: 'UtilitiesApplication',
        route: '/mofa-to-rera-converter'
    },
    sqFtCalculator: {
        name: 'Carpet Area to Sq Ft Calculator',
        description: 'Convert entered area values to square feet using the selected unit. Check the unit before relying on the result.',
        keywords: 'carpet area to sq ft calculator, sq ft calculator, square feet calculator, sq m to sq ft, sq yd to sq ft, gaj to sq ft, carpet area in square feet, area to sq ft converter, property area calculator, square feet conversion India, 360ghar',
        category: 'UtilitiesApplication',
        route: '/sq-ft-calculator'
    },
    acreInGaj: {
        name: 'Acre to Gaj Converter (1 Acre = 4840 Gaj)',
        description: 'Convert acres, gaj and square-foot values using the unit definitions shown by the tool.',
        keywords: '1 acre in gaj, acre in gaj, acre to gaj, 1 acre equal to gaj, acre to gaj converter, 4840 gaj in acre, acre to sq ft, gaj to sq ft, 1 acre how many gaj, acre gaj conversion, land area converter India, 360ghar',
        category: 'UtilitiesApplication',
        route: '/acre-in-gaj'
    },
    loanEligibility: {
        name: 'Home Loan Estimate Scenario',
        description: 'Explore an illustrative amount from entered values using a fixed 50% income-share assumption. This is not a lender offer or approval.',
        keywords: 'home loan estimate scenario, illustrative loan calculation, income-share assumption, 360ghar',
        category: 'FinanceApplication',
        route: '/loan-eligibility-calculator'
    },
    capitalGains: {
        name: 'Property Sale Gain Worksheet',
        description: 'Calculate a pre-tax gain from entered sale price, purchase price and transfer expenses. Arithmetic only; this tool does not estimate income tax.',
        keywords: 'property sale gain calculator, pre-tax property gain, sale price minus purchase price, 360ghar',
        category: 'FinanceApplication',
        route: '/capital-gains-tax-calculator'
    },
    propertyChecklist: {
        name: 'Property Document Prompts',
        description: 'A non-exhaustive set of property-document prompts. Requirements vary by transaction and location; this tool does not review documents or confirm title or legal compliance.',
        keywords: 'property documents checklist, buying property documents, legal documents for property, property registration documents, property buying documents India, property sale documents, flat purchase documents, property verification documents, property kharidne ke documents, property registration documents Hindi, flat purchase documents India, property verification documents list',
        category: 'BusinessApplication',
        route: '/property-document-checklist'
    },
    vastuChecker: {
        name: 'Vastu Compliance Checker',
        description: 'Compare a floor plan with the tool’s Vastu rules and view an informational score. This is not a structural, safety or professional assessment.',
        keywords: 'Vastu checker, Vastu analysis, floor plan Vastu, Vastu score calculator, Vastu for home, Vastu for flat, AI Vastu checker',
        category: 'LifestyleApplication',
        route: '/vastu-checker'
    },
    designBlueprint: {
        name: '3D Blueprint Designer',
        description: 'Draw a floor plan, place furniture and view the layout in 3D. This is a planning aid, not a construction drawing.',
        keywords: 'floor planner, 3D home design, blueprint designer, floor plan creator, home design tool, online floor plan, 3D floor plan creator, house layout designer, room planner, interior design tool, ghar ka naksha banana, floor plan designer India, ghar design online, 3D ghar design tool, home layout planner India',
        category: 'DesignApplication',
        route: '/design-blueprint'
    },
    stampDutyCalculator: {
        name: 'Stamp Duty Calculator Under Review',
        description: 'Stamp-duty and registration-charge figures are withheld while official schedules and source terms are reviewed.',
        keywords: 'stamp duty rates under review, registration charges under review',
        category: 'FinanceApplication',
        route: '/stamp-duty-calculator'
    },
    verifyOwnership: {
        name: 'Haryana Jamabandi Record Lookup',
        description: 'Look up a Haryana Jamabandi record by tehsil, village, and khasra number. This lookup does not independently verify legal title, title deeds, possession, disputes, or ownership.',
        keywords: 'Haryana Jamabandi record lookup, land records Haryana, Khasra number lookup',
        category: 'BusinessApplication',
        route: '/verify-ownership'
    },
    aiDesignStudio: {
        name: 'AI Design Studio',
        description: 'Generate an AI design concept from a room description or image. Results may differ from the source and are not professional plans or property assessments.',
        keywords: 'AI interior design, AI room designer, AI exterior design, room design generator, home design AI, 360ghar',
        category: 'DesignApplication',
        route: '/ai-design-studio'
    },
    rentReceipt: {
        name: 'Rent Receipt Generator',
        description: 'Create a rent-receipt document from entered details. A generated receipt does not establish HRA or tax eligibility; check the applicable requirements independently.',
        keywords: 'rent receipt generator, rent receipt format, monthly rent receipt, rent receipt PDF, किराया रसीद',
        category: 'FinanceApplication',
        route: '/rent-receipt'
    },
    rentAgreementDrafter: {
        name: 'Rent Agreement Drafter',
        description: 'Draft a rent (leave and licence) agreement for a home in India from standard clauses. Fill in the parties, rent, deposit and term, then print. A draft, not legal advice.',
        keywords: 'rent agreement format, rent agreement draft, leave and licence agreement, rental agreement India, rent agreement Gurugram, kiraya samjhauta',
        category: 'BusinessApplication',
        route: '/rent-agreement-drafter'
    },
    legalNoticeDrafter: {
        name: 'Legal Notice Drafter',
        description: 'Draft a legal notice for a security deposit refund, unpaid rent or a vacated property in India. Fill in the facts and print. A draft, not legal advice.',
        keywords: 'legal notice format, legal notice for deposit refund, legal notice unpaid rent, tenant legal notice, landlord legal notice India',
        category: 'BusinessApplication',
        route: '/legal-notice-drafter'
    },
    fakeListingChecker: {
        name: 'Listing URL Checker',
        description: 'Checks the URL host and a small set of patterns. It does not open the listing or verify the property, owner, price or documents.',
        keywords: 'property listing URL check, listing link patterns, property listing URL checker India',
        category: 'UtilitiesApplication',
        route: '/check-fake-listing'
    },
    bankAuctions: {
        name: 'Bank Auction Listings Under Review',
        description: 'Auction listings are withheld while source records, reuse terms, and update checks are reviewed.',
        keywords: 'bank auction listings under review',
        category: 'RealEstateTool',
        route: '/bank-auctions'
    },
    circleRates: {
        name: 'Circle Rate Directory',
        description: 'Circle-rate records are withheld while official schedules, source terms and update checks are reviewed.',
        keywords: 'circle-rate records under review',
        category: 'RealEstateTool',
        route: '/circle-rates'
    },
    reraProjects: {
        name: 'RERA Project Directory',
        description: 'Browse real-estate projects on the Delhi RERA and Haryana RERA registers, with registration number, promoter, location and status. Sources are not yet verified.',
        keywords: 'RERA projects, Delhi RERA projects, HRERA registered projects, Haryana RERA project list',
        category: 'RealEstateTool',
        featureList: 'RERA project list, Registration number lookup, Promoter and location, Registration status',
        route: '/rera-projects'
    }
};
