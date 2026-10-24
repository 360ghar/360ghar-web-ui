/**
 * Content ported from the old site (360ghar-web-ui/src/pages/data-hub/*.jsx and
 * src/pages/geo/*.jsx): FAQs, HowTo steps, the auction portal list, the tehsil
 * list and the three static geo datasets. Generated once from the old source;
 * em dashes and emojis were removed. English only, as on the old site.
 *
 * Corrections applied after a copy audit (2026-10): the old site linked the HRERA
 * portal at a domain that now 301-redirects to an unrelated commercial site, so
 * every link points at `haryanarera.gov.in` instead; the example RERA number
 * format was replaced with the formats the registers actually issue; and the
 * builder-score answers now state the score the site computes rather than an
 * algorithm it does not run. `BUILDERS`, `AREAS` and `SECTORS` are unchanged and
 * are 360Ghar's own 2026 editorial estimates, not register figures.
 */
export type Faq = { q: string; a: string };
export type Step = { name: string; text: string };

export const FAQ = {
  "circleRates": [
    {
      "q": "What are circle rates in Gurugram?",
      "a": "Circle rates (also called DLC rates or collector rates) are the minimum property valuation rates set by the Haryana government for each sector and colony. They are used to calculate stamp duty on property registrations. No property sale can be registered below the circle rate for that area."
    },
    {
      "q": "How are circle rates different from market rates?",
      "a": "Circle rates are government-set minimum values used for stamp duty calculation, while market rates are the actual prices at which properties are bought and sold. Market rates are typically 20-50% higher than circle rates in prime areas. Circle rates serve as a floor price for registration purposes."
    },
    {
      "q": "Do circle rates affect stamp duty?",
      "a": "Yes, stamp duty is calculated on the higher of the circle rate or the actual transaction value. If you buy a property below the circle rate, you still pay stamp duty based on the circle rate. This ensures the government collects a minimum amount of stamp duty on every property transaction."
    },
    {
      "q": "How often are circle rates revised in Haryana?",
      "a": "Circle rates in Haryana are revised periodically by the IGRS (Inspector General of Registration and Stamps), typically every 1-2 years. Revisions usually happen at the start of the financial year in April, though interim revisions can happen if there are significant market changes. The government issues gazette notifications when new rates come into effect."
    },
    {
      "q": "Can I buy property below the circle rate?",
      "a": "No, you cannot legally register a property below the circle rate. The Sub-Registrar will refuse to register the transaction if the declared value is below the applicable circle rate. Under Section 50C of the Income Tax Act, the difference between circle rate and actual price is taxable as income for the seller. You can negotiate the actual purchase price, but stamp duty will always be calculated on the circle rate value."
    },
    {
      "q": "What is the difference between circle rate, ready reckoner rate, and collector rate?",
      "a": "These are all names for the same thing, the minimum property valuation set by the government for stamp duty purposes. In Maharashtra it's called \"ready reckoner rate,\" in Haryana and Delhi it's \"circle rate,\" and in some states it's \"collector rate.\" All serve the same function of preventing under-valuation of properties."
    },
    {
      "q": "How do I check the circle rate for a specific locality in Gurugram?",
      "a": "Pick the sector and the property type on this page to see its rate per square yard and per square foot. The rates come from IGRS Haryana. You can also check the Haryana Revenue Department's website or visit the local Sub-Registrar's office for the latest rates."
    }
  ],
  "stampDuty": [
    {
      "q": "How is stamp duty calculated in Haryana in 2026?",
      "a": "In Haryana, stamp duty is calculated as a percentage of the property's transaction value or the circle rate, whichever is higher. As of 2026, the rates are 7% for male buyers, 5% for female buyers in urban areas, and 3% for properties in rural areas. An additional 1% registration fee is charged separately."
    },
    {
      "q": "What is the stamp duty rate for female buyers in Haryana?",
      "a": "Female buyers in Haryana pay 5% stamp duty on property purchases in urban areas, compared to 7% for male buyers. This 2% concession was introduced to encourage women's homeownership. The property must be registered in the woman's name to avail this benefit."
    },
    {
      "q": "Is stamp duty payable on gift deeds in Haryana?",
      "a": "Yes, stamp duty is payable on gift deeds in Haryana. When property is gifted to a blood relative (parent, child, sibling), the stamp duty is typically 3-5% depending on the relationship. For non-relatives, the standard rates apply. The deed must be registered at the Sub-Registrar's office."
    },
    {
      "q": "Can stamp duty be paid online in Haryana?",
      "a": "Yes, Haryana offers online stamp duty payment through the e-STAMPS portal (https://www.shcilestamp.com). You can generate an e-stamp paper online using net banking, debit card, or UPI. This is the preferred method as it eliminates the need for physical stamp papers."
    },
    {
      "q": "What happens if a property is registered below the circle rate?",
      "a": "If a property is registered below the circle rate (also called ready reckoner rate or collector rate), the sub-registrar may refuse registration. Additionally, both buyer and seller can face penalties under Section 50C of the Income Tax Act. The difference between circle rate and actual price is treated as income and taxed accordingly."
    },
    {
      "q": "What is the difference between stamp duty and registration charges?",
      "a": "Stamp duty is a tax paid on the property transaction value, while registration charges are fees paid for the legal registration of the property document. In Haryana, stamp duty ranges from 5-7% while registration charges are typically 1% of the property value. Both are mandatory for a valid property transfer."
    },
    {
      "q": "Is stamp duty refundable if the deal falls through?",
      "a": "Yes, stamp duty can be refunded if the property deal falls through before registration. You need to apply for a refund within 6 months from the date of execution of the document. A processing fee of 1-2% is deducted. If the document was already registered, the refund process is more complex and may require a court order."
    },
    {
      "q": "How does stamp duty affect home loan eligibility?",
      "a": "Stamp duty and registration charges are additional costs that reduce your effective home loan eligibility. Banks typically fund 80-90% of the property value but stamp duty must be paid from your own funds. For a ₹50 lakh property in Haryana, stamp duty (7%) and registration (1%) add ₹4 lakh to your upfront costs."
    },
    {
      "q": "What is the stamp duty for resale properties in Haryana?",
      "a": "Stamp duty for resale properties in Haryana is the same as for new properties, 7% for male buyers and 5% for female buyers in urban areas. The duty is calculated on the higher of the actual transaction value or the circle rate. The seller must also clear any pending property taxes before registration."
    }
  ],
  "rera": [
    {
      "q": "Is RERA registration mandatory in Haryana?",
      "a": "Yes, RERA registration is mandatory for all real estate projects in Haryana where the land area exceeds 500 square metres or the number of apartments exceeds 8. Even ongoing projects that have not received a completion certificate must register with HRERA. Projects by government authorities and those on very small plots are exempt, but these exemptions are narrow and must be verified."
    },
    {
      "q": "Is it safe to buy a property that is not RERA registered?",
      "a": "Buying a non-RERA registered project carries significant risk. Unregistered projects may lack the consumer protections that RERA provides, such as escrow accounts (70% of funds) for construction, mandatory quarterly progress updates, and access to the RERA complaint mechanism. If a project should be registered but is not, the developer may face penalties, and buyers could face difficulties with delivery timelines and quality."
    },
    {
      "q": "How can I verify a RERA project in Haryana?",
      "a": "You can verify a RERA project on the HRERA website (haryanarera.gov.in) by searching the project name or registration number. Check that the registration number matches the pattern the register issues (for example RERA-GRG-PROJ-1540-2024 from HRERA, or DLRERA2026P0011 from Delhi RERA). You can also use our Quick RERA Verify tool above to instantly check any registration number. Always cross-verify the project status, developer details, and possession dates on the HRERA portal."
    },
    {
      "q": "What rights do buyers have under RERA in Haryana?",
      "a": "Under RERA, buyers have the right to: (1) Receive possession as per the agreement date, with compensation for delays. (2) Access project information including sanctioned plans, approvals, and quarterly progress updates. (3) Claim refund with interest if the developer fails to deliver. (4) File complaints with HRERA for any violation, with disputes resolved within 60 days. (5) 5-year structural defect warranty from the developer."
    },
    {
      "q": "How do I file a RERA complaint in Haryana?",
      "a": "File a complaint on the HRERA website (haryanarera.gov.in) by registering as a complainant, filling out the complaint form, paying the fee (Rs. 1,000 for individuals), and uploading supporting documents (allotment letter, payment receipts, communication with the developer). HRERA benches in Panchkula and Gurugram hear cases. The authority aims to dispose of complaints within 60 days of the hearing."
    },
    {
      "q": "What is the difference between RERA and HRERA?",
      "a": "RERA (Real Estate Regulatory Authority) is the central Act passed by Parliament in 2016. HRERA is the Haryana state implementation of RERA, with offices in Panchkula and Gurugram. HRERA enforces RERA provisions specifically for Haryana, including project registration, agent registration, and complaint resolution."
    },
    {
      "q": "Can a RERA registered project still be delayed?",
      "a": "Yes, RERA registration does not guarantee on-time delivery. However, RERA gives buyers strong protections: developers must pay interest for every month of delay, buyers can claim full refunds, and HRERA can impose penalties up to 10% of the project cost. The quarterly progress reporting requirement also increases transparency."
    },
    {
      "q": "What is the RERA registration fee for developers in Haryana?",
      "a": "In Haryana, the RERA registration fee for residential projects is Rs. 10 per square metre for projects up to 1,000 sq m, and Rs. 15 per square metre for larger projects. For commercial projects, the fee is Rs. 20 per square metre. The registration is valid for 5 years or until the project completion certificate is issued, whichever is earlier."
    },
    {
      "q": "What happens when a RERA registration expires?",
      "a": "When a RERA registration expires, the developer cannot legally sell or market units in that project. Buyers should verify that the registration is active before making any payment. If a project's registration has expired, the developer must apply for renewal with HRERA, providing updated project details and compliance documents. Buying from an expired-registration project offers no RERA protections."
    }
  ],
  "auctions": [
    {
      "q": "What are SARFAESI auctions?",
      "a": "SARFAESI auctions are property auctions conducted by banks and financial institutions under the Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest (SARFAESI) Act, 2002. When a borrower defaults on a loan, the bank can recover dues by auctioning the secured property without court intervention, provided the default exceeds the threshold set by the RBI."
    },
    {
      "q": "Can I get a loan for a bank-auctioned property?",
      "a": "Yes, most banks offer loans for auctioned properties, but the process differs from regular home loans. You typically need to arrange 20-25% as earnest money deposit (EMD) upfront to participate in the auction. After winning the bid, you can apply for a loan for the balance amount. Some banks like SBI and Bank of Baroda have specific products for auction property financing."
    },
    {
      "q": "Are bank auction properties cheaper than market price?",
      "a": "Bank auction properties are often listed at reserve prices that can be 10-30% below prevailing market rates, especially if the bank wants a quick recovery. However, the final price depends on bidding competition. Properties with legal disputes or unclear titles may sell at deeper discounts but carry higher risk. Always verify the title and encumbrance status before bidding."
    },
    {
      "q": "What are the risks of buying property through bank auctions?",
      "a": "Key risks include: (1) The property may have pending legal disputes or litigations from the previous owner. (2) Physical possession may be difficult to obtain if occupants refuse to vacate. (3) There is usually no warranty on the property condition. (4) Outstanding dues like property tax, maintenance, or utility bills may be your responsibility. Always conduct thorough due diligence before bidding."
    },
    {
      "q": "How can I participate in a bank auction in Delhi NCR?",
      "a": "To participate: (1) Check auction notices on bank websites or portals like IBAPI, BankEAuctions, or eAuctionsIndia. (2) Download the auction notification and read the terms carefully. (3) Submit the Earnest Money Deposit (EMD) and required documents before the deadline. (4) Attend the auction (in-person or online). (5) If you win, pay the balance within the stipulated period (usually 15-30 days). Ensure you verify the property title and possession status beforehand."
    },
    {
      "q": "What is the difference between SARFAESI, DRT, and IBC auctions?",
      "a": "SARFAESI auctions are conducted by banks directly under the SARFAESI Act 2002 for NPA recovery. DRT (Debt Recovery Tribunal) auctions happen through court proceedings under the RDDBFI Act. IBC (Insolvency and Bankruptcy Code) auctions occur when a company goes through corporate insolvency resolution or liquidation, managed by insolvency professionals under IBBI oversight. Each has different timelines, processes, and buyer protections."
    },
    {
      "q": "What are HSVP (formerly HUDA) e-auctions in Haryana?",
      "a": "Haryana Shehri Vikas Pradhikaran (HSVP), formerly known as HUDA, conducts e-auctions for residential, commercial, industrial, and institutional plots across Haryana cities including Gurugram, Faridabad, and Panchkula. These are direct government auctions with no middlemen, often offering plots at below-market reserve prices. Auctions are held periodically through the HSVP e-Auction portal or the Procure247 platform."
    },
    {
      "q": "How do DDA e-auctions work in Delhi?",
      "a": "The Delhi Development Authority (DDA) periodically holds e-auctions (Mega e-Auction phases) for residential, commercial, and industrial plots across Delhi sectors through the DDA Bhoomi Portal (eservices.dda.org.in). You need to register on the portal, pay the earnest money online, and participate in the online bidding. DDA auctions are transparent and the allotment is done through the highest bidder system."
    },
    {
      "q": "What is IBAPI and why is it important for bank auction properties?",
      "a": "IBAPI (Indian Banks Auction Properties Information) is an RBI-mandated platform where all public sector banks, SBI, PNB, Bank of Baroda, Canara Bank, Union Bank, and others, are required to list their NPA auction properties. It is the single most comprehensive source for bank auction properties in India, with filters for city, bank, and property type. Since April 2025, IBBI also mandates listing insolvency liquidation assets exclusively on BaankNet/eBKray."
    }
  ],
  "sources": [
    {
      "q": "What types of property auctions exist in India?",
      "a": "There are four main types: (1) SARFAESI auctions, conducted by banks directly for NPA recovery without court involvement. (2) DRT auctions, ordered by Debt Recovery Tribunals under the RDDBFI Act. (3) IBC/Insolvency auctions, managed by insolvency professionals under the Insolvency and Bankruptcy Code, listed on BaankNet/eBKray. (4) Government authority auctions, conducted by development authorities like DDA (Delhi), HSVP (Haryana), MDA (Meerut), and YEIDA for plots and commercial properties."
    },
    {
      "q": "What is IBAPI and why is it the most important auction portal?",
      "a": "IBAPI (Indian Banks Auction Properties Information) is an RBI-mandated platform at ibapi.in where all public sector banks, SBI, PNB, Bank of Baroda, Canara Bank, Union Bank, and others, are required to list their NPA auction properties. It is the single most comprehensive source for bank auction properties in India, with filters for city, bank, and property type. If you check only one portal, make it IBAPI."
    },
    {
      "q": "How do HSVP e-auctions work in Gurugram?",
      "a": "Haryana Shehri Vikas Pradhikaran (HSVP, formerly HUDA) conducts e-auctions for residential, commercial, industrial, and institutional plots across Haryana cities including Gurugram. Auctions are held periodically through the HSVP e-Auction portal (eauction.hsvphry.org.in) or the Procure247 platform (hsvp.procure247.com). You need to register, pay the earnest money, and participate in online bidding. These are direct government auctions with no middlemen."
    },
    {
      "q": "What are DDA e-auctions in Delhi?",
      "a": "The Delhi Development Authority (DDA) holds e-auctions (called Mega e-Auction phases) for residential, commercial, and industrial plots across Delhi through the DDA Bhoomi Portal at eservices.dda.org.in. Registration is online, earnest money is paid digitally, and bidding happens in real-time. DDA auctions are transparent and allotment goes to the highest bidder."
    },
    {
      "q": "What is BaankNet/eBKray and how is it different from IBAPI?",
      "a": "BaankNet (baanknet.com), also known as eBKray, is the IBBI-mandated e-auction platform specifically for bank NPA and insolvency liquidation assets. Since April 2025, all liquidation process assets under IBC/NCLT cases must exclusively list on BaankNet. IBAPI covers SARFAESI/NPA auctions by PSU banks, while BaankNet covers the insolvency/liquidation side. Both are important, check both for comprehensive coverage."
    },
    {
      "q": "Can I get a loan for a bank-auctioned property?",
      "a": "Yes, most banks offer loans for auctioned properties, but the process differs from regular home loans. You need to arrange 20-25% as earnest money deposit (EMD) upfront to participate. After winning the bid, you can apply for a loan for the balance amount. SBI and Bank of Baroda have specific products for auction property financing. Pre-approve your loan before bidding to avoid missing payment deadlines."
    },
    {
      "q": "What are the risks of buying auction properties?",
      "a": "Key risks include: (1) Pending legal disputes from the previous owner. (2) Physical possession may be difficult if occupants refuse to vacate. (3) No warranty on property condition. (4) Outstanding dues (property tax, maintenance, utility bills) may be your responsibility. (5) Title defects or encumbrances. Always verify title, encumbrance status, possession, and outstanding dues before bidding. Hire a property lawyer for due diligence."
    },
    {
      "q": "How do I participate in an online property auction?",
      "a": "Steps: (1) Find auction notices on the relevant portal (IBAPI, DDA, HSVP, etc.). (2) Download the auction notification and read all terms carefully. (3) Register on the auction platform. (4) Pay the Earnest Money Deposit (EMD) online before the deadline. (5) Participate in the live e-auction. (6) If you win, pay the balance within the stipulated period (usually 15-30 days). (7) Complete documentation and take possession. Pre-auction due diligence is critical."
    },
    {
      "q": "Are aggregator sites like BankEAuctions reliable?",
      "a": "Aggregator sites like BankEAuctions.com, eAuctionsIndia.com, and FindAuction.in pull listings from multiple bank and government sources, making it easier to browse auctions in one place. They are useful for discovery and alerts. However, always verify details on the official source (bank website, IBAPI, or government portal) before participating, as aggregator data may not be real-time or fully accurate."
    },
    {
      "q": "What documents should I check before bidding on an auction property?",
      "a": "Essential due diligence: (1) Title deed and chain of ownership. (2) Encumbrance certificate from the sub-registrar. (3) Property tax receipts. (4) Approved building plan and occupation certificate. (5) Possession status, vacant or occupied. (6) Any court orders or attachments. (7) Society/RWA NOC if applicable. (8) Loan statement from the auctioning bank showing outstanding amount. Engage a property lawyer to verify these documents."
    },
    {
      "q": "How do DRT auctions differ from bank-conducted SARFAESI auctions?",
      "a": "In SARFAESI auctions, the bank directly auctions the property after giving the borrower 60 days notice, no court involvement needed. In DRT auctions, the bank approaches the Debt Recovery Tribunal, which then orders the sale through a court process. DRT auctions take longer but provide more legal protection for buyers since the sale is court-ordered. DRT auctions are listed on drt.gov.in."
    },
    {
      "q": "What are MDA and YEIDA auctions in Meerut/UP?",
      "a": "MDA (Meerut Development Authority) auctions plots and shops in Meerut through mdameerut.in, covering EWS, LIG, MIG, HIG categories. YEIDA (Yamuna Expressway Industrial Development Authority) auctions commercial, industrial, and institutional plots along the Yamuna Expressway corridor (Greater Noida to Agra). Both are government authority auctions offering plots at reserve prices that can be significantly below market rates."
    }
  ],
  "zones": [
    {
      "q": "What is CLU in Gurugram?",
      "a": "CLU stands for Change of Land Use. It is an approval from the Town and Country Planning Department, Haryana, that allows conversion of land from one use (e.g., agricultural) to another (e.g., residential or commercial). Without CLU approval, you cannot legally develop or construct on land that is zoned differently from your intended use. CLU applications involve fees, documentation, and compliance with the Master Plan."
    },
    {
      "q": "Can I convert residential property to commercial in Gurugram?",
      "a": "Yes, but you need CLU approval from the Department of Town and Country Planning (DTCP), Haryana. The process involves submitting an application with the current property documents, proposed commercial use details, and applicable fees. Approval depends on the Master Plan zoning of the area. Properties on designated commercial belts or mixed-use zones have a higher chance of approval. Conversion in purely residential zones is typically denied."
    },
    {
      "q": "How do I check the zoning status of a property in Gurugram?",
      "a": "You can check zoning status through the Haryana DTCP portal or by visiting the DTCP office in Gurugram. The Master Plan 2031 (and the upcoming Master Plan 2041) classifies all sectors into zones like residential, commercial, industrial, and institutional. You can also use our Zone Checker tool above to look up land use, FAR, and height restrictions for specific sectors."
    },
    {
      "q": "What is MCG approval and is it different from DTCP?",
      "a": "MCG (Municipal Corporation of Gurugram) approval is required for building plan sanctions, occupation certificates, and property tax within MCG limits. DTCP (Department of Town and Country Planning) handles land use zoning and CLU approvals. They are separate authorities. For most construction projects, you need both DTCP zoning clearance and MCG building plan approval. Licensed colonies get DTCP approval, while MCG handles infrastructure and civic permissions."
    },
    {
      "q": "What is the difference between R-zone and S-zone in Haryana?",
      "a": "In Haryana zoning terminology, R-zone (Residential zone) designates areas primarily for residential development, including plotted housing, group housing, and mixed-use along designated commercial belts. S-zone (Special zone) typically refers to areas with special development regulations, often near SEZs, industrial corridors, or areas requiring environmental clearances. S-zone may allow mixed development but with stricter density and height controls. Always verify the specific development norms for your zone with DTCP."
    }
  ],
  "gazette": [
    {
      "q": "What are Haryana gazette notifications for real estate?",
      "a": "Haryana gazette notifications are official government publications that announce changes in laws, rules, and policies affecting real estate. These include circle rate revisions, land acquisition notices, CLU (Change of Land Use) policy changes, building code amendments, and RERA rule modifications. Once published in the gazette, these changes have legal force and must be followed by all stakeholders."
    },
    {
      "q": "How does a CLU notification affect property value?",
      "a": "A CLU (Change of Land Use) notification can significantly affect property value. When agricultural or institutional land is approved for residential or commercial use, property values typically increase substantially because the land can now be developed for higher-value purposes. Conversely, if a CLU is denied or revoked, it can decrease property value. Investors and developers closely monitor CLU notifications for investment opportunities."
    },
    {
      "q": "What recent policy changes have affected Gurugram real estate?",
      "a": "Recent policy changes affecting Gurugram real estate include revisions to the Haryana Building Code, updates to the Affordable Housing Policy, amendments to the Deen Dayal Jan Awas Yojna (DDJAY) plot sizes, and changes in the licensing fee structure for commercial and mixed-use developments. The government has also eased conversion norms for commercial activities along designated roads. Check our regulatory updates above for the latest notifications."
    },
    {
      "q": "Where can I find official Haryana real estate regulations?",
      "a": "Official Haryana real estate regulations can be found on the Department of Town and Country Planning (DTCP) website (tcpharyana.gov.in), the HRERA website (haryanarera.gov.in), the Haryana Revenue Department for stamp duty and circle rates, and the India E-Gazette portal (egazette.nic.in). You can also check our Regulatory Updates page for curated notifications specific to Gurugram real estate."
    },
    {
      "q": "How can I stay updated on Haryana real estate regulatory changes?",
      "a": "To stay updated: (1) Bookmark the HRERA and DTCP websites for project and zoning updates. (2) Subscribe to the India E-Gazette for official notifications. (3) Follow our Regulatory Updates page on 360Ghar, where we curate and explain notifications relevant to Gurugram real estate. (4) Set up Google Alerts for key terms like \"HRERA notification\" or \"Gurugram circle rate revision\". (5) Consult a real estate lawyer for significant regulatory changes affecting your property."
    }
  ],
  "builders": [
    {
      "q": "What is a good builder reputation score?",
      "a": "A builder reputation score of 70 or above is considered good. This indicates the builder has a strong track record with HRERA-registered projects, minimal complaints, and timely delivery. Scores between 40 and 69 are average, suggesting some concerns around project delivery or complaints. Scores below 40 indicate poor reputation with multiple pending complaints or regulatory violations."
    },
    {
      "q": "How is the builder reputation score calculated?",
      "a": "The score on this page is 100 minus 15 for each complaint per project, capped at 0, from the RERA projects and complaints on 360Ghar's records. A builder with no projects on record scores 50. It uses no other input: the delivery record, the completion status and any penalties do not enter this figure. A separate five-pillar score (delivery, regulatory, complaints, financials, market reception) is shown on a builder's own page where the filing data supports it."
    },
    {
      "q": "Why is it important to check a builder's reputation before buying?",
      "a": "Checking a builder's reputation helps you avoid investing with developers who have a history of project delays, legal disputes, or poor construction quality. In Gurugram, where numerous projects have been delayed by years, a reputation check can save you from significant financial risk and emotional distress. It also helps you negotiate better terms with reputable builders."
    },
    {
      "q": "What does RERA compliance mean for a builder?",
      "a": "RERA compliance means the builder has registered all applicable projects with the Haryana Real Estate Regulatory Authority (HRERA) and follows the rules set by RERA. This includes maintaining a separate escrow account for each project (70% of funds), submitting quarterly updates on project progress, and adhering to the approved building plans. Non-compliance can result in penalties, project deregistration, or imprisonment."
    },
    {
      "q": "How do I file a complaint against a builder in Haryana?",
      "a": "You can file a complaint with HRERA through their official website (haryanarera.gov.in) or by visiting the HRERA office in Panchkula or Gurugram. You need to fill out the complaint form, pay the prescribed fee (currently Rs. 1,000), and provide supporting documents like the allotment letter, payment receipts, and evidence of the grievance. HRERA typically disposes of complaints within 60 days."
    }
  ],
  "builderScore": [
    {
      "q": "Which builders have the best reputation in Gurugram?",
      "a": "The eight builders on this guide are the large Gurugram developers 360Ghar ranked in its own 2026 research. The score and the project and complaint counts beside each name are that research's figures, not the live register counts: they were compiled from public sources and the developer's own disclosures, and 360Ghar has not published the sample behind them. For the figures the site computes today from the RERA registers, open the builder reputation directory."
    },
    {
      "q": "How do I check if a builder is RERA registered in Haryana?",
      "a": "Visit haryanarera.gov.in, the official Haryana Real Estate Regulatory Authority website. Search by builder name or project name to see RERA registration status, project details, quarterly progress reports, and complaint history. All builders operating in Haryana must register projects above 500 sq m."
    },
    {
      "q": "What is a safe minimum reputation score before buying from a builder?",
      "a": "A score of 70 or above is considered safe for investment. Scores between 40–69 require extra due diligence, check complaint details individually. Scores below 40 indicate significant risk of project delays, legal disputes, or stalled construction. Consult a real estate lawyer before investing."
    }
  ],
  "tenant": [
    {
      "q": "Which areas in Gurugram have the highest tenant demand?",
      "a": "DLF Phase 1, Golf Course Road, and Sushant Lok 1 have the highest tenant demand in Gurugram, with vacancy rates below 5%. These areas are popular with IT professionals and MNC employees working in Cyber City and Udyog Vihar. Average 2BHK rents range from ₹42,000 to ₹65,000 per month."
    },
    {
      "q": "Where do IT professionals typically rent in Gurugram?",
      "a": "IT professionals in Gurugram predominantly rent in areas close to Cyber City and Udyog Vihar, specifically DLF Phase 1, DLF Phase 2, Golf Course Road, and Sushant Lok 1. These areas offer shorter commutes and premium housing stock. Mid-level IT employees often prefer Sector 56 and Sohna Road for more affordable options."
    },
    {
      "q": "Which Gurugram area gives the best rental yield?",
      "a": "For rental yield (annual rent ÷ property price), Dwarka Expressway and New Gurugram sectors (82–95) currently offer the best yields at 4–5% annually due to lower property prices and rising rents. DLF Phase 1 and Golf Course Road offer the highest absolute rents but lower yields due to high property values."
    }
  ],
  "bestSectors": [
    {
      "q": "Which sector in Gurugram is best for property investment in 2026?",
      "a": "Dwarka Expressway (Sector 106–109) is the top pick for 2026 investment, driven by fully operational connectivity, metro expansion, and DMIC corridor development. Expected returns are 12–18% over 3 years. For rental yield, New Gurugram sectors (82–95) offer 4.2–5.1% annual yields due to lower purchase prices."
    },
    {
      "q": "What is the average property price per sq ft in Gurugram in 2026?",
      "a": "Property prices in Gurugram in 2026 range from ₹5,500–8,000 per sq ft in New Gurugram sectors, ₹7,500–11,000 on Dwarka Expressway, ₹9,000–14,000 on Golf Course Extension Road, and ₹18,000–28,000 in DLF Phase 5. Prices vary significantly by micro-location and project quality."
    },
    {
      "q": "What rental yield can I expect from Gurugram property?",
      "a": "Rental yields in Gurugram range from 2.5% to 5.1% annually depending on the area. New Gurugram and Dwarka Expressway offer the highest yields (4–5%) due to lower property prices relative to rental income. Established premium areas like DLF Phase 5 yield 2.5–3.2% but offer more capital stability."
    },
    {
      "q": "Is Gurugram real estate a good investment in 2026?",
      "a": "Yes. Gurugram remains one of India's strongest real estate markets in 2026. Key drivers include expanding IT and MNC presence in Cyber City, improving infrastructure (Dwarka Expressway, metro), proximity to IGI Airport, and strong rental demand from a large professional tenant base. Property values across most micro-markets grew 8–15% in 2025."
    }
  ]
} as const;

export const STEPS = {
  "circleRates": [
    {
      "name": "Choose the sector",
      "text": "Pick the Gurugram sector where the property is. Each sector has its own circle rate."
    },
    {
      "name": "Choose the property type",
      "text": "Pick residential, commercial or plot. The rate is different for each type."
    },
    {
      "name": "Check Rate Per Unit",
      "text": "Read the circle rate per square yard and per square foot for the sector and type you chose."
    },
    {
      "name": "Calculate Stamp Duty",
      "text": "Use the circle rate to calculate your stamp duty obligation. Stamp duty is computed on the higher of the actual transaction value or the circle rate value."
    }
  ],
  "stampDuty": [
    {
      "name": "Enter property value in rupees",
      "text": "Input the total property value or consideration amount in Indian Rupees."
    },
    {
      "name": "Select buyer type (male/female/joint)",
      "text": "Choose the buyer category to apply the correct stamp duty rate: 7% for male, 5% for female, or 6% for joint buyers."
    },
    {
      "name": "Optionally select sector for circle rates",
      "text": "Pick a sector in Gurugram to compare the stamp duty against circle rates for that area."
    },
    {
      "name": "View calculated stamp duty and registration charges",
      "text": "See the breakdown of stamp duty, 1% registration fee, and total registration cost instantly."
    }
  ],
  "rera": [
    {
      "name": "Search for a Project",
      "text": "Search for a project by its name or its developer. You can also filter by registration status."
    },
    {
      "name": "Verify RERA Registration",
      "text": "Use the Quick RERA Verify tool to instantly check if a registration number is valid. Cross-verify that the number matches the pattern the register issues (for example RERA-GRG-PROJ-1540-2024 from HRERA, or DLRERA2026P0011 from Delhi RERA) and check the project status on the official HRERA portal."
    },
    {
      "name": "Review Project Details",
      "text": "Check the developer name, total units, possession date and registration status of each project."
    },
    {
      "name": "File a Complaint if Needed",
      "text": "If you encounter issues with a RERA-registered project, file a complaint on haryanarera.gov.in. Pay the Rs. 1,000 fee, upload supporting documents, and HRERA aims to resolve disputes within 60 days."
    }
  ],
  "auctions": [
    {
      "name": "Browse Available Auctions",
      "text": "Search through current bank auction properties across India. Filter by location, property type, price range, and auctioning bank to find properties that match your criteria."
    },
    {
      "name": "Review Property Details",
      "text": "Check the property description, reserve price, auction date, and bank contact details. Note the EMD (Earnest Money Deposit) amount and any inspection dates available."
    },
    {
      "name": "Register for the Auction",
      "text": "Contact the auctioning bank or visit their e-auction portal to register. You'll need to submit KYC documents and pay the EMD (typically 10% of reserve price) before the auction date."
    },
    {
      "name": "Participate and Bid",
      "text": "Attend the auction (online or physical) on the scheduled date. Place your bids starting from the reserve price. The highest bidder wins and must complete payment within the stipulated timeline (usually 30-90 days)."
    }
  ],
  "sources": [
    {
      "name": "Find Auction Notices",
      "text": "Check IBAPI, DDA, HSVP, or aggregator portals for upcoming auctions in your target city and property type."
    },
    {
      "name": "Conduct Due Diligence",
      "text": "Verify title deed, encumbrance certificate, possession status, property tax receipts, and any court orders before bidding."
    },
    {
      "name": "Pay Earnest Money Deposit",
      "text": "Submit the EMD (typically 10-25% of reserve price) online before the auction deadline. This is refundable if you don't win."
    },
    {
      "name": "Participate in the E-Auction",
      "text": "Log in to the auction platform on the scheduled date and bid. Set a maximum budget and stick to it."
    },
    {
      "name": "Pay Balance & Complete Documentation",
      "text": "If you win, pay the remaining amount within 15-30 days. Complete registration, stamp duty payment, and take possession."
    }
  ],
  "verifyOwnership": [
    {
      "name": "Select the tehsil",
      "text": "Choose the tehsil where the property is located."
    },
    {
      "name": "Enter village name and khasra number",
      "text": "Type the village name and the Khasra number identifying the specific land parcel."
    },
    {
      "name": "Complete captcha verification",
      "text": "Load and solve the CAPTCHA to verify you are human, as required by the Jamabandi portal."
    },
    {
      "name": "View property ownership records",
      "text": "Review ownership details, mutation status, encumbrance, and area from official Haryana land records."
    }
  ]
} as const;

export const SOURCE_GROUPS = [
  {
    "key": "central",
    "sources": [
      {
        "source": "ibapi",
        "label": "IBAPI, Indian Bank's Auction Properties Information",
        "url": "https://ibapi.in",
        "description": "The single most comprehensive source for bank auction properties. All PSU banks (SBI, PNB, BOB, Canara, Union, etc.) are required by RBI to list NPA auction properties here. Filter by city, bank, and property type."
      },
      {
        "source": "ibbi",
        "label": "IBBI, Liquidation Auction Notices",
        "url": "https://ibbi.gov.in/liquidation-auction-notices",
        "description": "Official NCLT/IBC insolvency liquidation auction notices. As of April 2025, IBBI mandates exclusive use of eBKray/BaankNet for listing these assets. Check for notice details and links to the auction platform."
      },
      {
        "source": "baanknet",
        "label": "BaankNet / eBKray",
        "url": "https://baanknet.com",
        "description": "IBBI-mandated e-auction platform for bank NPA and insolvency liquidation assets. All liquidation process assets (IBC/NCLT cases) must exclusively list here from April 2025. Covers Delhi, NCR, and Meerut regions."
      },
      {
        "source": "mstc",
        "label": "MSTC e-Commerce",
        "url": "https://mstcecommerce.com",
        "description": "MSTC (Metal Scrap Trade Corporation) is a Government of India enterprise that conducts e-auctions for bank NPA properties and government assets. Works alongside IBAPI as another official channel for PSU bank auctions."
      }
    ]
  },
  {
    "key": "delhi",
    "sources": [
      {
        "source": "dda",
        "label": "DDA e-Services, Bhoomi Portal",
        "url": "https://eservices.dda.org.in",
        "description": "Delhi Development Authority's official e-auction portal. Commercial, industrial, and residential plots in Delhi sectors. Mega e-Auction phases held periodically. Post-auction documents also issued here."
      },
      {
        "source": "dfc_delhi",
        "label": "Delhi Financial Corporation",
        "url": "https://dfc.delhi.gov.in/dfc/public-auction",
        "description": "Government of Delhi undertaking. Auctions industrial plots, sheds, commercial land, and machinery in Narela, Jhilmil, and Nangloi areas. Niche but prime industrial and commercial assets."
      },
      {
        "source": "drt",
        "label": "DRT, Debt Recovery Tribunals",
        "url": "https://drt.gov.in",
        "description": "DRT Delhi auctions properties under RDDBFI Act and SARFAESI Act. Commercial properties attached via court orders. Check DRT-I and DRT-II Delhi benches for auction notices."
      }
    ]
  },
  {
    "key": "gurgaon",
    "sources": [
      {
        "source": "hsvp",
        "label": "HSVP e-Auction Portal",
        "url": "https://eauction.hsvphry.org.in",
        "description": "Haryana Shehri Vikas Pradhikaran (formerly HUDA). Official portal for commercial, industrial, institutional, and residential plots in Gurugram, Faridabad, Panchkula, and other Haryana cities. Direct government auction, no middlemen."
      },
      {
        "source": "hsvp_procure247",
        "label": "HSVP Procure247",
        "url": "https://hsvp.procure247.com",
        "description": "Technology backend for HSVP e-Auctions. Some auction cycles are hosted here rather than eauction.hsvphry.org.in, check both portals in parallel."
      },
      {
        "source": "dtcp",
        "label": "DTCP Haryana",
        "url": "https://tcpharyana.gov.in",
        "description": "Directorate of Town & Country Planning occasionally floats licensed colony commercial plots and institutional land parcels in Gurugram. Also useful for checking licensed colony status before buying an auctioned asset."
      }
    ]
  },
  {
    "key": "meerut",
    "sources": [
      {
        "source": "mda",
        "label": "MDA, Meerut Development Authority",
        "url": "https://mdameerut.in/auctions.php",
        "description": "MDA's official e-auction page. Commercial, EWS, LIG, MIG, HIG plots and shops in Vedvyas Puri, Lohia Nagar, Shatabdi Nagar, and other Meerut sectors. Land Monetization Scheme auctions with ~974 plots. Helpline: 63546 04884."
      },
      {
        "source": "yeida",
        "label": "YEIDA, Yamuna Expressway Authority",
        "url": "https://yamunaexpresswayauthority.com",
        "description": "Covers the Meerut-Noida-Agra expressway corridor. Commercial plots, industrial plots, and institutional land along the Yamuna Expressway. Relevant for Greater Noida and the expressway belt."
      }
    ]
  },
  {
    "key": "aggregators",
    "sources": [
      {
        "source": "bank_eauctions",
        "label": "BankEAuctions.com",
        "url": "https://bankeauctions.com",
        "description": "Largest NPA/bank auction aggregator in India. Pulls listings from SBI, ICICI, HDFC, Axis, PSU banks, ARCs, and NBFCs. Separate city pages for Delhi and Gurgaon. Updated daily."
      },
      {
        "source": "eauctions_india",
        "label": "eAuctionsIndia.com",
        "url": "https://eauctionsindia.com",
        "description": "Covers bank, government, MDA, DDA, and HSVP auctions in one feed. Also publishes detailed blog posts on new auction schemes. Good for tracking upcoming auctions across all sources."
      },
      {
        "source": "auction_bazaar",
        "label": "AuctionBazaar.com",
        "url": "https://auctionbazaar.com",
        "description": "Bank auction aggregator with strong SBI listings in Gurgaon and Delhi NCR. Search by residential/commercial and filter by bank. Alert system for new properties in saved searches."
      },
      {
        "source": "eauction_dekho",
        "label": "eAuctionDekho.com",
        "url": "https://eauctiondekho.com",
        "description": "Covers Gurgaon extensively. Lists flats, plots, commercial buildings, offices, shops, godowns, industrial, and factory land across banks. Clean location-based filter UI."
      },
      {
        "source": "findauction",
        "label": "FindAuction.in",
        "url": "https://findauction.in",
        "description": "229+ bank auction properties in Gurgaon as of 2025. Covers PNB, SBI, Canara Bank, Bank of Baroda, and Hinduja HF. Also covers Delhi and NCR with commercial property filter."
      },
      {
        "source": "findauction_prop",
        "label": "FindAuctionProperty.com",
        "url": "https://findauctionproperty.com",
        "description": "Delhi NCR focused portal. Vets legal status of each property. Covers Delhi, Noida, and Gurgaon commercial and residential bank auctions. Team-assisted due diligence available."
      },
      {
        "source": "auction_tiger",
        "label": "AuctionTiger.net",
        "url": "https://auctiontiger.net",
        "description": "B2B e-auction platform used by banks, ARCs, and IBC liquidators to conduct auctions. Not just a listing aggregator, NCLT liquidators use this to run the auction itself. Check for live bids."
      }
    ]
  },
  {
    "key": "banks",
    "sources": [
      {
        "source": "sbi",
        "label": "SBI, SARFAESI Auctions",
        "url": "https://www.sbi.co.in"
      },
      {
        "source": "pnb",
        "label": "PNB Auction Properties",
        "url": "https://www.pnbindia.in"
      },
      {
        "source": "bob",
        "label": "Bank of Baroda Auctions",
        "url": "https://www.bankofbaroda.in"
      },
      {
        "source": "canara",
        "label": "Canara Bank Auctions",
        "url": "https://www.canarabank.com"
      },
      {
        "source": "hdfc",
        "label": "HDFC Bank Auctions",
        "url": "https://www.hdfcbank.com"
      },
      {
        "source": "icici",
        "label": "ICICI Bank Auctions",
        "url": "https://www.icicibank.com"
      },
      {
        "source": "union",
        "label": "Union Bank Auctions",
        "url": "https://www.unionbankofindia.co.in"
      },
      {
        "source": "yes_bank",
        "label": "Yes Bank Auctions",
        "url": "https://www.yesbank.in"
      }
    ]
  }
] as const;

export const TEHSILS = [
  "Gurgaon",
  "Sohna",
  "Pataudi",
  "Farukhnagar",
  "Manesar",
  "Faridabad",
  "Ballabgarh",
  "Palwal",
  "Sonipat",
  "Ganaur",
  "Gohana",
  "Rohtak",
  "Maham",
  "Panipat",
  "Samalkha",
  "Karnal",
  "Gharaunda",
  "Assandh",
  "Rewari",
  "Bawal",
  "Kosli",
  "Hisar",
  "Hansi",
  "Narnaund",
  "Ambala",
  "Ambala Cantt",
  "Naraingarh",
  "Kurukshetra",
  "Pehowa",
  "Shahbad",
  "Jhajjar",
  "Bahadurgarh",
  "Nuh",
  "Ferozepur Jhirka",
  "Punahana",
  "Yamunanagar",
  "Jagadhri",
  "Chhachhrauli",
  "Wazirabad"
] as const;

export const BUILDERS = [
  {
    "name": "DLF Limited",
    "projects": 47,
    "reraScore": 94,
    "complaints": 12,
    "delivery": "On Time",
    "status": "good",
    "areas": [
      "DLF Phase 1",
      "DLF Phase 2",
      "DLF Phase 5",
      "Golf Course Road"
    ],
    "note": "India's largest listed real estate developer. Strong HRERA compliance record."
  },
  {
    "name": "Emaar India",
    "projects": 18,
    "reraScore": 88,
    "complaints": 8,
    "delivery": "Mostly On Time",
    "status": "good",
    "areas": [
      "Golf Course Road",
      "Sector 62",
      "Sector 65"
    ],
    "note": "Global developer with premium projects. Generally reliable delivery."
  },
  {
    "name": "Sobha Limited",
    "projects": 12,
    "reraScore": 85,
    "complaints": 6,
    "delivery": "On Time",
    "status": "good",
    "areas": [
      "Sector 106",
      "Sector 108",
      "Dwarka Expressway"
    ],
    "note": "Known for quality construction and consistent delivery timelines."
  },
  {
    "name": "M3M India",
    "projects": 31,
    "reraScore": 72,
    "complaints": 28,
    "delivery": "Delayed",
    "status": "average",
    "areas": [
      "Golf Course Ext Rd",
      "Sector 65",
      "Sector 70"
    ],
    "note": "Multiple premium projects but faced delivery delays post-2022."
  },
  {
    "name": "Godrej Properties",
    "projects": 9,
    "reraScore": 81,
    "complaints": 4,
    "delivery": "On Time",
    "status": "good",
    "areas": [
      "Sector 43",
      "Sector 88A",
      "Sohna Road"
    ],
    "note": "Listed developer with strong brand trust and delivery record."
  },
  {
    "name": "Signature Global",
    "projects": 22,
    "reraScore": 67,
    "complaints": 19,
    "delivery": "Delayed",
    "status": "average",
    "areas": [
      "Sohna Road",
      "Sector 37D",
      "Sector 71"
    ],
    "note": "Affordable housing focus. Some projects face regulatory hurdles."
  },
  {
    "name": "Ansal API",
    "projects": 8,
    "reraScore": 34,
    "complaints": 61,
    "delivery": "Severely Delayed",
    "status": "poor",
    "areas": [
      "Sector 57",
      "Sector 70",
      "Sushant Lok"
    ],
    "note": "Significant regulatory action history. Exercise extreme caution."
  },
  {
    "name": "Unitech",
    "projects": 6,
    "reraScore": 18,
    "complaints": 142,
    "delivery": "Stalled",
    "status": "poor",
    "areas": [
      "Sector 70",
      "Sector 72"
    ],
    "note": "Under NCLT supervision. Do not invest without legal verification."
  }
] as const;

export const AREAS = [
  {
    "name": "DLF Phase 1",
    "demandScore": 96,
    "avgRent2bhk": 55000,
    "vacancy": "2%",
    "profile": "IT Professionals, Senior Executives",
    "demandTrend": "↑ +8% YoY",
    "topEmployers": [
      "Cyber City",
      "Unitech Cyber Park",
      "Vatika Business Park"
    ],
    "tier": "ultra-high"
  },
  {
    "name": "Golf Course Road",
    "demandScore": 94,
    "avgRent2bhk": 65000,
    "vacancy": "3%",
    "profile": "MNC Employees, Expats",
    "demandTrend": "↑ +11% YoY",
    "topEmployers": [
      "DLF Cyber City",
      "Orchid Business Park"
    ],
    "tier": "ultra-high"
  },
  {
    "name": "Sushant Lok 1",
    "demandScore": 88,
    "avgRent2bhk": 42000,
    "vacancy": "4%",
    "profile": "Mid-level IT, Families",
    "demandTrend": "↑ +6% YoY",
    "topEmployers": [
      "Udyog Vihar",
      "Cyber City (commute)"
    ],
    "tier": "high"
  },
  {
    "name": "DLF Phase 2",
    "demandScore": 85,
    "avgRent2bhk": 48000,
    "vacancy": "5%",
    "profile": "IT Professionals, Young Families",
    "demandTrend": "↑ +5% YoY",
    "topEmployers": [
      "Cyber City",
      "Vatika Business Park"
    ],
    "tier": "high"
  },
  {
    "name": "Sector 56",
    "demandScore": 79,
    "avgRent2bhk": 32000,
    "vacancy": "6%",
    "profile": "Mid-income IT, Servicemen",
    "demandTrend": "↑ +4% YoY",
    "topEmployers": [
      "Unitech Cyber Park",
      "Sector 44 offices"
    ],
    "tier": "high"
  },
  {
    "name": "Sohna Road",
    "demandScore": 72,
    "avgRent2bhk": 28000,
    "vacancy": "8%",
    "profile": "Budget Tenants, Young Professionals",
    "demandTrend": "→ Stable",
    "topEmployers": [
      "Rajiv Chowk offices",
      "Udyog Vihar"
    ],
    "tier": "medium"
  },
  {
    "name": "Dwarka Expressway",
    "demandScore": 68,
    "avgRent2bhk": 24000,
    "vacancy": "10%",
    "profile": "Budget Renters, Families near Airport",
    "demandTrend": "↑ +14% YoY",
    "topEmployers": [
      "Gurugram offices",
      "Delhi NCR (commute)"
    ],
    "tier": "medium"
  },
  {
    "name": "New Gurugram (Sec 82–95)",
    "demandScore": 61,
    "avgRent2bhk": 20000,
    "vacancy": "14%",
    "profile": "Budget Segment, New Supply Area",
    "demandTrend": "↑ +18% YoY",
    "topEmployers": [
      "IMT Manesar",
      "Honda Plant area"
    ],
    "tier": "emerging"
  }
] as const;

export const SECTORS = [
  {
    "rank": 1,
    "name": "Dwarka Expressway, Sector 106, 108, 109",
    "type": "Capital Appreciation",
    "priceRange": "₹7,500 – ₹11,000/sq ft",
    "expectedReturn": "12–18% over 3 years",
    "rentalYield": "3.8–4.5%",
    "reason": "DWARKA EXPRESSWAY is now fully operational, reducing commute to IGI Airport and Dwarka to under 20 minutes. Several infrastructure projects (metro extension, DMIC corridor) are driving rapid appreciation. Best for capital gains investors.",
    "risk": "Low-Medium",
    "horizon": "3–5 years",
    "bestFor": "Capital appreciation",
    "verdict": "Top Pick 2026"
  },
  {
    "rank": 2,
    "name": "New Gurugram, Sector 82–95",
    "type": "Rental Yield",
    "priceRange": "₹5,500 – ₹8,000/sq ft",
    "expectedReturn": "8–12% over 3 years",
    "rentalYield": "4.2–5.1%",
    "reason": "Lowest entry price point in Gurugram with growing infrastructure. IMT Manesar expansion is driving blue-collar and mid-level IT demand. High rental yields due to lower purchase prices vs rental income.",
    "risk": "Medium",
    "horizon": "3–7 years",
    "bestFor": "Rental yield",
    "verdict": "Best Yield"
  },
  {
    "rank": 3,
    "name": "Golf Course Extension Road, Sector 65–70",
    "type": "Premium Residential",
    "priceRange": "₹9,000 – ₹14,000/sq ft",
    "expectedReturn": "8–10% over 3 years",
    "rentalYield": "3.2–3.8%",
    "reason": "Established premium micro-market. Strong demand from senior IT and MNC executives. Excellent social infrastructure. Stable values with low volatility, suitable for conservative investors.",
    "risk": "Low",
    "horizon": "3–5 years",
    "bestFor": "Stable premium investment",
    "verdict": "Safest Bet"
  },
  {
    "rank": 4,
    "name": "Sohna Road, Sector 47–57",
    "type": "Mid-Segment",
    "priceRange": "₹5,000 – ₹7,500/sq ft",
    "expectedReturn": "7–9% over 3 years",
    "rentalYield": "3.5–4.2%",
    "reason": "Good connectivity, affordable entry, improving social infrastructure. KMP Expressway access improving. Solid mid-segment market with stable demand from IT and services sector employees.",
    "risk": "Low-Medium",
    "horizon": "4–6 years",
    "bestFor": "Mid-budget investment",
    "verdict": "Solid Choice"
  },
  {
    "rank": 5,
    "name": "DLF Phase 5, Sector 53, 54, 55",
    "type": "Ultra Premium",
    "priceRange": "₹18,000 – ₹28,000/sq ft",
    "expectedReturn": "5–7% over 3 years",
    "rentalYield": "2.5–3.2%",
    "reason": "Gurugram's most prestigious address. Values are high but appreciation is slower due to already-elevated pricing. Best suited as a luxury lifestyle purchase rather than pure investment.",
    "risk": "Low",
    "horizon": "5+ years",
    "bestFor": "Wealth preservation, lifestyle",
    "verdict": "Ultra-Premium"
  }
] as const;
