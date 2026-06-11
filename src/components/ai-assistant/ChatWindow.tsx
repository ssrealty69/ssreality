'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip } from 'lucide-react';
import Image from 'next/image';
import LeadForm from './LeadForm';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  properties?: PropertyCard[];
  showLeadForm?: boolean;
  showMoreButton?: boolean;
  showPropertyTypePicker?: boolean;
  showLocationPicker?: boolean;
  showBhkPicker?: boolean;
  showBudgetPicker?: boolean;
}

interface PropertyCard {
  _id: string;
  title: string;
  city: string;
  price: string;
  type: string;
  bedrooms?: number;
  area: string;
  status: string;
  image?: string | null;
  amenities?: string[];
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { label: 'Apartment', emoji: '🏢', value: 'I am looking for an Apartment' },
  { label: 'Flat',      emoji: '🏠', value: 'I am looking for a Flat' },
  { label: 'Villa',     emoji: '🏡', value: 'I am looking for a Villa' },
  { label: 'Farm House',emoji: '🌳', value: 'I am looking for a Farm House' },
  { label: 'Plot',      emoji: '🏗️', value: 'I am looking for a Plot' },
  { label: 'Commercial',emoji: '🏪', value: 'I am looking for a Commercial property' },
];

const SS_LOCATIONS = ['Sultanpur', 'Chattarpur', 'Jaunapur', 'Gwal Pahari', 'Other'];

// ─── Mini Avatars ─────────────────────────────────────────────────────────────
function MiniAvatar() {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E8AF30]"
      style={{ background: '#FFF9E0' }}>
      <Image src="/mascot-profile.webp" alt="Aria" width={32} height={32} className="object-cover w-full h-full" />
    </div>
  );
}
function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-[#E2DCC8]"
      style={{ background: 'rgba(232,175,48,0.12)' }}>
      <span className="text-[13px]">👤</span>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <MiniAvatar />
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-[#E2DCC8] shadow-sm">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: '#E8AF30' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Property Type Picker ─────────────────────────────────────────────────────
function PropertyTypePicker({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <motion.div className="w-full mt-2"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex flex-wrap gap-1.5">
        {PROPERTY_TYPES.map((pt) => (
          <motion.button
            key={pt.label}
            onClick={() => onSelect(pt.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 py-1 rounded-full text-[9.5px] font-bold text-[#1A1800] transition-all"
            style={{
              background: 'linear-gradient(135deg, #F5C842 0%, #C9A227 100%)',
              boxShadow: '0 2px 6px rgba(232,175,48,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,220,80,0.35)',
              letterSpacing: '0.01em',
            }}
          >
            {pt.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Location Picker ──────────────────────────────────────────────────────────
function LocationPicker({ onSelect }: { onSelect: (loc: string) => void }) {
  const [showInput, setShowInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput) setTimeout(() => inputRef.current?.focus(), 100);
  }, [showInput]);

  const submitOther = () => {
    if (otherValue.trim()) {
      onSelect(otherValue.trim());
      setShowInput(false);
      setOtherValue('');
    }
  };

  return (
    <motion.div className="w-full mt-2"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex flex-wrap gap-1.5">
        {SS_LOCATIONS.map((loc) => (
          <motion.button
            key={loc}
            onClick={() => loc === 'Other' ? setShowInput(true) : onSelect(`I prefer ${loc} area`)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-2.5 py-1 rounded-full text-[9.5px] font-extrabold shadow-sm transition-all"
            style={{
              background: loc === 'Other'
                ? 'linear-gradient(135deg, #2d2900, #1A1800)'
                : 'linear-gradient(135deg, #E8AF30 0%, #C9A227 100%)',
              color: loc === 'Other' ? '#E8AF30' : '#1A1800',
              border: loc === 'Other' ? '1px solid #E8AF30' : 'none',
              boxShadow: '0 2px 6px rgba(232,175,48,0.25)',
            }}
          >
            {loc}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div className="mt-2 flex gap-2 items-center"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <input
              ref={inputRef}
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitOther()}
              placeholder="Type your preferred location..."
              className="flex-1 px-3 py-1.5 rounded-full text-[11px] outline-none font-medium"
              style={{ background: '#FFF9E6', border: '1.5px solid #E8AF30', color: '#1A1800' }}
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={submitOther}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8AF30, #B58110)' }}>
              <Send size={12} color="#1A1800" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── BHK Picker ───────────────────────────────────────────────────────────────
function BhkPicker({ onSelect }: { onSelect: (bhk: string) => void }) {
  const BHK_OPTIONS = ['2 BHK', '3 BHK', '4 BHK'];
  return (
    <motion.div className="w-full mt-2"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex flex-wrap gap-1.5">
        {BHK_OPTIONS.map((bhk) => (
          <motion.button
            key={bhk}
            onClick={() => onSelect(bhk)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 py-1 rounded-full text-[9.5px] font-bold text-[#1A1800] transition-all"
            style={{
              background: 'linear-gradient(135deg, #F5C842 0%, #C9A227 100%)',
              boxShadow: '0 2px 6px rgba(232,175,48,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,220,80,0.35)',
              letterSpacing: '0.01em',
            }}
          >
            {bhk}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Budget Picker ────────────────────────────────────────────────────────────
function BudgetPicker({ onSelect }: { onSelect: (budget: string) => void }) {
  const BUDGET_OPTIONS = [
    { label: 'Under 50L', value: 'My budget is under 50 Lakh' },
    { label: '50L - 1 Cr', value: 'My budget is 1 Crore' },
    { label: '1 Cr - 1.5 Cr', value: 'My budget is 1.5 Crore' },
    { label: '1.5 Cr - 2.5 Cr', value: 'My budget is 2.5 Crore' },
    { label: '2.5 Cr - 5 Cr', value: 'My budget is 5 Crore' },
    { label: '5 Cr+', value: 'My budget is 5 Cr+' },
  ];

  return (
    <motion.div className="w-full mt-2"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="grid grid-cols-3 gap-1.5">
        {BUDGET_OPTIONS.map((opt) => (
          <motion.button
            key={opt.label}
            onClick={() => onSelect(opt.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-1 py-1.5 rounded-full text-[9.5px] font-bold text-[#1A1800] transition-all text-center"
            style={{
              background: 'linear-gradient(135deg, #F5C842 0%, #C9A227 100%)',
              boxShadow: '0 2px 6px rgba(232,175,48,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,220,80,0.35)',
              letterSpacing: '0.01em',
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyMiniCard({ prop }: { prop: PropertyCard }) {
  const highlights = prop.amenities?.length ? prop.amenities.slice(0, 4) : ['Prime Location', 'Modern Amenities', 'Great Connectivity', 'High ROI'];
  return (
    <motion.div className="rounded-2xl overflow-hidden mt-2 shadow-sm"
      style={{ background: '#FFFFFF', border: '1.5px solid #E2DCC8' }} whileHover={{ scale: 1.01 }}>
      <div className="flex">
        <div className="w-24 h-[100px] flex-shrink-0 relative bg-gradient-to-br from-[#FFF9E0] to-[#FFF3C4] overflow-hidden">
          {prop.image ? (
            <Image src={prop.image} alt={prop.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" width="70" height="70" fill="none">
                <rect x="20" y="30" width="60" height="55" rx="4" fill="#E8AF30" opacity="0.2" />
                <rect x="28" y="22" width="44" height="63" rx="3" fill="#E8AF30" opacity="0.3" />
                {[28,40,52,64,76].map((y) => (
                  <g key={y}>
                    <rect x="33" y={y} width="8" height="7" rx="1" fill="#E8AF30" opacity="0.8" />
                    <rect x="48" y={y} width="8" height="7" rx="1" fill="#E8AF30" opacity="0.8" />
                    <rect x="63" y={y} width="8" height="7" rx="1" fill="#E8AF30" opacity="0.8" />
                  </g>
                ))}
                <line x1="10" y1="86" x2="90" y2="86" stroke="#E8AF30" strokeWidth="3" />
              </svg>
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 text-[7px] font-bold px-1.5 py-0.5 rounded-full text-[#1A1800]"
            style={{ background: '#E8AF30' }}>✦ Best Match</div>
        </div>
        <div className="flex-1 min-w-0 px-2.5 py-2 flex flex-col justify-between">
          <div>
            <span className="font-extrabold text-[11px] text-[#1A1800] leading-tight line-clamp-1 block">{prop.title}</span>
            <div className="text-[9px] font-bold text-[#E8AF30] mt-0.5">
              {prop.price}{prop.bedrooms ? ` | ${prop.bedrooms} BHK` : ''}
            </div>
            <div className="text-[8px] text-gray-500 mt-0.5">{prop.city} • {prop.area}</div>
            <div className="mt-1 space-y-0.5">
              {highlights.map((f) => (
                <div key={f} className="flex items-center gap-1 text-[8.5px] text-gray-600">
                  <span className="text-green-600 font-black text-[9px]">✓</span>{f}
                </div>
              ))}
            </div>
          </div>
          <a href={`/properties/${prop._id}`}
            className="mt-1.5 w-full py-1 rounded-lg text-[9.5px] font-extrabold text-center text-[#1A1800] block"
            style={{ background: 'linear-gradient(135deg, #E8AF30, #B58110)' }}>
            View Details →
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onLeadSuccess, onChipClick }: {
  msg: Message;
  onLeadSuccess: (n: string) => void;
  onChipClick: (text: string) => void;
}) {
  const isUser = msg.role === 'user';
  return (
    <motion.div className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {isUser ? <UserAvatar /> : <MiniAvatar />}

      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message text */}
        <div className="px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed font-medium whitespace-pre-wrap"
          style={isUser
            ? { background: 'linear-gradient(135deg,#E8AF30,#B58110)', color:'#1A1800', borderRadius:'18px 18px 4px 18px', boxShadow:'0 4px 12px rgba(232,175,48,0.3)' }
            : { background:'#FFFFFF', color:'#1A1800', border:'1.5px solid #E2DCC8', borderRadius:'18px 18px 18px 4px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }
          }>
          {msg.content}
        </div>

        {/* Property type picker */}
        {!isUser && msg.showPropertyTypePicker && (
          <PropertyTypePicker onSelect={onChipClick} />
        )}

        {/* Location picker */}
        {!isUser && msg.showLocationPicker && (
          <LocationPicker onSelect={onChipClick} />
        )}

        {/* BHK picker */}
        {!isUser && msg.showBhkPicker && (
          <BhkPicker onSelect={onChipClick} />
        )}

        {/* Budget picker */}
        {!isUser && msg.showBudgetPicker && (
          <BudgetPicker onSelect={onChipClick} />
        )}

        {/* Property cards */}
        {!isUser && msg.properties && msg.properties.length > 0 && (
          <div className="w-full mt-1 space-y-1">
            {msg.properties.map((p) => <PropertyMiniCard key={p._id} prop={p} />)}
          </div>
        )}

        {/* More Properties button */}
        {!isUser && msg.showMoreButton && (
          <motion.button
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => onChipClick('Show me more properties in same location')}
            className="mt-2 w-full py-2 rounded-xl text-[10.5px] font-extrabold text-[#B58110] text-center border border-[#E8AF30] hover:bg-[#FFF9E0] transition-all">
            🏘️ More Properties
          </motion.button>
        )}

        {/* Lead form */}
        {!isUser && msg.showLeadForm && (
          <motion.div className="w-full mt-2 p-3 rounded-xl"
            style={{ background: 'rgba(232,175,48,0.05)', border: '1px solid rgba(232,175,48,0.2)' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <p className="text-xs font-semibold text-[#E8AF30] mb-2 flex items-center gap-1">
              📞 Share your details
            </p>
            <LeadForm source="chat" compact onSuccess={onLeadSuccess} />
          </motion.div>
        )}

        <span className="text-[9px] text-gray-400 mt-1 px-1">
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main ChatWindow ──────────────────────────────────────────────────────────
export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // Attractive welcome message — property type picker shown first
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '✨ Welcome to SS Realty!\n\nI\'m Aria, your personal property expert. I\'ll help you find your dream property in minutes!\n\nWhat are you looking for?',
        timestamp: new Date(),
        showPropertyTypePicker: true,
      }]);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen, messages.length]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: text }], userMessage: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.message || "I'm here to help! What would you like to know?",
        timestamp: new Date(),
        properties: data.properties || [],
        showLeadForm: data.showLeadForm || false,
        showMoreButton: data.showMoreButton || false,
        showPropertyTypePicker: data.showPropertyTypePicker || false,
        showLocationPicker: data.showLocationPicker || false,
        showBhkPicker: data.showBhkPicker || false,
        showBudgetPicker: data.showBudgetPicker || false,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `a-err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having a momentary issue. Please try again or call us at +91 9311059100.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping]);

  const handleLeadSuccess = useCallback((name: string) => {
    // The LeadForm component renders its own gorgeous success card inline,
    // so we don't append a redundant duplicate chat message bubble.
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-[150] bottom-[80px] md:bottom-[115px] left-[44px] md:left-[68px]"
          style={{ width: 'min(305px, calc(100vw - 56px))' }}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {/* Leaning mascot */}
          <motion.div className="absolute -top-[80px] right-6 z-20 pointer-events-none"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 25 }}>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Image src="/mascot-peeking-final.webp" alt="SS Realty Mascot"
                width={100} height={100} className="object-contain"
                style={{ filter: 'drop-shadow(0 6px 12px rgba(232,175,48,0.25))' }} priority />
            </motion.div>
          </motion.div>

          {/* Close button */}
          <div className="absolute -top-2.5 -right-2 z-30 pointer-events-auto">
            <button onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#E8AF30] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              style={{ background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)' }} title="Close Chat">
              <X size={11} color="#000000" strokeWidth={3.5} />
            </button>
          </div>

          {/* Chat card */}
          <div className="flex flex-col overflow-hidden relative z-10"
            style={{ height: 'min(460px, calc(100vh - 190px))', background: '#F8F6EE', border: '2px solid #E8AF30', borderRadius: '20px', boxShadow: '0 24px 70px rgba(26,24,0,0.2), 0 6px 24px rgba(232,175,48,0.15)' }}>

            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1A1800 0%, #2d2900 100%)' }}>
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E8AF30]" style={{ background: '#FFF9E0' }}>
                <Image src="/mascot-profile.webp" alt="Aria" width={36} height={36} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-[13.5px] leading-none truncate"
                  style={{ fontFamily: 'Playfair Display, serif', background: 'linear-gradient(90deg,#FFE082 0%,#F5B041 50%,#C39B34 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SS Realty AI Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9.5px] text-green-300 font-bold uppercase tracking-wide">Online 24/7</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onLeadSuccess={handleLeadSuccess}
                    onChipClick={sendMessage}
                  />
                ))}
              </AnimatePresence>
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons */}
            <div className="flex-shrink-0 px-3 py-1.5 bg-white border-t border-[#E2DCC8]">
              <div className="flex gap-1.5 w-full justify-between">
                {[
                  { label: 'Site Visit', text: 'I want to schedule a site visit' },
                  { label: 'Callback',   text: 'Please arrange a callback' },
                  { label: 'Brochure',   text: 'Send me the brochure' },
                ].map(({ label, text }) => (
                  <button key={label} onClick={() => sendMessage(text)}
                    className="flex-1 flex items-center justify-center py-1 px-0.5 rounded-lg text-[9.5px] font-bold whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'rgba(232,175,48,0.04)', border: '0.75px solid rgba(232,175,48,0.2)', color: '#B58110' }}>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 pb-4 pt-2 bg-white border-t border-[#E2DCC8]">
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2 cursor-text"
                style={{ background: '#F8F6EE', border: '1.5px solid #E2DCC8' }}
                onClick={() => inputRef.current?.focus()}>
                <Paperclip size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask anything about properties..."
                  className="flex-1 bg-transparent text-[12px] h-full py-1 outline-none placeholder-gray-400"
                  style={{ color: '#1A1800' }}
                  disabled={isTyping}
                  aria-label="Chat message input"
                />
                <motion.button
                  onClick={(e) => { e.stopPropagation(); sendMessage(input); }}
                  disabled={!input.trim() || isTyping}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all pointer-events-auto"
                  style={{ background: input.trim() && !isTyping ? 'linear-gradient(135deg,#E8AF30,#B58110)' : 'rgba(232,175,48,0.15)' }}
                  whileTap={input.trim() && !isTyping ? { scale: 0.88 } : {}}
                  aria-label="Send">
                  <Send size={11} color={input.trim() && !isTyping ? '#1A1800' : '#C9A227'} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
