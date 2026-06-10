const https = require('https');
const fs = require('fs');

const url = 'https://www.google.com/search?rlz=1C1YTUH_enIN1182IN1182&sca_esv=91390b2ecb4203d7&cs=1&output=search&kgmid=/g/11z8gpb009&q=SS+REALTY&shem=rimspwouoe&shndl=30&source=sh/x/loc/uni/m1/1&kgs=e860a04afc08ef4c&utm_source=rimspwouoe,sh/x/loc/uni/m1/1';

function fetchWithUA(userAgent, filename) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        fs.writeFileSync(filename, data);
        console.log(`Saved ${filename}, length: ${data.length}`);
        
        // Check if page contains coordinates or Google Maps link
        const mapsUrlMatches = data.match(/maps\.google\.com\/[^\s"'`<>]+/g) || data.match(/google\.com\/maps\/[^\s"'`<>]+/g);
        if (mapsUrlMatches) {
          console.log(`[${filename}] Found maps URLs:`, [...new Set(mapsUrlMatches)].slice(0, 5));
        }
        
        const coordsMatch = data.match(/ll=([-0-9\.]+),([-0-9\.]+)/) || data.match(/@([-0-9\.]+),([-0-9\.]+)/);
        if (coordsMatch) {
          console.log(`[${filename}] Found coordinates:`, coordsMatch[0]);
        }
        
        if (data.includes("Jonapur") || data.includes("Dalmia") || data.includes("ssrealty.org") || data.includes("Chattarpur")) {
          console.log(`[${filename}] Found relevant keywords!`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error for ${filename}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  // Try Lynx user agent
  await fetchWithUA('Lynx/2.8.8dev.3 libwww-FM/2.14 SSL-MM/1.4.1', 'scripts/search-lynx.html');
  
  // Try very old IE user agent (causes Google to serve basic page)
  await fetchWithUA('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)', 'scripts/search-ie.html');
}

run();
