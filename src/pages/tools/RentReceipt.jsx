import { useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import {
  generateBreadcrumbStructuredData,
  generateFaqStructuredData,
  generateHowToStructuredData,
} from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';
import RentReceiptPreview from './RentReceiptPreview';
import './RentReceipt.scss';

const RR_FAQS = [
  {
    question: 'Is a rent receipt mandatory for HRA claim?',
    answer:
      'Yes. If your monthly HRA exceeds ₹3,000, you must submit rent receipts to your employer to claim HRA exemption under Section 10(13A) of the Income Tax Act. For monthly HRA up to ₹3,000, receipts are not mandatory per CBDT circular, but most employers still ask for them.',
  },
  {
    question: 'When is landlord PAN required on a rent receipt?',
    answer:
      'If your annual rent exceeds ₹1,00,000 (i.e., monthly rent above ₹8,333), you must provide your landlord\'s PAN. If the landlord does not have a PAN, a written declaration stating so is required. Without PAN or declaration, your HRA claim may be rejected.',
  },
  {
    question: 'Is a revenue stamp required on rent receipts?',
    answer:
      'A revenue stamp of ₹1 must be affixed on rent receipts for cash payments exceeding ₹5,000, as per the Indian Stamp Act. For cheque, UPI, or bank transfer payments, no revenue stamp is needed regardless of the amount.',
  },
  {
    question: 'Can I claim HRA if I pay rent to my spouse?',
    answer:
      'No. Rent paid to a spouse is not eligible for HRA exemption. The Income Tax Department considers this a colorable transaction. However, rent paid to parents is allowed if genuine payments and documentation exist.',
  },
  {
    question: 'How is HRA exemption calculated?',
    answer:
      'HRA exemption is the minimum of: (1) Actual HRA received, (2) 50% of basic salary for metro cities (Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad) or 40% for non-metro cities, (3) Rent paid minus 10% of basic salary. "Salary" means Basic + Dearness Allowance.',
  },
  {
    question: 'How many rent receipts do I need for a financial year?',
    answer:
      'You need one rent receipt per month (12 receipts) if paying monthly. Some employers accept quarterly receipts (4 per year). Each receipt must show the rent period, amount, and landlord details.',
  },
  {
    question: 'Are digital/printed rent receipts valid?',
    answer:
      'Yes. Printed or digitally generated rent receipts are accepted by employers and the Income Tax Department. They must contain all required details: tenant name, landlord name, property address, rent amount, period, and landlord signature.',
  },
  {
    question: 'What is the rent receipt format for HRA claim?',
    answer:
      'A valid rent receipt must include: receipt number, date, tenant name, landlord name, property address, rent amount (in figures and words), rent period (from/to), payment mode, and landlord signature. If annual rent exceeds ₹1 lakh, include landlord PAN. If cash payment exceeds ₹5,000, affix a revenue stamp.',
  },
];

const HOW_TO_STEPS = [
  {
    name: 'Enter Landlord Details',
    text: 'Fill in your landlord\'s name and PAN (required if annual rent exceeds ₹1 lakh). The PAN format is 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F).',
  },
  {
    name: 'Enter Tenant & Property Details',
    text: 'Provide your name and the full address of the rented property. This address appears on the receipt as submitted to your employer.',
  },
  {
    name: 'Fill Rent & Payment Details',
    text: 'Enter the monthly rent amount, select the rent period (month), and choose the payment mode (Cash, UPI, Bank Transfer, or Cheque). The receipt auto-generates the amount in words.',
  },
  {
    name: 'Preview & Download',
    text: 'Review the live preview on the right. Click "Print / Download PDF" to save the receipt as PDF or print it directly. Use "Generate Full Year" to create all 12 monthly receipts at once.',
  },
];

const PAYMENT_MODES = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash', label: 'Cash' },
];

function getMonthStartEnd() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const toStr = (d) => d.toISOString().split('T')[0];
  return { start: toStr(start), end: toStr(end) };
}

function generateReceiptNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  return `RR-${ts.slice(-5)}`;
}

const RentReceipt = () => {
  const { t, i18n } = useTranslation('tools');
  const previewRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const { start: defaultStart, end: defaultEnd } = getMonthStartEnd();

  // Form state
  const [tenantName, setTenantName] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [rentPeriodStart, setRentPeriodStart] = useState(defaultStart);
  const [rentPeriodEnd, setRentPeriodEnd] = useState(defaultEnd);
  const [paymentMode, setPaymentMode] = useState('upi');
  const [receiptDate, setReceiptDate] = useState(today);
  const [landlordPAN, setLandlordPAN] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  // AUDIT FIX (imp 3.10): optional landlord signature image (data URL).
  const [landlordSignature, setLandlordSignature] = useState('');
  const [receiptNumber] = useState(generateReceiptNumber());
  const [batchMode, setBatchMode] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Computed values
  const rentAmountNum = Number(rentAmount) || 0;
  const annualRent = rentAmountNum * 12;
  const isPANRequired = annualRent > 100000;
  const isRevenueStampRequired = paymentMode === 'cash' && rentAmountNum > 5000;

  const panValidation = useMemo(() => {
    if (!landlordPAN) return isPANRequired ? 'required' : 'none';
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(landlordPAN.toUpperCase()) ? 'valid' : 'invalid';
  }, [landlordPAN, isPANRequired]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  // Print handler — same ref works for both single and batch mode
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: batchMode
      ? `RentReceipts-FY-${receiptNumber}`
      : `RentReceipt-${receiptNumber}`,
    pageStyle: `
      @page { size: A4; margin: 15mm; }
      @font-face {
        font-family: 'Josefin Sans';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('${window.location.origin}/assets/fonts/josefin-sans-latin.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Josefin Sans';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('${window.location.origin}/assets/fonts/josefin-sans-latin-variable.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Josefin Sans';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('${window.location.origin}/assets/fonts/josefin-sans-latin-variable.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Cinzel';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('${window.location.origin}/assets/fonts/cinzel-latin.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Cinzel';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('${window.location.origin}/assets/fonts/cinzel-latin-700.woff2') format('woff2');
      }
      @media print {
        html, body { height: auto !important; }
        body {
          color-adjust: exact;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    bodyClass: 'rent-receipt-print-body',
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    onPrintError: () => {
      setIsPrinting(false);
    },
  });

  const triggerPrint = () => {
    setIsPrinting(true);
    handlePrint();
    setTimeout(() => setIsPrinting(false), 10000);
  };

  const handleFillSample = () => {
    setTenantName('Rahul Sharma');
    setLandlordName('Sunita Gupta');
    setPropertyAddress('Flat 402, Tower B, DLF Phase 1, Gurugram, Haryana 122002');
    setRentAmount('25000');
    setRentPeriodStart(defaultStart);
    setRentPeriodEnd(defaultEnd);
    setPaymentMode('upi');
    setReceiptDate(today);
    setLandlordPAN('ABCPG1234F');
    setTransactionRef('UPI-20260501-RR');
  };

  const handleReset = () => {
    setTenantName('');
    setLandlordName('');
    setPropertyAddress('');
    setRentAmount('');
    setRentPeriodStart(defaultStart);
    setRentPeriodEnd(defaultEnd);
    setPaymentMode('upi');
    setReceiptDate(today);
    setLandlordPAN('');
    setTransactionRef('');
    setBatchMode(false);
  };

  // Batch receipts data (12 months of current FY)
  const batchReceipts = useMemo(() => {
    if (!batchMode) return null;
    const now = new Date();
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const receipts = [];
    for (let i = 0; i < 12; i++) {
      const month = (3 + i) % 12;
      const year = month >= 3 ? fyStartYear : fyStartYear + 1;
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      receipts.push({
        tenantName,
        landlordName,
        propertyAddress,
        rentAmount,
        rentPeriodStart: start.toISOString().split('T')[0],
        rentPeriodEnd: end.toISOString().split('T')[0],
        paymentMode,
        receiptDate: end.toISOString().split('T')[0],
        landlordPAN,
        landlordSignature,
        transactionRef,
        receiptNumber: `${receiptNumber}-${(i + 1).toString().padStart(2, '0')}`,
        isRevenueStampRequired,
      });
    }
    return receipts;
  }, [
    batchMode, tenantName, landlordName, propertyAddress, rentAmount,
    paymentMode, landlordPAN, landlordSignature, transactionRef, receiptNumber, isRevenueStampRequired,
  ]);

  const previewData = {
    tenantName,
    landlordName,
    propertyAddress,
    rentAmount,
    rentPeriodStart,
    rentPeriodEnd,
    paymentMode,
    receiptDate,
    landlordPAN,
    landlordSignature,
    transactionRef,
    receiptNumber,
    isRevenueStampRequired,
  };

  return (
    <>
      <SEO
        title={t('rentReceipt.title')}
        description={t('rentReceipt.description')}
        keywords={t('rentReceipt.keywords')}
        canonical="/rent-receipt"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={[
          generateToolSchema(toolSchemas.rentReceipt),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/tools' },
            { name: toolSchemas.rentReceipt.name, url: 'https://360ghar.com/rent-receipt' },
          ]),
          generateFaqStructuredData(RR_FAQS),
          generateHowToStructuredData({
            name: 'How to Generate Rent Receipt for HRA Claim',
            description: 'Step-by-step guide to create rent receipts for HRA tax exemption claims in India.',
            steps: HOW_TO_STEPS,
          }),
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
                {/* Hero */}
                <div className="rent-receipt-hero">
                  <h1>{t('rentReceipt.headingTitle')}</h1>
                  <p>{t('rentReceipt.headingDesc')}</p>
                </div>

                {/* Info badges */}
                <div className="rent-receipt-badges">
                  <span className="rent-receipt-badge rent-receipt-badge--success">
                    <i className="fas fa-check-circle" /> {t('rentReceipt.badgeFree')}
                  </span>
                  <span className="rent-receipt-badge rent-receipt-badge--info">
                    <i className="fas fa-shield-alt" /> {t('rentReceipt.badgePrivate')}
                  </span>
                  {isPANRequired && !landlordPAN && (
                    <span className="rent-receipt-badge rent-receipt-badge--warning">
                      <i className="fas fa-exclamation-triangle" /> {t('rentReceipt.badgePANRequired')}
                    </span>
                  )}
                  {isRevenueStampRequired && (
                    <span className="rent-receipt-badge rent-receipt-badge--warning">
                      <i className="fas fa-stamp" /> {t('rentReceipt.badgeRevenueStamp')}
                    </span>
                  )}
                </div>

                {/* AUDIT FIX (3.10): state-specific revenue stamp disclaimer */}
                <div className="alert alert-info py-2 px-3 small mb-3">
                  <i className="fas fa-info-circle me-1"></i>
                  {t('rentReceipt.stampStateNote', 'The ₹5,000 revenue stamp threshold varies by state under the Indian Stamp Act. Some states (e.g., Maharashtra, Karnataka) have different limits or surcharges. Confirm the applicable stamp duty rule for your state before submitting receipts for HRA claims.')}
                </div>

                {/* Quick actions */}
                <div className="rent-receipt-quick-actions">
                  <button className="btn-quick" onClick={handleFillSample}>
                    <i className="fas fa-magic" /> {t('rentReceipt.fillSample')}
                  </button>
                  <button className="btn-quick" onClick={handleReset}>
                    <i className="fas fa-eraser" /> {t('rentReceipt.clearAll')}
                  </button>
                </div>

                {/* Main form + preview layout */}
                <div className="row g-4">
                  {/* Form */}
                  <div className="col-lg-6">
                    <div className="rent-receipt-form calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                      {/* Landlord Details */}
                      <div className="form-section-title">
                        <i className="fas fa-user-tie me-1" /> {t('rentReceipt.landlordDetails')}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('rentReceipt.landlordName')}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={t('rentReceipt.landlordNamePlaceholder')}
                          value={landlordName}
                          onChange={(e) => setLandlordName(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          {t('rentReceipt.landlordPAN')}
                          {isPANRequired && <span className="text-danger ms-1">*</span>}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${panValidation === 'invalid' ? 'is-invalid' : ''}`}
                          placeholder="ABCDE1234F"
                          value={landlordPAN}
                          onChange={(e) => setLandlordPAN(e.target.value.toUpperCase())}
                          maxLength={10}
                        />
                        <div className="rent-receipt-hint">{t('rentReceipt.panHint')}</div>
                        {panValidation === 'invalid' && (
                          <div className="invalid-feedback">{t('rentReceipt.panInvalid')}</div>
                        )}
                        {isPANRequired && !landlordPAN && (
                          <div className="rent-receipt-warning">
                            <i className="fas fa-exclamation-triangle" />
                            {t('rentReceipt.panWarning')}
                          </div>
                        )}
                      </div>
                      {/* AUDIT FIX (imp 3.10): landlord signature upload */}
                      <div className="mb-3">
                        <label className="form-label">{t('rentReceipt.landlordSignature', 'Landlord Signature (optional)')}</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error(t('rentReceipt.signatureTooLarge', 'Signature image must be under 2MB.'));
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => setLandlordSignature(reader.result);
                            reader.readAsDataURL(file);
                          }}
                        />
                        {landlordSignature && (
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <img src={landlordSignature} alt="signature" style={{ maxHeight: 48 }} />
                            <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => setLandlordSignature('')}>
                              <i className="fas fa-times me-1" />{t('rentReceipt.removeSignature', 'Remove')}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tenant Details */}
                      <div className="form-section-title mt-4">
                        <i className="fas fa-user me-1" /> {t('rentReceipt.tenantDetails')}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('rentReceipt.tenantName')}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={t('rentReceipt.tenantNamePlaceholder')}
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                        />
                      </div>

                      {/* Property & Payment */}
                      <div className="form-section-title mt-4">
                        <i className="fas fa-home me-1" /> {t('rentReceipt.propertyPayment')}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('rentReceipt.propertyAddress')}</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder={t('rentReceipt.addressPlaceholder')}
                          value={propertyAddress}
                          onChange={(e) => setPropertyAddress(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('rentReceipt.rentAmount')}</label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="25000"
                            value={rentAmount}
                            onChange={(e) => setRentAmount(e.target.value)}
                            min={0}
                          />
                        </div>
                        {rentAmountNum > 0 && (
                          <div className="rent-receipt-hint">
                            {t('rentReceipt.annualRent')}: {formatCurrency(annualRent)}
                          </div>
                        )}
                      </div>
                      <div className="row">
                        <div className="col-6 mb-3">
                          <label className="form-label">{t('rentReceipt.periodFrom')}</label>
                          <input
                            type="date"
                            className="form-control"
                            value={rentPeriodStart}
                            onChange={(e) => setRentPeriodStart(e.target.value)}
                          />
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label">{t('rentReceipt.periodTo')}</label>
                          <input
                            type="date"
                            className="form-control"
                            value={rentPeriodEnd}
                            onChange={(e) => setRentPeriodEnd(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('rentReceipt.paymentMode')}</label>
                        <select
                          className="form-select"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                        >
                          {PAYMENT_MODES.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(paymentMode === 'cheque' || paymentMode === 'bank_transfer' || paymentMode === 'upi') && (
                        <div className="mb-3">
                          <label className="form-label">
                            {paymentMode === 'cheque'
                              ? t('rentReceipt.chequeNumber')
                              : t('rentReceipt.transactionRef')}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={
                              paymentMode === 'cheque'
                                ? t('rentReceipt.chequePlaceholder')
                                : t('rentReceipt.txnPlaceholder')
                            }
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Receipt Details */}
                      <div className="form-section-title mt-4">
                        <i className="fas fa-file-alt me-1" /> {t('rentReceipt.receiptDetails')}
                      </div>
                      <div className="row">
                        <div className="col-6 mb-3">
                          <label className="form-label">{t('rentReceipt.receiptDate')}</label>
                          <input
                            type="date"
                            className="form-control"
                            value={receiptDate}
                            onChange={(e) => setReceiptDate(e.target.value)}
                          />
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label">{t('rentReceipt.receiptNumber')}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={receiptNumber}
                            readOnly
                            style={{ backgroundColor: '#f8f8f8' }}
                          />
                        </div>
                      </div>

                      {/* Revenue stamp notice */}
                      {isRevenueStampRequired && (
                        <div className="rent-receipt-warning">
                          <i className="fas fa-stamp" />
                          {t('rentReceipt.revenueStampNotice')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="col-lg-6">
                    <div className="rent-receipt-preview-section">
                      <div className="results-card bg-white p-4 rounded-3 shadow-sm border border-light">
                        <h4 className="mb-3">
                          <i className="fas fa-eye me-2 text-main" />
                          {t('rentReceipt.previewTitle')}
                        </h4>

                        <div ref={previewRef}>
                          {batchMode && batchReceipts ? (
                            batchReceipts.map((receipt, idx) => (
                              <RentReceiptPreview key={idx} data={receipt} />
                            ))
                          ) : (
                            <RentReceiptPreview data={previewData} />
                          )}
                        </div>

                        {/* Actions */}
                        <div className="rent-receipt-actions">
                          {!batchMode ? (
                            <>
                              <button className="btn btn-main" onClick={triggerPrint} disabled={isPrinting}>
                                <i className={`fas ${isPrinting ? 'fa-circle-notch fa-spin' : 'fa-print'} me-1`} />
                                {isPrinting ? t('rentReceipt.preparing') : t('rentReceipt.printDownload')}
                              </button>
                              <button
                                className="btn btn-outline-main"
                                onClick={() => setBatchMode(true)}
                                disabled={isPrinting}
                              >
                                <i className="fas fa-calendar-alt me-1" /> {t('rentReceipt.generateFullYear')}
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-main" onClick={triggerPrint} disabled={isPrinting}>
                                <i className={`fas ${isPrinting ? 'fa-circle-notch fa-spin' : 'fa-print'} me-1`} />
                                {isPrinting ? t('rentReceipt.preparing') : t('rentReceipt.printFullYear')}
                              </button>
                              <button
                                className="btn btn-outline-main"
                                onClick={() => setBatchMode(false)}
                                disabled={isPrinting}
                              >
                                <i className="fas fa-arrow-left me-1" /> {t('rentReceipt.backToSingle')}
                              </button>
                            </>
                          )}
                          <button className="btn btn-outline-secondary" onClick={handleFillSample} disabled={isPrinting}>
                            <i className="fas fa-magic me-1" /> {t('rentReceipt.fillSample')}
                          </button>
                          <button className="btn btn-outline-danger" onClick={handleReset} disabled={isPrinting}>
                            <i className="fas fa-undo me-1" /> {t('rentReceipt.reset')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HRA Tips Section */}
                <div className="mt-5">
                  <h5>{t('rentReceipt.hraTipsTitle')}</h5>
                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-2">
                        <strong className="text-main">{t('rentReceipt.tipMetroTitle')}</strong>
                        <p className="small text-muted mb-0">{t('rentReceipt.tipMetro')}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-2">
                        <strong className="text-main">{t('rentReceipt.tipPANTitle')}</strong>
                        <p className="small text-muted mb-0">{t('rentReceipt.tipPAN')}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-2">
                        <strong className="text-main">{t('rentReceipt.tipStampTitle')}</strong>
                        <p className="small text-muted mb-0">{t('rentReceipt.tipStamp')}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-2">
                        <strong className="text-main">{t('rentReceipt.tipDocsTitle')}</strong>
                        <p className="small text-muted mb-0">{t('rentReceipt.tipDocs')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <ToolFaq faqs={RR_FAQS} heading={t('rentReceipt.faqHeading')} />

                {/* Related Tools */}
                <ToolRelatedLinks
                  heading={t('rentReceipt.relatedTools')}
                  links={[
                    { to: '/emi-calculator', label: t('rentReceipt.relatedEmi'), icon: 'fas fa-calculator' },
                    { to: '/capital-gains-tax-calculator', label: t('rentReceipt.relatedCapitalGains'), icon: 'fas fa-receipt' },
                    { to: '/area-converter', label: t('rentReceipt.relatedArea'), icon: 'fas fa-exchange-alt' },
                    { to: '/property-document-checklist', label: t('rentReceipt.relatedChecklist'), icon: 'fas fa-clipboard-check' },
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

export default RentReceipt;
