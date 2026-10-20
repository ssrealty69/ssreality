const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=== COMPILING 'THE AI EMPLOYEE' EBOOK ===");

const chaptersDir = path.join(__dirname, 'chapters');
const ch00 = require(path.join(chaptersDir, '00_cover_and_intro.js'));
const ch01 = require(path.join(chaptersDir, '01_chapter1_paradigm.js'));
const ch02 = require(path.join(chaptersDir, '02_chapter2_operating_system.js'));
const ch03 = require(path.join(chaptersDir, '03_chapter3_agents_strategy_marketing.js'));
const ch04 = require(path.join(chaptersDir, '04_chapter3_agents_sales_tech_ops.js'));
const ch05 = require(path.join(chaptersDir, '05_chapter4_orchestration_workflows.js'));
const ch06 = require(path.join(chaptersDir, '06_chapter5_guardrails_auditing.js'));
const ch07 = require(path.join(chaptersDir, '07_chapter6_roadmap_appendix.js'));

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary: #7c3aed;
  --accent: #06b6d4;
  --dark: #090d16;
  --dark-surface: #111827;
  --dark-card: #1f2937;
  --light-bg: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --text-light: #94a3b8;
  --border: #e2e8f0;
  --border-dark: #334155;
  --code-bg: #0f172a;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@page {
  size: A4 portrait;
  margin: 18mm 16mm 18mm 16mm;
}

@page :first {
  margin: 0;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-main);
  background-color: #ffffff;
  line-height: 1.65;
  font-size: 10pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* COVER PAGE */
.cover-page {
  width: 100vw;
  min-height: 100vh;
  height: 100vh;
  background: radial-gradient(circle at 80% 20%, #1e1b4b 0%, #090d16 65%, #020408 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 55mm 25mm 30mm 25mm;
  page-break-after: always;
  position: relative;
  overflow: hidden;
}

.cover-page::before {
  content: "";
  position: absolute;
  top: -150px;
  right: -150px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.cover-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 9pt;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.cover-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 36pt;
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -1.2px;
  color: #ffffff;
  margin-bottom: 16px;
}

.cover-title span {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cover-subtitle {
  font-size: 13.5pt;
  color: #cbd5e1;
  font-weight: 400;
  line-height: 1.45;
  max-width: 620px;
  margin-bottom: 25px;
}

.cover-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  border-radius: 2px;
  margin-bottom: 30px;
}

.cover-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-width: 580px;
}

.cover-feature-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.cover-feature-title {
  font-size: 8.5pt;
  font-weight: 700;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.cover-feature-desc {
  font-size: 8pt;
  color: #94a3b8;
  line-height: 1.35;
}

.cover-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 18px;
}

.cover-author {
  font-size: 10pt;
  color: #f1f5f9;
  font-weight: 600;
}

.cover-author-sub {
  font-size: 8pt;
  color: #64748b;
}

.cover-meta {
  text-align: right;
  font-size: 8pt;
  color: #64748b;
}

/* GENERAL PAGE STYLING */
.page {
  page-break-after: always;
  position: relative;
  min-height: 245mm;
  padding-top: 4px;
}

.page:last-child {
  page-break-after: avoid;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
  margin-bottom: 20px;
  font-size: 7.5pt;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.page-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  font-size: 7.5pt;
  color: var(--text-light);
}

/* TYPOGRAPHY */
h1.chapter-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22pt;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.7px;
  line-height: 1.2;
  margin-bottom: 12px;
}

.chapter-number {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary);
  margin-bottom: 4px;
  display: block;
}

h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13.5pt;
  font-weight: 700;
  color: #0f172a;
  margin-top: 16px;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

h3 {
  font-size: 10.5pt;
  font-weight: 700;
  color: #1e293b;
  margin-top: 12px;
  margin-bottom: 5px;
}

p {
  margin-bottom: 9px;
  color: #334155;
}

p.lead {
  font-size: 10.5pt;
  line-height: 1.6;
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 12px;
}

/* CARDS & CONTAINERS */
.card {
  background: var(--light-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin: 10px 0;
  page-break-inside: avoid;
}

.card-primary {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.card-dark {
  background: var(--dark-surface);
  border-color: var(--border-dark);
  color: #f1f5f9;
}

.card-dark p {
  color: #cbd5e1;
}

.callout {
  border-left: 4px solid var(--primary);
  background: #f8fafc;
  padding: 10px 14px;
  margin: 10px 0;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  page-break-inside: avoid;
}

.callout-warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.callout-success {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.callout-danger {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.callout-title {
  font-weight: 700;
  font-size: 9pt;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.callout-warning .callout-title { color: #b45309; }
.callout-success .callout-title { color: #047857; }
.callout-danger .callout-title { color: #b91c1c; }
.callout-title { color: var(--primary-dark); }

/* TABLES */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 8.5pt;
  page-break-inside: avoid;
}

th {
  background: #0f172a;
  color: #ffffff;
  text-align: left;
  padding: 7px 9px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

td {
  padding: 7px 9px;
  border-bottom: 1px solid var(--border);
  color: #334155;
  vertical-align: top;
}

tr:nth-child(even) td {
  background: #f8fafc;
}

/* AGENT PROFILE BOXES */
.agent-profile {
  background: #ffffff;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin: 14px 0 18px 0;
  page-break-inside: avoid;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

.agent-profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.agent-id-badge {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 12pt;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.agent-division-tag {
  font-size: 7.5pt;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.division-strategy { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
.division-marketing { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.division-sales { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.division-tech { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.division-ops { background: #fce7f3; color: #9d174d; border: 1px solid #fbcfe8; }

.agent-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-meta-item {
  font-size: 8pt;
}

.agent-meta-label {
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 7pt;
  letter-spacing: 0.5px;
  margin-bottom: 1px;
}

.agent-meta-value {
  color: #0f172a;
  font-weight: 600;
}

/* PROMPT BOX */
.prompt-box {
  background: var(--code-bg);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.5pt;
  color: #e2e8f0;
  line-height: 1.4;
  border: 1px solid #1e293b;
  position: relative;
  page-break-inside: avoid;
}

.prompt-box-header {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 7.5pt;
  font-weight: 700;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
  padding-bottom: 3px;
}

/* TOC STYLING */
.toc-list {
  list-style: none;
  margin: 12px 0;
}

.toc-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px dotted var(--border);
  font-size: 9pt;
}

.toc-chapter {
  font-weight: 700;
  color: #0f172a;
}

.toc-subitem {
  padding-left: 20px;
  font-size: 8.5pt;
  color: var(--text-muted);
}

.toc-page {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--primary);
  font-size: 8.5pt;
}

/* WORKFLOW DIAGRAM BOXES */
.flow-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f5f9;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px;
  margin: 10px 0;
  page-break-inside: avoid;
}

.flow-step {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  text-align: center;
  flex: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.flow-step-num {
  font-size: 6.5pt;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.flow-step-title {
  font-weight: 700;
  font-size: 8pt;
  color: #0f172a;
}

.flow-arrow {
  padding: 0 6px;
  color: #94a3b8;
  font-weight: 700;
  font-size: 10pt;
}

.badge {
  display: inline-block;
  padding: 2px 7px;
  font-size: 7pt;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
  margin-right: 4px;
}
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-purple { background: #f3e8ff; color: #6b21a8; }
.badge-amber { background: #fef3c7; color: #92400e; }
`;

const allChapters = [
  ch00,
  ch01,
  ch02,
  ch03,
  ch04,
  ch05,
  ch06,
  ch07
].join('\n');

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The AI Employee: How One Person Can Build a Business With 20 AI Employees</title>
  <style>
` + css + `
  </style>
</head>
<body>
` + allChapters + `
</body>
</html>`;

const outputHtmlPath = path.join(__dirname, 'The_AI_Employee_Ebook.html');
fs.writeFileSync(outputHtmlPath, fullHtml, 'utf8');
console.log("HTML eBook saved to:", outputHtmlPath);

// Compile to PDF using Edge headless
const outputPdfPath = path.join(__dirname, 'The_AI_Employee_Ebook.pdf');
const rootPdfPath = path.join(__dirname, '..', 'The_AI_Employee_Ebook.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log("Generating PDF with Microsoft Edge...");
const fileUrl = 'file:///' + outputHtmlPath.replace(/\\/g, '/');
const cmd = '"' + edgePath + '" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="' + outputPdfPath + '" "' + fileUrl + '"';

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log("PDF successfully generated at:", outputPdfPath);
  fs.copyFileSync(outputPdfPath, rootPdfPath);
  console.log("PDF copied to workspace root:", rootPdfPath);
} catch (err) {
  console.error("Error generating PDF:", err);
  process.exit(1);
}

const stats = fs.statSync(outputPdfPath);
console.log("Generated PDF size: " + (stats.size / 1024).toFixed(2) + " KB");
console.log("=== COMPILATION COMPLETE ===");
