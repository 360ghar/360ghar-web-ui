import { formatRupeesInWords } from '../../utils/numberToWords';

const RentReceiptPreview = ({ data }) => {
  const {
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
  } = data;

  const amountInWords = rentAmount ? formatRupeesInWords(Number(rentAmount)) : '';
  const paymentModeLabels = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rent-receipt-print-area">
      <div className="rent-receipt-paper">
        {/* Header */}
        <div className="rent-receipt-paper__header">
          <h2 className="rent-receipt-paper__title">RENT RECEIPT</h2>
          <div className="rent-receipt-paper__meta">
            <span>Receipt No: <strong>{receiptNumber || 'RR-00001'}</strong></span>
            <span>Date: <strong>{formatDate(receiptDate)}</strong></span>
          </div>
        </div>

        {/* Body */}
        <div className="rent-receipt-paper__body">
          <p className="rent-receipt-paper__statement">
            Received a sum of <strong className="rent-receipt-paper__amount">
              {rentAmount ? `₹${Number(rentAmount).toLocaleString('en-IN')}` : '₹___'}
            </strong>
            {amountInWords && (
              <span className="rent-receipt-paper__words"> ({amountInWords})</span>
            )}
            {' '}from <strong>{tenantName || '___________________'}</strong> towards the rent
            for the property located at <strong>{propertyAddress || '___________________'}</strong>
            {' '}for the period from <strong>{formatDate(rentPeriodStart) || '___'}</strong> to{' '}
            <strong>{formatDate(rentPeriodEnd) || '___'}</strong>.
          </p>

          {/* Payment Details */}
          <div className="rent-receipt-paper__details">
            <div className="rent-receipt-paper__detail-row">
              <span className="rent-receipt-paper__detail-label">Mode of Payment:</span>
              <span className="rent-receipt-paper__detail-value">
                {paymentModeLabels[paymentMode] || paymentMode}
              </span>
            </div>
            {transactionRef && (
              <div className="rent-receipt-paper__detail-row">
                <span className="rent-receipt-paper__detail-label">
                  {paymentMode === 'cheque' ? 'Cheque No' : 'Transaction Ref'}:
                </span>
                <span className="rent-receipt-paper__detail-value">{transactionRef}</span>
              </div>
            )}
          </div>

          {/* Landlord Details */}
          <div className="rent-receipt-paper__landlord">
            <div className="rent-receipt-paper__detail-row">
              <span className="rent-receipt-paper__detail-label">Landlord Name:</span>
              <span className="rent-receipt-paper__detail-value">
                {landlordName || '___________________'}
              </span>
            </div>
            {landlordPAN && (
              <div className="rent-receipt-paper__detail-row">
                <span className="rent-receipt-paper__detail-label">Landlord PAN:</span>
                <span className="rent-receipt-paper__detail-value">{landlordPAN}</span>
              </div>
            )}
          </div>

          {/* Revenue Stamp */}
          {isRevenueStampRequired && (
            <div className="rent-receipt-paper__stamp">
              <div className="rent-receipt-paper__stamp-box">
                <span>₹1</span>
                <small>Revenue Stamp</small>
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="rent-receipt-paper__signature">
            {/* AUDIT FIX (imp 3.10): render uploaded landlord signature */}
            {landlordSignature && (
              <img
                src={landlordSignature}
                alt="Landlord signature"
                className="rent-receipt-paper__signature-image"
                style={{ maxHeight: 60, marginBottom: 4, objectFit: 'contain' }}
              />
            )}
            <div className="rent-receipt-paper__signature-line" />
            <span className="rent-receipt-paper__signature-label">
              Landlord Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentReceiptPreview;
