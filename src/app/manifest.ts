import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SS Realty — Luxury Properties in Delhi NCR',
    short_name: 'SS Realty',
    description: 'Find premium flats, builder floors, villas and plots in Chattarpur, Gwal Pahari, Mandi Road and Delhi NCR. Direct from self-build developer since 2008.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFEF5',
    theme_color: '#1A1800',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['real estate', 'lifestyle', 'business'],
    lang: 'en-IN',
  };
}
