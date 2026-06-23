$baseUrl = "http://localhost:3000"
$adminSecret = $env:ADMIN_SECRET

if (-not $adminSecret) {
  # Try reading from .env.local
  $envFile = Join-Path $PSScriptRoot ".." ".env.local"
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^ADMIN_SECRET=(.+)$') { $adminSecret = $matches[1] }
    }
  }
}

$content = @'
<article>
<h2>Why Construction Quality Matters More Than You Think</h2>
<p>Buying a home is the biggest financial decision most families make in their lifetime. Yet, for <strong>90% of homebuyers in Delhi NCR</strong> — whether looking for a <a href="https://ssrealty.org/properties">3 BHK flat in Gwal Pahari</a>, a builder floor in Gurgaon, or a registry flat in Chattarpur — construction quality remains a blind spot.</p>
<p>You check the location. You negotiate the price. You admire the interiors. But how do you know if the <em>bones</em> of the building are solid?</p>
<p>This guide gives you a <strong>practical, room-by-room inspection framework</strong> that even non-technical buyers can apply during a site visit. At SS Realty, every property we recommend has already passed our internal quality review — but knowing what to check yourself makes you a smarter, more confident buyer.</p>

<hr>

<h2>Step 1: Start Outside — Soil &amp; Foundation Quality</h2>
<p>The strength of any building begins with what lies beneath it. When you visit a construction site or an under-construction project, observe the soil type and ask the builder for the <strong>soil test report</strong>.</p>
<ul>
  <li>✅ <strong>Recommended soils:</strong> Sandy loam, rock-based, laterite — these provide stable foundations.</li>
  <li>🚩 <strong>Avoid:</strong> Clay-rich soil and black cotton soil, which expand when wet and shrink when dry — causing structural instability over time.</li>
  <li>✅ Ask if the builder conducted a <strong>soil bearing capacity test (SBC)</strong> before starting construction.</li>
</ul>
<p><em>Pro Tip:</em> In areas like Gwal Pahari and Chattarpur — where terrain can vary significantly — soil quality directly affects the long-term durability of any property.</p>

<h2>Step 2: Check the Structural Design &amp; Concrete Curing</h2>
<p>A strong structural design is the most critical aspect of construction quality. If you're not a civil engineer, hire one for ₹5,000–₹15,000 for a single inspection. This small cost can save crores on a bad purchase.</p>

<h3>What to Look For:</h3>
<ul>
  <li>Cracks in beams, columns, or slabs — especially diagonal or wide cracks (larger than 0.3mm)</li>
  <li>Check whether concrete curing was done properly — slabs and columns should be kept moist for <strong>7–14 days</strong> post-casting</li>
  <li>Inadequate curing leads to surface cracks, weakened strength, and premature water seepage</li>
  <li>Ask the builder: Was hessian cloth or water ponding used for curing?</li>
</ul>

<blockquote>
<strong>SS Realty Standard:</strong> Every <a href="https://ssrealty.org/properties">property listed on SS Realty</a> is inspected for structural soundness before being added to our portfolio. We don't list what we wouldn't recommend to our own family.
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

<h2>Step 4: Water Leakage &amp; Waterproofing — The Hidden Cost Trap</h2>
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
<p>MEP stands for <strong>Mechanical, Electrical, and Plumbing</strong> — the systems you can't see once the walls are plastered but pay for daily through electricity bills, maintenance, and repair costs.</p>

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

<h3>Mechanical (Ventilation) Check:</h3>
<ul>
  <li>✅ Bathrooms and kitchens should have exhaust fan provision or ventilation shafts</li>
  <li>✅ If central/ductable AC is promised, inspect duct routing during construction</li>
</ul>

<h2>Step 6: Fire Safety Elements to Verify</h2>
<p>For <strong>high-rise residential apartments</strong> in Delhi NCR (above G+3 floors), fire safety is a legal requirement — not optional.</p>
<ul>
  <li>✅ <strong>Fire exits:</strong> Clear, unobstructed, and marked on every floor</li>
  <li>✅ <strong>Fire extinguishers + hydrant systems:</strong> At key locations on each floor</li>
  <li>✅ <strong>Smoke detectors:</strong> In common areas, especially near lift lobbies and staircases</li>
  <li>✅ For buildings above 15 metres, a <strong>Fire NOC from the Delhi/Haryana Fire Department</strong> is mandatory before occupancy</li>
  <li>✅ Dedicated fire-fighting water storage tank (separate from domestic supply)</li>
</ul>

<h2>Step 7: Sanitary Fittings &amp; Tiles — The Showroom Test</h2>
<ul>
  <li>Tap toilet seats, wash basins, and sanitary ceramics gently — a clear sound indicates quality ceramic without cracks. A hoarse/dull sound indicates internal cracks.</li>
  <li>Check tiles for uniform size, straight edges, and consistent colour — inconsistency suggests different production batches.</li>
  <li>Press down on bathroom tiles near joints — loose or "bouncy" tiles indicate poor adhesive or thin-bed application.</li>
  <li>✅ <strong>Anti-skid tiles in bathrooms</strong> are mandatory for safety — check for this specification.</li>
</ul>

<h2>Step 8: Doors, Windows &amp; Frames</h2>
<ul>
  <li>Open and close every door 3–4 times. It should swing smoothly without friction, misalignment, or noise.</li>
  <li>Check gaps between frame and wall — gaps larger than 3mm indicate poor frame installation.</li>
  <li>Windows should lock securely, with rubber gaskets for weather-sealing.</li>
  <li>✅ UPVC window frames are preferred over wood in Delhi NCR due to humidity and termite risk.</li>
  <li>Press the door panel — a solid, heavy sound indicates solid-core wood. A light, hollow sound = hollow-core (cheaper, less durable).</li>
</ul>

<h2>Step 9: Terrace &amp; Common Area Quality</h2>
<ul>
  <li>Walk the terrace after rain or check for water pooling — terraces must slope towards drainage points.</li>
  <li>Check parapet wall stability — should not wobble or show cracks.</li>
  <li>Staircase: check riser height uniformity (standard = 150–175mm), railing strength, and finishing quality.</li>
  <li>Lobby, corridor, and common area finishing reflects the builder's overall quality commitment.</li>
</ul>

<h2>Construction Quality Checklist for Homebuyers</h2>
<table>
  <thead>
    <tr><th>#</th><th>Inspection Point</th><th>What to Check</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Soil type</td><td>Ask for soil test report; avoid clay/black cotton soil</td></tr>
    <tr><td>2</td><td>Wall thickness &amp; quality</td><td>Tap for hollowness; check for cracks; verify with plan</td></tr>
    <tr><td>3</td><td>Concrete strength</td><td>No visible cracking; ask about curing practices</td></tr>
    <tr><td>4</td><td>Electrical safety</td><td>ISI-marked wires, branded switches, MCB panel, earthing</td></tr>
    <tr><td>5</td><td>Water pressure &amp; plumbing</td><td>Test all taps; check drainage; confirm UPVC pipes</td></tr>
    <tr><td>6</td><td>Waterproofing</td><td>No damp patches, no efflorescence; ask about DPC</td></tr>
    <tr><td>7</td><td>Bathroom tiles</td><td>Anti-skid; evenly laid; no loose tiles</td></tr>
    <tr><td>8</td><td>Doors &amp; windows</td><td>Smooth operation; no gaps; UPVC preferred</td></tr>
    <tr><td>9</td><td>Fire safety</td><td>Fire exits, alarms, extinguishers (especially high-rises)</td></tr>
    <tr><td>10</td><td>Lift &amp; common areas</td><td>Reputed brand lift; generator backup; clean finish</td></tr>
  </tbody>
</table>

<h2>Certifications That Indicate Quality</h2>
<ul>
  <li><strong>ISI mark</strong> (Bureau of Indian Standards): Look for it on cement bags, wires, tiles, pipes</li>
  <li><strong>IS 456 compliance</strong> for concrete structures</li>
  <li><strong>IS 2062</strong> for structural steel</li>
  <li><strong>ISO 9001:2015 certified builders</strong> are more likely to follow standardised quality control processes</li>
  <li>Ask the builder for a structural engineer's compliance report or third-party inspection certificate</li>
</ul>

<h2>Why SS Realty is the Safest Choice for Property Buyers in Delhi NCR</h2>
<p>At <strong>SS Realty</strong>, we don't just list properties — we <em>evaluate</em> them. Here's what sets us apart when it comes to construction quality assurance:</p>

<ul>
  <li>🏗️ <strong>Pre-listing physical inspection:</strong> Every property in our portfolio — from <a href="https://ssrealty.org/properties">3 BHK flats in Gwal Pahari</a> to builder floors in Gurgaon — undergoes a preliminary quality check before we recommend it.</li>
  <li>📋 <strong>Branded materials only:</strong> We only work with builders who use ISI-marked materials — Polycab/Finolex wiring, UPVC plumbing, ISI cement, and TMT steel from reputed manufacturers.</li>
  <li>🔍 <strong>Transparent documentation:</strong> We help buyers access layout approvals, soil test reports, building plan sanctions, and building completion certificates before the transaction.</li>
  <li>👷 <strong>Third-party inspection facilitation:</strong> SS Realty can coordinate with empanelled structural engineers for an independent inspection of any property before you sign.</li>
  <li>📞 <strong>Post-purchase support:</strong> Our relationship doesn't end at handover. We're here if you discover issues post-possession.</li>
  <li>📍 <strong>Local expertise:</strong> 15+ years operating in Chattarpur, Gwal Pahari, Jonapur, Mandi, Chandan Hola, and Gurgaon means we know which micro-markets have quality builder supply chains — and which don't.</li>
</ul>

<blockquote>
<strong>SS Realty's Promise:</strong> We recommend only those properties in which we would invest our own savings. Our reputation is built on trust, and trust is built on quality.
— <em>SS Realty Team, Jonapur, New Delhi</em>
</blockquote>

<h2>⭐ The Expert's Pro Tip: Visit an Old Project First</h2>
<p>Before committing to any new property — whether a <strong>3 BHK flat in Chattarpur</strong>, a builder floor in Gurgaon, or a plot in Gwal Pahari — visit the builder's 5–10 year old completed project.</p>
<p>Ask the residents:</p>
<ul>
  <li>Does seepage or leakage occur during monsoon?</li>
  <li>Have structural cracks appeared in walls or slabs?</li>
  <li>How often does the lift break down?</li>
  <li>Did the builder provide support after possession?</li>
</ul>
<p>Existing residents give you ground-truth information that no brochure or online review can provide. This 30-minute exercise can save you from a 30-year mistake.</p>
<p><strong>SS Realty</strong> encourages every buyer to do this due diligence — and we'll help arrange introductions to residents in any project we recommend.</p>

<h2>Frequently Asked Questions (FAQs)</h2>

<h3>Can I check construction quality without an inspector?</h3>
<p>Yes — using the checklist in this guide, you can visually assess walls, plumbing, electrical, waterproofing, and more. However, for large investments (above ₹50 lakh), hiring a structural engineer for ₹5,000–₹15,000 is always recommended.</p>

<h3>What are the warning signs of poor waterproofing in a new home?</h3>
<p>Look for salt deposits (efflorescence) near floor edges, peeling paint near bathrooms, or damp patches at the base of external walls. These signal missing or failed DPC layers.</p>

<h3>How do I verify the electrical safety of a house?</h3>
<p>Carry a phone charger and test every socket. Check for ISI-marked wiring, branded switchgear, a labelled MCB panel, and ask the builder if proper earthing is provided.</p>

<h3>What pipe materials should I look for in new construction?</h3>
<p>UPVC or CPVC pipes are preferred — they don't rust or corrode. Avoid GI (galvanised iron) pipes, which degrade within 5–7 years in Delhi NCR's water conditions.</p>

<h3>How can SS Realty help me check construction quality?</h3>
<p>SS Realty conducts pre-listing property inspections and can connect buyers with empanelled structural engineers. All properties on our platform — including <a href="https://ssrealty.org/properties">3 BHK flats in Gwal Pahari and Chattarpur</a> — meet our internal quality standards. <a href="https://ssrealty.org/contact-us">Contact our team</a> to schedule a site visit with a quality checklist walkthrough.</p>

<h3>What is the role of RERA in construction quality?</h3>
<p>Section 14 of the RERA Act makes it mandatory for builders to rectify structural defects within 5 years of possession — but only for projects registered under RERA. Always verify whether a project is RERA registered on your state's RERA portal before purchase.</p>

<h3>How long should concrete be cured for?</h3>
<p>Concrete should be kept moist for a minimum of 7 days (ordinary Portland cement) and up to 14 days for high-performance mixes. Poor curing is one of the leading causes of premature cracking and structural weakness in Indian residential construction.</p>
</article>
'@

$body = @{
  title = "New Property, Flat ya Apartment Lete Samay Kya Check Karein? | Complete Construction Quality Guide 2025"
  slug = "construction-quality-check-buying-flat-apartment-property-delhi-ncr"
  excerpt = "Ghar kharidna ek badi zimmedari hai. Jante hain ki 3 BHK flat in Gwal Pahari, Chattarpur ya Gurgaon lete samay construction quality kaise check karein — walls, plumbing, waterproofing, electrical sab. SS Realty ka expert guide."
  content = $content
  coverImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
  category = "Buying Guide"
  tags = @(
    "construction quality", "3 BHK flat Gwal Pahari", "buy flat Chattarpur",
    "property inspection checklist", "builder floor Gurgaon", "home buying tips Delhi NCR",
    "waterproofing check", "flat buying guide", "SS Realty", "3 BHK Gurgaon",
    "registry flat Chattarpur", "new property check", "home inspection India"
  )
  status = "published"
  published = $true
  authorName = "SS Realty Expert"
  publishDate = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
  seo = @{
    title = "New Flat ya Property Lete Samay Construction Quality Kaise Check Karein? | SS Realty Guide 2025"
    description = "3 BHK flat in Gwal Pahari, Chattarpur ya Gurgaon kharidne se pehle construction quality check karna kyun zaruri hai. SS Realty ka 10-point inspection checklist — walls, plumbing, waterproofing, electrical sab kuch detail mein."
    keywords = "construction quality check, 3 bhk flat gwal pahari, buy flat chattarpur, property inspection checklist, builder floor gurgaon, home buying tips delhi ncr, new flat inspection, waterproofing check, 3 bhk gurgaon, registry flat chattarpur, how to check construction quality, property buying guide india"
    focusKeyword = "construction quality check flat apartment"
    canonicalUrl = "https://ssrealty.org/blog/construction-quality-check-buying-flat-apartment-property-delhi-ncr"
  }
} | ConvertTo-Json -Depth 10

Write-Host "Posting blog article to SS Realty API..."
$headers = @{
  "Content-Type" = "application/json"
  "x-admin-secret" = $adminSecret
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/blogs" -Method POST -Body $body -Headers $headers
  if ($response.success) {
    Write-Host "✅ Blog created successfully!"
    Write-Host "Blog ID: $($response.data._id)"
    Write-Host "Slug: $($response.data.slug)"
    Write-Host "Live at: https://ssrealty.org/blog/$($response.data.slug)"
  } else {
    Write-Host "❌ Failed: $($response.error)"
  }
} catch {
  Write-Host "❌ Error: $_"
}
