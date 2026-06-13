'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Star, Users, Target, Rocket, IndianRupee, X, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTracking } from '@/components/tracking/TrackingProvider';

const jobs = [
  {
    id: 1,
    title: 'Field Sales Associate',
    department: 'Sales & Field Ops',
    location: 'South Delhi / Gurgaon',
    type: 'Commission Based',
    experience: '0-2 Years / Freshers',
    salary: 'High Commission + Travel Allowance',
    isHot: true,
    description: 'We are looking for ambitious individuals to drive our field sales operations. High earning potential through performance-based commissions.'
  }
];

const perks = [
  { icon: Users, title: 'Great Culture', desc: 'Work with a young and ambitious team of real estate experts.' },
  { icon: Target, title: 'High Incentives', desc: 'Uncapped earning potential with industry-leading commission structures.' },
  { icon: Star, title: 'Premium Branding', desc: 'Deal with high-net-worth individuals and luxury inventory.' },
  { icon: Rocket, title: 'Growth Path', desc: 'Clear trajectory from associate to management levels.' }
];

export default function CareersPage() {
  const { fireEvent } = useTracking();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('position', selectedJob.title);

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // Fire CompleteRegistration event for dynamic remarketing
        fireEvent('CompleteRegistration', {
          content_name: 'Job Application',
          position: selectedJob?.title,
          name: formData.get('name'),
          phone: formData.get('phone'),
          age: formData.get('age')
        });

        setIsSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSuccess(false);
          setSelectedJob(null);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5] overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/90 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="gold-divider mb-5" />
            <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] mb-4 text-white">
              <span className="text-white">Join Our</span> <span className="text-[#C9A227]">Elite Team</span>
            </h1>
            <p className="text-[#d4c490] text-lg max-w-2xl">
              Build your future with Delhi NCR's most trusted real estate brand.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why Work With Us - Compact */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-[#E8D5A3]/30 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-[#FFFEF5] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#C9A227] transition-all duration-300">
                <perk.icon className="text-[#C9A227] group-hover:text-white transition-colors" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1800] mb-2">{perk.title}</h3>
              <p className="text-[12px] text-[#6b6450] leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Open Positions - Compact Premium List */}
      <section className="py-16 bg-[#FFFEF5] relative overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-0 right-0 text-[100px] md:text-[120px] font-black text-[#C9A227]/[0.03] select-none pointer-events-none translate-x-10 -translate-y-1/4">
          CAREERS
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.4em] block mb-2">Join The Best</span>
            <h2 className="text-3xl md:text-5xl font-[var(--font-playfair)] text-[#1A1800] mb-2">
              Current <span className="text-[#C9A227] italic">Opportunities</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent mx-auto mt-4" />
          </div>

          <div className="space-y-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C9A227]/0 via-[#C9A227]/20 to-[#C9A227]/0 rounded-[32px] opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700" />
                
                <div className="relative bg-white border border-[#E8D5A3]/30 rounded-[32px] p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#1A1800] text-[#C9A227] text-[9px] font-black uppercase rounded-full shadow-md">
                          {job.isHot && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A227] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A227]"></span>
                            </span>
                          )}
                          {job.department}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FFFEF5] border border-[#E8D5A3]/40 text-[#6b6450] text-[9px] font-bold uppercase rounded-full">
                          <Clock size={11} className="text-[#C9A227]" />
                          {job.type}
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-[#1A1800] mb-3 group-hover:text-[#C9A227] transition-colors duration-300">
                        {job.title}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#FFFEF5] rounded-lg flex items-center justify-center border border-[#E8D5A3]/20">
                            <MapPin size={16} className="text-[#C9A227]" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-[#6b6450]/40 uppercase tracking-widest">Location</p>
                            <p className="text-[11px] font-bold text-[#1A1800]">{job.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#FFFEF5] rounded-lg flex items-center justify-center border border-[#E8D5A3]/20">
                            <Star size={16} className="text-[#C9A227]" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-[#6b6450]/40 uppercase tracking-widest">Experience</p>
                            <p className="text-[11px] font-bold text-[#1A1800]">{job.experience}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#FFFEF5] rounded-lg flex items-center justify-center border border-[#E8D5A3]/20">
                            <IndianRupee size={16} className="text-[#C9A227]" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-[#6b6450]/40 uppercase tracking-widest">Salary</p>
                            <p className="text-[11px] font-bold text-[#1A1800]">{job.salary}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={() => handleApply(job)}
                        className="group/btn relative w-full lg:w-auto px-10 py-3.5 bg-[#1A1800] text-white rounded-xl font-bold transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-lg hover:shadow-[0_15px_30px_rgba(201,162,39,0.2)] overflow-hidden flex items-center justify-center gap-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative z-10 text-[14px]">Apply Now</span>
                        <ArrowRight size={18} className="relative z-10 transition-transform group-hover/btn:translate-x-1.5" />
                      </button>
                      <p className="text-[9px] font-bold text-[#6b6450]/40 italic">Fast Response</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#1A1800]/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] border-2 border-[#C9A227] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#1A1800] p-6 text-center relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <h3 className="text-2xl font-[var(--font-playfair)] font-bold tracking-tight" style={{ color: '#EAD393' }}>Join SS Realty</h3>
                <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] mt-2">Applying for {selectedJob?.title}</p>
              </div>

              <div className="p-8">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-[#1A1800] mb-2">Application Sent!</h4>
                    <p className="text-sm text-[#6b6450]">We'll review your profile and get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-[#6b6450] uppercase tracking-widest mb-1.5 ml-1">Full Name *</label>
                      <input 
                        required
                        name="name"
                        type="text" 
                        placeholder="Enter your name"
                        className="w-full bg-[#FFFEF5] border border-[#E8D5A3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#6b6450] uppercase tracking-widest mb-1.5 ml-1">Mobile No *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6b6450]/60">
                            +91
                          </span>
                          <input 
                            required
                            name="phone"
                            type="tel" 
                            maxLength={10}
                            minLength={10}
                            pattern="[0-9]{10}"
                            placeholder="XXXXXXXXXX"
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className="w-full bg-[#FFFEF5] border border-[#E8D5A3] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#6b6450] uppercase tracking-widest mb-1.5 ml-1">Age *</label>
                        <input 
                          required
                          name="age"
                          type="number" 
                          placeholder="Years"
                          className="w-full bg-[#FFFEF5] border border-[#E8D5A3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#6b6450] uppercase tracking-widest mb-1.5 ml-1">Resume (Optional)</label>
                      <div className="relative">
                        <input 
                          name="resume"
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-[#FFFEF5] border-2 border-dashed border-[#E8D5A3] rounded-xl px-4 py-4 text-center group-hover:border-[#C9A227] transition-all">
                          <Upload size={20} className="mx-auto text-[#C9A227] mb-2" />
                          <p className="text-[10px] text-[#6b6450] font-bold">PDF, DOCX (Max 5MB)</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full bg-[#1A1800] text-[#C9A227] py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#C9A227] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recruitment Process - Professional & Compact */}
      <section className="py-20 bg-[#FFFEF5] border-t border-[#E8D5A3]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-[var(--font-playfair)] text-[#1A1800] mb-12">
            Your <span className="text-[#C9A227]">Recruitment Journey</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#1A1800] text-[#C9A227] rounded-full flex items-center justify-center mx-auto mb-4 font-black text-lg shadow-xl">1</div>
              <h4 className="text-sm font-bold text-[#1A1800] mb-2 uppercase tracking-widest">Apply Online</h4>
              <p className="text-[11px] text-[#6b6450] leading-relaxed">Fill out our quick application form with your basic details.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#1A1800] text-[#C9A227] rounded-full flex items-center justify-center mx-auto mb-4 font-black text-lg shadow-xl">2</div>
              <h4 className="text-sm font-bold text-[#1A1800] mb-2 uppercase tracking-widest">Team Interview</h4>
              <p className="text-[11px] text-[#6b6450] leading-relaxed">A direct interaction with our leadership to discuss the role.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#C9A227] text-[#1A1800] rounded-full flex items-center justify-center mx-auto mb-4 font-black text-lg shadow-xl">3</div>
              <h4 className="text-sm font-bold text-[#1A1800] mb-2 uppercase tracking-widest">Onboarding</h4>
              <p className="text-[11px] text-[#6b6450] leading-relaxed">Start your journey with comprehensive training and support.</p>
            </div>
          </div>

          <p className="mt-16 text-[10px] text-[#6b6450]/60 italic font-medium">
            SS Realty is an equal opportunity employer. We value diversity and ambition.
          </p>
        </div>
      </section>
    </div>
  );
}
