module.exports = `
<!-- CHAPTER 2 -->
<div class="page">
  <div class="page-header">
    <span>Chapter 2</span>
    <span>The Agentic Operating System</span>
  </div>

  <span class="chapter-number">CHAPTER 02</span>
  <h1 class="chapter-title">The Agentic Operating System</h1>

  <p class="lead">
    Before deploying 20 AI employees, you must construct the nervous system that connects them. Without this infrastructure, you have 20 isolated bots screaming into the void.
  </p>

  <h2>2.1 The Knowledge Vault: Single Source of Truth</h2>
  <p>
    The number one failure mode of multi-agent setups is <em>context divergence</em>. If your marketing agent believes your product costs $99/mo, while your sales outreach agent quotes $49/mo and your customer support agent insists refunds are impossible, your business dissolves into chaos.
  </p>
  <p>
    Enterprise solopreneurs solve this by creating a <strong>Single Source of Truth (SSOT)</strong>, often called the <em>Company Knowledge Vault</em>.
  </p>

  <div class="card">
    <h3 style="margin-top: 0; color: #0f172a;">The 4 Core Pillars of Your Company Vault</h3>
    <ul style="margin: 6px 0 6px 18px; font-size: 8.5pt; color: #334155;">
      <li><strong>01_brand_identity.md:</strong> Tone of voice, forbidden words, target customer ICP (Ideal Customer Profile), value propositions, and positioning pillars.</li>
      <li><strong>02_product_specifications.md:</strong> Exact pricing tiers, feature lists, API limits, technical architecture, and roadmap items.</li>
      <li><strong>03_standard_operating_procedures.md:</strong> Step-by-step rules for refunds, discount approvals, lead qualification score thresholds, and bug escalation tiers.</li>
      <li><strong>04_memory_and_changelog.md:</strong> Dynamic state tracking updated daily by Agent #1 (Chief of Staff) capturing current sprint goals, open deals, and metric milestones.</li>
    </ul>
  </div>

  <h2>2.2 Orchestration Engines: Selecting Your Backbone</h2>
  <p>
    Agents require an orchestration layer to listen for events, route payloads, handle retries, and trigger downstream actions. You do not need to write thousands of lines of low-level networking code. Three dominant architectures power modern 20-agent companies:
  </p>

  <table>
    <thead>
      <tr>
        <th>Engine</th>
        <th>Best For</th>
        <th>Strengths</th>
        <th>Cost / Setup</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>n8n (Self-Hosted)</strong></td>
        <td>The Default Choice for Solopreneurs</td>
        <td>Visual node builder, unlimited executions, native AI agent nodes, total data privacy.</td>
        <td>$10–$20/mo VPS (Docker)</td>
      </tr>
      <tr>
        <td><strong>Make.com</strong></td>
        <td>Zero-Code Operators</td>
        <td>Extremely fast visual setup, thousands of pre-built SaaS connectors, zero DevOps.</td>
        <td>$29–$99/mo depending on volume</td>
      </tr>
      <tr>
        <td><strong>LangGraph / CrewAI</strong></td>
        <td>Technical Founders & Developers</td>
        <td>Programmatic cyclical graph flows, deep state control, deterministic routing.</td>
        <td>Free OSS + Cloud hosting</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-success">
    <div class="callout-title">The Recommended Solopreneur Stack</div>
    <p style="margin-bottom: 0; font-size: 8.5pt;">
      For 95% of non-technical or semi-technical founders, <strong>n8n running on a $15/month Hetzner or DigitalOcean server</strong> is the undisputed champion. It allows you to connect webhooks, run multi-step AI agents with LangChain tools natively, and store execution logs with zero per-run fees.
    </p>
  </div>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 8</span>
  </div>
</div>

<div class="page">
  <div class="page-header">
    <span>Chapter 2</span>
    <span>Slack Mission Control & Tool Calling</span>
  </div>

  <h2>2.3 The AI Headquarters: Slack as Central Command</h2>
  <p>
    Do not build a bespoke admin panel. You already have the most powerful collaboration software on earth: <strong>Slack</strong> (or Discord). By creating a private Slack workspace where each channel represents a company division, your AI employees report directly to you where you already communicate.
  </p>

  <div class="card card-dark">
    <h3 style="margin-top: 0; color: #38bdf8;">The 6-Channel AI Command Center</h3>
    <ul style="margin: 6px 0 6px 18px; font-size: 8.5pt; color: #cbd5e1;">
      <li><code>#exec-standup</code>: Daily 8:30 AM briefings from Agent #1, key metrics, and strategic alerts.</li>
      <li><code>#content-marketing</code>: Agent #4 posts draft blog posts and newsletters with <em>"Approve"</em> or <em>"Revise"</em> interactive buttons.</li>
      <li><code>#sales-pipeline</code>: Real-time alerts when Agent #9 enriches a qualified lead or Agent #11 books a sales call.</li>
      <li><code>#dev-deployments</code>: Pull requests, test suite passes, and security scan reports from Agents #13, #14, and #15.</li>
      <li><code>#customer-support</code>: Live notifications of resolved tickets and escalations that require founder attention.</li>
      <li><code>#approvals-hitl</code>: The central gate where all high-stakes agent decisions require 1-click founder sign-off before execution.</li>
    </ul>
  </div>

  <h2>2.4 Hands & Eyes: Tool Calling & Webhook Mechanics</h2>
  <p>
    An LLM alone is just a brain in a jar. It can think, but it cannot see or touch the external world. <strong>Tool Calling</strong> (also known as Function Calling) gives your AI employees hands and eyes.
  </p>

  <div class="flow-container">
    <div class="flow-step">
      <div class="flow-step-num">Step 1: Event</div>
      <div class="flow-step-title">Trigger Fired</div>
      <p style="font-size: 7pt; color: #64748b; margin: 2px 0 0 0;">New prospect fills Typeform</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">Step 2: Agent Brain</div>
      <div class="flow-step-title">LLM Reasons</div>
      <p style="font-size: 7pt; color: #64748b; margin: 2px 0 0 0;">Evaluates ICP & decides tool call</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">Step 3: Tool Call</div>
      <div class="flow-step-title">External Action</div>
      <p style="font-size: 7pt; color: #64748b; margin: 2px 0 0 0;">Calls Apollo API / Writes to CRM</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">Step 4: Output</div>
      <div class="flow-step-title">Feedback Loop</div>
      <p style="font-size: 7pt; color: #64748b; margin: 2px 0 0 0;">Slack alert & sequence queued</p>
    </div>
  </div>

  <p>
    Every AI employee blueprint in Chapter 3 specifies exactly which tools that employee possesses. By constraining each agent's tool set (for example, the Content Writer has access to WordPress and Google Docs, but zero access to the Stripe payment gateway), you guarantee security and eliminate accidental catastrophic actions.
  </p>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 9</span>
  </div>
</div>
`;
