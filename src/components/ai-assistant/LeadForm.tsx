'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2 } from 'lucide-react';

const schema = z.object({
  name:         z.string().min(2, 'Please enter your full name'),
  phone:        z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  location:     z.string().optional(),
  propertyType: z.string().optional(),
  budget:       z.string().optional(),
  message:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LeadFormProps {
  source?: 'chat' | 'scroll_modal' | 'lead_form';
  onSuccess?: (name: string) => void;
  compact?: boolean;
  className?: string;
}

const propertyTypes = ['Apartment / Flat', 'Villa / Builder Floor', 'Plot / Land', 'Commercial / Office', 'Any'];
const budgetRanges  = ['Under ₹50L', '₹50L–₹1Cr', '₹1Cr–₹2Cr', '₹2Cr–₹5Cr', '₹5Cr+'];

export default function LeadForm({ source = 'chat', onSuccess, compact = false, className = '' }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/ai-assistant/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      onSuccess?.(data.name);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className={`flex flex-col items-center gap-3 py-6 text-center ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #C9A227, #F0D060)' }}>
          <CheckCircle size={28} color="white" />
        </div>
        <h4 className="font-bold text-base" style={{ color: '#C9A227' }}>Details Received!</h4>
        <p className="text-sm text-gray-600 leading-relaxed max-w-[220px]">
          Our property expert will call you within 30 minutes. Thank you!
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-3 ${className}`}>
      {/* Name */}
      <div>
        <input
          {...register('name')}
          placeholder="Your Full Name *"
          className="ai-input"
          type="text"
          autoComplete="name"
        />
        {errors.name && <p className="ai-error">{errors.name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <input
          {...register('phone')}
          placeholder="Mobile Number (10 digits) *"
          className="ai-input"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
        />
        {errors.phone && <p className="ai-error">{errors.phone.message}</p>}
      </div>

      {!compact && (
        <>
          {/* Location */}
          <div>
            <input
              {...register('location')}
              placeholder="Preferred Location (e.g. Noida, Gurugram)"
              className="ai-input"
              type="text"
            />
          </div>

          {/* Property Type */}
          <div>
            <select {...register('propertyType')} className="ai-input">
              <option value="">Property Type (Optional)</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <select {...register('budget')} className="ai-input">
              <option value="">Budget Range (Optional)</option>
              {budgetRanges.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}

      <motion.button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
        style={{
          background: submitting
            ? '#9CA3AF'
            : 'linear-gradient(135deg, #C9A227 0%, #B8860B 100%)',
          boxShadow: submitting ? 'none' : '0 4px 16px rgba(201,162,39,0.4)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        {submitting ? (
          <><Loader2 size={16} className="animate-spin" /> Sending...</>
        ) : (
          '🏠 Request Callback'
        )}
      </motion.button>
    </form>
  );
}
