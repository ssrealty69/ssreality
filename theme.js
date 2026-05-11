const fs = require('fs');
let content = fs.readFileSync('src/app/properties/[id]/page.tsx', 'utf8');

// Replace hex colors
content = content.replace(/#be184a/g, '#C9A227'); // Red to Gold
content = content.replace(/#a0143e/g, '#A88721'); // Hover red to Hover Gold
content = content.replace(/#fdf9ee/g, '#1A1800'); // Cream to Black

// Tailwind classes
content = content.replace(/pink-100/g, '[#E8D5A3]/30');
content = content.replace(/pink-200/g, '[#C9A227]/20');
content = content.replace(/pink-50/g, '[#FFFEF5]');

// Hero gradient adjustment
content = content.replace(/from-\[#C9A227\]\/80 via-transparent to-black\/60/g, 'from-[#1A1800]/95 via-[#1A1800]/70 to-black/60');
content = content.replace(/bg-white\/10 backdrop-blur-sm rounded-xl border border-white\/40/g, 'bg-[#1A1800]/80 backdrop-blur-md rounded-xl border border-[#C9A227]/30');

// Overview text
content = content.replace(/text-gray-800/g, 'text-[#1A1800]');
content = content.replace(/text-gray-700/g, 'text-[#1A1800]/80');
content = content.replace(/text-gray-600/g, 'text-[#1A1800]/70');
content = content.replace(/text-gray-500/g, 'text-[#1A1800]/60');

// Buttons (Black text on gold buttons)
content = content.replace(/bg-\[#C9A227\] text-white/g, 'bg-[#C9A227] text-[#1A1800]');
content = content.replace(/bg-\[#C9A227\] text-\[#1A1800\] p-3/g, 'bg-[#1A1800] text-[#C9A227] p-3');
content = content.replace(/text-\[#C9A227\] fill-\[#C9A227\]/g, 'text-[#1A1800] fill-[#1A1800]');

// Highlights Left Box (was Cream, now Black #1A1800)
content = content.replace(/bg-\[#1A1800\] p-8 md:p-12 space-y-6/g, 'bg-[#1A1800] p-8 md:p-12 space-y-6 text-[#E8D5A3]');
content = content.replace(/text-\[#1A1800\]\/80/g, 'text-[#1A1800]/80');

// Highlights Right Box (was Red, now Gold)
content = content.replace(/bg-\[#C9A227\] p-8 md:p-12 space-y-6 text-white/g, 'bg-[#C9A227] p-8 md:p-12 space-y-6 text-[#1A1800]');

// Form Box (was White, now Black)
content = content.replace(/bg-white rounded-xl shadow-\[0_0_20px_rgba\(190,24,74,0.15\)\]/g, 'bg-[#1A1800] rounded-xl shadow-[0_0_20px_rgba(201,162,39,0.15)]');
content = content.replace(/text-\[#C9A227\] mb-2\">Enquire Now/g, 'text-[#C9A227] mb-2\">Enquire Now');
content = content.replace(/text-\[#1A1800\]\/70 mb-8/g, 'text-[#E8D5A3]/80 mb-8');
content = content.replace(/bg-white text-\[#C9A227\] px-6 py-3/g, 'bg-[#1A1800] text-[#C9A227] px-6 py-3');

// Inputs inside the form
content = content.replace(/border-\[#E8D5A3\]\/30 rounded-md px-4 py-3 shadow-sm focus:outline-none focus:border-\[#C9A227\] focus:ring-1 focus:ring-\[#C9A227\] transition-all/g, 'bg-[#FFFEF5]/10 text-white border border-[#C9A227]/30 rounded-md px-4 py-3 shadow-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all placeholder:text-white/40');
content = content.replace(/bg-gray-50 border-r border-\[#E8D5A3\]\/30 px-3 py-3 text-sm flex items-center justify-center/g, 'bg-[#FFFEF5]/5 border-r border-[#C9A227]/30 px-3 py-3 text-[#E8D5A3] flex items-center justify-center');
content = content.replace(/w-full px-4 py-3 focus:outline-none/g, 'w-full px-4 py-3 focus:outline-none bg-[#FFFEF5]/10 text-white placeholder:text-white/40');

// Price List Cards
// Card 1 & 3 (were cream, now black)
content = content.replace(/bg-\[#1A1800\] rounded-xl p-6 shadow-md relative overflow-hidden flex flex-col h-full border border-\[#1A1800\]/g, 'bg-[#1A1800] rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full border border-[#C9A227]/30');
// Card 2 & 4 (were red, now gold)
content = content.replace(/bg-\[#C9A227\] rounded-xl p-6 shadow-md relative overflow-hidden flex flex-col h-full/g, 'bg-[#C9A227] rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full');
// Price list text fixes
// For Card 1 & 3 inside black
content = content.replace(/<h3 className=\"text-xl font-bold text-\[#1A1800\] mb-6\">/g, '<h3 className=\"text-xl font-bold text-white mb-6\">');
// Wait, the replaced class might have `text-[#1A1800]` everywhere. Let's fix text on black.

fs.writeFileSync('src/app/properties/[id]/page.tsx', content);
console.log('Theme applied successfully.');
