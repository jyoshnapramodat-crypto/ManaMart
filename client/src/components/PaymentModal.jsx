import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, QrCode, CreditCard, Landmark, Banknote, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess, totalAmount, merchantName }) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate Razorpay Gateway handshake & backend verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onPaymentSuccess(method);
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Razorpay Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs">
              R
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-400 block">Razorpay Gateway</span>
              <span className="text-xs text-slate-300">Paying {merchantName || 'Local Merchant'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-white">₹{totalAmount}</span>
            <span className="text-[10px] text-slate-400 block">100% Secure SSL</span>
          </div>
        </div>

        {/* Success Animation View */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Payment Verified!</h3>
            <p className="text-xs text-slate-500">
              Transaction ID: <span className="font-mono text-slate-700">pay_{Math.random().toString(36).substring(2, 10)}</span>
            </p>
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-100">
              Handing over order to merchant and dispatching rider...
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                  method === 'upi'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-orange-600" />
                <div>
                  <span className="text-xs font-bold block">UPI Instant</span>
                  <span className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                  method === 'card'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-orange-600" />
                <div>
                  <span className="text-xs font-bold block">Card</span>
                  <span className="text-[10px] text-slate-500">Visa, RuPay, Master</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                  method === 'netbanking'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Landmark className="w-4 h-4 text-orange-600" />
                <div>
                  <span className="text-xs font-bold block">Net Banking</span>
                  <span className="text-[10px] text-slate-500">SBI, HDFC, ICICI, etc.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cod')}
                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                  method === 'cod'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-orange-600" />
                <div>
                  <span className="text-xs font-bold block">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-500">Pay at doorstep</span>
                </div>
              </button>
            </div>

            {/* Method Details */}
            {method === 'upi' && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Enter UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="mobilenumber@upi"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-orange-500"
                />
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supports Google Pay, PhonePe, Paytm, BHIM, CRED</span>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4111 2222 3333 4444"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Valid Thru</label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CVV</label>
                    <input
                      type="password"
                      defaultValue="888"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'cod' && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold">Keep cash ready at doorstep.</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You can also pay the delivery partner via UPI QR code on arrival.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying with Bank...</span>
                  </span>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
