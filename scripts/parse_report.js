const fs = require('fs');
const path = require('path');

const reportPath = 'C:\\Users\\Pawan\\.gemini\\antigravity-ide\\brain\\98e50f54-73fa-40c3-bde4-fcfbe1cb1b1f\\lighthouse_mobile_report_optimized.html';

if (!fs.existsSync(reportPath)) {
  console.error('Report file not found:', reportPath);
  process.exit(1);
}

const html = fs.readFileSync(reportPath, 'utf8');

// Find window.__LIGHTHOUSE_JSON__
const match = html.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*({[\s\S]*?});/);
if (!match) {
  // Try newer lighthouse structure where data is in <script class="lh-inline-json">
  const inlineMatch = html.match(/<script[^>]*class=["']lh-inline-json["'][^>]*>([\s\S]*?)<\/script>/);
  if (inlineMatch) {
    parseJson(inlineMatch[1]);
  } else {
    // Try search for any JSON resembling LH JSON
    const scriptJsonMatch = html.match(/__LIGHTHOUSE_JSON__\s*=\s*({[\s\S]*?});/);
    if (scriptJsonMatch) {
      parseJson(scriptJsonMatch[1]);
    } else {
      console.error('Could not find Lighthouse JSON in HTML');
      process.exit(1);
    }
  }
} else {
  parseJson(match[1]);
}

function parseJson(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    const audits = data.audits || {};
    
    console.log('=== LIGHTHOUSE PERFORMANCE METRICS ===');
    console.log('Performance Score:', (data.categories?.performance?.score * 100) || 'N/A');
    console.log('--------------------------------------');
    
    const metrics = [
      { name: 'First Contentful Paint (FCP)', audit: 'first-contentful-paint' },
      { name: 'Largest Contentful Paint (LCP)', audit: 'largest-contentful-paint' },
      { name: 'Total Blocking Time (TBT)', audit: 'total-blocking-time' },
      { name: 'Speed Index (SI)', audit: 'speed-index' },
      { name: 'Cumulative Layout Shift (CLS)', audit: 'cumulative-layout-shift' },
      { name: 'Time to Interactive (TTI)', audit: 'interactive' }
    ];
    
    metrics.forEach(m => {
      const a = audits[m.audit];
      if (a) {
        console.log(`${m.name}: ${a.displayValue || a.numericValue + ' ' + (a.numericUnit || '')} (${a.score * 100} / 100)`);
      } else {
        console.log(`${m.name}: Not Found`);
      }
    });
    
    console.log('--------------------------------------');
    console.log('Long Tasks (>50ms):');
    const longTasks = audits['long-tasks'];
    if (longTasks && longTasks.details && longTasks.details.items) {
      console.log(`Found ${longTasks.details.items.length} long tasks.`);
      longTasks.details.items.slice(0, 5).forEach((t, i) => {
        console.log(`  ${i+1}. URL: ${t.url || 'Main thread'}, Duration: ${t.duration}ms, Start Time: ${t.startTime}ms`);
      });
    } else {
      console.log('No long tasks audit details found.');
    }
    
    console.log('--------------------------------------');
    console.log('Render Blocking Resources:');
    const renderBlocking = audits['render-blocking-resources'];
    if (renderBlocking && renderBlocking.details && renderBlocking.details.items) {
      renderBlocking.details.items.forEach((item) => {
        console.log(`  - URL: ${item.url}, Wasted MS: ${item.wastedMs}ms`);
      });
    } else {
      console.log('No render blocking resources.');
    }

  } catch (err) {
    console.error('Error parsing JSON:', err);
    process.exit(1);
  }
}
