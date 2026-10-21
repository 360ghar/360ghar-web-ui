/**
 * Referral programme terms from the old ReferralTerms.jsx (English only).
 * Items are trusted static HTML (bold labels and two links).
 */
import { COMPANY_EMAIL } from '@/lib/company';

export const TERMS: { title: string; items: string[] }[] = [
  {
    title: '1. Eligibility',
    items: [
      'The 360Ghar Referral Program is open to all Indian residents aged 18 years and above.',
      'Employees, agents, and contractors of 360Ghar, as well as their immediate family members, are not eligible to participate.',
      'Participants must provide accurate and complete information during the referral submission.',
      '360Ghar reserves the right to verify the identity and eligibility of any participant.',
    ],
  },
  {
    title: '2. Referral qualification',
    items: [
      "The referred property must be located within 360Ghar's current service areas (primarily Gurugram and Delhi NCR).",
      'The property owner must be the legal owner with authority to rent or sell the property.',
      '<strong>Duplicate properties:</strong> properties already listed on 360Ghar or previously referred by any party are not eligible. 360Ghar decides this based on address verification.',
      "The property must pass 360Ghar's on-ground verification process.",
      'Commercial properties are only eligible if explicitly included in promotional campaigns.',
    ],
  },
  {
    title: '3. Reward structure',
    items: [
      '<strong>Onboarding bonus (₹100):</strong> paid within 7 business days of successful property verification and listing publication.',
      '<strong>Deal completion bonus, rent deals:</strong> 10% of brokerage received by 360Ghar (capped at ₹5,000).',
      '<strong>Deal completion bonus, sale deals:</strong> 5% of brokerage received by 360Ghar (capped at ₹10,000).',
      "Rewards are paid via UPI or bank transfer to the referrer's registered account.",
      'All rewards are subject to applicable tax deductions (TDS) as per the Income Tax Act, 1961.',
    ],
  },
  {
    title: '4. Deal completion requirements',
    items: [
      '<strong>For rental transactions:</strong> the lease agreement must be signed and the security deposit received by the property owner.',
      '<strong>For sale transactions:</strong> the sale deed must be registered and full payment received by the seller.',
      '360Ghar must receive its commission or brokerage fee for the referral reward to apply.',
      'If a deal is cancelled, reversed, or refunded after reward disbursement, 360Ghar reserves the right to recover the reward amount.',
    ],
  },
  {
    title: '5. Exclusions',
    items: [
      "Properties already in 360Ghar's database (verified by address, unit number, or owner details).",
      'Properties where the owner has already been contacted by 360Ghar through other channels.',
      'Referrals where the referee is an existing registered user of 360Ghar.',
      'Properties currently listed with other brokers or platforms with exclusive agreements.',
      'Properties that fail verification due to ownership disputes, legal issues, or misrepresentation.',
    ],
  },
  {
    title: '6. Anti-fraud provisions',
    items: [
      '<strong>Self-referrals are strictly prohibited.</strong> Referring your own property through a different identity will result in disqualification.',
      'Multiple referrals for the same property will result in only the first valid submission being considered.',
      'Fabricated or fake referrals will result in permanent disqualification and potential legal action.',
      '360Ghar reserves the right to verify the relationship between referrer and referee.',
      'Any attempt to manipulate or abuse the referral program will result in account suspension and clawback of all rewards.',
    ],
  },
  {
    title: '7. Contact verification',
    items: [
      "The referrer's mobile number may be verified via OTP before the submission is accepted.",
      'The property owner (referee) will be contacted for verification and consent.',
      '360Ghar may request identity proof from the referrer before releasing rewards.',
      'If the property owner declines to proceed or denies the referral, the submission will be cancelled.',
    ],
  },
  {
    title: '8. Reward disbursement',
    items: [
      'Bank account or UPI details will be collected at the time of reward claim.',
      'Rewards not claimed within 90 days of qualification will expire and cannot be reinstated.',
      'The referrer is responsible for providing accurate bank details. 360Ghar is not liable for failed transfers due to incorrect information.',
      'Payment processing may take 7-15 business days from the date of claim.',
    ],
  },
  {
    title: '9. One referral per property',
    items: [
      'Only one referrer can earn rewards for a single property.',
      'In case of duplicate submissions, the first valid submission (determined by timestamp) will be prioritised.',
      "360Ghar's decision on priority disputes is final and binding.",
    ],
  },
  {
    title: '10. Modification rights',
    items: [
      '360Ghar reserves the right to modify, suspend, or terminate the Referral Program at any time without prior notice.',
      'Changes to the terms will be effective immediately upon publication on this page.',
      'Continued participation in the program after changes constitutes acceptance of the modified terms.',
      "360Ghar's interpretation of these terms is final and binding in all matters related to the program.",
    ],
  },
  {
    title: '11. Tax implications',
    items: [
      'All rewards are subject to applicable taxes including TDS (Tax Deducted at Source) as per the Income Tax Act, 1961.',
      'TDS will be deducted at the applicable rate before payment.',
      'Referrers are solely responsible for reporting referral income in their tax returns.',
      '360Ghar will provide TDS certificates (Form 16A) upon request for amounts subject to TDS.',
    ],
  },
  {
    title: '12. Data and privacy',
    items: [
      'By submitting a referral, you confirm that you have obtained explicit consent from the property owner to share their contact details with 360Ghar.',
      'All personal data collected is subject to the 360Ghar <a href="{privacy}">Privacy Policy</a>.',
      'Information provided may be used for verification, communication, and program administration.',
      '360Ghar does not sell or share personal data with third parties except as required for program fulfilment.',
    ],
  },
  {
    title: '13. Dispute resolution',
    items: [
      `For any dispute about eligibility, rewards, or program terms, contact 360Ghar at <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a>.`,
      '360Ghar will investigate and respond to disputes within 15 business days.',
      "360Ghar's decision on all disputes shall be final and binding.",
      'Any legal disputes shall be subject to the jurisdiction of courts in Gurgaon, Haryana, India.',
    ],
  },
];
