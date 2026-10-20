module.exports = `
<!-- CHAPTER 6 -->
<div class="page">
  <div class="page-header">
    <span>Chapter 6</span>
    <span>The 30-Day Step-by-Step Launch Blueprint</span>
  </div>

  <span class="chapter-number">CHAPTER 06</span>
  <h1 class="chapter-title">The 30-Day Step-by-Step Launch Calendar</h1>

  <p class="lead">
    A structured, zero-overwhelm implementation roadmap taking you from solo freelancer to the CEO of a 20-agent automated enterprise in four weeks.
  </p>

  <h2>Week 1: The Knowledge Vault & Executive Core (Days 1 – 7)</h2>
  <p>The goal of Week 1 is to build your infrastructure foundation before touching any outbound or marketing automations.</p>
  <ul style="margin: 6px 0 12px 18px; font-size: 8.5pt; color: #334155;">
    <li><strong>Days 1–2 &bull; Company Knowledge Vault:</strong> Create your GitHub repository or Notion workspace containing <code>01_brand_identity.md</code>, <code>02_product_specifications.md</code>, and your pricing matrix.</li>
    <li><strong>Days 3–4 &bull; Orchestration Setup:</strong> Deploy n8n (self-hosted Docker on a $15/mo VPS or cloud instance) and configure API keys for Anthropic and OpenAI.</li>
    <li><strong>Days 5–7 &bull; Deploy Agents #1, #2, #3:</strong> Set up your private Slack workspace with the 6 core channels. Wire Agent #1 (Chief of Staff) to run the 8:30 AM morning standup and connect Agent #2 (Competitor Scout) to monitor industry rivals.</li>
  </ul>

  <h2>Week 2: The Growth & Pipeline Engine (Days 8 – 14)</h2>
  <p>With your executive brain live, deploy your content, SEO, and outbound sales division to generate inbound leads and booked calls.</p>
  <ul style="margin: 6px 0 12px 18px; font-size: 8.5pt; color: #334155;">
    <li><strong>Days 8–9 &bull; Content & SEO (Agents #4, #5, #6):</strong> Configure Agent #5 to run weekly keyword clustering and wire Agent #4 to draft weekly technical articles. Hook Agent #6 to repurpose articles into Twitter/LinkedIn drafts.</li>
    <li><strong>Days 10–11 &bull; Direct Response & Video (Agents #7, #8):</strong> Connect Agent #7 to draft high-converting landing page variants and email welcome series.</li>
    <li><strong>Days 12–14 &bull; Outbound Lead Machine (Agents #9, #10, #11, #12):</strong> Connect Clay/Apollo API to Agent #9 (Lead Scraper). Wire Agent #10 to draft personalized email openers and establish the Slack approval queue before sending via Smartlead.</li>
  </ul>

  <div class="callout callout-success">
    <div class="callout-title">Milestone at Day 14</div>
    <p style="margin-bottom: 0; font-size: 8.5pt;">
      By the end of Week 2, your top-of-funnel and outbound sales engine is completely operational. You are generating targeted leads and drafting high-converting copy while you sleep, reviewing output with 1-click approvals in Slack.
    </p>
  </div>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 24</span>
  </div>
</div>

<div class="page">
  <div class="page-header">
    <span>Chapter 6</span>
    <span>Weeks 3 & 4 Implementation</span>
  </div>

  <h2>Week 3: Engineering, Testing & Infrastructure (Days 15 – 21)</h2>
  <p>Automate your software product development cycle or client deliverable production line.</p>
  <ul style="margin: 6px 0 12px 18px; font-size: 8.5pt; color: #334155;">
    <li><strong>Days 15–16 &bull; Developer & Coding Agents (Agent #13):</strong> Connect your code repository to Claude Code CLI or Cursor with strict codebase rules in <code>AGENTS.md</code>.</li>
    <li><strong>Days 17–18 &bull; Security & QA Hunter (Agents #14, #15):</strong> Wire GitHub Actions to run automated security audits on every Pull Request and execute automated Playwright integration tests before deployment.</li>
    <li><strong>Days 19–21 &bull; DevOps Sentinel (Agent #16):</strong> Configure BetterStack uptime monitoring and Sentry error webhooks with automatic rollback triggers.</li>
  </ul>

  <h2>Week 4: Operations, Retention & Financial Autopilot (Days 22 – 30)</h2>
  <p>Seal your operational loop with customer delight, automated documentation, and financial bookkeeping.</p>
  <ul style="margin: 6px 0 12px 18px; font-size: 8.5pt; color: #334155;">
    <li><strong>Days 22–24 &bull; 24/7 Support & Docs (Agents #17, #18):</strong> Embed Intercom Fin or Chatbase on your website connected to your Knowledge Vault via vector search. Set up Agent #18 to auto-generate FAQ docs from resolved tickets.</li>
    <li><strong>Days 25–27 &bull; Finance & Legal Screener (Agents #19, #20):</strong> Connect Stripe and QuickBooks webhooks to Agent #19 for automated bookkeeping and expense categorization. Wire Agent #20 to review vendor MSAs.</li>
    <li><strong>Days 28–30 &bull; System Hardening & Autopilot Simulation:</strong> Run a complete simulated product release from start to finish. Audit token limits, verify circuit breakers, and lock in your daily 20-minute conductor routine.</li>
  </ul>

  <div class="card card-dark" style="margin-top: 14px;">
    <h3 style="margin-top: 0; color: #38bdf8;">The 30-Day Master Readiness Checklist</h3>
    <table style="font-size: 8pt; margin: 4px 0; background: transparent;">
      <thead>
        <tr>
          <th style="background: #1e293b;">Area</th>
          <th style="background: #1e293b;">Checklist Item</th>
          <th style="background: #1e293b;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="color: #cbd5e1;">Infrastructure</td>
          <td style="color: #94a3b8;">n8n server running with SSL & daily database backups</td>
          <td style="color: #10b981; font-weight: 700;">READY</td>
        </tr>
        <tr>
          <td style="color: #cbd5e1;">Security</td>
          <td style="color: #94a3b8;">Hard spend caps set in OpenAI ($100) & Anthropic ($150)</td>
          <td style="color: #10b981; font-weight: 700;">READY</td>
        </tr>
        <tr>
          <td style="color: #cbd5e1;">Orchestration</td>
          <td style="color: #94a3b8;">Slack #approvals-hitl channel configured with interactive buttons</td>
          <td style="color: #10b981; font-weight: 700;">READY</td>
        </tr>
        <tr>
          <td style="color: #cbd5e1;">Knowledge Base</td>
          <td style="color: #94a3b8;">Single source of truth markdown docs uploaded to Vector DB</td>
          <td style="color: #10b981; font-weight: 700;">READY</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 25</span>
  </div>
</div>

<!-- APPENDIX: TOOL DIRECTORY & CONCLUSION -->
<div class="page">
  <div class="page-header">
    <span>Appendix & Tool Directory</span>
    <span>Reference Manual</span>
  </div>

  <span class="chapter-number">APPENDIX</span>
  <h1 class="chapter-title">The 2026 AI Solopreneur Tool Directory</h1>

  <p class="lead">
    Curated software stack for powering your 20 AI employees with maximum efficiency and minimal monthly subscription bloat.
  </p>

  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Recommended Software</th>
        <th>Primary Purpose</th>
        <th>Estimated Monthly Cost</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>LLM Frontier</strong></td>
        <td>Claude 3.5 Sonnet / OpenAI GPT-4o</td>
        <td>Complex reasoning, writing, coding & PRD specs</td>
        <td>Pay-as-you-go ($40–$150/mo)</td>
      </tr>
      <tr>
        <td><strong>LLM Fast Tier</strong></td>
        <td>Gemini 2.0 Flash / GPT-4o-mini</td>
        <td>Data extraction, classification & filtering</td>
        <td>Pay-as-you-go ($5–$20/mo)</td>
      </tr>
      <tr>
        <td><strong>Orchestration</strong></td>
        <td>n8n (Self-hosted on Hetzner VPS)</td>
        <td>Central workflow engine & agent graph</td>
        <td>$12 – $20 / month</td>
      </tr>
      <tr>
        <td><strong>Knowledge Base</strong></td>
        <td>Pinecone / Supabase pgvector + Notion</td>
        <td>Vector memory & single source of truth</td>
        <td>Free tier &ndash; $25 / month</td>
      </tr>
      <tr>
        <td><strong>Lead Generation</strong></td>
        <td>Clay.com + Apollo API</td>
        <td>B2B prospect scraping & data enrichment</td>
        <td>$49 – $149 / month</td>
      </tr>
      <tr>
        <td><strong>Cold Outreach</strong></td>
        <td>Smartlead.ai / Instantly</td>
        <td>Automated email warmup & sequence sending</td>
        <td>$39 – $79 / month</td>
      </tr>
      <tr>
        <td><strong>Development</strong></td>
        <td>Cursor IDE + Claude Code CLI</td>
        <td>Agentic software engineering & testing</td>
        <td>$20 / month</td>
      </tr>
      <tr>
        <td><strong>Customer Support</strong></td>
        <td>Intercom Fin / Chatbase</td>
        <td>Automated tier-1 resolution bot</td>
        <td>$39 – $99 / month</td>
      </tr>
      <tr>
        <td><strong>Finance & Ops</strong></td>
        <td>Stripe + QuickBooks / Dext</td>
        <td>Payment gateway & automated bookkeeping</td>
        <td>$30 / month</td>
      </tr>
    </tbody>
  </table>

  <h2>Conclusion: Your New Life as a Conductor</h2>
  <p>
    The future does not belong to the largest corporations with thousands of cubicles. It belongs to the <strong>leanest, most adaptable minds</strong> capable of orchestrating intelligence at scale.
  </p>
  <p>
    You now hold the complete blueprint. You know the exact job roles, the standard operating procedures, the prompt architectures, and the safety guardrails needed to run a 20-person business entirely by yourself.
  </p>
  <p>
    The era of exhausting 80-hour workweeks spent doing repetitive cognitive drudgery is over. Step into your role as Conductor. Build your system. Deploy your 20 AI employees. And build the business of your dreams.
  </p>

  <div style="margin-top: 30px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
    <h3 style="margin-top: 0; color: #0f172a;">THE AI SOLOPRENEUR CREED</h3>
    <p style="font-size: 9.5pt; font-style: italic; color: #475569; max-width: 500px; margin: 0 auto;">
      "Never do by hand what an agent can automate. Never let an agent publish what a human hasn't verified. Build systems that compound while you sleep."
    </p>
  </div>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 26</span>
  </div>
</div>
`;
