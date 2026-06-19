# Glossary

Project-specific terms used across the 360Ghar codebase, docs, and conversations.

| Term | Definition |
|------|------------|
| **360Ghar** | Company name. Means "360 home" - a full-circle view of real estate. Headquartered in Gurugram, Haryana, India. |
| **BHK** | Bedroom, Hall, Kitchen. Property classification denoting the number of bedrooms (1BHK, 2BHK, 3BHK, etc.). |
| **Vastu** | Vastu Shastra, ancient Indian architectural principles for spatial arrangement and design. The `/vastu-checker` tool uses AI to score floor plans against these principles. |
| **RERA** | Real Estate Regulation Authority. Indian regulatory body governing real estate transactions under the RERA Act 2016. |
| **Locality** | A neighborhood or named area within a city (e.g., Sector 56 in Gurugram). Used as a geographic filter and as the basis for locality pages. |
| **Programmatic SEO** | Auto-generated landing pages for city/intent/type combinations (e.g., `gurugram/buy/2bhk-flats`) to capture long-tail search traffic. See `src/pages/landing/`. |
| **LCP** | Largest Contentful Paint. Core Web Vital measuring when the largest visible element finishes rendering. Target < 2.5s. |
| **CWV** | Core Web Vitals. Google's set of real-world user experience metrics: LCP, INP, CLS. Captured via PostHog. |
| **GEO** | Generative Engine Optimization. Optimization for AI answer engines (ChatGPT, Perplexity, Gemini) rather than traditional search. |
| **AEO** | Answer Engine Optimization. Structuring content so AI assistants can extract and cite it as authoritative answers. |
| **MCP** | Model Context Protocol. Open standard for connecting AI assistants to external tools and data. The `/mcp/login` route provides MCP login for AI assistants. |
| **Supabase** | Backend-as-a-Service used for authentication. The frontend uses the Supabase Auth SDK directly; the backend only validates bearer tokens. |
| **PostHog** | Product analytics platform integrated for session replay, SPA pageview tracking, user identity, and Core Web Vitals capture. |
| **Facet Landing** | A landing page filtered by a specific facet: BHK (`/:bhk`), budget (`/budget/:budget`), or amenity (`/amenity/:amenity`). See `src/pages/landing/FacetLanding.jsx`. |
| **Prerendering** | Pre-generating static HTML at build time for key routes so the initial load ships meaningful content before JS hydrates. |
| **Entity Ingestion** | A build step that ingests Gurgaon area entities (localities, sectors, landmarks) into structured JSON used for sitemaps, landing pages, and search. |
| **WebMCP** | Web Model Context Protocol. A web-discoverable manifest that lets AI assistants find and use a site's tools and content. |
| **llms.txt** | An AI-readable site description file (akin to `robots.txt` for LLMs) that summarizes the site for crawlers and answer engines. Lives at `public/data/llm-feed.json`. |
| **Short Stay** | A temporary rental option (days to weeks) distinct from long-term rent or sale. Filtered via `check_in`, `check_out`, `guests` query params. |
| **Swipe** | A property like/dislike interaction (Tinder-style) recorded via `swipeService`. Liked properties populate the user's favorites. |
