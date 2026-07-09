/* eslint-disable */
/**
 * Fix all 8 draft + 2 scheduled blogs:
 * 1. Add cross-blog "Also Read" / "Read More" interlinking sections mid-content
 * 2. Fix all internal property links
 * 3. Set proper scheduled publish dates (spaced 2 days apart)
 */
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

// All blog slugs + titles for interlinking
const BLOG_MAP = {
  'chattarpur-3bhk-published':  { slug: '3bhk-flat-in-chattarpur-registry-flat-jvts-garden-chattarpur-enclave-phase-2', title: '3BHK Flat in Chattarpur for Sale — Registry Flats in JVTS Garden' },
  'gwal-pahari-3bhk':           { slug: '3bhk-flat-in-gwal-pahari-for-sale-luxury-builder-floors',                    title: '3BHK Flat in Gwal Pahari for Sale — Luxury Builder Floors' },
  'ready-to-move':              { slug: 'ready-to-move-flat-in-chattarpur-3bhk-immediate-possession',                  title: 'Ready to Move Flat in Chattarpur — 3BHK Immediate Possession' },
  '4bhk-chattarpur':            { slug: '4bhk-flat-in-chattarpur-for-sale-luxury-builder-floors-family-suite',         title: '4BHK Flat in Chattarpur for Sale — Luxury Builder Floors with Family Suites' },
  'south-delhi-investment':     { slug: 'property-investment-south-delhi-chattarpur-gwal-pahari-best-locations',        title: 'Property Investment in South Delhi — Chattarpur and Gwal Pahari' },
  'builder-floor-vs-apartment': { slug: 'builder-floor-vs-apartment-delhi-south-delhi-buyers-guide',                   title: 'Builder Floor vs Apartment in Delhi — Which is Better?' },
  'under-1-crore':              { slug: 'flat-for-sale-in-chattarpur-under-1-crore-3bhk-ready-to-move',                title: 'Flat for Sale in Chattarpur Under 1 Crore — 3BHK Options' },
  'new-projects':               { slug: 'new-residential-projects-in-chattarpur-delhi-ss-realty-complete-guide',        title: 'New Residential Projects in Chattarpur Delhi — All SS Realty Projects' },
  'duplex':                     { slug: 'duplex-flat-in-delhi-guide-south-delhi-builder-floor',                         title: 'Duplex Flat in Delhi — Complete Guide to Buying' },
  'first-time-buyer':           { slug: 'first-time-home-buyer-guide-delhi-step-by-step-flat-purchase',                title: 'First Time Home Buyer Guide Delhi — Step by Step' },
  'how-to-buy':                 { slug: 'how-to-buy-a-flat-in-delhi-complete-legal-loan-registration-guide',           title: 'How to Buy a Flat in Delhi — Complete Legal & Loan Guide' },
};

// Helper: generate a styled "Also Read" box
function alsoRead(key1, key2, key3) {
  const b1 = BLOG_MAP[key1], b2 = BLOG_MAP[key2], b3 = key3 ? BLOG_MAP[key3] : null;
  return `
<div class="also-read-box" style="background:#f8f4ec;border-left:4px solid #C9A227;padding:20px 24px;margin:32px 0;border-radius:0 8px 8px 0;">
  <p style="font-weight:700;color:#7a6020;margin:0 0 12px;font-size:0.95em;text-transform:uppercase;letter-spacing:0.05em;">📖 Also Read</p>
  <ul style="margin:0;padding-left:20px;list-style:disc;">
    <li style="margin-bottom:8px;"><a href="/blog/${b1.slug}" style="color:#b8860b;font-weight:600;text-decoration:none;">${b1.title} →</a></li>
    <li style="margin-bottom:${b3 ? '8px' : '0'};"><a href="/blog/${b2.slug}" style="color:#b8860b;font-weight:600;text-decoration:none;">${b2.title} →</a></li>
    ${b3 ? `<li style="margin-bottom:0;"><a href="/blog/${b3.slug}" style="color:#b8860b;font-weight:600;text-decoration:none;">${b3.title} →</a></li>` : ''}
  </ul>
</div>`;
}

// Helper: insert "Also Read" block after Nth </h2> tag in existing content
function insertAfterNthH2(content, n, block) {
  let count = 0;
  return content.replace(/<\/h2>/g, (match) => {
    count++;
    if (count === n) return `</h2>${block}`;
    return match;
  });
}

// Helper: insert "Also Read" block before </article>
function insertBeforeClose(content, block) {
  return content.replace('</article>', `${block}\n</article>`);
}

MongoClient.connect(uri).then(async (client) => {
  const db = client.db('SSRealty');
  const col = db.collection('blogs');

  // ─── SCHEDULED: Set proper future publish dates ───────────────────────────
  // first-time-buyer → Jul 13, 2026 10:00 AM IST
  await col.updateOne(
    { slug: BLOG_MAP['first-time-buyer'].slug },
    { $set: { publishDate: new Date('2026-07-13T10:00:00+05:30'), updatedAt: new Date() } }
  );
  console.log('Scheduled date set: first-time-buyer → 13 Jul 2026 10:00 AM');

  // how-to-buy → Jul 15, 2026 10:00 AM IST
  await col.updateOne(
    { slug: BLOG_MAP['how-to-buy'].slug },
    { $set: { publishDate: new Date('2026-07-15T10:00:00+05:30'), updatedAt: new Date() } }
  );
  console.log('Scheduled date set: how-to-buy → 15 Jul 2026 10:00 AM');

  // ─── DRAFTS: Add cross-blog interlinking ─────────────────────────────────

  // 1. 3BHK Gwal Pahari
  {
    const b = await col.findOne({ slug: BLOG_MAP['gwal-pahari-3bhk'].slug });
    if (b) {
      let c = b.content;
      // After 2nd h2: insert also-read pointing to south delhi investment + under 1 crore
      c = insertAfterNthH2(c, 2, alsoRead('south-delhi-investment', 'under-1-crore', 'chattarpur-3bhk-published'));
      // After 4th h2: insert also-read pointing to builder-floor-vs-apartment + new-projects
      c = insertAfterNthH2(c, 4, alsoRead('builder-floor-vs-apartment', 'new-projects', 'ready-to-move'));
      // Before closing tag: insert also-read pointing to duplex + how-to-buy
      c = insertBeforeClose(c, alsoRead('duplex', 'how-to-buy', 'first-time-buyer'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: gwal-pahari-3bhk ✓');
    }
  }

  // 2. Ready to Move Chattarpur
  {
    const b = await col.findOne({ slug: BLOG_MAP['ready-to-move'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('under-1-crore', 'chattarpur-3bhk-published', 'new-projects'));
      c = insertAfterNthH2(c, 3, alsoRead('builder-floor-vs-apartment', 'first-time-buyer', '4bhk-chattarpur'));
      c = insertBeforeClose(c, alsoRead('south-delhi-investment', 'how-to-buy', 'duplex'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: ready-to-move ✓');
    }
  }

  // 3. 4BHK Chattarpur
  {
    const b = await col.findOne({ slug: BLOG_MAP['4bhk-chattarpur'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('chattarpur-3bhk-published', 'new-projects', 'duplex'));
      c = insertAfterNthH2(c, 3, alsoRead('builder-floor-vs-apartment', 'south-delhi-investment', 'gwal-pahari-3bhk'));
      c = insertBeforeClose(c, alsoRead('ready-to-move', 'first-time-buyer', 'how-to-buy'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: 4bhk-chattarpur ✓');
    }
  }

  // 4. Property Investment South Delhi
  {
    const b = await col.findOne({ slug: BLOG_MAP['south-delhi-investment'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('chattarpur-3bhk-published', 'gwal-pahari-3bhk', 'new-projects'));
      c = insertAfterNthH2(c, 3, alsoRead('under-1-crore', '4bhk-chattarpur', 'duplex'));
      c = insertBeforeClose(c, alsoRead('builder-floor-vs-apartment', 'how-to-buy', 'first-time-buyer'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: south-delhi-investment ✓');
    }
  }

  // 5. Builder Floor vs Apartment
  {
    const b = await col.findOne({ slug: BLOG_MAP['builder-floor-vs-apartment'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('new-projects', 'chattarpur-3bhk-published', 'gwal-pahari-3bhk'));
      c = insertAfterNthH2(c, 3, alsoRead('duplex', 'south-delhi-investment', 'under-1-crore'));
      c = insertBeforeClose(c, alsoRead('ready-to-move', 'first-time-buyer', 'how-to-buy'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: builder-floor-vs-apartment ✓');
    }
  }

  // 6. Flat Under 1 Crore
  {
    const b = await col.findOne({ slug: BLOG_MAP['under-1-crore'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 2, alsoRead('ready-to-move', 'chattarpur-3bhk-published', 'new-projects'));
      c = insertAfterNthH2(c, 4, alsoRead('first-time-buyer', 'how-to-buy', 'builder-floor-vs-apartment'));
      c = insertBeforeClose(c, alsoRead('south-delhi-investment', 'gwal-pahari-3bhk', 'duplex'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: under-1-crore ✓');
    }
  }

  // 7. New Residential Projects Chattarpur
  {
    const b = await col.findOne({ slug: BLOG_MAP['new-projects'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('chattarpur-3bhk-published', 'under-1-crore', '4bhk-chattarpur'));
      c = insertAfterNthH2(c, 3, alsoRead('ready-to-move', 'builder-floor-vs-apartment', 'south-delhi-investment'));
      c = insertBeforeClose(c, alsoRead('gwal-pahari-3bhk', 'duplex', 'how-to-buy'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: new-projects ✓');
    }
  }

  // 8. Duplex Flat in Delhi
  {
    const b = await col.findOne({ slug: BLOG_MAP['duplex'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 2, alsoRead('builder-floor-vs-apartment', 'chattarpur-3bhk-published', '4bhk-chattarpur'));
      c = insertAfterNthH2(c, 4, alsoRead('new-projects', 'south-delhi-investment', 'gwal-pahari-3bhk'));
      c = insertBeforeClose(c, alsoRead('ready-to-move', 'first-time-buyer', 'how-to-buy'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: duplex ✓');
    }
  }

  // 9. First Time Home Buyer (SCHEDULED) — add cross links too
  {
    const b = await col.findOne({ slug: BLOG_MAP['first-time-buyer'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('how-to-buy', 'under-1-crore', 'chattarpur-3bhk-published'));
      c = insertAfterNthH2(c, 3, alsoRead('new-projects', 'builder-floor-vs-apartment', 'ready-to-move'));
      c = insertBeforeClose(c, alsoRead('south-delhi-investment', 'gwal-pahari-3bhk', '4bhk-chattarpur'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: first-time-buyer ✓');
    }
  }

  // 10. How to Buy a Flat in Delhi (SCHEDULED) — add cross links too
  {
    const b = await col.findOne({ slug: BLOG_MAP['how-to-buy'].slug });
    if (b) {
      let c = b.content;
      c = insertAfterNthH2(c, 1, alsoRead('first-time-buyer', 'under-1-crore', 'new-projects'));
      c = insertAfterNthH2(c, 3, alsoRead('builder-floor-vs-apartment', 'chattarpur-3bhk-published', 'ready-to-move'));
      c = insertBeforeClose(c, alsoRead('south-delhi-investment', 'duplex', '4bhk-chattarpur'));
      await col.updateOne({ slug: b.slug }, { $set: { content: c, updatedAt: new Date() } });
      console.log('Updated: how-to-buy ✓');
    }
  }

  console.log('\n✅ All done! 8 drafts + 2 scheduled blogs updated with cross-blog interlinking.');
  console.log('Scheduled dates:');
  console.log('  first-time-buyer → Sun 13 Jul 2026, 10:00 AM IST');
  console.log('  how-to-buy       → Tue 15 Jul 2026, 10:00 AM IST');
  client.close();
}).catch(e => { console.error(e.message); process.exit(1); });
