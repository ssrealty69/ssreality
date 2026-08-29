<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:environment-security-rules -->
# Environment & Script Security Rules

1. **NEVER Hardcode Secrets or Database URIs**:
   - Never write raw database connection strings (e.g., `mongodb+srv://`, `rediss://`), API keys, passwords, or secret tokens inside scripts or code files.
   - Always access configuration via environment variables using `process.env.MONGODB_URI`, `process.env.REDIS_URL`, etc.
   - For standalone Node / TypeScript scripts, load `.env.local` dynamically or parse it into `process.env` at runtime.

2. **Git Security & Ignore Policy**:
   - Always ensure `scripts/`, `./scripts/*`, and local scratch scripts remain untracked in `.gitignore`.
   - Never commit environment files (`.env*`, `.env.local*`) or temporary scratch files (`temp*`).

3. **ONLY Use `.env.local` — NEVER Use `.env`**:
   - Always read configuration and environment variables from `.env.local` exclusively.
   - NEVER create, read, reference, or use a `.env` file. Only `.env.local` is allowed.
<!-- END:environment-security-rules -->

