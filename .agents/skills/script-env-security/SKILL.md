---
name: script-env-security
description: Best practices for managing environment variables, secrets, and script execution in this repository. Use whenever creating, editing, or running utility, seed, maintenance, or test scripts.
---

# Script & Environment Security Guidelines

## 1. Zero Hardcoding Rule
- **Never** hardcode MongoDB connection strings (`mongodb+srv://...`), Redis URIs (`rediss://...`), Cloudinary keys, JWT/Admin secrets, or SMTP credentials directly in script files.
- Always use `process.env.<VARIABLE_NAME>`.

## 2. Dynamic Environment Loading in Standalone Scripts
When writing or running a standalone Node.js or TypeScript script (e.g. in `scripts/` or scratch directory), dynamically load `.env.local` instead of hardcoding:

```javascript
const fs = require('fs');

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  if (fs.existsSync('.env.local')) {
    const content = fs.readFileSync('.env.local', 'utf8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return undefined;
}

const mongoUri = getEnv('MONGODB_URI');
const redisUrl = getEnv('REDIS_URL');
```

## 3. Git & .gitignore Protection
- All helper/scratch scripts and directories (`scripts/`, `./scripts/*`, `temp*`) must remain in `.gitignore`.
- Always verify `git status` before committing to ensure no sensitive files or scripts are staged.
