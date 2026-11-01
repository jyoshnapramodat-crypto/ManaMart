import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Landmark,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Wallet,
  Lock,
  ChevronRight,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmount,
  merchantName,
}) {
  // Payment Lifecycle State: 'selection' | 'processing' | 'success' | 'failure' | 'pending'
  const [paymentState, setPaymentState] = useState('selection');
  const [method, setMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'vpa'
  const [customVpa, setCustomVpa] = useState('user@okaxis');
  const [walletBalance] = useState(450);
  const [useWallet, setUseWallet] = useState(false);

  // Saved Cards state (Masked according to strict PCI guidelines)
  const [savedCards, setSavedCards] = useState([
    {
      id: 'card-1',
      brand: 'HDFC Bank Visa Platinum',
      last4: '4242',
      exp: '08/28',
      type: 'Credit Card',
      isDefault: true,
    },
    {
      id: 'card-2',
      brand: 'SBI RuPay Debit Card',
      last4: '9812',
      exp: '11/27',
      type: 'Debit Card',
      isDefault: false,
    },
  ]);
  const [selectedCardId, setSelectedCardId] = useState('card-1');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExp, setNewCardExp] = useState('');

  // Generated Order & Transaction Info
  const [orderId, setOrderId] = useState(`MNM-ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [txnId, setTxnId] = useState(`txn_${Math.random().toString(36).substring(2, 10)}`);

  if (!isOpen) return null;

  // Payable calculation if wallet balance is partially or fully applied
  const walletDeduction = useWallet ? Math.min(walletBalance, totalAmount) : 0;
  const netPayable = Math.max(0, totalAmount - walletDeduction);

  const handleStartPayment = (forceState = null) => {
    setPaymentState('processing');

    // Simulate gateway network roundtrip
    setTimeout(() => {
      if (forceState === 'failure') {
        setPaymentState('failure');
        return;
      }
      if (forceState === 'pending') {
        setPaymentState('pending');
        return;
      }

      // Default successful flow
      setPaymentState('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 1600);
  };

  const handleRefreshPending = () => {
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  const handleFinishSuccess = () => {
    onPaymentSuccess(method);
  };

  const handleAddNewCard = (e) => {
    e.preventDefault();
    if (!newCardNumber || newCardNumber.length < 4) return;
    const last4 = newCardNumber.slice(-4);
    const brand = last4.startsWith('4') ? 'Visa Card' : 'RuPay Card';
    const cardObj = {
      id: `card-${Date.now()}`,
      brand: `Bank ${brand}`,
      last4,
      exp: newCardExp || '12/29',
      type: 'Debit/Credit',
      isDefault: false,
    };
    setSavedCards((prev) => [...prev, cardObj]);
    setSelectedCardId(cardObj.id);
    setShowAddCard(false);
    setNewCardNumber('');
    setNewCardExp('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Gateway Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-black text-xs shadow-xs text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-orange-400">
                  ManaMart Pay Secure
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-sm border border-slate-700">
                  256-bit SSL
                </span>
              </div>
              <span className="text-xs text-slate-300 block">
                Paying {merchantName || 'Neighborhood Merchant'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-black text-white">₹{netPayable}</span>
            {useWallet && walletDeduction > 0 && (
              <span className="text-[10px] text-emerald-400 block font-semibold">
                -₹{walletDeduction} Wallet
              </span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* STATE 1: PAYMENT METHOD SELECTION */}
        {/* ============================================================== */}
        {paymentState === 'selection' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            
            {/* ManaMart Wallet Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-950 block">ManaMart Cash Wallet</span>
                  <span className="text-[11px] text-emerald-700">Available: ₹{walletBalance}</span>
                </div>
              </div>

              <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-emerald-900">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Apply</span>
              </label>
            </div>

            {/* Methods Tabs / Radios */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Choose Payment Mode
              </span>

              {/* 1. UPI Option */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  method === 'upi'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setMethod('upi')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">UPI Instant Payment</span>
                      <span className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm, Any UPI</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method === 'upi'}
                    onChange={() => setMethod('upi')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                </div>

                {/* UPI Sub-Apps */}
                {method === 'upi' && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {[
                        { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                        { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                        { id: 'paytm', name: 'Paytm', icon: '🔵' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1 ${
                            selectedUpiApp === app.id
                              ? 'border-orange-500 bg-white shadow-xs text-orange-950 ring-1 ring-orange-200'
                              : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <span className="text-base">{app.icon}</span>
                          <span className="text-[10px]">{app.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={customVpa}
                        onChange={(e) => setCustomVpa(e.target.value)}
                        placeholder="Or enter UPI ID (e.g. mobile@upi)"
                        className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Saved Debit / Credit Cards */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  method === 'card'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setMethod('card')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Saved Cards / New Card</span>
                      <span className="text-[10px] text-slate-500">RuPay, Visa, MasterCard</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method === 'card'}
                    onChange={() => setMethod('card')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                </div>

                {/* Masked Saved Cards View (PCI-DSS compliant) */}
                {method === 'card' && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    {savedCards.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCardId(c.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedCardId === c.id
                            ? 'bg-white border-orange-500 shadow-xs ring-1 ring-orange-200'
                            : 'bg-white/60 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-slate-600" />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{c.brand}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              •••• •••• •••• {c.last4} (Exp: {c.exp})
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="saved_card"
                          checked={selectedCardId === c.id}
                          onChange={() => setSelectedCardId(c.id)}
                          className="text-orange-600"
                        />
                      </div>
                    ))}

                    {/* Add Card Form or Trigger */}
                    {showAddCard ? (
                      <form onSubmit={handleAddNewCard} className="space-y-2 pt-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-600 block">Add New Card</span>
                        <input
                          type="text"
                          required
                          maxLength="19"
                          placeholder="Card Number (e.g. 4532 ...)"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength="5"
                            value={newCardExp}
                            onChange={(e) => setNewCardExp(e.target.value)}
                            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            maxLength="3"
                            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddCard(false)}
                            className="flex-1 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-1 rounded-lg bg-orange-600 text-white text-[11px] font-bold"
                          >
                            Save & Use
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddCard(true)}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add another Debit or Credit card</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Net Banking */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  method === 'netbanking'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setMethod('netbanking')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Net Banking</span>
                      <span className="text-[10px] text-slate-500">SBI, HDFC, ICICI, Axis, Kotak</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method === 'netbanking'}
                    onChange={() => setMethod('netbanking')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* 4. Cash on Delivery (COD) */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  method === 'cod'
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setMethod('cod')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Cash on Delivery</span>
                      <span className="text-[10px] text-slate-500">Pay cash or scan rider QR at doorstep</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={method === 'cod'}
                    onChange={() => setMethod('cod')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Test State Simulator Toolbar (To inspect Failure / Pending states effortlessly) */}
            <div className="p-2.5 bg-slate-100 rounded-xl text-[10px] text-slate-500 flex items-center justify-between">
              <span className="font-bold text-slate-700">Simulate Edge State:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => handleStartPayment('failure')}
                  className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold hover:bg-red-200"
                >
                  Simulate Fail
                </button>
                <button
                  type="button"
                  onClick={() => handleStartPayment('pending')}
                  className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold hover:bg-amber-200"
                >
                  Simulate Pending
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleStartPayment()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between"
              >
                <span className="text-xs">Pay Securely</span>
                <span className="text-sm font-black">₹{netPayable} →</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STATE 2: PAYMENT PROCESSING */}
        {/* ============================================================== */}
        {paymentState === 'processing' && (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-600 animate-spin" />
              <ShieldCheck className="w-8 h-8 text-orange-600" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              Processing Secure Neighborhood Payment
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Verifying transaction with banking network and notifying store. Please do not refresh or hit back.
            </p>

            <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-50 py-1.5 rounded-xl border border-slate-200 max-w-xs mx-auto">
              <span>Txn: {txnId}</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STATE 3: PAYMENT SUCCESS */}
        {/* ============================================================== */}
        {paymentState === 'success' && (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                Payment Confirmed
              </span>
              <h3 className="text-lg font-black text-slate-900">Order Placed Successfully!</h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-800">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">₹{netPayable} ({method.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Dispatch:</span>
                <span className="font-bold text-slate-800">5-8 mins</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Order has been sent directly to the store's kitchen/prep counter. Neighborhood rider dispatch initialized!
            </p>

            <button
              type="button"
              onClick={handleFinishSuccess}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#003527] to-[#055c24] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Track Live Delivery Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STATE 4: PAYMENT FAILURE */}
        {/* ============================================================== */}
        {paymentState === 'failure' && (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
                Transaction Declined
              </span>
              <h3 className="text-lg font-black text-slate-900">Payment Could Not Be Completed</h3>
            </div>

            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Your issuing bank or UPI application timed out or declined the authorization. No funds were deducted from your account.
            </p>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 text-left space-y-1">
              <span className="font-bold block">Recommended Actions:</span>
              <p className="text-[11px] text-red-700">
                • Retry the payment with the same method<br />
                • Or switch to Cash on Delivery (COD) or another card
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentState('selection')}
                className="py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-all"
              >
                Change Method
              </button>
              <button
                type="button"
                onClick={() => handleStartPayment()}
                className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Retry Payment
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STATE 5: PAYMENT PENDING */}
        {/* ============================================================== */}
        {paymentState === 'pending' && (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                Verification In Progress
              </span>
              <h3 className="text-lg font-black text-slate-900">Awaiting UPI Confirmation</h3>
            </div>

            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Please open your UPI app ({selectedUpiApp.toUpperCase()}) and approve the pending collect request of ₹{netPayable}.
            </p>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span>Status:</span>
                <span className="font-bold">Awaiting Bank Webhook</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span>Expires in:</span>
                <span className="font-bold text-amber-800">04:48 mins</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRefreshPending}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Payment Status</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentState('selection')}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold block mx-auto pt-1"
              >
                Cancel and pick another method
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
