"use client";

import React from "react";
import Image from "next/image";
import { Compass, Home, Building2, ShieldCheck } from "lucide-react";

interface Milestone {
  year: string;
  step: string;
  title: string;
  desc: string;
  imageUrl: string;
  icon: any;
}

const milestones: Milestone[] = [
  {
    year: "2008",
    step: "01",
    title: "Plotting & Land Development",
    desc: "Our journey began in 2008, specializing in premium plotting works, local land developments, and layouts in the Delhi NCR region.",
    imageUrl: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=90",
    icon: Compass
  },
  {
    year: "2014",
    step: "02",
    title: "Luxury Villas & Farmhouses",
    desc: "Responding to elite demand, we expanded into luxury villas and farmhouses in prestigious neighborhoods, focusing on premium private greens.",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=90",
    icon: Home
  },
  {
    year: "2019",
    step: "03",
    title: "Commercial Projects",
    desc: "Diversified into commercial spaces, successfully facilitating state-of-the-art office spaces, high-street retail shops, and commercial hubs.",
    imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=90",
    icon: Building2
  },
  {
    year: "2021",
    step: "04",
    title: "Apartments & Registered Corporate",
    desc: "Entered the residential apartments sector and officially registered as a corporate real estate firm in Delhi NCR, serving buyers across Chattarpur, Gwal Pahari, and Gurgaon.",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=90",
    icon: ShieldCheck
  }
];

export default function JourneyTimeline() {
  return (
    <section className="section-padding bg-[#0A0907] relative overflow-hidden py-28 border-y border-[#C9A227]/15">
      
      {/* Definitions for arrow gold gradient */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <linearGradient id="arrowGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9A7D1C" />
            <stop offset="35%" stopColor="#C9A227" />
            <stop offset="70%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
        </defs>
      </svg>

      {/* Animated Dot/Blueprint Pattern (Moving GIF Pattern Style on Dark Background) */}
      <div 
        className="absolute inset-0 opacity-[0.22] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#C9A227 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
          animation: "movePattern 18s linear infinite"
        }}
      />

      {/* Styled Inline Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes movePattern {
          0% { background-position: 0 0; }
          100% { background-position: 64px 64px; }
        }
        @keyframes lineFlow {
          to { stroke-dashoffset: -120; }
        }
        .journey-flow-path {
          animation: lineFlow 6s linear infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.25; }
        }
        .animated-pulse-glow {
          animation: pulseGlow 6s ease-in-out infinite;
        }
      `}} />

      {/* Background glow filters (Warm Golden Glows) */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#C9A227]/6 rounded-full filter blur-[120px] pointer-events-none animated-pulse-glow z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#C9A227]/6 rounded-full filter blur-[120px] pointer-events-none animated-pulse-glow z-0" style={{ animationDuration: '8s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="gold-divider mx-auto mb-5" />
          <h2 className="text-4xl md:text-5xl font-[var(--font-playfair)]">
            <span style={{ color: "#ffffff" }}>Our</span> <span className="gold-text-gradient">Journey</span>
          </h2>
          <p className="text-[#a09060] text-sm max-w-lg mx-auto mt-3">
            Tracing our landmark expansion and growth in Delhi NCR real estate, shown side-by-side in one frame.
          </p>
        </div>

        {/* Timeline Grid Container */}
        <div className="relative">
          
          {/* Horizontal progress line strictly behind property circles (z-0, hidden on mobile) */}
          <div className="absolute left-[12%] right-[12%] top-[108px] h-2 z-0 hidden md:block pointer-events-none">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 1000 10" 
              preserveAspectRatio="none"
              overflow="visible"
            >
              {/* Backing glow line */}
              <path
                d="M 0 5 L 1000 5"
                fill="none"
                stroke="#C9A227"
                strokeWidth="4"
                className="opacity-20"
              />
              {/* Flowing dashed path */}
              <path
                d="M 0 5 L 1000 5"
                fill="none"
                stroke="#C9A227"
                strokeWidth="2.5"
                strokeDasharray="14, 14"
                className="journey-flow-path opacity-50"
              />

              {/* Moving Gradient Golden Arrow along the line */}
              <g>
                <path 
                  d="M -10 -5 L 6 0 L -10 5 L -6 0 Z" 
                  fill="url(#arrowGoldGradient)"
                  filter="drop-shadow(0px 0px 4px rgba(201, 162, 39, 0.8))"
                />
                <animateMotion 
                  path="M 0 5 L 1000 5" 
                  dur="6s" 
                  repeatCount="indefinite" 
                />
              </g>
            </svg>
          </div>

          {/* Cards Grid layout: 4 columns in one horizontal frame on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {milestones.map(({ year, step, title, desc, imageUrl, icon: Icon }) => (
              <div 
                key={year}
                className="bg-gradient-to-br from-[#161512]/90 to-[#0F0E0C]/95 border border-[#C9A227]/15 hover:border-[#C9A227]/40 rounded-2xl p-5 shadow-lg text-center flex flex-col items-center hover:scale-102 hover:shadow-[0_15px_35px_rgba(201,162,39,0.08)] transition-all duration-300 group z-10"
              >
                
                {/* Milestone Year (Top of the Card) */}
                <span className="text-[#C9A227] text-3xl font-[var(--font-playfair)] font-extrabold tracking-tight mb-3 block">
                  {year}
                </span>

                {/* Circle Property Image (z-20: stands in front of the path line) */}
                <div className="w-24 h-24 rounded-full border-3 border-[#C9A227]/40 group-hover:border-[#C9A227] group-hover:shadow-[0_0_20px_rgba(201,162,39,0.3)] overflow-hidden relative shadow-md z-20 transition-all duration-500 shrink-0">
                  <Image 
                    src={imageUrl} 
                    alt={title} 
                    fill 
                    sizes="200px"
                    className="object-cover transition-transform duration-700 scale-100 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Card Content details below circle */}
                <div className="flex flex-col items-center mt-4">
                  
                  {/* Step counter */}
                  <span className="text-[#a09060] text-[10px] font-semibold tracking-widest uppercase mb-1">
                    Step {step}
                  </span>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-1.5 justify-center mb-2 min-h-[44px]">
                    <Icon className="text-[#C9A227] w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <h3 
                      className="text-sm font-bold font-[var(--font-playfair)] leading-snug"
                      style={{
                        background: "linear-gradient(to right, #D9B44A 0%, #FFFBEB 50%, #C9A227 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        color: "transparent",
                        display: "inline-block"
                      } as any}
                    >
                      {title}
                    </h3>
                  </div>

                  {/* Description text */}
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {desc}
                  </p>

                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
