'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import Script from 'next/script';

interface TrackingSettingsData {
  isEnabled: boolean;
  googleTagManagerId?: string;
  metaPixelId?: string;
  googleAdsConversionId?: string;
  googleAdsRemarketingLabel?: string;
  ga4MeasurementId?: string;
  enableAdvancedMatching?: boolean;
  enableEventLog?: boolean;
}

interface TrackingContextType {
  fireEvent: (eventName: string, params?: Record<string, any>) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}

interface TrackingProviderProps {
  settings: TrackingSettingsData | null;
  children: React.ReactNode;
}

export default function TrackingProvider({ settings, children }: TrackingProviderProps) {
  const sessionIdRef = useRef<string>('');

  // 1. Generate unique session ID on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessId = localStorage.getItem('ss_realty_session_id');
      if (!sessId) {
        sessId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('ss_realty_session_id', sessId);
      }
      sessionIdRef.current = sessId;
    }
  }, []);

  // 2. Core tracking function
  const fireEvent = async (eventName: string, params: Record<string, any> = {}) => {
    if (!settings || !settings.isEnabled) return;

    const payload = {
      ...params,
      platform: 'web',
      timestamp: new Date().toISOString()
    };

    console.log(`📡 [Retargeting Event]: Firing "${eventName}" with parameters:`, payload);

    // A. Meta (Facebook) Pixel Event
    if (typeof window !== 'undefined' && (window as any).fbq && settings.metaPixelId) {
      // If it's a standard event name, fire standard track. Otherwise trackCustom.
      const standardEvents = [
        'ViewContent', 'Search', 'AddToCart', 'AddToWishlist', 'InitiateCheckout',
        'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration', 'Contact'
      ];
      const isStandard = standardEvents.includes(eventName);
      if (isStandard) {
        (window as any).fbq('track', eventName, payload);
      } else {
        (window as any).fbq('trackCustom', eventName, payload);
      }
    }

    // B. Google Analytics Data Layer (GTM)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        eventModel: payload,
        ...payload
      });
    }

    // C. Google Ads Global Tag conversion / GA4 direct fire
    if (typeof window !== 'undefined' && (window as any).gtag) {
      if (settings.googleAdsConversionId) {
        (window as any).gtag('event', eventName, {
          send_to: settings.googleAdsConversionId,
          ...payload
        });
      }
      if (settings.ga4MeasurementId) {
        (window as any).gtag('event', eventName, {
          send_to: settings.ga4MeasurementId,
          ...payload
        });
      }
    }

    // D. Database server-side EventLog debug trace
    if (settings.enableEventLog) {
      try {
        await fetch('/api/tracking/event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            eventName,
            parameters: payload,
            sessionId: sessionIdRef.current,
            page: typeof window !== 'undefined' ? window.location.href : ''
          })
        });
      } catch (err) {
        // Fail silently on analytics endpoints to prevent breaking user experiences
        console.error('Error logging event to database:', err);
      }
    }
  };

  // 3. Inject TrackingHelper globally on window object so traditional JS scripts can use it
  useEffect(() => {
    if (typeof window !== 'undefined' && settings?.isEnabled) {
      (window as any).TrackingHelper = {
        isEnabled: true,
        fireEvent: (eventName: string, params?: Record<string, any>) => {
          fireEvent(eventName, params);
        }
      };
    }
  }, [settings]);

  // A pageview event on initial mount/navigation check
  useEffect(() => {
    if (settings?.isEnabled) {
      fireEvent('PageView', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }, [settings]);

  const value = { fireEvent };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}
