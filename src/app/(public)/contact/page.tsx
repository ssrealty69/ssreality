'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Send, Phone, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { useTracking } from '@/components/tracking/TrackingProvider';

const schema = z.object({
  name: z.string().min(2, 'Name is required (min 2 characters)'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short')
    .max(50, 'Email is too long'),
  phone: z.string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  subject: z.string().min(3, 'Please enter a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

const contactInfo = [
  { icon: MapPin, title: 'Office Address', detail: 'C43, St Number 9, DR Ambedkar Colony, Chattarpur Enclave, New Delhi 110030' },
  { icon: Phone, title: 'Phone', detail: '+91 93110 59100' },
  { icon: Mail, title: 'Email', detail: 'info@ssrealty.in' },
  { icon: Clock, title: 'Working Hours', detail: 'Mon–Sat: 9:00 AM – 7:00 PM' },
];

export default function ContactPage() {
  const { fireEvent } = useTracking();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        // Telemetry tracking event
        fireEvent('Contact', {
          form_name: 'General Contact Form',
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message
        });

        toast.success('Message sent! We\'ll contact you within 24 hours.');
        reset();
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#3a3828] bg-white outline-none focus:border-[#C9A227] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)] transition-all placeholder:text-[#b0a080]";
  const errorClass = "text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-tight";

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Header */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/90 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="gold-divider mb-5" />
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] text-white mb-4">Get In <span className="text-[#C9A227]">Touch</span></h1>
          <p className="text-[#d4c490] text-lg max-w-xl">Have a property in mind? Need expert advice? Our team is here to help.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[380px_1fr] gap-12">
          {/* Left — Info cards */}
          <div className="space-y-5">
            {contactInfo.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-[#E8D5A3] flex items-start gap-4 hover:shadow-[var(--shadow-gold)] transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-[#C9A227]/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b6450] uppercase tracking-wide mb-1">{title}</p>
                  <p className="text-sm text-[#1A1800] font-medium">{detail}</p>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-[#E8D5A3] h-48 bg-[#FFFBEB] flex items-center justify-center">
              <div className="text-center text-[#a09060]">
                <MapPin size={32} className="mx-auto mb-2 text-[#C9A227]" />
                <p className="text-sm font-medium">Chhatarpur, New Delhi</p>
                <p className="text-xs">Chattarpur Enclave, 110030</p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-white rounded-2xl p-8 border border-[#E8D5A3] shadow-[0_4px_24px_rgba(26,24,0,0.06)]">
            <h2 className="text-2xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-2">Send Us a Message</h2>
            <p className="text-sm text-[#6b6450] mb-8">Fill in the form and our team will get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#6b6450] uppercase tracking-wide mb-2">Full Name *</label>
                  <input {...register('name')} placeholder="Your full name" className={inputClass} />
                  {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b6450] uppercase tracking-wide mb-2">Email *</label>
                  <input {...register('email')} type="email" placeholder="your@email.com" className={inputClass} />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#6b6450] uppercase tracking-wide mb-2">Phone *</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#1A1800] border-r border-[#E8D5A3]/50 pr-3 flex items-center gap-2 pointer-events-none">
                      <Phone size={14} className="text-[#C9A227]" />
                      <span>+91</span>
                    </div>
                    <input 
                      {...register('phone', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        }
                      })} 
                      placeholder="XXXXXXXXXX" 
                      className={inputClass}
                      style={{ paddingLeft: '95px' }}
                    />
                  </div>
                  {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b6450] uppercase tracking-wide mb-2">Subject *</label>
                  <input {...register('subject')} placeholder="Property enquiry / Consultation" className={inputClass} />
                  {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b6450] uppercase tracking-wide mb-2">Message *</label>
                <textarea {...register('message')} rows={5} placeholder="Tell us what you're looking for…" className={`${inputClass} resize-none`} />
                {errors.message && <p className={errorClass}>{errors.message.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
