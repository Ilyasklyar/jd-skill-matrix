# JD → Skill Matrix

Parses job descriptions into a structured JSON "skill matrix" with a short summary. Works with or without an AI API key.

## Features
- Paste job description and click **Analyze**
- JSON output with **Copy** button
- Fallback parser if no AI key
- Zod validation and inline error messages

## Tech
- Next.js + TypeScript
- TailwindCSS
- Zod
- Jest (unit tests for fallback parser)

## Setup
```bash
git clone https://github.com/Ilyasklyar/jd-skill-matrix.git
cd jd-skill-matrix
npm install
npm run dev
npm test
