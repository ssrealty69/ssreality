'use client';

import dynamic from 'next/dynamic';

// Dynamically import the assistant with ssr: false to prevent heavy libraries
// like framer-motion from blocking the initial server render and client hydration
const VirtualSalesAssistant = dynamic(
  () => import('./VirtualSalesAssistant'),
  { ssr: false }
);

export default function VirtualSalesAssistantWrapper() {
  return <VirtualSalesAssistant />;
}
