'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, X, User, Mail, MapPin, IndianRupee, Send, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useTracking } from '@/components/tracking/TrackingProvider';

export default function EMICalculator() {
  const { fireEvent } = useTracking();
  const [loanAmount, setLoanAmount] = useState<number | string>(5000000);
  const [downPayment, setDownPayment] = useState<number | string>(1000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [showDPDropdown, setShowDPDropdown] = useState(false);
  const dpDropdownRef = useRef<HTMLDivElement>(null);
  const [interestRate, setInterestRate] = useState<number | string>(8.5);
  const [tenure, setTenure] = useState<number | string>(20);

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState('');
  const [loanRequest, setLoanRequest] = useState('');
  const [pincode, setPincode] = useState('');
  const [formData, setFormData] = useState({
    employmentType: 'Salaried',
    propertyStatus: 'Shortlisted',
    monthlyIncome: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dpDropdownRef.current && !dpDropdownRef.current.contains(e.target as Node)) {
        setShowDPDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync down payment amount when percentage or loan amount changes
  useEffect(() => {
    const loan = Number(loanAmount) || 0;
    const dpAmount = Math.round((downPaymentPercent / 100) * loan);
    setDownPayment(dpAmount);
  }, [downPaymentPercent, loanAmount]);

  useEffect(() => {
    const p = Number(loanAmount) || 0;
    const d = Number(downPayment) || 0;
    const r = Number(interestRate) || 0;
    const t = Number(tenure) || 0;

    const principal = Math.max(0, p - d);
    const monthlyRate = r / 12 / 100;
    const numberOfMonths = t * 12;

    if (principal > 0 && numberOfMonths > 0) {
      if (r === 0) {
        const emiValue = Math.round(principal / numberOfMonths);
        setEmi(emiValue);
        setTotalPayment(Math.round(principal));
        setTotalInterest(0);
      } else {
        const emiValue = Math.round(
          (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
          (Math.pow(1 + monthlyRate, numberOfMonths) - 1)
        );
        const totalPay = emiValue * numberOfMonths;
        const totalInt = totalPay - principal;
        setEmi(emiValue);
        setTotalPayment(Math.round(totalPay));
        setTotalInterest(Math.round(totalInt));
      }
    } else {
      setEmi(0);
      setTotalPayment(0);
      setTotalInterest(0);
    }
  }, [loanAmount, downPayment, interestRate, tenure]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const principalAmount = Math.max(0, Number(loanAmount) - Number(downPayment));
  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (interestPercentage / 100) * circumference;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      setFormStep(2);
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: 'loan-enquiry@ssrealty.in', // Placeholder as email is not asked in EMI form
            phone: phone,
            subject: 'New Home Loan Enquiry (EMI Calculator)',
            message: `
              Home Loan Enquiry Details:
              - Name: ${formData.name}
              - Required Amount: ₹${loanRequest}
              - Area Pincode: ${pincode}
              - Employment: ${formData.employmentType}
              - Property Status: ${formData.propertyStatus}
              - Monthly Income: ₹${formData.monthlyIncome}
              - Calculated EMI: ₹${emi}
            `.trim()
          }),
        });

        if (res.ok) {
          // Fire Lead event for Remarketing
          fireEvent('Lead', {
            content_category: 'Home Loan Lead',
            content_name: 'EMI Calculator Inquiry',
            value: Number(loanRequest),
            currency: 'INR',
            name: formData.name,
            phone: phone,
            employment_type: formData.employmentType,
            monthly_income: formData.monthlyIncome,
            calculated_emi: emi
          });

          setSubmitted(true);
          setTimeout(() => {
            setShowModal(false);
            setSubmitted(false);
            setFormStep(1);
            setPhone('');
            setLoanRequest('');
            setPincode('');
            setFormData({ ...formData, name: '', monthlyIncome: '' });
          }, 3000);
        }
      } catch (error) {
        console.error('Submit Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Pre-fill loan request when modal opens
  useEffect(() => {
    if (showModal && !loanRequest) {
      setLoanRequest(loanAmount.toString());
    }
  }, [showModal, loanAmount]);

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* ... Hero and Calculator sections remain the same ... */}
      <div className="relative pt-36 pb-20 lg:pt-44 lg:pb-24 overflow-hidden bg-[#1A1800]">
        {/* Subtle background image at low opacity to ensure text stands out */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80')" }} 
        />
        {/* Bottom fade for smooth section transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFFEF5] to-transparent opacity-100" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="gold-divider mb-6 mx-auto" />
          <h1 className="text-4xl md:text-7xl font-[var(--font-playfair)] text-white mb-4 tracking-tight">
            EMI <span className="text-[#C9A227]">Calculator</span>
          </h1>
          <p className="text-[#E8D5A3] text-lg md:text-xl max-w-3xl font-medium mx-auto leading-relaxed">
            Plan your property investment with precision. Calculate your monthly installments and interest breakdown instantly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:-mt-10 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-[#E8D5A3]/40 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#E8D5A3]/30">
            
            <div className="w-full lg:w-[42%] lg:order-2 bg-[#FFFEF5]/50 p-8 lg:p-12 flex flex-col items-center">
              <div className="text-center mb-8">
                <span className="text-[10px] font-black text-[#6b6450]/60 uppercase tracking-[0.2em] block mb-2">Monthly EMI</span>
                <div className="text-4xl lg:text-5xl font-black text-[#1A1800] tracking-tighter">{formatCurrency(emi)}</div>
              </div>

              <div className="relative w-48 h-48 lg:w-56 lg:h-56 mb-8 mx-auto">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r={radius} fill="transparent" stroke="#1A1800" strokeWidth="18" />
                  <circle 
                    cx="50%" cy="50%" r={radius} fill="transparent" stroke="#C9A227" strokeWidth="18" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black text-[#6b6450]/60 uppercase tracking-widest">Interest</span>
                  <span className="text-lg font-black text-[#1A1800] tracking-tight">{Math.round(interestPercentage)}%</span>
                </div>
              </div>

              <div className="w-full space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E8D5A3]/30 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#1A1800]" />
                      <span className="text-[9px] font-bold text-[#6b6450]/60 uppercase tracking-widest">Principal</span>
                    </div>
                    <p className="text-sm font-black text-[#1A1800]">{formatCurrency(principalAmount)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#E8D5A3]/30 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
                      <span className="text-[9px] font-bold text-[#6b6450]/60 uppercase tracking-widest">Interest</span>
                    </div>
                    <p className="text-sm font-black text-[#C9A227]">{formatCurrency(totalInterest)}</p>
                  </div>
                </div>
                <div className="w-full mt-4 pt-6 border-t border-[#E8D5A3]/20 flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#6b6450]/60 uppercase tracking-widest">Total Payable</span>
                  <span className="text-xl font-black text-[#1A1800]">{formatCurrency(totalPayment)}</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[58%] lg:order-1 p-8 lg:p-14 space-y-12 bg-white">
              <CalculatorRow 
                label="Home Loan Amount" 
                value={loanAmount} 
                onChange={setLoanAmount} 
                min={100000} 
                max={100000000} 
                step={100000}
                minLabel="₹1L"
                maxLabel="₹10Cr"
                prefix="₹"
              />
              
              {/* Down Payment — custom dropdown + slider */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center gap-4">
                  <label className="text-[13px] font-bold text-[#1A1800] leading-tight flex-1">
                    Down Payment
                  </label>
                  {/* Custom compact dropdown */}
                  <div className="relative w-[140px] lg:w-[160px] shrink-0" ref={dpDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowDPDropdown(!showDPDropdown)}
                      className="w-full h-11 border-2 border-[#E8D5A3]/40 rounded-xl text-center text-[14px] font-black text-[#1A1800] transition-colors shadow-sm bg-[#FFFEF5] cursor-pointer flex items-center justify-between px-4 hover:border-[#C9A227] focus:border-[#C9A227] focus:outline-none"
                    >
                      <span className="flex-1 text-center">{downPaymentPercent}%</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-200 ${showDPDropdown ? 'rotate-180' : ''}`}>
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="#6b6450" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {/* Compact scrollable dropdown */}
                    {showDPDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#E8D5A3]/40 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] z-50 overflow-hidden">
                        <div className="max-h-[240px] overflow-y-auto" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
                          {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => { setDownPaymentPercent(pct); setShowDPDropdown(false); }}
                              className={`w-full px-4 py-2 text-[13px] font-bold text-center transition-colors ${
                                downPaymentPercent === pct
                                  ? 'bg-[#1A1800] text-[#C9A227]'
                                  : 'text-[#1A1800] hover:bg-[#FFFEF5]'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slider bar for percentage */}
                <div className="space-y-2">
                  <div className="relative h-6 flex items-center">
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #C9A227 0%, #C9A227 ${((downPaymentPercent - 5) / 95) * 100}%, #E5E7EB ${((downPaymentPercent - 5) / 95) * 100}%, #E5E7EB 100%)`
                      }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#C9A227]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#6b6450]/40 tracking-wider">
                    <span>5%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Show calculated amount */}
                <div className="flex justify-between items-center text-[11px] font-bold text-[#6b6450]/60 px-1">
                  <span>Amount</span>
                  <span className="text-[#1A1800] font-black text-[13px]">{formatCurrency(Number(downPayment))}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <CalculatorRow 
                  label="Tenure (Yrs)" 
                  value={tenure} 
                  onChange={setTenure} 
                  min={1} 
                  max={30} 
                  step={1}
                  minLabel="1"
                  maxLabel="30"
                  isSmall
                />
                <CalculatorRow 
                  label="Interest (%)" 
                  value={interestRate} 
                  onChange={setInterestRate} 
                  min={0} 
                  max={20} 
                  step={0.1}
                  minLabel="0%"
                  maxLabel="20%"
                  suffix="%"
                  isSmall
                />
              </div>

              <button 
                onClick={() => setShowModal(true)}
                className="w-full relative group active:scale-95 transition-all duration-500 mt-6"
              >
                {/* PREMIUM GLOW BACKGROUND */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A227]/0 via-[#C9A227]/40 to-[#C9A227]/0 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                <div className="relative w-full bg-[#1A1800] border border-white/5 p-4 sm:p-6 rounded-[32px] flex items-center justify-between shadow-2xl overflow-hidden">
                  {/* SHIMMER EFFECT */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#C9A227] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(201,162,39,0.3)] group-hover:scale-110 transition-transform duration-500">
                        <Phone className="text-[#1A1800] animate-pulse" size={24} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1800] animate-bounce" />
                    </div>
                    
                    <div className="text-left">
                      <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#C9A227] tracking-[0.2em] mb-1 opacity-80">Exclusive Financing</p>
                      <p className="text-white text-sm sm:text-lg font-bold leading-tight">Apply for Dream Home Loan</p>
                      <p className="text-white/40 text-[10px] font-medium mt-0.5 hidden sm:block">Fast-track your approval with our banking partners</p>
                    </div>
                  </div>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#C9A227]/30 flex items-center justify-center group-hover:bg-[#C9A227] group-hover:border-[#C9A227] transition-all duration-500 relative z-10">
                    <ArrowRight className="text-[#C9A227] group-hover:text-[#1A1800] transition-transform duration-500 group-hover:translate-x-1" size={20} />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MINI PREMIUM MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-[#1A1800]/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-[260px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-[#E8D5A3]/30"
            >
              {/* Premium Nano Header */}
              <div className="pt-5 px-4 pb-2 text-center relative bg-[#1A1800]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent opacity-50" />
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-white/30 hover:text-[#C9A227]"
                >
                  <X size={14} />
                </button>
                <h3 className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.3em]">
                  {formStep === 1 ? 'Step 01' : 'Step 02'}
                </h3>
                <p className="text-[13px] text-white font-black uppercase tracking-tight mt-1">
                  {formStep === 1 ? 'Basic Info' : 'Eligibility'}
                </p>
              </div>

              {/* Nano Elite Form Content */}
              <div className="p-5">
                {submitted ? (
                  <div className="py-6 text-center">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="text-green-500" size={20} />
                    </div>
                    <p className="text-[11px] font-black text-[#1A1800] uppercase tracking-tight">Application Received</p>
                    <p className="text-[9px] text-[#6b6450] mt-1 font-bold">Expert will call soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {formStep === 1 ? (
                        <motion.div 
                          key="s1"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-3"
                        >
                          <InputField 
                            label="Name" 
                            placeholder="Your full name" 
                            value={formData.name}
                            onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                            required 
                          />
                          <InputField 
                            label="Phone" 
                            placeholder="XXXXXXXXXX" 
                            type="tel" 
                            prefixText="+91"
                            value={phone}
                            onChange={(e: any) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            required 
                          />
                          <InputField 
                            label="Required Amount" 
                            placeholder="Enter amount"
                            prefixText="₹"
                            value={loanRequest}
                            onChange={(e: any) => setLoanRequest(e.target.value.replace(/[^0-9,]/g, ''))}
                            required 
                          />
                          <InputField 
                            label="Area Pincode" 
                            placeholder="6-digit code" 
                            value={pincode}
                            onChange={(e: any) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required 
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="s2"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-3"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-[#6b6450]/40 uppercase tracking-widest ml-1">Employment</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Salaried', 'Business'].map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setFormData({...formData, employmentType: t})}
                                  className={`h-8 rounded-lg text-[9px] font-black uppercase border transition-all ${
                                    formData.employmentType === t 
                                    ? 'bg-[#1A1800] border-[#1A1800] text-white shadow-lg' 
                                    : 'bg-white border-[#E8D5A3]/30 text-[#6b6450]/60 hover:border-[#C9A227]'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <InputField 
                            label="Monthly Income" 
                            placeholder="e.g. 50,000" 
                            prefixText="₹"
                            value={formData.monthlyIncome}
                            onChange={(e: any) => setFormData({...formData, monthlyIncome: e.target.value.replace(/[^0-9,]/g, '')})}
                            required 
                          />
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-[#6b6450]/40 uppercase tracking-widest ml-1">Property Status</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Shortlisted', 'Searching'].map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setFormData({...formData, propertyStatus: s})}
                                  className={`h-8 rounded-lg text-[9px] font-black uppercase border transition-all ${
                                    formData.propertyStatus === s 
                                    ? 'bg-[#1A1800] border-[#1A1800] text-white shadow-lg' 
                                    : 'bg-white border-[#E8D5A3]/30 text-[#6b6450]/60 hover:border-[#C9A227]'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-2 space-y-2">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1A1800] h-10 rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#C9A227] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                      >
                        {loading ? 'Processing...' : (formStep === 1 ? 'Continue' : 'Submit')}
                        {!loading && <ArrowRight size={12} />}
                      </button>
                      {formStep === 2 && (
                        <button 
                          type="button"
                          onClick={() => setFormStep(1)}
                          className="w-full text-[8px] font-black uppercase tracking-widest text-[#6b6450]/40 hover:text-[#1A1800] transition-colors"
                        >
                          Go Back
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, icon, prefixText, ...props }: any) {
  // Dynamic padding based on prefix length
  const pl = prefixText === '+91' ? 'pl-[88px]' : prefixText === '₹' ? 'pl-10' : 'pl-4';

  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-[#6b6450]/40 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {(icon || prefixText) && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {icon && <span className="text-[#C9A227]">{icon}</span>}
            {prefixText && (
              <span className="text-[13px] font-black text-[#1A1800] border-r border-[#E8D5A3]/30 pr-2 leading-none">
                {prefixText}
              </span>
            )}
          </div>
        )}
        <input 
          className={`w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-[13px] font-bold text-black focus:border-[#C9A227] focus:outline-none transition-all placeholder:text-gray-400 ${pl}`} 
          style={prefixText === '+91' ? { paddingLeft: '95px', color: '#000000', backgroundColor: '#ffffff' } : { color: '#000000', backgroundColor: '#ffffff' }}
          {...props} 
        />
      </div>
    </div>
  );
}

function CalculatorRow({ label, value, onChange, min, max, step, minLabel, maxLabel, prefix = "", suffix = "", isSmall = false }: any) {
  const percentage = ((Number(value) - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={`flex ${isSmall ? 'flex-col gap-2' : 'justify-between items-center gap-4'}`}>
        <label className="text-[13px] font-bold text-[#1A1800] leading-tight flex-1">
          {label}
        </label>
        <div className={`relative ${isSmall ? 'w-full' : 'w-[140px] lg:w-[160px]'} shrink-0`}>
          {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#6b6450]/60 pointer-events-none">{prefix}</span>}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
            className={`w-full h-11 border-2 border-[#E8D5A3]/40 rounded-xl text-right text-[14px] font-black text-[#1A1800] focus:border-[#C9A227] focus:outline-none transition-colors shadow-sm bg-[#FFFEF5]/50 ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-8' : 'pr-4'}`}
          />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#6b6450]/60 pointer-events-none">{suffix}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative h-6 flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={Number(value) || 0}
            onChange={(e) => onChange(e.target.value)}
            style={{
              background: `linear-gradient(to right, #C9A227 0%, #C9A227 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
            }}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#C9A227]"
          />
          <style jsx>{`
            input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              background: #C9A227;
              border: 4px solid white;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
          `}</style>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold text-[#6b6450]/40 tracking-wider">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
