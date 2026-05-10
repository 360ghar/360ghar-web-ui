import { useState } from 'react';
import { I18nLink } from '../../i18n/I18nLink';

const TERMS_DATA = [
  {
    title: '1. Eligibility',
    content: `
      <ul>
        <li>The 360Ghar Referral Program is open to all Indian residents aged 18 years and above.</li>
        <li>Employees, agents, and contractors of 360Ghar, as well as their immediate family members, are not eligible to participate.</li>
        <li>Participants must provide accurate and complete information during the referral submission.</li>
        <li>360Ghar reserves the right to verify the identity and eligibility of any participant.</li>
      </ul>
    `,
  },
  {
    title: '2. Referral Qualification',
    content: `
      <ul>
        <li>The referred property must be located within 360Ghar's current service areas (primarily Gurugram/Delhi NCR).</li>
        <li>The property owner must be the legal owner with authority to rent or sell the property.</li>
        <li><strong>Duplicate/Redundant Properties:</strong> Properties already listed on 360Ghar or previously referred by any party are not eligible. Determination is made by 360Ghar based on address verification.</li>
        <li>The property must pass 360Ghar's on-ground verification process.</li>
        <li>Commercial properties are only eligible if explicitly included in promotional campaigns.</li>
      </ul>
    `,
  },
  {
    title: '3. Reward Structure',
    content: `
      <ul>
        <li><strong>Onboarding Bonus (₹100):</strong> Paid within 7 business days of successful property verification and listing publication.</li>
        <li><strong>Deal Completion Bonus:</strong>
          <ul>
            <li>Rent deals: 10% of brokerage received by 360Ghar (capped at ₹5,000)</li>
            <li>Sale deals: 5% of brokerage received by 360Ghar (capped at ₹10,000)</li>
          </ul>
        </li>
        <li>Rewards are paid via UPI or Bank Transfer to the referrer's registered account.</li>
        <li>All rewards are subject to applicable tax deductions (TDS) as per the Income Tax Act, 1961.</li>
      </ul>
    `,
  },
  {
    title: '4. Deal Completion Requirements',
    content: `
      <ul>
        <li><strong>For Rental Transactions:</strong> Lease agreement must be signed and security deposit received by the property owner.</li>
        <li><strong>For Sale Transactions:</strong> Sale deed must be registered and full payment received by the seller.</li>
        <li>360Ghar must receive its commission/brokerage fee for the referral reward to be applicable.</li>
        <li>If a deal is cancelled, reversed, or refunded after reward disbursement, 360Ghar reserves the right to recover the reward amount.</li>
      </ul>
    `,
  },
  {
    title: '5. Exclusions',
    content: `
      <ul>
        <li>Properties already in 360Ghar's database (verified by address, unit number, or owner details).</li>
        <li>Properties where the owner has already been contacted by 360Ghar through other channels.</li>
        <li>Referrals where the referee is an existing registered user of 360Ghar.</li>
        <li>Properties currently listed with other brokers/platforms with exclusive agreements.</li>
        <li>Properties that fail verification due to ownership disputes, legal issues, or misrepresentation.</li>
      </ul>
    `,
  },
  {
    title: '6. Anti-Fraud Provisions',
    content: `
      <ul>
        <li><strong>Self-referrals are strictly prohibited.</strong> Referring your own property through a different identity will result in disqualification.</li>
        <li>Multiple referrals for the same property will result in only the first valid submission being considered.</li>
        <li>Fabricated or fake referrals will result in permanent disqualification and potential legal action.</li>
        <li>360Ghar reserves the right to verify the relationship between referrer and referee.</li>
        <li>Any attempt to manipulate or abuse the referral program will result in account suspension and clawback of all rewards.</li>
      </ul>
    `,
  },
  {
    title: '7. Contact Verification',
    content: `
      <ul>
        <li>Referrer's mobile number may be verified via OTP before submission is accepted.</li>
        <li>The property owner (referee) will be contacted for verification and consent.</li>
        <li>360Ghar may request identity proof from the referrer before releasing rewards.</li>
        <li>If the property owner declines to proceed or denies the referral, the submission will be cancelled.</li>
      </ul>
    `,
  },
  {
    title: '8. Reward Disbursement',
    content: `
      <ul>
        <li>Bank account or UPI details will be collected at the time of reward claim.</li>
        <li>Rewards not claimed within 90 days of qualification will expire and cannot be reinstated.</li>
        <li>The referrer is responsible for providing accurate bank details. 360Ghar is not liable for failed transfers due to incorrect information.</li>
        <li>Payment processing may take 7-15 business days from the date of claim.</li>
      </ul>
    `,
  },
  {
    title: '9. One Referral Per Property',
    content: `
      <ul>
        <li>Only one referrer can earn rewards for a single property.</li>
        <li>In case of duplicate submissions, the first valid submission (determined by timestamp) will be prioritized.</li>
        <li>360Ghar's decision on priority disputes is final and binding.</li>
      </ul>
    `,
  },
  {
    title: '10. Modification Rights',
    content: `
      <ul>
        <li>360Ghar reserves the right to modify, suspend, or terminate the Referral Program at any time without prior notice.</li>
        <li>Changes to the terms will be effective immediately upon publication on this page.</li>
        <li>Continued participation in the program after changes constitutes acceptance of the modified terms.</li>
        <li>360Ghar's interpretation of these terms is final and binding in all matters related to the program.</li>
      </ul>
    `,
  },
  {
    title: '11. Tax Implications',
    content: `
      <ul>
        <li>All rewards are subject to applicable taxes including TDS (Tax Deducted at Source) as per the Income Tax Act, 1961.</li>
        <li>TDS will be deducted at the applicable rate before payment.</li>
        <li>Referrers are solely responsible for reporting referral income in their tax returns.</li>
        <li>360Ghar will provide TDS certificates (Form 16A) upon request for amounts subject to TDS.</li>
      </ul>
    `,
  },
  {
    title: '12. Data & Privacy',
    content: null,
    jsxContent: (
      <ul>
        <li>By submitting a referral, you confirm that you have obtained explicit consent from the property owner to share their contact details with 360Ghar.</li>
        <li>All personal data collected is subject to 360Ghar&apos;s <I18nLink to="/policies/privacy-policy">Privacy Policy</I18nLink>.</li>
        <li>Information provided may be used for verification, communication, and program administration.</li>
        <li>360Ghar does not sell or share personal data with third parties except as required for program fulfillment.</li>
      </ul>
    ),
  },
  {
    title: '13. Dispute Resolution',
    content: `
      <ul>
        <li>In case of any dispute regarding eligibility, rewards, or program terms, participants may contact 360Ghar at <a href="mailto:info@360ghar.com">info@360ghar.com</a>.</li>
        <li>360Ghar will investigate and respond to disputes within 15 business days.</li>
        <li>360Ghar's decision on all disputes shall be final and binding.</li>
        <li>Any legal disputes shall be subject to the jurisdiction of courts in Gurgaon, Haryana, India.</li>
      </ul>
    `,
  },
];

const ReferralTerms = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="terms-and-conditions" className="referral-terms padding-y-60">
      <div className="container container-two">
        <div className="row justify-content-center mb-40">
          <div className="col-lg-8 text-center">
            <h2 className="section-heading">Terms & Conditions</h2>
            <p className="section-desc">Please read these terms carefully before submitting a referral</p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="accordion referral-accordion" id="referralTermsAccordion">
              {TERMS_DATA.map((term, index) => (
                <div className="accordion-item" key={index}>
                  <h3 className="accordion-header">
                    <button
                      type="button"
                      className={`accordion-button ${openIndex === index ? '' : 'collapsed'}`}
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={openIndex === index}
                      aria-controls={`term-${index}`}
                    >
                      {term.title}
                    </button>
                  </h3>
                  <div
                    id={`term-${index}`}
                    className={`accordion-collapse collapse ${openIndex === index ? 'show' : ''}`}
                  >
                    <div
                      className="accordion-body"
                    >
                      {term.jsxContent || (
                        <div dangerouslySetInnerHTML={{ __html: term.content }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralTerms;
