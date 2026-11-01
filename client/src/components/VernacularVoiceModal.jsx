import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Volume2,
  Globe,
  Plus,
  Minus,
  ArrowRight,
  Store,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import soundService from '../services/soundService';

// Comprehensive catalog vocabulary with Telugu & English synonym mappings
const VOICE_CATALOG = [
  {
    id: 'p-1',
    name: 'Swagath Handi Chicken Dum Biryani',
    teluguName: 'స్పెషల్ చికెన్ దమ్ బిర్యానీ',
    category: 'Hyderabadi Biryani',
    price: 360,
    mrp: 420,
    unit: '1 Handi (Serves 2)',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
    store: {
      id: 'm-1',
      businessName: 'Swagath Grand Kitchen',
      deliveryFee: 40,
    },
    keywords: [
      'biryani',
      'chicken biryani',
      'dum biryani',
      'handi biryani',
      'బిర్యానీ',
      'చికెన్ బిర్యానీ',
      'దమ్ బిర్యానీ',
      'హండీ బిర్యానీ',
    ],
  },
  {
    id: 'p-2',
    name: 'Sona Masoori Raw Rice (5kg)',
    teluguName: 'సోనా మసూరి బియ్యం (5 కేజీలు)',
    category: 'Staples & Grains',
    price: 340,
    mrp: 380,
    unit: '5 kg bag',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
    store: {
      id: 'm-2',
      businessName: 'Annapurna Supermarket',
      deliveryFee: 30,
    },
    keywords: [
      'rice',
      'sona masoori',
      'raw rice',
      'grain',
      'బియ్యం',
      'రైస్',
      'సోనా మసూరి',
      'మసూరి బియ్యం',
    ],
  },
  {
    id: 'p-3',
    name: 'Vijaya Gold Toned Milk (1 Litre)',
    teluguName: 'విజయ గోల్డ్ పాలు (1 లీటర్)',
    category: 'Dairy & Milk',
    price: 68,
    mrp: 72,
    unit: '1 Litre Pouch',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    store: {
      id: 'm-2',
      businessName: 'Annapurna Supermarket',
      deliveryFee: 30,
    },
    keywords: [
      'milk',
      'toned milk',
      'dairy',
      'vijaya milk',
      'heritage',
      'curd',
      'పాలు',
      'విజయ పాలు',
      'మిల్క్',
      'పెరుగు',
    ],
  },
  {
    id: 'p-4',
    name: 'Irani Dum Chai Flask Combo',
    teluguName: 'ఇరానీ దమ్ చాయ్ కాంబో + ఉస్మానియా బిస్కెట్లు',
    category: 'Tea & Snacks',
    price: 180,
    mrp: 210,
    unit: '500ml Flask + 6 Biscuits',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300',
    store: {
      id: 'm-9',
      businessName: 'Niloufer Cafe & Bakers',
      deliveryFee: 35,
    },
    keywords: [
      'chai',
      'tea',
      'irani chai',
      'osmania biscuits',
      'biscuits',
      'టీ',
      'చాయ్',
      'ఇరానీ చాయ్',
      'బిస్కెట్లు',
      'ఉస్మానియా',
    ],
  },
  {
    id: 'p-5',
    name: 'Dolo 650mg Paracetamol Strip',
    teluguName: 'డోలో 650 పారాసిటమాల్ టాబ్లెట్లు',
    category: 'Pharmacy',
    price: 32,
    mrp: 35,
    unit: '1 Strip (15 tablets)',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    store: {
      id: 'm-4',
      businessName: 'Apollo 24x7 Pharmacy',
      deliveryFee: 25,
    },
    keywords: [
      'dolo',
      'dolo 650',
      'paracetamol',
      'fever medicine',
      'tablet',
      'డోలో',
      'పారాసిటమాల్',
      'మందులు',
      'టాబ్లెట్లు',
    ],
  },
];

// Quick simulation prompts for instant testing without microphone
const SAMPLE_PROMPTS = [
  {
    lang: 'te',
    label: 'రెండు చికెన్ దమ్ బిర్యానీ కావాలి',
    text: 'రెండు చికెన్ దమ్ బిర్యానీ ఆర్డర్ చెయ్యి',
    tag: 'తెలుగు (Food)',
  },
  {
    lang: 'te',
    label: 'విజయ గోల్డ్ పాలు ప్యాకెట్ కార్ట్‌కి వేయి',
    text: 'ఒక విజయ గోల్డ్ పాలు ప్యాకెట్',
    tag: 'తెలుగు (Dairy)',
  },
  {
    lang: 'te',
    label: 'రెండు బ్యాగులు సోనా మసూరి బియ్యం',
    text: 'రెండు బ్యాగులు సోనా మసూరి బియ్యం',
    tag: 'తెలుగు (Kirana)',
  },
  {
    lang: 'en',
    label: '2 Handi Chicken Biryani from Swagath',
    text: 'Add 2 Handi Chicken Dum Biryani to my cart',
    tag: 'English (Food)',
  },
  {
    lang: 'en',
    label: '1 strip Dolo 650 from pharmacy',
    text: 'Please order 1 strip Dolo 650mg tablet',
    tag: 'English (Health)',
  },
];

export default function VernacularVoiceModal({ isOpen, onClose }) {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedLanguage, setSelectedLanguage] = useState('te-IN'); // 'te-IN' | 'en-IN'
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [matchedItem, setMatchedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setLiveTranscript('Listening... మాట్లాడండి...');
      setMatchedItem(null);
      setIsAddedSuccess(false);
      setFeedbackMsg('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setLiveTranscript(transcript);

      if (event.results[current].isFinal) {
        processSpokenVoice(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setFeedbackMsg('Microphone permission blocked. Please enable it in browser.');
      } else if (event.error === 'no-speech') {
        setFeedbackMsg('No speech detected. Please speak closer to microphone or try sample prompts below.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [selectedLanguage]);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setMatchedItem(null);
      setItemQuantity(1);
      setIsAddedSuccess(false);
      setFeedbackMsg('');
      setLiveTranscript('');
      // Auto start listening
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
        soundService.playRiderChirp();
      } catch (err) {
        // Recognition might already be running
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
  };

  // Natural Language Understanding (NLU) & Entity Extraction
  const processSpokenVoice = (text) => {
    const lower = text.toLowerCase().trim();

    // 1. Quantity Detection (Telugu & English)
    let qty = 1;
    if (
      lower.includes('రెండు') ||
      lower.includes('2') ||
      lower.includes('two') ||
      lower.includes('couple')
    ) {
      qty = 2;
    } else if (
      lower.includes('మూడు') ||
      lower.includes('3') ||
      lower.includes('three')
    ) {
      qty = 3;
    } else if (
      lower.includes('నాలుగు') ||
      lower.includes('4') ||
      lower.includes('four')
    ) {
      qty = 4;
    } else if (
      lower.includes('ఐదు') ||
      lower.includes('5') ||
      lower.includes('five')
    ) {
      qty = 5;
    }
    setItemQuantity(qty);

    // 2. Catalog Keyword Match
    let found = null;
    for (const item of VOICE_CATALOG) {
      const isMatch = item.keywords.some((kw) => lower.includes(kw.toLowerCase()));
      if (isMatch) {
        found = item;
        break;
      }
    }

    if (found) {
      setMatchedItem(found);
      setFeedbackMsg(`Recognized: ${found.name} (${qty}x)`);
      soundService.playDealDing();
    } else {
      setMatchedItem(null);
      setFeedbackMsg(
        selectedLanguage.startsWith('te')
          ? 'మీరు మాట్లాడింది అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి లేదా కింద ఉన్న నమూనా ఎంపికలపై క్లిక్ చేయండి.'
          : 'Could not match specific item. Please speak clearly or tap a sample prompt below.'
      );
    }
  };

  // Test with sample prompt (1-tap simulation)
  const handleTestSample = (sample) => {
    setSelectedLanguage(sample.lang === 'te' ? 'te-IN' : 'en-IN');
    setLiveTranscript(sample.text);
    processSpokenVoice(sample.text);
  };

  // Add recognized item to cart
  const handleConfirmAddToCart = () => {
    if (!matchedItem) return;

    for (let i = 0; i < itemQuantity; i++) {
      addItem(
        {
          id: matchedItem.id,
          name: matchedItem.name,
          price: matchedItem.price,
          mrp: matchedItem.mrp,
          isVeg: matchedItem.isVeg,
          image: matchedItem.image,
          merchantId: matchedItem.store.id,
        },
        matchedItem.store
      );
    }

    soundService.playDealDing();
    setIsAddedSuccess(true);

    setTimeout(() => {
      onClose();
      setIsCartOpen(true);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#003527] to-[#064e3b] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#fe6b00] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                ManaMart Vernacular Voice AI
                <span className="text-[10px] font-bold bg-white/20 text-emerald-200 px-2 py-0.5 rounded-full">
                  Telugu + English
                </span>
              </h2>
              <p className="text-[11px] text-white/80">
                Speak naturally in Telugu or English to order instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Language Selector Pill */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 pl-2">
              <Globe className="w-4 h-4 text-[#003527]" />
              <span>Voice Language:</span>
            </div>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('te-IN');
                  if (isListening) {
                    stopListening();
                    setTimeout(startListening, 300);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === 'te-IN'
                    ? 'bg-[#003527] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                తెలుగు (Telugu)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('en-IN');
                  if (isListening) {
                    stopListening();
                    setTimeout(startListening, 300);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === 'en-IN'
                    ? 'bg-[#003527] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                English (India)
              </button>
            </div>
          </div>

          {/* Central Live Microphone Pulse Area */}
          <div className="flex flex-col items-center justify-center py-3 text-center">
            <div className="relative flex items-center justify-center mb-3">
              {/* Outer Pulsing Waves */}
              {isListening && (
                <>
                  <div className="absolute w-28 h-28 rounded-full bg-[#fe6b00]/20 animate-ping duration-1000" />
                  <div className="absolute w-36 h-36 rounded-full bg-[#003527]/10 animate-pulse duration-700" />
                </>
              )}

              {/* Main Mic Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer active:scale-95 ${
                  isListening
                    ? 'bg-[#fe6b00] text-white ring-4 ring-[#fe6b00]/30 shadow-[#fe6b00]/40'
                    : 'bg-[#003527] text-white ring-4 ring-[#003527]/20 hover:bg-[#064e3b]'
                }`}
                title={isListening ? 'Tap to pause' : 'Tap to speak'}
              >
                {isListening ? (
                  <Mic className="w-8 h-8 animate-bounce duration-700" />
                ) : (
                  <MicOff className="w-8 h-8 opacity-90" />
                )}
              </button>
            </div>

            <span className="text-xs font-black text-slate-800">
              {isListening ? (
                <span className="flex items-center gap-1.5 text-[#fe6b00]">
                  <span className="w-2 h-2 rounded-full bg-[#fe6b00] animate-ping" />
                  Listening... మాట్లాడండి...
                </span>
              ) : (
                'Microphone idle. Tap mic to speak'
              )}
            </span>

            {/* Live Transcript Bubble */}
            <div className="mt-3 w-full min-h-[50px] p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-center text-center">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 italic">
                {liveTranscript ? `"${liveTranscript}"` : 'Try saying: "రెండు బిర్యానీ కావాలి" or "Add 2 Chicken Biryani"'}
              </p>
            </div>

            {feedbackMsg && (
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                {feedbackMsg}
              </p>
            )}
          </div>

          {/* Matched Product Card & Direct Add to Cart Action */}
          {matchedItem && (
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500/70 shadow-sm space-y-3 animate-slideUp">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={matchedItem.image}
                    alt={matchedItem.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          matchedItem.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {matchedItem.category}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                      {matchedItem.name}
                    </h4>
                    <p className="text-xs font-medium text-[#fe6b00]">
                      {matchedItem.teluguName}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-bold text-emerald-700">₹{matchedItem.price}</span>
                      <span className="line-through text-slate-400">₹{matchedItem.mrp}</span>
                      <span>• {matchedItem.store.businessName}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-900">
                    {itemQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setItemQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Confirm Add to Cart Button */}
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                disabled={isAddedSuccess}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer ${
                  isAddedSuccess
                    ? 'bg-emerald-600'
                    : 'bg-gradient-to-r from-[#003527] to-[#064e3b] hover:from-[#064e3b] hover:to-[#003527]'
                }`}
              >
                {isAddedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Added {itemQuantity}x to Cart! Opening checkout...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#fe6b00]" />
                    <span>
                      Add {itemQuantity}x to Cart • ₹{matchedItem.price * itemQuantity}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quick 1-Tap Sample Prompts for Instant Testing */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#fe6b00]" />
                1-Tap Test Prompts (Simulate Voice):
              </span>
              <span className="text-[10px] text-slate-400">Click to test instantly</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTestSample(sample)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-left transition-all group flex flex-col cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/60 self-start px-1.5 py-0.2 rounded-md mb-0.5">
                    {sample.tag}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 line-clamp-1">
                    "{sample.label}"
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 Supported in Hyderabad, Vijayawada, Vizag, Warangal & all Telugu districts
          </p>
        </div>
      </div>
    </div>
  );
}
