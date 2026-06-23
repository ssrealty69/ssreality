const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Read ADMIN_SECRET from .env.local
let adminSecret = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const match = envContent.match(/^ADMIN_SECRET=(.+)$/m);
  if (match) adminSecret = match[1].trim();
} catch(e) {}

const content = `
<article>
<h2>Why Construction Quality Matters More Than You Think</h2>
<p>Buying a home is the biggest financial decision most families make in their lifetime. Yet, for <strong>90% of homebuyers in Delhi NCR</strong> — whether looking for a <a href="/properties">3 BHK flat in Gwal Pahari</a>, a builder floor in Gurgaon, or a registry flat in Chattarpur — construction quality remains a blind spot.</p>
<p>You check the location. You negotiate the price. You admire the interiors. But how do you know if the <em>bones</em> of the building are solid?</p>
<p>This guide gives you a <strong>practical, room-by-room inspection framework</strong> that even non-technical buyers can apply during a site visit. At SS Realty, every property we recommend has already passed our internal quality review — but knowing what to check yourself makes you a smarter, more confident buyer.</p>

<hr>

<h2>Step 1: Start Outside — Soil and Foundation Quality</h2>
<p>The strength of any building begins with what lies beneath it. When you visit a construction site or an under-construction project, observe the soil type and ask the builder for the <strong>soil test report</strong>.</p>
<ul>
  <li>✅ <strong>Recommended soils:</strong> Sandy loam, rock-based, laterite — these provide stable foundations.</li>
  <li>🚩 <strong>Avoid:</strong> Clay-rich soil and black cotton soil, which expand when wet and shrink when dry — causing structural instability over time.</li>
  <li>✅ Ask if the builder conducted a <strong>soil bearing capacity test (SBC)</strong> before starting construction.</li>
</ul>
<p><em>Pro Tip:</em> In areas like Gwal Pahari and Chattarpur — where terrain can vary significantly — soil quality directly affects the long-term durability of any property.</p>

<h2>Step 2: Check the Structural Design and Concrete Curing</h2>
<p>A strong structural design is the most critical aspect of construction quality. If you're not a civil engineer, hire one for Rs. 5,000–15,000 for a single inspection. This small cost can save crores on a bad purchase.</p>

<h3>What to Look For:</h3>
<ul>
  <li>Cracks in beams, columns, or slabs — especially diagonal or wide cracks (larger than 0.3mm)</li>
  <li>Check whether concrete curing was done properly — slabs and columns should be kept moist for <strong>7–14 days</strong> post-casting</li>
  <li>Inadequate curing leads to surface cracks, weakened strength, and premature water seepage</li>
  <li>Ask the builder: Was hessian cloth or water ponding used for curing?</li>
</ul>

<blockquote>
<strong>SS Realty Standard:</strong> Every <a href="/properties">property listed on SS Realty</a> is inspected for structural soundness before being added to our portfolio. We don't list what we wouldn't recommend to our own family.
</blockquote>

<h2>Step 3: The 5-Minute Wall Check Anyone Can Do</h2>
<p>This is the single most reliable on-site test for a non-technical buyer:</p>
<ol>
  <li><strong>Tap the wall</strong> with your knuckles in 3–4 spots across the room.
    <ul>
      <li>✅ <strong>Solid, dense sound</strong> = good brick/AAC block masonry</li>
      <li>🚩 <strong>Hollow, echoing sound</strong> = possible plywood infill or poor plastering</li>
    </ul>
  </li>
  <li><strong>Check wall thickness:</strong> It should match the building plan. A 9-inch (230mm) wall for external walls is standard in Delhi NCR construction.</li>
  <li><strong>Look for cracks:</strong> Hairline cracks (less than 0.1mm) can be normal during settling. But diagonal, wide, or L-shaped cracks near doors and windows are red flags.</li>
  <li><strong>Run your palm across the surface:</strong> Plaster should feel uniform, without bubbling, pitting, or lumps.</li>
</ol>

<h2>Step 4: Water Leakage and Waterproofing — The Hidden Cost Trap</h2>
<p>Water seepage is the #1 complaint among new homebuyers in Delhi NCR — especially during the monsoon season. Poor waterproofing is not just a cosmetic issue; it can corrode steel reinforcement inside the concrete, leading to structural failure over years.</p>

<h3>What to Check:</h3>
<ul>
  <li>🔍 <strong>Bottom of walls:</strong> Salt-like white deposits (efflorescence) or peeling paint = rising damp. This indicates the Damp Proof Course (DPC) layer may be missing or improperly installed.</li>
  <li>🔍 <strong>Bathroom ceiling and corners:</strong> Stains or discolouration = poor waterproofing of the slab above.</li>
  <li>🔍 <strong>Balcony floor joints:</strong> Cracks near the wall junction indicate improper waterproofing of the junction.</li>
  <li>✅ Ask the builder: What waterproofing system was used? (Bitumen membrane, SBR polymer coating, or crystalline waterproofing are good answers.)</li>
  <li>✅ Was a <strong>Damp Proof Course (DPC)</strong> installed between the plinth and wall masonry?</li>
</ul>

<h2>Step 5: MEP Quality — The Invisible Backbone of Your Home</h2>
<p>MEP stands for <strong>Mechanical, Electrical, and Plumbing</strong> — the systems you cannot see once the walls are plastered but pay for daily through electricity bills, maintenance, and repair costs.</p>

<h3>Electrical Quality Check:</h3>
<ul>
  <li>✅ Wires should be <strong>ISI-marked</strong> from reputed brands (Finolex, Polycab, Havells)</li>
  <li>✅ Carry a phone charger during your visit — test every socket</li>
  <li>✅ Modular switches (Legrand, Schneider, Anchor Roma) indicate quality choice</li>
  <li>✅ MCB (Miniature Circuit Breaker) panel should be labeled, well-organized, and safely mounted</li>
  <li>🚩 Open wiring, wire ends without PVC conduit casing, or unlabeled breaker panels are red flags</li>
</ul>

<h3>Plumbing Quality Check:</h3>
<ul>
  <li>✅ <strong>UPVC or CPVC pipes</strong> are preferred — they are corrosion-resistant and long-lasting. GI (galvanised iron) pipes tend to rust within 5–7 years.</li>
  <li>✅ Turn on all taps simultaneously and note the pressure. In multi-floor buildings, water pressure on higher floors can be an issue — ask about the booster pump.</li>
  <li>✅ Flush the toilet 2–3 times and observe the drainage speed. Slow drainage = poor slope in pipes.</li>
  <li>🚩 Patches near pipe joints or under the sink indicate prior leakage repairs.</li>
</ul>

<h2>Step 6: Fire Safety Elements to Verify</h2>
<p>For <strong>high-rise residential apartments</strong> in Delhi NCR (above G+3 floors), fire safety is a legal requirement — not optional.</p>
<ul>
  <li>✅ <strong>Fire exits:</strong> Clear, unobstructed, and marked on every floor</li>
  <li>✅ <strong>Fire extinguishers and hydrant systems:</strong> At key locations on each floor</li>
  <li>✅ <strong>Smoke detectors:</strong> In common areas, especially near lift lobbies and staircases</li>
  <li>✅ For buildings above 15 metres, a <strong>Fire NOC from the Delhi/Haryana Fire Department</strong> is mandatory before occupancy</li>
  <li>✅ Dedicated fire-fighting water storage tank (separate from domestic supply)</li>
</ul>

<h2>Step 7: Sanitary Fittings and Tiles — The Showroom Test</h2>
<ul>
  <li>Tap toilet seats, wash basins, and sanitary ceramics gently — a clear sound indicates quality ceramic without cracks. A hoarse/dull sound indicates internal cracks.</li>
  <li>Check tiles for uniform size, straight edges, and consistent colour — inconsistency suggests different production batches.</li>
  <li>Press down on bathroom tiles near joints — loose or bouncy tiles indicate poor adhesive or thin-bed application.</li>
  <li>✅ <strong>Anti-skid tiles in bathrooms</strong> are mandatory for safety — check for this specification.</li>
</ul>

<h2>Step 8: Doors, Windows and Frames</h2>
<ul>
  <li>Open and close every door 3–4 times. It should swing smoothly without friction, misalignment, or noise.</li>
  <li>Check gaps between frame and wall — gaps larger than 3mm indicate poor frame installation.</li>
  <li>Windows should lock securely, with rubber gaskets for weather-sealing.</li>
  <li>✅ UPVC window frames are preferred over wood in Delhi NCR due to humidity and termite risk.</li>
  <li>Press the door panel — a solid, heavy sound indicates solid-core wood. A light, hollow sound = hollow-core (cheaper, less durable).</li>
</ul>

<h2>Step 9: Terrace and Common Area Quality</h2>
<ul>
  <li>Walk the terrace after rain or check for water pooling — terraces must slope towards drainage points.</li>
  <li>Check parapet wall stability — should not wobble or show cracks.</li>
  <li>Staircase: check riser height uniformity (standard = 150–175mm), railing strength, and finishing quality.</li>
  <li>Lobby, corridor, and common area finishing reflects the builder's overall quality commitment.</li>
</ul>

<h2>Construction Quality Checklist for Homebuyers</h2>
<table border="1" style="width:100%;border-collapse:collapse;">
  <thead>
    <tr style="background:#C9A227;color:#1A1800;">
      <th style="padding:8px;">#</th>
      <th style="padding:8px;">Inspection Point</th>
      <th style="padding:8px;">What to Check</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px;">1</td><td style="padding:8px;">Soil type</td><td style="padding:8px;">Ask for soil test report; avoid clay/black cotton soil</td></tr>
    <tr><td style="padding:8px;">2</td><td style="padding:8px;">Wall thickness and quality</td><td style="padding:8px;">Tap for hollowness; check for cracks; verify with plan</td></tr>
    <tr><td style="padding:8px;">3</td><td style="padding:8px;">Concrete strength</td><td style="padding:8px;">No visible cracking; ask about curing practices</td></tr>
    <tr><td style="padding:8px;">4</td><td style="padding:8px;">Electrical safety</td><td style="padding:8px;">ISI-marked wires, branded switches, MCB panel, earthing</td></tr>
    <tr><td style="padding:8px;">5</td><td style="padding:8px;">Water pressure and plumbing</td><td style="padding:8px;">Test all taps; check drainage; confirm UPVC pipes</td></tr>
    <tr><td style="padding:8px;">6</td><td style="padding:8px;">Waterproofing</td><td style="padding:8px;">No damp patches, no efflorescence; ask about DPC</td></tr>
    <tr><td style="padding:8px;">7</td><td style="padding:8px;">Bathroom tiles</td><td style="padding:8px;">Anti-skid; evenly laid; no loose tiles</td></tr>
    <tr><td style="padding:8px;">8</td><td style="padding:8px;">Doors and windows</td><td style="padding:8px;">Smooth operation; no gaps; UPVC preferred</td></tr>
    <tr><td style="padding:8px;">9</td><td style="padding:8px;">Fire safety</td><td style="padding:8px;">Fire exits, alarms, extinguishers (especially high-rises)</td></tr>
    <tr><td style="padding:8px;">10</td><td style="padding:8px;">Lift and common areas</td><td style="padding:8px;">Reputed brand lift; generator backup; clean finish</td></tr>
  </tbody>
</table>

<h2>Why SS Realty is the Safest Choice for Property Buyers in Delhi NCR</h2>
<p>At <strong>SS Realty</strong>, we do not just list properties — we <em>evaluate</em> them. Here is what sets us apart when it comes to construction quality assurance:</p>
<ul>
  <li>🏗️ <strong>Pre-listing physical inspection:</strong> Every property in our portfolio — from <a href="/properties">3 BHK flats in Gwal Pahari</a> to builder floors in Gurgaon — undergoes a preliminary quality check before we recommend it.</li>
  <li>📋 <strong>Branded materials only:</strong> We only work with builders who use ISI-marked materials — Polycab/Finolex wiring, UPVC plumbing, ISI cement, and TMT steel from reputed manufacturers.</li>
  <li>🔍 <strong>Transparent documentation:</strong> We help buyers access layout approvals, soil test reports, building plan sanctions, and completion certificates before the transaction.</li>
  <li>👷 <strong>Third-party inspection facilitation:</strong> SS Realty can coordinate with empanelled structural engineers for an independent inspection of any property before you sign.</li>
  <li>📞 <strong>Post-purchase support:</strong> Our relationship does not end at handover. We are here if you discover issues post-possession.</li>
  <li>📍 <strong>Local expertise:</strong> 15+ years operating in Chattarpur, Gwal Pahari, Jonapur, Mandi, Chandan Hola, and Gurgaon — we know which micro-markets have quality builder supply chains and which do not.</li>
</ul>

<blockquote>
SS Realty's Promise: We recommend only those properties in which we would invest our own savings. Our reputation is built on trust, and trust is built on quality. — SS Realty Team, Jonapur, New Delhi
</blockquote>

<h2>The Expert's Pro Tip: Visit an Old Project First</h2>
<p>Before committing to any new property — whether a <strong>3 BHK flat in Chattarpur</strong>, a builder floor in Gurgaon, or a plot in Gwal Pahari — visit the builder's 5–10 year old completed project. Ask the residents:</p>
<ul>
  <li>Does seepage or leakage occur during monsoon?</li>
  <li>Have structural cracks appeared in walls or slabs?</li>
  <li>How often does the lift break down?</li>
  <li>Did the builder provide support after possession?</li>
</ul>
<p>Existing residents give you ground-truth information that no brochure can provide. SS Realty encourages every buyer to do this due diligence — and we can help arrange introductions to residents in any project we recommend. <a href="/contact-us">Contact us to schedule a guided site visit.</a></p>

<h2>Frequently Asked Questions (FAQs)</h2>

<h3>Can I check construction quality without an inspector?</h3>
<p>Yes — using the checklist in this guide, you can visually assess walls, plumbing, electrical, waterproofing, and more. However, for large investments (above Rs. 50 lakh), hiring a structural engineer for Rs. 5,000–15,000 is always recommended.</p>

<h3>What are the warning signs of poor waterproofing in a new home?</h3>
<p>Look for salt deposits (efflorescence) near floor edges, peeling paint near bathrooms, or damp patches at the base of external walls. These signal missing or failed DPC layers.</p>

<h3>How do I verify the electrical safety of a house?</h3>
<p>Carry a phone charger and test every socket. Check for ISI-marked wiring, branded switchgear, a labelled MCB panel, and ask the builder if proper earthing is provided.</p>

<h3>What pipe materials should I look for in new construction?</h3>
<p>UPVC or CPVC pipes are preferred — they do not rust or corrode. Avoid GI (galvanised iron) pipes, which degrade within 5–7 years in Delhi NCR's water conditions.</p>

<h3>How can SS Realty help me check construction quality?</h3>
<p>SS Realty conducts pre-listing property inspections and can connect buyers with empanelled structural engineers. All properties on our platform — including <a href="/properties">3 BHK flats in Gwal Pahari and Chattarpur</a> — meet our internal quality standards. <a href="/contact-us">Contact our team</a> to schedule a site visit with a quality checklist walkthrough.</p>

<h3>What is the standard curing period for concrete?</h3>
<p>Concrete should be kept moist for a minimum of 7 days and up to 14 days for high-performance mixes. Poor curing is one of the leading causes of premature cracking and structural weakness in Indian residential construction.</p>
</article>
`;

const blogData = {
  title: "New Property, Flat ya Apartment Lete Samay Kya Check Karein? Complete Construction Quality Guide 2025",
  slug: "construction-quality-check-buying-flat-apartment-property-delhi-ncr",
  excerpt: "Ghar kharidna ek badi zimmedari hai. 3 BHK flat in Gwal Pahari, Chattarpur ya Gurgaon lete samay construction quality kaise check karein — walls, plumbing, waterproofing, electrical sab detail mein. SS Realty ka expert guide with 10-point checklist.",
  content: content,
  coverImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  category: "Buying Guide",
  tags: [
    "construction quality", "3 BHK flat Gwal Pahari", "buy flat Chattarpur",
    "property inspection checklist", "builder floor Gurgaon", "home buying tips Delhi NCR",
    "waterproofing check", "flat buying guide", "SS Realty", "3 BHK Gurgaon",
    "registry flat Chattarpur", "new property check", "home inspection India"
  ],
  status: "published",
  published: true,
  authorName: "SS Realty Expert",
  publishDate: new Date().toISOString(),
  seo: {
    title: "New Flat ya Property Lete Samay Construction Quality Kaise Check Karein? | SS Realty Guide 2025",
    description: "3 BHK flat in Gwal Pahari, Chattarpur ya Gurgaon kharidne se pehle construction quality check karna kyun zaruri hai. SS Realty ka 10-point inspection checklist — walls, plumbing, waterproofing, electrical sab kuch detail mein.",
    keywords: "construction quality check, 3 bhk flat gwal pahari, buy flat chattarpur, property inspection checklist, builder floor gurgaon, home buying tips delhi ncr, new flat inspection, waterproofing check, 3 bhk gurgaon, registry flat chattarpur, how to check construction quality, property buying guide india, SS Realty",
    focusKeyword: "construction quality check flat apartment property Delhi NCR",
    canonicalUrl: "https://ssrealty.org/blog/construction-quality-check-buying-flat-apartment-property-delhi-ncr"
  }
};

const postData = JSON.stringify(blogData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/blogs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-admin-secret': adminSecret
  }
};

console.log('Posting blog to SS Realty API...');
console.log('Admin secret found:', !!adminSecret);

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ Blog created successfully!');
        console.log('Blog ID:', parsed.data._id);
        console.log('Slug:', parsed.data.slug);
        console.log('Live at: http://localhost:3000/blog/' + parsed.data.slug);
      } else {
        console.log('❌ Failed:', parsed.error);
        console.log('Full response:', data);
      }
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(postData);
req.end();
