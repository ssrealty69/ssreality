'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';


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
  const pathname = usePathname();
  const entryTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>('');

  // Keep a ref to settings so event handlers always read the latest value
  // without needing to be re-created (avoids stale closures)
  const settingsRef = useRef<TrackingSettingsData | null>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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

  // 2. Core tracking function — stable reference via useCallback + settingsRef
  const fireEvent = useCallback(async (eventName: string, params: Record<string, any> = {}) => {
    const currentSettings = settingsRef.current;
    if (!currentSettings || !currentSettings.isEnabled) return;

    const payload = {
      ...params,
      platform: 'web',
      timestamp: new Date().toISOString()
    };

    // A. Meta (Facebook) Pixel Event
    if (typeof window !== 'undefined' && (window as any).fbq && currentSettings.metaPixelId) {
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
      if (currentSettings.googleAdsConversionId) {
        (window as any).gtag('event', eventName, {
          send_to: currentSettings.googleAdsConversionId,
          ...payload
        });
      }
      if (currentSettings.ga4MeasurementId) {
        (window as any).gtag('event', eventName, {
          send_to: currentSettings.ga4MeasurementId,
          ...payload
        });
      }
    }

    // D. Database server-side EventLog debug trace — only when explicitly enabled
    // PageLeave is skipped here: GA/Pixel already capture it, and each DB-logged event is a serverless invocation.
    if (currentSettings.enableEventLog && eventName !== 'PageLeave') {
      const url = '/api/tracking/event';
      const bodyStr = JSON.stringify({
        eventName,
        parameters: payload,
        sessionId: sessionIdRef.current,
        page: typeof window !== 'undefined' ? window.location.href : ''
      });

      let sent = false;
      if (typeof window !== 'undefined' && window.navigator?.sendBeacon) {
        try {
          const blob = new Blob([bodyStr], { type: 'application/json' });
          sent = window.navigator.sendBeacon(url, blob);
        } catch {
          // Fallback to fetch on failure
        }
      }

      if (!sent) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: true
          });
        } catch {
          // Fail silently — analytics errors must never break user experience
        }
      }
    }
  }, []); // stable — reads settings via settingsRef

  // 3. Inject TrackingHelper globally on window object
  useEffect(() => {
    if (typeof window !== 'undefined' && settings?.isEnabled) {
      (window as any).TrackingHelper = {
        isEnabled: true,
        fireEvent: (eventName: string, params?: Record<string, any>) => {
          fireEvent(eventName, params);
        }
      };
    }
  }, [settings, fireEvent]);

  // 4. Track Route Navigation & Stay Duration
  useEffect(() => {
    if (!settings || !settings.isEnabled) return;

    const currentTime = Date.now();
    const currentPath = pathname || '/';

    // Log PageLeave event for previous page if we have one
    if (lastPathRef.current && lastPathRef.current !== currentPath) {
      const stayDurationMs = currentTime - entryTimeRef.current;
      const stayDurationSeconds = Math.round(stayDurationMs / 1000);

      if (stayDurationSeconds > 0 && stayDurationSeconds < 43200) {
        fireEvent('PageLeave', {
          page_path: lastPathRef.current,
          duration_seconds: stayDurationSeconds,
        });
      }
    }

    // Track PageView for the new page
    fireEvent('PageView', {
      page_title: typeof document !== 'undefined' ? document.title : 'SS Realty',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: currentPath,
    });

    lastPathRef.current = currentPath;
    entryTimeRef.current = currentTime;
  }, [pathname, settings?.isEnabled, fireEvent]);

  // 5. Track Stay Duration when leaving the tab or closing the page
  //    Use fireEventRef so the handler always calls the latest fireEvent
  //    without needing to re-register the event listener on every render
  const fireEventRef = useRef(fireEvent);
  useEffect(() => {
    fireEventRef.current = fireEvent;
  }, [fireEvent]);

  useEffect(() => {
    const handleExit = () => {
      if (document.visibilityState === 'hidden' && lastPathRef.current) {
        const stayDurationMs = Date.now() - entryTimeRef.current;
        const stayDurationSeconds = Math.round(stayDurationMs / 1000);

        if (stayDurationSeconds > 0 && stayDurationSeconds < 43200) {
          fireEventRef.current('PageLeave', {
            page_path: lastPathRef.current,
            duration_seconds: stayDurationSeconds,
          });
        }
      }
    };

    window.addEventListener('visibilitychange', handleExit);

    return () => {
      window.removeEventListener('visibilitychange', handleExit);
    };
  }, []); // intentionally [] — handlers use refs to stay fresh

  const value = { fireEvent };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}
