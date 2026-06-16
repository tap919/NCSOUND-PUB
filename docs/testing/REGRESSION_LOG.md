# Regression Log

Every bug fix must add a regression test. Log entries below.

| Date | Bug ID | Description | Component | Test File | Fix Commit |
|---|---|---|---|---|---|
| 2026-06-12 | N/A | Home page crash: Play is not defined (missing import) | Home | `src/pages/__tests__/Home.test.tsx` | `09f317a` |
| 2026-06-12 | N/A | GlobalPlayer shows mock data when no track loaded | GlobalPlayer | `src/components/__tests__/GlobalPlayer.test.tsx` | `d481657` |
| 2026-06-12 | N/A | BeatStore play button removed (beats for sync only) | BeatStore | `src/pages/__tests__/BeatStore.test.tsx` | `d481657` |
| 2026-06-12 | N/A | Featured tracks crash: stale mock data on Home | Home | `src/pages/__tests__/Home.test.tsx` | `d481657` |
| 2026-06-12 | N/A | Home JSX parse error: missing div wrapper | Home | `src/pages/__tests__/Home.test.tsx` | `09f317a` |
