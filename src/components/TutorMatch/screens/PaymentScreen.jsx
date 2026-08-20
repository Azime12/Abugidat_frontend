import React, { useState } from "react";

export default function PaymentScreen({
  bookingDetails,
  onBack,
  onConfirmPayment,
}) {
  const [selectedMethod, setSelectedMethod] = useState("tg");
  const [isProcessing, setIsProcessing] = useState(false);

  const rate = bookingDetails?.rate || 300;
  const serviceFee = bookingDetails?.serviceFee || 15;
  const total = rate + serviceFee;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment();
    }, 600);
  };

  return (
    <div className="tm-screen flex flex-col justify-between" id="s-payment">
      <div>
        <div className="tm-backbar">
          <i className="ti ti-arrow-left" onClick={onBack} title="Back to booking" />
          <span>Payment</span>
        </div>

        <p className="text-[13px] text-tm-muted mb-4 font-medium">
          Choose how you'd like to pay safely.
        </p>

        {/* Method 1: Telegram Pay */}
        <div
          className={`tm-pay-method shadow-xs ${
            selectedMethod === "tg" ? "selected" : ""
          }`}
          onClick={() => setSelectedMethod("tg")}
        >
          <i className="ti ti-brand-telegram text-2xl text-tm-blue" />
          <div>
            <div className="font-semibold text-[13px] text-tm-navy">
              Telegram Pay
            </div>
            <div className="text-[11px] text-tm-muted">
              Pay directly inside Telegram
            </div>
          </div>
        </div>

        {/* Method 2: Mobile money */}
        <div
          className={`tm-pay-method shadow-xs ${
            selectedMethod === "mobile" ? "selected" : ""
          }`}
          onClick={() => setSelectedMethod("mobile")}
        >
          <i className="ti ti-device-mobile text-2xl text-tm-coral" />
          <div>
            <div className="font-semibold text-[13px] text-tm-navy">
              Mobile Money
            </div>
            <div className="text-[11px] text-tm-muted">
              Telebirr, CBE Birr, M-Pesa
            </div>
          </div>
        </div>

        {/* Method 3: Card */}
        <div
          className={`tm-pay-method shadow-xs ${
            selectedMethod === "card" ? "selected" : ""
          }`}
          onClick={() => setSelectedMethod("card")}
        >
          <i className="ti ti-credit-card text-2xl text-tm-green" />
          <div>
            <div className="font-semibold text-[13px] text-tm-navy">
              Debit / Credit Card
            </div>
            <div className="text-[11px] text-tm-muted">
              Visa, Mastercard, Local Cards
            </div>
          </div>
        </div>

        {/* Total Card */}
        <div className="tm-card shadow-sm mt-3">
          <div className="tm-req-row">
            <span className="text-[13px] text-tm-muted">Session (1 hr)</span>
            <span className="text-[13px] text-tm-navy">{rate} ETB</span>
          </div>
          <div className="tm-req-row">
            <span className="text-[13px] text-tm-muted">Escrow service fee</span>
            <span className="text-[13px] text-tm-navy">{serviceFee} ETB</span>
          </div>
          <div className="tm-req-row pt-1.5">
            <span className="text-[13px] font-semibold text-tm-navy">
              Total Amount
            </span>
            <span className="text-[15px] font-bold text-tm-navy">
              {total} ETB
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <button
          disabled={isProcessing}
          className="tm-btn tm-btn-primary shadow-sm flex items-center justify-center gap-2"
          onClick={handlePay}
        >
          {isProcessing ? (
            <>
              <i className="ti ti-loader animate-spin text-lg" />
              <span>Processing secure payment...</span>
            </>
          ) : (
            <>
              <i className="ti ti-lock text-base" />
              <span>Pay {total} ETB</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
