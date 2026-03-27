export const aiAgentShowcaseContent = {
    badge: "AI-Powered",
    title: "Meet Your AI-Powered Property Guide",
    subtitle: "Search verified properties, schedule guided walkthroughs, and manage your rentals — all through natural conversation. No apps to navigate, no forms to fill.",
    subtitleHighlight: "Just ask.",
    mcpUrl: "http://api.360ghar.com/mcp"
};

export const aiAgentFeatures = [
    {
        icon: "search",
        title: "Smart Property Search",
        description: "Describe what you need in plain language. Our AI finds matching verified properties, compares options, and presents the best matches with guided walkthroughs.",
        example: '"Find a 2BHK furnished apartment in DLF Phase 3 under 35k"'
    },
    {
        icon: "calendar",
        title: "Instant Visit Scheduling",
        description: "Book property visits directly through conversation. The AI coordinates with owners, finds available time slots, and confirms instantly.",
        example: '"Schedule a visit for this Saturday afternoon"'
    },
    {
        icon: "home",
        title: "Property Management",
        description: "Landlords can track rent collection, manage tenants, handle maintenance requests, and access documents — all via simple chat.",
        example: '"Show me this month\'s rent collection status"'
    },
    {
        icon: "plug",
        title: "Connect Any AI Assistant",
        description: "Our MCP server integrates with Claude, ChatGPT, or any AI assistant. Access 360Ghar services directly from your preferred AI.",
        example: "MCP Server: api.360ghar.com/mcp"
    }
];

export const aiAgentHowItWorks = [
    {
        step: "01",
        title: "Connect Your AI",
        description: "Link Claude, ChatGPT, or any AI assistant to 360Ghar using our MCP server. One simple authentication connects your AI forever."
    },
    {
        step: "02",
        title: "Ask Naturally",
        description: "Type or speak what you need. \"Find 3BHK rentals near Cyber City under 50k\" or \"Show me properties with power backup in Sohna Road\"."
    },
    {
        step: "03",
        title: "AI Does the Rest",
        description: "Our AI searches listings, filters by your criteria, compares options, and presents the best matches. Book visits, get details, make decisions — all through conversation."
    }
];

export const aiAgentCapabilities = [
    {
        title: "Property Search & Matching",
        items: [
            "Natural language search across all listings",
            "AI-powered recommendation based on preferences",
            "Compare properties side-by-side",
            "Get notified when matching properties are listed"
        ]
    },
    {
        title: "Visit Management",
        items: [
            "Schedule visits through conversation",
            "Reschedule or cancel appointments",
            "Get visit reminders and property summaries",
            "Share visit schedules with family"
        ]
    },
    {
        title: "Landlord Services",
        items: [
            "Track rent collection and payments",
            "Manage tenant information and agreements",
            "Handle maintenance requests",
            "Access rent receipts and documents"
        ]
    },
    {
        title: "Market Insights",
        items: [
            "Price trends for your preferred localities",
            "Rental yield analysis",
            "Upcoming projects in your area of interest",
            "Neighborhood comparison reports"
        ]
    }
];

export const aiAgentMCPTools = [
    {
        name: "property_search",
        description: "Search properties with natural language filters"
    },
    {
        name: "get_property_details",
        description: "Get detailed information about any listing"
    },
    {
        name: "schedule_visit",
        description: "Book a physical visit to a property"
    },
    {
        name: "list_visits",
        description: "View all scheduled and past visits"
    },
    {
        name: "get_rent_status",
        description: "Check rent collection status (for landlords)"
    },
    {
        name: "manage_tenants",
        description: "Add, update, or remove tenant information"
    },
    {
        name: "track_maintenance",
        description: "Track and update maintenance requests"
    },
    {
        name: "get_documents",
        description: "Access rental agreements and property documents"
    }
];

export const aiAgentUseCases = [
    {
        role: "Home Buyer",
        scenario: "Looking for a 3BHK apartment in Golf Course Road area",
        conversation: '"I\'m looking to buy a 3BHK apartment in Golf Course Road area, preferably in a gated society with amenities. What options do you have under 2 crores?"',
        result: "AI presented 5 verified listings with guided walkthroughs, compared amenities, and scheduled visits for the top 3 properties."
    },
    {
        role: "Tenant",
        scenario: "Searching for PG in Gurugram near metro",
        conversation: '"Need a single room in a PG near MG Road metro, with WiFi and meals included. Budget around 15k."',
        result: "AI found 8 verified PGs, showed photos and guided walkthroughs, and helped schedule site visits."
    },
    {
        role: "Landlord",
        scenario: "Managing rental property efficiently",
        conversation: '"List all my properties and show me this month\'s rent collection. Also, any pending maintenance requests?"',
        result: "AI displayed dashboard with 4 properties, collection summary, and 2 pending maintenance tickets with owner details."
    }
];

export const aiAgentFAQs = [
    {
        question: "What is 360Ghar's AI Agent?",
        answer: "360Ghar's AI Agent is an intelligent assistant powered by our MCP server that helps you find properties, book visits, and manage rentals through natural conversation. Connect it to Claude, ChatGPT, or any AI assistant to access all 360Ghar services via chat."
    },
    {
        question: "How do I connect my AI assistant to 360Ghar?",
        answer: "Visit our MCP login page and authenticate your 360Ghar account. Once connected, your AI assistant will have access to search properties, schedule visits, and manage your rentals. The connection persists until you revoke access."
    },
    {
        question: "Is MCP server access free?",
        answer: "Yes, connecting your AI assistant via MCP is completely free for all 360Ghar users. You can search properties, view listings, and access basic features at no cost. Premium features may apply for certain property management capabilities."
    },
    {
        question: "Which AI assistants can connect to 360Ghar?",
        answer: "Our MCP server is compatible with any AI assistant that supports the Model Context Protocol, including Claude (via Claude Desktop), ChatGPT, and custom AI implementations. You can also build your own integrations using our API."
    },
    {
        question: "Is my data secure when using AI?",
        answer: "Absolutely. Your 360Ghar account data is protected with enterprise-grade security. The AI assistant only accesses data you've explicitly authorized. All conversations and data access are logged for your security."
    },
    {
        question: "Can the AI help me with property management?",
        answer: "Yes! Landlords can use the AI to track rent collection, manage tenants, handle maintenance requests, and access property documents. Just ask: \"Show me this month's rent status\" or \"List all open maintenance requests\"."
    },
    {
        question: "What can I search for using natural language?",
        answer: "Almost anything! Try: '2BHK furnished flat near Cyber City under 30k', '3BHK apartment in DLF Phase 5 with power backup', or 'PG in Sector 22 with WiFi and meals'. The AI understands context and preferences."
    },
    {
        question: "How accurate are the AI property recommendations?",
        answer: "Our AI learns from your preferences and behavior. The more you interact, the better it understands your needs. All property data is verified by our on-site team, so recommendations are based on accurate, up-to-date listings."
    }
];

export const aiAgentStats = {
    propertiesSearched: "50K+",
    visitsScheduled: "10K+",
    queriesHandled: "24/7",
    accuracy: "99%"
};

export const aiAgentCTASection = {
    badge: "Get Started",
    title: "Ready to Find Home the Smart Way?",
    subtitle: "Connect your AI assistant in seconds and discover India's VR-First Way to Find a Home — verified properties, guided walkthroughs, complete transparency.",
    primaryCTA: "Connect AI Assistant",
    primaryLink: "/mcp/login",
    secondaryCTA: "Learn More",
    secondaryLink: "/ai-agent"
};
