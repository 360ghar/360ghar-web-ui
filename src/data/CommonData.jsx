// Top header Info
export const offCanvasInfos = [
    {
        icon: <i className="fas fa-map-marker-alt"></i>,
        textKey: 'common:offCanvas.location',
        link: ''
    },
    {
        icon: <i className="fas fa-envelope"></i>,
        textKey: 'common:offCanvas.email',
        link: 'mailto:'
    }
];


// Social List
export const socialLists = [
    {
        link: 'https://www.facebook.com/people/360Ghar',
        icon: <i className="fab fa-facebook-f"></i>,
        label: 'Facebook'
    },
    {
        link: 'https://x.com/360Ghar',
        icon: <i className="fab fa-twitter"></i>,
        label: 'X (Twitter)'
    },
    {
        link: 'https://in.linkedin.com/company/360ghar',
        icon: <i className="fab fa-linkedin-in"></i>,
        label: 'LinkedIn'
    },
    {
        link: 'https://www.instagram.com/360ghar/',
        icon: <i className="fab fa-instagram"></i>,
        label: 'Instagram'
    },
]

// Star Rating
export const starRatings = [
    {
        icon: <i className="fas fa-star"></i>
    },
    {
        icon: <i className="fas fa-star"></i>
    },
    {
        icon: <i className="fas fa-star"></i>
    },
    {
        icon: <i className="fas fa-star"></i>
    },
    {
        icon: <i className="fas fa-star"></i>
    },
]


// Top header Info
export const topHeaderInfos = [
    {
        icon: <i className="fas fa-envelope"></i>,
        textKey: 'common:offCanvas.email',
        link: 'mailto:'
    },
    {
        icon: <i className="fas fa-map-marker-alt"></i>,
        textKey: 'common:offCanvas.location',
        link: ''
    }
]


// Header Nav Menu
export const navMenus = [
    {
        textKey: "common:nav.home",
        path: "/",
    },
    {
        textKey: "common:nav.properties",
        path: "/properties",
    },
    {
        textKey: "common:nav.localities",
        path: "/localities",
        submenus: [
            {
                textKey: "common:nav.allLocalities",
                path: "/localities",
            },
            {
                textKey: "common:nav.dlfPhase1",
                path: "/locality/dlf-phase-1-gurgaon",
            },
            {
                textKey: "common:nav.dlfPhase2",
                path: "/locality/dlf-phase-2-gurgaon",
            },
            {
                textKey: "common:nav.dlfPhase5",
                path: "/locality/dlf-phase-5-gurgaon",
            },
            {
                textKey: "common:nav.golfCourseRoad",
                path: "/locality/golf-course-road-gurgaon",
            },
            {
                textKey: "common:nav.sushantLok1",
                path: "/locality/sushant-lok-1-gurgaon",
            },
        ],
    },
    {
        textKey: "common:nav.vastuChecker",
        path: "/vastu-checker",
    },
    {
        textKey: "common:nav.designBlueprint",
        path: "/design-blueprint",
    },
    {
        textKey: "common:nav.dataHub",
        path: "#",
        submenus: [
            {
                textKey: "common:nav.circleRates",
                path: "/circle-rates",
            },
            {
                textKey: "common:nav.reraProjects",
                path: "/rera-projects",
            },
            {
                textKey: "common:nav.bankAuctions",
                path: "/bank-auctions",
            },
            {
                textKey: "common:nav.stampDutyCalc",
                path: "/stamp-duty-calculator",
            },
            {
                textKey: "common:nav.verifyOwnership",
                path: "/verify-ownership",
            },
            {
                textKey: "common:nav.zoneChecker",
                path: "/zone-checker",
            },
            {
                textKey: "common:nav.regulatoryUpdates",
                path: "/regulatory-updates",
            },
            {
                textKey: "common:nav.builderReputation",
                path: "/builder-reputation",
            },
        ],
    },
    {
        textKey: "common:nav.services",
        path: "#",
        submenus: [
            {
                textKey: "common:nav.postProperty",
                path: "/post-property",
            },
            {
                textKey: "common:nav.propertyValuation",
                path: "/post-property",
            },
            {
                textKey: "common:nav.virtualTours",
                path: "/properties",
            },
            {
                textKey: "common:nav.mapSearch",
                path: "/map-location",
            },
            {
                textKey: "common:nav.aiAssistant",
                path: "/ai-agent",
            },
            {
                textKey: "common:nav.referAndEarn",
                path: "/refer-and-earn",
            },
        ],
    },
    {
        textKey: "common:nav.resources",
        path: "#",
        submenus: [
            {
                textKey: "common:nav.blog",
                path: "/blog",
            },
            {
                textKey: "common:nav.aiDesignStudio",
                path: "/ai-design-studio",
            },
            {
                textKey: "common:nav.aboutUs",
                path: "/about-us",
            },
            {
                textKey: "common:nav.faq",
                path: "/faq",
            },
            {
                textKey: "common:nav.emiCalculator",
                path: "/emi-calculator",
            },
            {
                textKey: "common:nav.loanEligibility",
                path: "/loan-eligibility-calculator",
            },
            {
                textKey: "common:nav.areaConverter",
                path: "/area-converter",
            },
            {
                textKey: "common:nav.carpetAreaCalc",
                path: "/area-calculator",
            },
            {
                textKey: "common:nav.propertyChecklist",
                path: "/property-document-checklist",
            },
            {
                textKey: "common:nav.capitalGainsTax",
                path: "/capital-gains-tax-calculator",
            },
            {
                textKey: "common:nav.rentReceipt",
                path: "/rent-receipt",
            },
            {
                textKey: "common:nav.policies",
                path: "/policies",
            },
        ],
    },
    {
        textKey: "common:nav.contact",
        path: "/contact",
    },
]



// Footer Content
export const footerInfos = [
    {
        icon: <i className="fas fa-map-marker-alt"></i>,
        textKey: 'common:commonData.addressLabel',
        addressKey: 'common:commonData.addressValue'
    },
    {
        icon: <i className="fas fa-envelope"></i>,
        textKey: 'common:commonData.emailLabel',
        addressKey: 'common:commonData.emailValue'
    }
]

export const footerServiceLinks = [
    {
        textKey: 'common:footer.propertySearch',
        link: '/properties'
    },
    {
        textKey: 'common:nav.postProperty',
        link: '/post-property'
    },
    {
        textKey: 'common:footer.virtualTours',
        link: '/properties'
    },
    {
        textKey: 'common:nav.bankAuctions',
        link: '/bank-auctions'
    },
    {
        textKey: 'common:nav.verifyOwnership',
        link: '/verify-ownership'
    },
    {
        textKey: 'common:nav.zoneChecker',
        link: '/zone-checker'
    },
    {
        textKey: 'common:nav.builderReputation',
        link: '/builder-reputation'
    },
    {
        textKey: 'common:nav.regulatoryUpdates',
        link: '/regulatory-updates'
    },
    {
        textKey: 'common:footer.propertyManagement',
        link: '/contact'
    },
    {
        textKey: 'common:footer.investmentAdvisory',
        link: '/contact'
    },
]

export const footerUsefulLinks = [
    {
        textKey: 'common:footer.propertyListings',
        link: '/properties'
    },
    {
        textKey: 'common:footer.about360ghar',
        link: '/about-us'
    },
    {
        textKey: 'common:footer.blogAndInsights',
        link: '/blog'
    },
    {
        textKey: 'common:nav.aiAssistant',
        link: '/ai-agent'
    },
    {
        textKey: 'common:nav.vastuChecker',
        link: '/vastu-checker'
    },
    {
        textKey: 'common:nav.aiDesignStudio',
        link: '/ai-design-studio'
    },
    {
        textKey: 'common:nav.auctionSources',
        link: '/auction-sources'
    },
    {
        textKey: 'common:nav.emiCalculator',
        link: '/emi-calculator'
    },
    {
        textKey: 'common:nav.loanEligibility',
        link: '/loan-eligibility-calculator'
    },
    {
        textKey: 'common:nav.areaConverter',
        link: '/area-converter'
    },
    {
        textKey: 'common:nav.propertyChecklist',
        link: '/property-document-checklist'
    },
    {
        textKey: 'common:nav.circleRates',
        link: '/circle-rates'
    },
    {
        textKey: 'common:nav.reraProjects',
        link: '/rera-projects'
    },
    {
        textKey: 'common:footer.stampDutyCalculator',
        link: '/stamp-duty-calculator'
    },
    {
        textKey: 'common:footer.helpCenter',
        link: '/faq'
    },
    {
        textKey: 'common:footer.contactUs',
        link: '/contact'
    },
    {
        textKey: 'common:footer.forAIAssistants',
        link: '/for-ai'
    },
    {
        textKey: 'common:nav.referAndEarn',
        link: '/refer-and-earn'
    },
    {
        textKey: 'common:footer.vsNoBroker',
        link: '/vs/nobroker'
    },
    {
        textKey: 'common:footer.vsMagicBricks',
        link: '/vs/magicbricks'
    },
    {
        textKey: 'common:footer.vs99acres',
        link: '/vs/99acres'
    },
    {
        textKey: 'common:footer.careers',
        link: '/careers'
    },
]


export const BottomFooterLink = [
    {
        textKey: 'common:footer.termsOfService',
        link: '/policies/terms-of-service'
    },
    {
        textKey: 'common:footer.privacyPolicy',
        link: '/policies/privacy-policy'
    },
    {
        textKey: 'common:nav.referAndEarn',
        link: '/refer-and-earn'
    },
    {
        textKey: 'common:footer.forAIAssistants',
        link: '/for-ai'
    }
]

