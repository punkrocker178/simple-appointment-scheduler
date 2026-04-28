# AGENTS.md

## 1. Project Overview

The universal scheduler is a Nuxt 4 application that provides digital appointment booking between customers and dealership. The Frontend application guides the user through selecting a vehicle, service type, and desired date, then presents only valid appointment slots based on Backend availability checks.

## 2. Build & Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Starts the dev server on `http://localhost:3000` with hot module replacement.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Generate Static Pages
```bash
npm run generate
```

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Linting code
```bash
npm run lint
```

### Format Code
<!-- TODO: fill in manually -->
Verify how code is formatted in this project. ESLint may be configured with formatting rules, or a separate formatter may be needed.

## 3. Code Style & Conventions

**Language / Runtime:**
- TypeScript with Nuxt 4 strict mode
- Node.js (ESM modules via `"type": "module"`)

**Linter:**
- ESLint with `@nuxt/eslint` for Nuxt-specific rules
- Config: `eslint.config.mjs` (flat config format)
- Run with: `npx eslint .` (or add npm script)

**Key Rules:**
- No explicit constraints found; verify in ESLint config or team guidelines

## 4. Repository Structure

```
app/                     — main Vue application files
  app.vue                  — root component
public/                  — static assets (robots.txt, etc.)
test/                    — Vitest unit tests (structure TBD)
.nuxt/                   — Nuxt build output (generated, do not commit)
eslint.config.mjs        — ESLint configuration (flat config)
nuxt.config.ts           — Nuxt configuration
tsconfig.json            — TypeScript configuration references
vitest.config.ts         — Vitest test runner configuration
```

## 5. Environment Setup

**Environment Variables:**
<!-- TODO: fill in manually --> No `.env.example` or environment variables detected yet. Add variables as the project grows (e.g., `NUXT_API_URL`, `NUXT_PUBLIC_*` for Nuxt runtime config).

**Setup Instructions:**
1. Run `npm install` to install dependencies
2. Create `.env` if needed: `cp .env.example .env` (when added)
3. Fill in required values
4. Run `npm run dev` to start development

## 6. Important Constraints

- **Do not commit** `.env`, `.env.local`, or any files containing secrets
- **Open a PR** rather than pushing directly to `main`
- **Test coverage:** Run `npm test` before submitting changes to ensure tests pass
- **TypeScript:** All files should maintain type safety; run type-check via Nuxt build process

---

### Generated on: April 28, 2026

This file was auto-generated to assist AI agents and contributors in understanding the project structure and development workflow.