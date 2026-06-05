# Kam HRMS/ATS — HireMind AI Integration Worklog

**Date:** 2026-03-05
**Engineer:** Z.ai Code
**Project:** Kam Global HRMS/ATS

---

## Summary

Integrated a comprehensive **HireMind AI Engine** — a 12-agent resume analysis system — into the existing Kam Global HRMS/ATS platform. The engine uses an LLM provider abstraction layer that supports both Ollama (when available) and z-ai-web-dev-sdk (default working backend).

---

## Task 1: Prisma Schema — New Models ✅

Added 4 new models to `prisma/schema.prisma` (without removing any existing models):

- **Job** — Full job posting with title, department, location, type, status, skills (JSON), requirements (JSON), responsibilities (JSON), benefits (JSON), experienceLevel, etc.
- **Candidate** — Candidate profile linked to a Job, with stage tracking, scoreBreakdown (JSON), timeline (JSON), resumeText, resumeFileName, etc.
- **AIAnalysis** — Stores all 12 agent results as JSON fields, plus overallScore, shortlistDecision, confidence, provider, model.
- **RAGDocument** — For future RAG document storage (resume, JD, skill taxonomy, knowledge base) with content and embedding vectors.

**Migration:** `npx prisma db push` — Successfully pushed to SQLite.

---

## Task 2: HireMind AI Engine ✅

Created `/home/z/my-project/src/lib/ai/hiremind-engine.ts` (~650 lines):

### Architecture:
1. **LLM Provider Abstraction** — `LLMProvider` interface with `OllamaProvider` and `ZAISDKProvider`
2. **12 Focused Agent Methods** — Each agent uses targeted prompts (NOT massive JSON system prompts):
   - Agent 1: `parseResume()` — Resume parser
   - Agent 2: `detectDomain()` — Domain classifier
   - Agent 3: `detectSeniority()` — Seniority level detector
   - Agent 4: `expandSkills()` — Skill abbreviation expander
   - Agent 5: `parseJD()` — Job description parser
   - Agent 6: `matchJob()` — JD-candidate matching engine
   - Agent 7: `analyzeAchievements()` — Achievement quality analyzer
   - Agent 8: `calculateATS()` — ATS compatibility scorer
   - Agent 9: `analyzeGaps()` — Skill gap analyzer
   - Agent 10: `suggestImprovements()` — Resume improvement advisor
   - Agent 11: `predictInterviews()` — Interview prediction
   - Agent 12: `generateRecruiterInsights()` — Recruiter insight generator
3. **RAG Pipeline** — TF-IDF based document retrieval (no external vector DB)
4. **Skill Abbreviation Expansion** — 150+ abbreviations mapped to full forms (ML→Machine Learning, NLP→Natural Language Processing, etc.)
5. **Master Orchestrator** — `fullAnalysis()` runs all 12 agents sequentially, calculates weighted overall score

### Key Features:
- `OllamaProvider`: Calls `http://127.0.0.1:11434/api/chat` with configurable model
- `ZAISDKProvider`: Uses `z-ai-web-dev-sdk` chat.completions.create() (server-side only)
- Auto-fallback: If Ollama is unavailable, falls back to z-ai-web-dev-sdk
- `safeParseJSON()`: Robust JSON extraction from LLM responses (handles markdown code blocks, partial JSON)
- Singleton pattern via `getHireMindEngine()`

---

## Task 3: API Routes ✅

Created 6 new API routes:

1. **`/api/recruitment/jobs/route.ts`** — GET (list with filters), POST (create)
2. **`/api/recruitment/jobs/[id]/route.ts`** — GET, PUT, DELETE single job
3. **`/api/recruitment/candidates/route.ts`** — GET (list with filters), POST (create with job verification)
4. **`/api/recruitment/candidates/[id]/route.ts`** — GET, PUT, DELETE single candidate
5. **`/api/recruitment/hiremind-analyze/route.ts`** — POST: Run full 12-agent analysis, save to AIAnalysis table
6. **`/api/recruitment/hiremind-analyze/[id]/route.ts`** — GET: Retrieve saved analysis results

All routes:
- Use `import { db } from '@/lib/db'` for Prisma client
- Handle JSON serialization/deserialization for JSON string fields
- Include proper error handling and validation
- The hiremind-analyze route builds JD text from job record, finds/creates candidates, and updates match scores

---

## Task 4: Fix .docx Resume Parsing ✅

Enhanced `/home/z/my-project/src/app/api/recruitment/parse-resume/route.ts`:

### Changes:
1. **Multi-strategy DOCX parsing** via `parseDocx()` function:
   - Strategy 1: `mammoth.extractRawText()` — most reliable
   - Strategy 2: `mammoth.convertToHtml()` + HTML stripping — sometimes gets content that extractRawText misses
   - Strategy 3: JSZip XML fallback — parses `word/document.xml`, `header1.xml`, `header2.xml`, `footer1.xml`, `footnotes.xml`, `endnotes.xml`, `comments.xml`
   - Strategy 4: Binary text extraction — last resort
2. **Proper mammoth import handling** — handles both `module.default` and direct export
3. **Added `parseMethod` to response metadata** — helps debug which strategy succeeded
4. **Better error logging** — warns instead of errors for each failed strategy

---

## Task 5: Fix New Job Button + Enhance Form ✅

### Fix:
- Added `key={editingJob?.id ?? "new"}` to `CreateEditJobDialog` to force remount when editingJob changes, ensuring proper state reset
- Removed the problematic `useEffect` that called setState within an effect (React 19 lint violation)
- Initial state is now computed from props during render

### Enhancements:
1. **Skill auto-suggestions** — New input with dropdown showing AI/ML domain skills (50+ suggestions including Python, ML, NLP, Docker, etc.)
2. **Skill tags** — Selected skills shown as removable Badge tags instead of list of inputs
3. **Enter key support** — Press Enter to add a skill
4. **Click-to-remove** — Click a skill tag to remove it
5. **Skills default changed** — From `[""]` to `[]` (empty array) for cleaner UX

---

## Task 6: Update Enhanced Recruitment Component ✅

### Changes to `enhanced-recruitment.tsx`:

1. **New `AIAnalysisData` interface** — Comprehensive type for AI analysis results including skillExpansion, atsScore, gapAnalysis, recruiterInsights, interviewPrediction
2. **Updated `Candidate` interface** — Added optional `aiAnalysis?: AIAnalysisData | null`
3. **AI/ML Skill Suggestions constant** — 50+ suggestions for the job creation form
4. **Data loading from API** — `loadJobsFromDB()` and `loadCandidatesFromDB()` called on mount, with mock data fallback
5. **Job save persists to API** — `handleSaveJob` now POST/PUTs to API routes
6. **AI Analysis state** — New `aiAnalysisOpen`, `aiAnalysisCandidate`, `aiAnalysisResult`, `aiAnalysisLoading` states
7. **`handleRunAIAnalysis()`** — Calls `/api/recruitment/hiremind-analyze` API, updates candidate scores
8. **Brain icon button on candidate table** — Each candidate row has an AI analysis trigger button
9. **Candidate Detail Dialog enhanced** — Shows:
   - "Run HireMind AI Analysis" button if no analysis
   - Shortlist decision badge
   - Recruiter insights (green flags, red flags, one-line summary)
   - Skill expansion (ML → Machine Learning)
   - ATS score breakdown
   - Gap analysis (critical gaps)
   - Interview prediction (likelihood, expected rounds)
10. **HireMind AI Analysis Dialog** — Full-featured dialog with:
    - Loading state showing all 12 agents with spinners
    - Overall score with skills/experience breakdown
    - Skill expansion cards with related skills
    - Matched/missing skills grid
    - Recruiter insights with green/red flags
    - Gap analysis with bridging steps
    - Interview prediction with expected rounds
    - ATS compatibility score with recommendations
    - Provider and confidence info

---

## Task 7: Ollama Startup Script ✅

Created `/home/z/my-project/scripts/start-ollama.sh`:

- Checks for Ollama installation
- Sets `LD_LIBRARY_PATH` for bundled libraries
- Starts Ollama server on `0.0.0.0:11434`
- Waits for server with retry logic (10 retries)
- Pulls `qwen2.5:0.5b` model automatically
- Provides clear error messages if Ollama is unavailable
- Notifies user that HireMind falls back to z-ai-web-dev-sdk

---

## Files Created/Modified

### New Files:
- `src/lib/ai/hiremind-engine.ts` — HireMind AI engine (650+ lines)
- `src/app/api/recruitment/jobs/route.ts` — Jobs CRUD API
- `src/app/api/recruitment/jobs/[id]/route.ts` — Single job API
- `src/app/api/recruitment/candidates/route.ts` — Candidates CRUD API
- `src/app/api/recruitment/candidates/[id]/route.ts` — Single candidate API
- `src/app/api/recruitment/hiremind-analyze/route.ts` — HireMind analysis API
- `src/app/api/recruitment/hiremind-analyze/[id]/route.ts` — Analysis retrieval API
- `scripts/start-ollama.sh` — Ollama startup script

### Modified Files:
- `prisma/schema.prisma` — Added Job, Candidate, AIAnalysis, RAGDocument models
- `src/app/api/recruitment/parse-resume/route.ts` — Enhanced DOCX parsing
- `src/components/recruitment/enhanced-recruitment.tsx` — AI analysis integration, DB-backed data, skill suggestions

---

## Brand Compliance
- Primary Orange: #FF9900 — Used for primary actions, AI buttons, analysis highlights
- Secondary Blue: #0066CC — Used for skill expansion badges, ATS scores, secondary actions
- No gradients mixing orange and blue
- Solid colors only

---

## Technical Notes
- z-ai-web-dev-sdk is used ONLY on the server side (API routes/lib), never in client components
- The HireMind engine auto-detects available LLM providers and falls back gracefully
- All JSON fields in SQLite are stored as strings and parsed/serialized in API routes
- Mock data is preserved as fallback when API is unavailable
- The existing `resume-engine.ts` and `glassbox-engine.ts` are NOT modified — HireMind runs parallel
