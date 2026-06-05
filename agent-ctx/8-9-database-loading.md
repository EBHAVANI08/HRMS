# Task 8-9: Load Jobs & Candidates from Real Database via API

**Agent:** Z.ai Code
**Date:** 2026-03-05
**Status:** ✅ Completed

## What was done

Modified `enhanced-recruitment.tsx` to load data from real database via API instead of hardcoded mock arrays.

## Key Changes

### State Initialization
- `candidates` state: `useState<Candidate[]>(MOCK_CANDIDATES)` → `useState<Candidate[]>([])`
- `jobs` state: `useState<JobPosting[]>(MOCK_JOBS)` → `useState<JobPosting[]>([])`
- Added `dataLoading` state for tracking API load status

### Data Loading (loadData function)
1. Seeds skill ontology via `POST /api/recruitment/skill-ontology/seed` (separate useEffect)
2. Loads jobs from `GET /api/recruitment/jobs`
3. If DB empty, seeds MOCK_JOBS via POST requests, then reloads
4. Falls back to MOCK_JOBS if API still empty
5. Loads candidates from `GET /api/recruitment/candidates`
6. Falls back to MOCK_CANDIDATES if API returns empty

### API Response Mapping
- Jobs: strip `_count`, `createdAt`, `updatedAt` from API response
- Candidates: strip `job` relation, `createdAt`, `updatedAt`; parse `scoreBreakdown`/`timeline` if still strings

### Subcomponents Updated
- `ResumeAnalyzerTab`: added `jobs: JobPosting[]` prop
- `BatchAnalysisTab`: added `jobs: JobPosting[]` prop
- `PipelineTab`: added `jobs: JobPosting[]` prop
- All `MOCK_JOBS` references in component logic replaced with `jobs` prop/state

### Build Verification
- `npx next build` — ✅ Successful
- `bun run lint` — ✅ No errors

## Files Modified
- `src/components/recruitment/enhanced-recruitment.tsx`
- `worklog.md`
