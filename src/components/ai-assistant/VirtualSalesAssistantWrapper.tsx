'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import the assistant with ssr: false
const VirtualSalesAssistant = dynamic(
  () => import('./VirtualSalesAssistant'),
  { ssr: false }
);

export default function VirtualSalesAssistantWrapper() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Render immediately if on a large screen or after interaction
    const handleInteraction = () => setShouldRender(true);
    
    // Fallback: render after 5 seconds anyway
    const timer = setTimeout(() => setShouldRender(true), 5000);

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    window.addEventListener('mousemove', handleInteraction, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
    };
  }, []);

  if (!shouldRender) return null;

  return <VirtualSalesAssistant />;
}
