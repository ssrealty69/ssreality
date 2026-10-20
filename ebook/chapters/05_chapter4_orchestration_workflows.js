module.exports = `
<!-- CHAPTER 4 -->
<div class="page">
  <div class="page-header">
    <span>Chapter 4</span>
    <span>Multi-Agent Orchestration & Workflows</span>
  </div>

  <span class="chapter-number">CHAPTER 04</span>
  <h1 class="chapter-title">Multi-Agent Orchestration & The Hand-Off Protocol</h1>

  <p class="lead">
    How 20 specialized AI workers communicate asynchronously, pass state seamlessly, and collaborate to deliver complex business outcomes without human friction.
  </p>

  <h2>4.1 Asynchronous Message Passing: The Pub/Sub Standard</h2>
  <p>
    In human organizations, work breaks down when a task falls through the cracks between departments. In AI organizations, work breaks down when agents exchange unvalidated, unstructured natural language.
  </p>
  <p>
    Professional AI workforce architectures do not rely on raw chat between agents. Instead, they operate on a <strong>Standardized JSON Handoff Envelope</strong> routed through an event bus (such as Redis Pub/Sub, an n8n webhook switch, or an agent graph).
  </p>

  <div class="card card-dark">
    <h3 style="margin-top: 0; color: #38bdf8;">Standardized Inter-Agent Handoff Payload</h3>
    <div class="prompt-box" style="margin-top: 4px;">
{
  "handoff_id": "handoff_9824_sales_outreach",
  "source_agent": "agent_09_prospect_scraper",
  "target_agent": "agent_10_cold_outreach",
  "status": "READY_FOR_PERSONALIZATION",
  "payload": {
    "lead_count": 25,
    "target_vertical": "Enterprise SaaS",
    "verified_records_url": "s3://vault/leads/2026-09-10_batch.json"
  },
  "guardrails": {
    "max_daily_budget_usd": 15.00,
    "hitl_approval_required": true,
    "escalate_channel": "#approvals-hitl"
  }
}
    </div>
  </div>

  <h2>4.2 The 45-Minute Product Launch: A Live Multi-Agent Case Study</h2>
  <p>
    To witness the power of a 20-agent workforce, consider this actual workflow executed by a solo founder launching an AI-powered invoice parsing feature:
  </p>

  <div class="flow-container">
    <div class="flow-step">
      <div class="flow-step-num">00:00 - Founder</div>
      <div class="flow-step-title">Voice Memo</div>
      <p style="font-size: 6.5pt; color: #64748b; margin: 2px 0 0 0;">Sends 45s audio note to Slack #exec-standup</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">00:05 - Agent #1 & #3</div>
      <div class="flow-step-title">PRD Spec</div>
      <p style="font-size: 6.5pt; color: #64748b; margin: 2px 0 0 0;">Generates technical requirements & data schema</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">00:15 - Agent #13 & #15</div>
      <div class="flow-step-title">Code & Test</div>
      <p style="font-size: 6.5pt; color: #64748b; margin: 2px 0 0 0;">Creates feature branch & passes Playwright tests</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">00:30 - Agent #4 & #6</div>
      <div class="flow-step-title">Marketing Pack</div>
      <p style="font-size: 6.5pt; color: #64748b; margin: 2px 0 0 0;">Drafts changelog, announcement thread & blog</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">00:45 - Founder</div>
      <div class="flow-step-title">1-Click Launch</div>
      <p style="font-size: 6.5pt; color: #166534; font-weight: 700; margin: 2px 0 0 0;">Approves PR & releases campaign</p>
    </div>
  </div>

  <p>
    In a traditional startup, this sequence involves a product manager writing a ticket, an engineering standup, two days of frontend development, a QA review cycle, a marketing sync, and a sales briefing—consuming 3 to 4 weeks of calendar time and thousands in salary overhead. In an AI-orchestrated setup, the founder conducts the symphony from their smartphone in under an hour.
  </p>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 20</span>
  </div>
</div>

<div class="page">
  <div class="page-header">
    <span>Chapter 4</span>
    <span>Human-in-the-Loop Governance</span>
  </div>

  <h2>4.3 The 4 Ironclad Human-in-the-Loop (HITL) Checkpoints</h2>
  <p>
    Total autonomy is a dangerous vanity metric. Unsupervised agents can hallucinate promises to customers, trigger runaway API charges, or push breaking code to production.
  </p>
  <p>
    Elite solopreneurs establish strict <strong>Kill Switches</strong> and <strong>Approval Gates</strong>. An agent is given autonomous authority to research, draft, code, and simulate—but execution requires founder approval at four specific gates:
  </p>

  <table>
    <thead>
      <tr>
        <th>Gate #</th>
        <th>Category</th>
        <th>Responsible Agent</th>
        <th>Approval Threshold</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Gate 1</strong></td>
        <td><strong>Financial & Outbound Spend</strong></td>
        <td>Agent #19 (Finance) & Agent #10 (Sales)</td>
        <td>Any outbound email sequence &gt; 50 contacts or any single API/SaaS charge &gt; $50.00 requires Slack button click.</td>
      </tr>
      <tr>
        <td><strong>Gate 2</strong></td>
        <td><strong>Production Deployments</strong></td>
        <td>Agent #13 (Developer) & Agent #14 (Security)</td>
        <td>No code merges directly to the <code>main</code> branch. Agent produces a preview URL; human tests for 60 seconds and clicks "Merge".</td>
      </tr>
      <tr>
        <td><strong>Gate 3</strong></td>
        <td><strong>Public Communications & Brand</strong></td>
        <td>Agent #4 (Content) & Agent #6 (Social)</td>
        <td>All blog posts, newsletters, and social threads sit in a "Draft" queue. Founder reviews tone and clicks "Publish".</td>
      </tr>
      <tr>
        <td><strong>Gate 4</strong></td>
        <td><strong>Legal & High-Stakes Support</strong></td>
        <td>Agent #17 (Support) & Agent #20 (Legal)</td>
        <td>Refund requests &gt; $100, customer threat of cancellation, or vendor contract signatures automatically freeze and alert founder.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-danger">
    <div class="callout-title">The Golden Rule of AI Delegation</div>
    <p style="margin-bottom: 0; font-size: 8.5pt;">
      <strong>Never delegate the final authority to commit your capital, sign your legal name, or broadcast to your entire audience.</strong> Let your AI employees do 99% of the heavy computational and drafting labor, and preserve the final 1% for human judgment, taste, and risk verification.
    </p>
  </div>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 21</span>
  </div>
</div>
`;
