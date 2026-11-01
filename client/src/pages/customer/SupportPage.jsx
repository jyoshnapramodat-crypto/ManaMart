import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  HelpCircle,
  FileText,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function SupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchHelpQuery, setSearchHelpQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'new_ticket' | 'faqs' | 'chat'

  // FAQs Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Tickets State
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-8942',
      category: 'Damaged Products',
      orderId: 'MNM-ORD-841920',
      subject: 'Milk pouch punctured during transit',
      description: 'One of the Vijaya Dairy milk packets was leaking when rider delivered the package.',
      status: 'In Progress', // 'Submitted' | 'In Progress' | 'Resolved'
      date: 'Today, 11:20 AM',
      hasImage: true,
      lastAgentReply: 'Hi! Our care team is reviewing the photo. Refund of ₹32 will be credited to your wallet in 15 mins.',
    },
    {
      id: 'TKT-8201',
      category: 'Delayed Delivery',
      orderId: 'MNM-ORD-771245',
      subject: 'Order delayed by 25 mins due to rain',
      description: 'Rider was held up at Jubilee Hills checkpost.',
      status: 'Resolved',
      date: 'Yesterday, 8:45 PM',
      hasImage: false,
      lastAgentReply: 'Delivery completed. ₹50 apology coupon LOCAL50 credited to your account.',
    },
  ]);

  // New Ticket Form State
  const [ticketCategory, setTicketCategory] = useState('Missing Items');
  const [ticketOrderId, setTicketOrderId] = useState('MNM-ORD-841920');
  const [ticketDescription, setTicketDescription] = useState('');
  const [imageAttached, setImageAttached] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(null);

  // Active In-App Chat with Support Agent
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', name: 'Aarti (ManaMart Support)', text: 'Namaste! Welcome to ManaMart Care. How can I help you today with your neighborhood orders?' },
    { sender: 'customer', text: 'I wanted to check on ticket TKT-8942 regarding the milk replacement.' },
    { sender: 'agent', name: 'Aarti (ManaMart Support)', text: 'Yes! I see ticket TKT-8942. The store has acknowledged it and your ₹32 refund has been initiated to your original UPI ID.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const faqs = [
    {
      q: 'How does ManaMart multi-store delivery work?',
      a: 'When you order items from multiple shops in one checkout, ManaMart dispatches dedicated neighborhood delivery partners to each merchant simultaneously. Your orders may arrive in separate bags within 20-35 minutes.',
    },
    {
      q: 'What happens if an ordered product is out of stock?',
      a: 'During checkout you can set your substitution preference: 1. Replace with similar product (store suggests brand/variant with price confirmation), 2. Contact me before replacing, or 3. Remove unavailable item & receive an instant refund.',
    },
    {
      q: 'How long does a refund take to reach my account?',
      a: 'UPI and ManaMart Wallet refunds are credited almost immediately (within 15 minutes to 2 hours). Debit/Credit card refunds typically reflect in 2 to 4 business days according to your bank rules.',
    },
    {
      q: 'Can I cancel an order after placing it?',
      a: 'Yes, you can cancel an order free of charge while it is in "Placed" or "Confirmed" status before the merchant starts preparing it. Simply go to Order Details and click "Cancel Order".',
    },
    {
      q: 'How do I download the GST tax invoice?',
      a: 'Visit Orders History -> select any completed order -> tap "Download Invoice" to get the official printable tax receipt with store GSTIN details.',
    },
  ];

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;

    const newTkt = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      orderId: ticketOrderId,
      subject: `${ticketCategory} on ${ticketOrderId}`,
      description: ticketDescription,
      status: 'Submitted',
      date: 'Just now',
      hasImage: imageAttached,
      lastAgentReply: 'Ticket received. A neighborhood support executive is being assigned within 5 minutes.',
    };

    setTickets([newTkt, ...tickets]);
    setCreatedNotice(newTkt.id);
    setTicketDescription('');
    setImageAttached(false);
    setActiveTab('tickets');
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'customer', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated executive reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          name: 'Aarti (ManaMart Support)',
          text: 'Thank you for providing the details! I have updated your ticket notes. Is there anything else I can assist you with?',
        },
      ]);
    }, 1500);
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      !searchHelpQuery ||
      f.q.toLowerCase().includes(searchHelpQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchHelpQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#003527] to-[#055c24] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <LifeBuoy className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Customer Care & Redressal
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black">Help & Support Center</h1>
            <p className="text-xs text-emerald-100/90 max-w-md">
              Need assistance with an order, missing item, payment, or neighborhood merchant? We're here 24x7!
            </p>
          </div>

          {/* Quick Call Button */}
          <a
            href="tel:1800123456"
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white text-[#003527] font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex-shrink-0"
          >
            <PhoneCall className="w-4 h-4 text-orange-600" />
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold">Toll-Free Helpline</span>
              <span>1800-MANA-MART</span>
            </div>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'tickets', label: `My Tickets (${tickets.length})`, icon: FileText },
          { id: 'new_ticket', label: 'Raise an Issue / Complaint', icon: AlertTriangle },
          { id: 'chat', label: 'Live Support Chat', icon: MessageSquare },
          { id: 'faqs', label: 'FAQs & Articles', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TICKETS DASHBOARD */}
      {/* ============================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {createdNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  Ticket <span className="font-mono font-bold">{createdNotice}</span> has been logged successfully. An agent is reviewing your request.
                </span>
              </div>
              <button
                onClick={() => setCreatedNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((tkt) => {
              const statusColor =
                tkt.status === 'Resolved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : tkt.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div
                  key={tkt.id}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {tkt.id}
                      </span>
                      <span className="text-[11px] text-slate-500">{tkt.date}</span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                      {tkt.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{tkt.subject}</h4>
                    <span className="text-[11px] font-semibold text-orange-600 block">
                      Order: {tkt.orderId} • {tkt.category}
                    </span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tkt.description}</p>
                  </div>

                  {tkt.hasImage && (
                    <div className="text-[10px] text-slate-500 flex items-center space-x-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-fit">
                      <Upload className="w-3 h-3 text-slate-400" />
                      <span>1 attachment photo uploaded</span>
                    </div>
                  )}

                  {tkt.lastAgentReply && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Latest Response from Care Team:
                      </span>
                      <p className="text-slate-700 italic">"{tkt.lastAgentReply}"</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                    >
                      <span>Chat with Assigned Executive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RAISE COMPLAINT / NEW TICKET */}
      {/* ============================================================== */}
      {activeTab === 'new_ticket' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 max-w-xl mx-auto">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Log a Support Complaint</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your recent order and issue category to receive fast refund or replacement.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Issue Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Missing Items',
                  'Damaged Products',
                  'Incorrect Order',
                  'Delayed Delivery',
                  'Request Refund',
                  'Merchant Quality',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTicketCategory(cat)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                      ticketCategory === cat
                        ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Reference */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Order ID Reference
              </label>
              <input
                type="text"
                required
                value={ticketOrderId}
                onChange={(e) => setTicketOrderId(e.target.value)}
                placeholder="e.g. MNM-ORD-841920"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Detailed Description of the Problem
              </label>
              <textarea
                rows="4"
                required
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Please describe what happened (e.g. 1 packet of curd missing from Swagath Grand order / package leaked)..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Image Attachment Upload Simulation (Module 9) */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Attach Photo Evidence (Damaged / Missing item)
              </label>
              <div
                onClick={() => setImageAttached(!imageAttached)}
                className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  imageAttached
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                    : 'border-slate-300 hover:border-orange-400 text-slate-500'
                }`}
              >
                {imageAttached ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">photo_evidence_package.jpg attached</span>
                    <span className="text-[10px] text-emerald-700">Click to remove</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Click to select or drop order photo</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all"
            >
              Submit Support Ticket
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIVE SUPPORT CHAT */}
      {/* ============================================================== */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[520px] max-w-xl mx-auto overflow-hidden">
          {/* Agent Banner */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute bottom-0 right-0" />
              </div>
              <div>
                <span className="text-xs font-black block">Aarti • ManaMart Executive</span>
                <span className="text-[10px] text-emerald-400">Online • Typically replies in 1 min</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
              Live Channel
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
              >
                {msg.name && (
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">{msg.name}</span>
                )}
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'customer'
                      ? 'bg-orange-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message to Aarti..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: FAQS & HELP ARTICLES */}
      {/* ============================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Search FAQ bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchHelpQuery}
              onChange={(e) => setSearchHelpQuery(e.target.value)}
              placeholder="Search help articles, returns, or delivery policy..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 shadow-2xs"
            />
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-2.5">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-extrabold text-slate-900 hover:text-orange-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

