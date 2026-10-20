module.exports = `
<!-- CHAPTER 5 -->
<div class="page">
  <div class="page-header">
    <span>Chapter 5</span>
    <span>Guardrails & Operational Quality Control</span>
  </div>

  <span class="chapter-number">CHAPTER 05</span>
  <h1 class="chapter-title">Guardrails, Context Rot & Quality Audits</h1>

  <p class="lead">
    How to safeguard your business against hallucination cascades, runaway API bills, and prompt drift as your autonomous operations scale.
  </p>

  <h2>5.1 Combating Context Rot: The Stateless Architecture</h2>
  <p>
    The most pervasive misconception among novice AI operators is that an AI employee should have an endless, running conversation thread that continues for months.
  </p>
  <p>
    In reality, as a conversation window swells with thousands of tokens of chat history, models suffer from <strong>Context Rot</strong>. Attention mechanisms become diluted, instructions provided in message #1 are superseded by noise in message #40, and the agent begins to output hallucinated garbage or enter infinite repetitive loops.
  </p>

  <div class="card card-dark">
    <h3 style="margin-top: 0; color: #38bdf8;">The Stateless Execution Model</h3>
    <p style="font-size: 8.5pt; color: #cbd5e1; margin-bottom: 6px;">
      Professional AI employees are engineered to be <strong>fundamentally stateless</strong>. Every single execution begins fresh with a clean slate:
    </p>
    <ol style="margin: 6px 0 6px 18px; font-size: 8pt; color: #cbd5e1;">
      <li><strong>Immutable System Prompt:</strong> The agent's static identity, core rules, and JSON output schema.</li>
      <li><strong>Dynamic Just-in-Time Context:</strong> Only the specific task payload + relevant vector search results retrieved from the Company Knowledge Vault.</li>
      <li><strong>Execution & Termination:</strong> The agent completes the task, outputs the payload, saves results to the database, and terminates execution. Zero conversational baggage persists into the next run.</li>
    </ol>
  </div>

  <h2>5.2 The "Critic-Agent" Audit Loop</h2>
  <p>
    Never allow a generative agent to publish or execute without an independent evaluation layer. In high-leverage workflows, implement the <strong>Producer-Critic Pattern</strong>:
  </p>

  <div class="flow-container">
    <div class="flow-step">
      <div class="flow-step-num">Step 1: Producer</div>
      <div class="flow-step-title">Agent #10 (Copy)</div>
      <p style="font-size: 7pt; color: #64748b; margin: 2px 0 0 0;">Drafts 50 personalized outreach emails</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step" style="background: #fffbeb; border-color: #fde68a;">
      <div class="flow-step-num" style="color: #b45309;">Step 2: Critic / Auditor</div>
      <div class="flow-step-title" style="color: #92400e;">Agent #20 (Compliance)</div>
      <p style="font-size: 7pt; color: #92400e; margin: 2px 0 0 0;">Audits claims against Company Vault</p>
    </div>
    <div class="flow-arrow">&rarr;</div>
    <div class="flow-step">
      <div class="flow-step-num">Step 3: Verification</div>
      <div class="flow-step-title">Scoring Gate</div>
      <p style="font-size: 7pt; color: #64748b; margin: 2px 0 0 0;">Score &ge; 95% &rarr; Human Queue; Score &lt; 95% &rarr; Retry</p>
    </div>
  </div>

  <p>
    The Critic Agent does not rewrite the text. It grades the draft against strict binary criteria: <em>Does this email make any false promises? Does it use forbidden words? Is the pricing accurate according to [Vault/02_product_specifications.md]?</em> If any check fails, the task is rejected back to the producer with an exact remediation note.
  </p>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 22</span>
  </div>
</div>

<div class="page">
  <div class="page-header">
    <span>Chapter 5</span>
    <span>Cost Controls & Circuit Breakers</span>
  </div>

  <h2>5.3 Token Budgets, Rate Limits, and Circuit Breakers</h2>
  <p>
    One of the greatest fears of founders building autonomous teams is waking up to an unexpected $5,000 credit card bill caused by an infinite loop between two agents arguing with each other.
  </p>
  <p>
    You can completely eliminate this risk by implementing three structural engineering safeguards:
  </p>

  <table>
    <thead>
      <tr>
        <th>Safeguard</th>
        <th>Mechanism</th>
        <th>Implementation Detail</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Hard Platform Spend Caps</strong></td>
        <td>API Provider Console</td>
        <td>Configure hard billing limits in Anthropic, OpenAI, and OpenRouter consoles. Set monthly limit at $250.00. All API keys instantly disable if reached.</td>
      </tr>
      <tr>
        <td><strong>2. Loop Counter Circuit Breakers</strong></td>
        <td>Orchestration Engine (n8n)</td>
        <td>Every inter-agent workflow includes an incrementing integer <code>iteration_count</code>. If any task loops more than 3 times without resolution, it halts immediately and pings #alerts-dev.</td>
      </tr>
      <tr>
        <td><strong>3. Model Tiering Cascade</strong></td>
        <td>Smart Routing Proxy</td>
        <td>Use lightweight models (Gemini 2.0 Flash or GPT-4o-mini at $0.15/1M tokens) for high-frequency filtering and data extraction. Reserve frontier models (Claude 3.5 Sonnet) only for creative copywriting, complex coding, and strategic analysis.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-warning">
    <div class="callout-title">The "Air-Gapped Keys" Security Policy</div>
    <p style="margin-bottom: 0; font-size: 8.5pt;">
      Never give an AI agent access to your master administrative API credentials. Always generate <strong>scoped, read-only or single-purpose API keys</strong>. For instance, your customer support agent needs read access to Stripe subscriptions, but should never possess the secret key capable of issuing refunds or deleting accounts.
    </p>
  </div>

  <h2>5.4 Disaster Recovery: The Model Redundancy Protocol</h2>
  <p>
    What happens when Anthropic or OpenAI experiences an unexpected service outage? In a traditional setup, your operations grind to a halt.
  </p>
  <p>
    By utilizing an API proxy such as <strong>OpenRouter</strong> or an orchestration switch in n8n, you can configure <em>automatic failover fallbacks</em>. If Claude 3.5 Sonnet returns a 503 error, your orchestration engine automatically routes the payload to GPT-4o or Gemini 1.5 Pro without dropping a single customer conversation or pausing your pipeline.
  </p>

  <div class="page-footer">
    <span>The AI Employee</span>
    <span>Page 23</span>
  </div>
</div>
`;
