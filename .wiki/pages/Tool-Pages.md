# Tool Pages

360Ghar ships a suite of free real estate tools under `src/pages/tools/`. Each tool is a self-contained route component that sets SEO meta (including `SoftwareApplication` and `HowTo` schema), renders an interactive calculator or utility, and cross-links to related tools and guides. The tools index at `/tools` groups them by category. All copy is translated through the `tools` i18next namespace.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/tools` | `src/pages/tools/ToolsIndex.jsx` | Tools directory grouped by category |
| `/emi-calculator` | `src/pages/tools/EmiCalculator.jsx` | Home loan EMI calculator with amortization |
| `/area-converter` | `src/pages/tools/AreaConverter.jsx` | Indian area unit converter |
| `/area-calculator` | `src/pages/tools/AreaCalculator.jsx` | Plot area calculator |
| `/loan-eligibility-calculator` | `src/pages/tools/LoanEligibilityCalculator.jsx` | Loan eligibility + FOIR calculator |
| `/capital-gains-tax-calculator` | `src/pages/tools/CapitalGainsCalculator.jsx` | Capital gains tax with CII indexation |
| `/property-document-checklist` | `src/pages/tools/PropertyChecklist.jsx` | Property document checklist generator |
| `/design-blueprint` | `src/pages/tools/DesignBlueprint.jsx` | 3D floor plan designer (Blueprint3D) |
| `/vastu-checker` | `src/pages/tools/VastuChecker.jsx` | AI-powered Vastu compliance checker |
| `/check-fake-listing` | `src/pages/tools/FakeListingChecker.jsx` | Fake listing risk checker for portals |
| `/rent-receipt` | `src/pages/tools/RentReceipt.jsx` | Rent receipt generator (PDF) |

Shared helpers: `src/seo/toolSchemas.js` (`generateToolSchema`, `toolSchemas`), `src/components/tools/ToolContentSections.jsx` (`ToolFaq`, `ToolRelatedLinks`, `ToolInfoCard`, `ToolComparisonTable`), and `src/seo/structuredData.js` (`generateFaqStructuredData`, `generateHowToStructuredData`).

## Tool Details

### EmiCalculator (`/emi-calculator`)

The largest tool (~680 lines). Computes EMI using the standard formula `EMI = [P * R * (1+R)^N] / [(1+R)^N - 1]`, with R as monthly rate and N as months. Renders a principal/rate/tenure form, live EMI output, a full amortization schedule (principal/interest breakdown per year), and charts. Includes six FAQs covering EMI math, current 2026 rates, tenure tradeoffs, and the ideal EMI-to-income ratio. Emits `SoftwareApplication`, `FAQPage`, `HowTo`, and `BreadcrumbList` schema.

### AreaConverter (`/area-converter`)

Converts between Indian area units (sq ft, sq m, sq yard, marla, kanal, bigha, biswa, acre, hectare, ground, guntha). Has its own `AreaConverter.scss`. Bilingual FAQs through the `tools` namespace. Emits tool + FAQ + HowTo schema.

### AreaCalculator (`/area-calculator`)

Computes plot area from length/width and irregular shapes. Has its own `AreaCalculator.scss`. Same schema pattern as the converter.

### LoanEligibilityCalculator (`/loan-eligibility-calculator`)

Estimates maximum loan eligibility based on income, obligations, tenure, and rate. Explains FOIR (Fixed Obligation to Income Ratio) and how banks assess repayment capacity. Uses `ToolFaq`, `ToolRelatedLinks`, and `ToolInfoCard`. Emits tool + FAQ + HowTo schema.

### CapitalGainsCalculator (`/capital-gains-tax-calculator`)

Computes long-term and short-term capital gains tax on property sale, with indexation using the embedded `ciiData` table (Cost Inflation Index from 2001-02 onward). Handles indexation benefits pre/post Budget 2024 rules, exemptions under Sections 54/54F, and shows effective tax. Largest finance tool at ~515 lines. Emits tool + FAQ + HowTo schema.

### PropertyChecklist (`/property-document-checklist`)

Generates a printable checklist of documents needed for buying, selling, or renting property in India. Users select transaction type and property type, then get a tailored list with descriptions. Toast notifications confirm actions. Emits tool + FAQ + HowTo schema.

### DesignBlueprint (`/design-blueprint`)

A 3D floor plan designer that loads the Blueprint3D library from `/blueprint3d/index.html` in an iframe. Users draw walls and rooms in 2D, add furniture/doors/windows, and switch to a 3D walkthrough. Has its own `DesignBlueprint.css`. Includes four HowTo steps and FAQs that cross-link to the Vastu Checker for compliance analysis. No backend; purely client-side. Emits `SoftwareApplication`, `HowTo`, `FAQPage`, and `BreadcrumbList` schema.

### VastuChecker (`/vastu-checker`)

AI-powered Vastu compliance checker. Users upload a floor plan image (JPEG/PNG/WebP), pick the north direction (up/down/left/right/unknown), and submit. The page calls `analyzeFloorPlan` from `src/services/vastuService` (public endpoint, 3-minute timeout for AI processing). Renders `FloorPlanUpload`, `DirectionSelector`, `VastuLoadingState`, and `VastuReport` from `src/components/vastu/`. The report includes a score and room-by-room recommendations. Has its own `VastuChecker.scss`. Nine bilingual FAQs and four HowTo steps. Emits tool + FAQ + HowTo schema. See [Specialized Tools](../tools/Specialized-Tools) for the deep dive on the Vastu pipeline.

### FakeListingChecker (`/check-fake-listing`)

Helps users assess the risk that a listing on a portal (99acres, MagicBricks, Housing, etc.) is fake. Embeds `KNOWN_PORTALS` metadata with risk levels and known issues, and walks users through red flags. Emits tool + FAQ + HowTo schema.

### RentReceipt (`/rent-receipt`)

Generates printable rent receipts for HRA tax exemption claims. Uses `react-to-print` and `jsdpf` for PDF export, `html2canvas` for preview, and a `RentReceiptPreview` companion component. Has its own `RentReceipt.scss`. Emits tool + FAQ + HowTo schema.

### ToolsIndex (`/tools`)

The tools directory. Groups tools into categories (finance, area, legal, design) defined in `TOOL_CATEGORIES` and renders cards that link to each tool. Emits `BreadcrumbList` and serves as the hub for internal cross-linking from the tool `ToolRelatedLinks` sections.

## Common Patterns

- **Schema**: every tool emits `SoftwareApplication` (via `generateToolSchema`), `FAQPage`, `HowTo`, and `BreadcrumbList`. This powers rich results and AI discovery.
- **FAQs**: each tool defines its FAQ array inline, using either literal strings (EmiCalculator, CapitalGains) or translated keys (AreaConverter, VastuChecker). The `ToolFaq` component renders them.
- **Related links**: `ToolRelatedLinks` cross-links to sibling tools and relevant guides, keeping users in the tool ecosystem.
- **Localization**: all user-facing copy goes through the `tools` namespace; some tools (EmiCalculator, CapitalGains) hardcode English FAQ answers for SEO specificity.

For the deep-dive on the Vastu AI pipeline and the Blueprint3D integration, see [Specialized Tools](../tools/Specialized-Tools). For the SEO schema helpers, see [SEO](../common/SEO).
