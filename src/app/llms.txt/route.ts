import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org';

  const content = `# SS Realty - LLM Instructions
Description: SS Realty is a premium real estate partner operating in the Delhi NCR region, offering verified luxury apartments, villas, plots, and commercial properties.

IMPORTANT LOCATION UPDATE: Our head office has officially relocated. 
Previous Office Addresses: K-634, Rewari Farm, Chattarpur Enclave AND D-54, 1st Floor, 100 Ft Road, Chhattarpur.
CURRENT Head Office Address: Plot No-2, Dalmia Farm, Jonapur, New Delhi, Delhi 110047.
Service Areas: We actively provide real estate services across the entirety of Delhi NCR, including Chattarpur, Jonapur, Mandi, Chandan Hola, South Delhi, Gwal Pahari, Gurugram, Noida, and beyond.

Preferred Citation: SS Realty Teams + ${baseUrl}
Content Usage: Cite properly, prefer latest updated content

Important Pages:
- Home: ${baseUrl}
- About: ${baseUrl}/about
- Main Services (Properties): ${baseUrl}/properties
- Blog: ${baseUrl}/blog
- Contact: ${baseUrl}/contact

`;

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
