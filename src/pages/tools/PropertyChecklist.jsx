import { useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks, ToolInfoCard } from '../../components/tools/ToolContentSections';

const PROPERTY_CHECKLIST_HOW_TO_STEPS = [
  { name: 'Select transaction type (buy/sell/rent)', text: 'Choose whether you are buying, selling, or renting a property to see the relevant document checklist.' },
  { name: 'Review required and optional documents', text: 'Browse through categorized lists of legal, financial, and registration documents needed for your transaction.' },
  { name: 'Mark documents as collected', text: 'Check off each document as you collect it. Your progress is saved automatically in your browser.' },
  { name: 'Download your customized checklist', text: 'Review your completed checklist and use it to track remaining documents for your property transaction.' },
];

const CHECKLIST_FAQS = [
  {
    question: 'What documents are required for buying a property in India?',
    answer: 'The essential documents are: Title Deed/Sale Deed (proof of ownership), Encumbrance Certificate (no dues/mortgages), Property Tax Receipts (up-to-date payments), Approved Building Plan, Completion/Occupancy Certificate, Khata Certificate, and NOCs from society and bank (if applicable). Additional documents may be required depending on the state and property type.',
  },
  {
    question: 'What documents are required for a loan against property?',
    answer: 'For a Loan Against Property (LAP), you need: (1) Identity proof — PAN, Aadhaar, Passport; (2) Address proof — Utility bill, Aadhaar; (3) Income proof — Salary slips (3 months), ITR (2-3 years), bank statements (6 months); (4) Property documents — Title deed, EC, property tax receipts, approved building plan, OC; (5) NOC from society/housing association; (6) Encumbrance certificate for 15-30 years. Banks may also request a valuation report.',
  },
  {
    question: 'What is an Encumbrance Certificate and why is it important?',
    answer: 'An Encumbrance Certificate (EC) records all transactions on a property — sales, mortgages, gifts, leases — over a specified period. It proves the property is free from legal or financial liabilities. Banks require a 15-30 year EC for loan approval. Get it from the sub-registrar office or online through state registration portals (e.g., IGR Maharashtra, REGS Haryana).',
  },
  {
    question: 'What is the difference between Occupancy Certificate and Completion Certificate?',
    answer: 'A Completion Certificate (CC) confirms the building is constructed as per the approved plan. An Occupancy Certificate (OC) certifies the building is fit for habitation and has all necessary infrastructure (water, sewage, fire safety). Both are issued by the local municipal authority. CC comes first, OC comes after utility connections. Never buy a property without OC — it means the building may be illegal.',
  },
  {
    question: 'How do I verify property ownership in Gurugram?',
    answer: 'In Gurugram, verify property ownership through: (1) Haryana Jamabandi portal (jamabandi.nic.in) — check owner names and land records; (2) Sub-registrar office — verify sale deed registration; (3) Encumbrance Certificate — confirm no mortgages; (4) MCG (Municipal Corporation Gurugram) — check property tax records; (5) RERA Haryana — verify project registration and builder credentials. Use 360Ghar\'s Verify Ownership tool for guided verification.',
  },
  {
    question: 'Is a Khata Certificate required for all properties?',
    answer: 'Khata Certificate (also called Patta in Tamil Nadu, 7/12 extract in Maharashtra) is required mainly for properties in housing societies and municipal areas. It records the property in the municipal register and is essential for: property tax payment, utility connections, and sale/purchase transactions. In Gurugram, it is issued by MCG. Independent plots may use Jamabandi instead.',
  },
];

const PropertyChecklist = () => {
    const checklistData = {
        "Legal Documents (Pre-Purchase)": [
            { id: 1, text: "Title Deed / Sale Deed", desc: "Verify the seller has clear ownership of the property." },
            { id: 2, text: "Encumbrance Certificate (EC)", desc: "Ensures the property is free from legal dues or mortgages. Required for 15-30 years." },
            { id: 3, text: "NA Order (Non-Agricultural)", desc: "Required if buying land to build a home — confirms land is approved for residential use." },
            { id: 4, text: "Approved Building Plan", desc: "Check if the building plan is approved by the local municipal authority (MCG in Gurugram)." },
            { id: 5, text: "Completion / Occupancy Certificate", desc: "Proof that the building is constructed per approved plans and is ready for habitation. Never buy without OC." },
            { id: 6, text: "RERA Registration", desc: "For under-construction properties, verify RERA registration number on the state RERA portal." }
        ],
        "Financial & Tax Documents": [
            { id: 7, text: "Property Tax Receipts", desc: "Ensure all previous property taxes have been paid by the seller. Get receipts for last 3 years." },
            { id: 8, text: "Khata Certificate / Patta", desc: "Proof that the property is registered in municipal records. Essential for utility connections." },
            { id: 9, text: "NOC from Bank", desc: "If the seller had a loan, ensure they have a No Objection Certificate from the bank confirming loan closure." },
            { id: 10, text: "NOC from Society/RWA", desc: "Required for transferring the share certificate in housing societies." },
            { id: 11, text: "Utility Bills (Water, Electricity)", desc: "Confirm all utility bills are paid and connections are in the seller's name." }
        ],
        "Loan Against Property Documents": [
            { id: 12, text: "Identity Proof (PAN, Aadhaar)", desc: "Mandatory KYC documents for bank loan processing." },
            { id: 13, text: "Income Proof (ITR, Salary Slips, Bank Statements)", desc: "Banks require 2-3 years ITR, 3 months salary slips, and 6 months bank statements." },
            { id: 14, text: "Property Valuation Report", desc: "Banks conduct independent valuation. LAP is typically 50-70% of property value." },
            { id: 15, text: "15-30 Year Encumbrance Certificate", desc: "Essential for LAP — proves no prior mortgage or legal claims on the property." }
        ],
        "Agreement & Registration": [
            { id: 16, text: "Sale Agreement", desc: "Drafted on stamp paper, outlining terms and conditions. Includes payment schedule and possession date." },
            { id: 17, text: "Stamp Duty Payment", desc: "Proof of stamp duty payment to the government. Rate varies by state: 5-7% in Haryana." },
            { id: 18, text: "Registration Receipt", desc: "Final proof of transaction registration with the sub-registrar. Registration is mandatory within 4 months." },
            { id: 19, text: "Possession Letter", desc: "Issued by the builder/seller when handing over keys. Required for property tax and utility registration." },
            { id: 20, text: "Share Certificate (Society)", desc: "For society flats — transferred to your name after registration. Confirms membership in the housing society." }
        ]
    };

    const [checkedItems, setCheckedItems] = useState(() => {
        const saved = localStorage.getItem('propertyChecklist');
        return saved ? JSON.parse(saved) : {};
    });

    const handleCheck = (id) => {
        const updated = { ...checkedItems, [id]: !checkedItems[id] };
        setCheckedItems(updated);
        localStorage.setItem('propertyChecklist', JSON.stringify(updated));
    };

    const calculateProgress = () => {
        const totalItems = Object.values(checklistData).flat().length;
        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        return Math.round((checkedCount / totalItems) * 100);
    };

    const faqStructuredData = generateFaqStructuredData(CHECKLIST_FAQS);

    return (
        <>
            <SEO
                title="Property Documents Checklist Gurgaon | Legal Documents Haryana | 360Ghar"
                description="Free property document checklist for buying in India (2026). Track 20+ required documents — title deed, EC, OC, income proof, LAP documents. Save your progress as you collect each document."
                keywords="property document checklist India, documents for buying flat, loan against property documents list, home loan documents, property legal verification checklist, real estate documents India, LAP documents, 360ghar guide"
                canonical="/property-document-checklist"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.propertyChecklist),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                        { name: toolSchemas.propertyChecklist.name, url: 'https://360ghar.com/property-document-checklist' }
                    ]),
                    generateHowToStructuredData({
                        name: 'How to Use the Property Document Checklist',
                        description: 'Track 20+ required documents for buying, selling, or renting property in India with this interactive checklist.',
                        steps: PROPERTY_CHECKLIST_HOW_TO_STEPS,
                    }),
                    faqStructuredData,
                ]}
            />

            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header />

                <section className="padding-y-50">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                {/* Hero heading */}
                                <div className="text-center mb-4">
                                    <h1>Property Document Checklist — India (2026)</h1>
                                    <p className="text-muted">
                                        Complete legal and financial document checklist for buying property and applying for Loan Against Property. Save your progress as you collect each document.
                                    </p>
                                </div>

                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        {/* Progress Bar */}
                                        <div className="mb-5 bg-white p-4 rounded-3 shadow-sm sticky-top" style={{top: '90px', zIndex: 90}}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold">Your Progress</span>
                                                <span className="fw-bold text-main">{calculateProgress()}% Completed</span>
                                            </div>
                                            <div className="progress" style={{height: '10px'}}>
                                                <div
                                                    className="progress-bar bg-main"
                                                    role="progressbar"
                                                    style={{width: `${calculateProgress()}%`}}
                                                ></div>
                                            </div>
                                        </div>

                                        {Object.entries(checklistData).map(([category, items]) => (
                                            <div key={category} className="mb-4">
                                                <h3 className="mb-3 fs-4 fw-bold text-dark border-start border-4 border-main ps-3">
                                                    {category}
                                                </h3>
                                                <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                                                    {items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className={`p-3 border-bottom d-flex gap-3 align-items-start ${checkedItems[item.id] ? 'bg-light' : ''}`}
                                                        >
                                                            <div className="pt-1">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input fs-5"
                                                                    style={{cursor: 'pointer'}}
                                                                    checked={!!checkedItems[item.id]}
                                                                    onChange={() => handleCheck(item.id)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h5 className={`mb-1 fs-6 ${checkedItems[item.id] ? 'text-decoration-line-through text-muted' : ''}`}>
                                                                    {item.text}
                                                                </h5>
                                                                <p className="small text-muted mb-0">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-5 p-4 bg-info bg-opacity-10 rounded-3 border border-info">
                                            <h5 className="text-info-emphasis"><i className="fas fa-info-circle me-2"></i>Note</h5>
                                            <p className="mb-0 small text-dark">
                                                This checklist is for general guidance only. Property laws vary by state in India.
                                                It is highly recommended to consult a property lawyer for legal verification of documents before making a purchase.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* LAP documents explainer */}
                                <ToolInfoCard title="Loan Against Property — Key Documents Explained">
                                  <p>
                                    A Loan Against Property (LAP) requires both <strong>identity/income documents</strong> (like a home loan)
                                    and <strong>property documents</strong> proving your ownership. Banks typically lend 50-70% of the property value.
                                    The most critical documents are:
                                  </p>
                                  <ul>
                                    <li><strong>Title Deed</strong> — proves you own the property being mortgaged</li>
                                    <li><strong>Encumbrance Certificate (15-30 years)</strong> — confirms no existing mortgage or legal claims</li>
                                    <li><strong>Property Tax Receipts</strong> — shows all dues are cleared</li>
                                    <li><strong>Approved Building Plan &amp; OC</strong> — confirms legal construction</li>
                                    <li><strong>Income proof</strong> — ITR (2-3 years), bank statements (6 months), salary slips</li>
                                  </ul>
                                  <p>
                                    Processing time is typically 7-15 days. Interest rates range from 9-14% depending on the bank and your profile.
                                  </p>
                                </ToolInfoCard>

                                {/* FAQ */}
                                <ToolFaq faqs={CHECKLIST_FAQS} heading="Property Documents — Frequently Asked Questions" />

                                {/* Related Tools */}
                                <ToolRelatedLinks
                                  heading="Related Tools & Resources"
                                  links={[
                                    { to: '/loan-eligibility-calculator', label: 'Loan Eligibility Calculator', icon: 'fas fa-university' },
                                    { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                                    { to: '/capital-gains-tax-calculator', label: 'Capital Gains Tax Calculator', icon: 'fas fa-receipt' },
                                    { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-stamp' },
                                    { to: '/verify-ownership', label: 'Verify Property Ownership', icon: 'fas fa-shield-alt' },
                                    { to: '/blog', label: 'Real Estate Blog', icon: 'fas fa-blog' },
                                  ]}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Cta ctaClass="" />

                <Footer />
            </main>
        </>
    );
};

export default PropertyChecklist;
