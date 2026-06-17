# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Training materials for auditors (biegli rewidenci) on the Polish Commercial Companies Code (Kodeks Spółek Handlowych, KSH). It contains:

- `index.html` — a self-contained single-page learning app (no build system, no dependencies)
- Three PDF files (script, presentation, exercises) and one XLSX exercises workbook

## Running the app

Open `index.html` directly in a browser. No server, no npm, no build step.

## Architecture of index.html

The file is one large HTML/CSS/JS file. All data is hardcoded in JavaScript objects at the top of the `<script>` block:

| Object | Purpose |
|---|---|
| `cards` | Main learning cards — one per company type or transaction |
| `keyArticles` | KSH article references keyed by `card.id` |
| `factBasis` | Legal basis strings for each fact label per card |
| `legalProfiles` | Thesis, elements, and traps for legal analysis per card |
| `lawRefs` | Tag → tooltip text for legal term pills |
| `articleTexts` | Article number → summary text for hover chips |
| `questions` | Quiz questions with correct answer and distractors |
| `legalCases` | Case study scenarios with checklist |
| `kshGuideTopics` | Guide topics organized by KSH title/part |

**State** is managed in plain globals (`activeId`, `currentPage`, `mode`, `seen`, `quizIndex`, `caseIndex`, `activeGuideId`).

**Rendering** is done by setting `content.innerHTML` with template strings — no virtual DOM or framework. The `render()` function dispatches to `renderLearn()`, `renderQuiz()`, `renderCompare()`, `renderCase()`, or `renderGuide()` based on current state.

The two top-level pages are toggled via `currentPage`: `"review"` (flashcard/quiz/compare/case modes) and `"guide"` (KSH statutory guide).

## Adding content

- **New company type or transaction card**: add an object to `cards`, then populate entries in `keyArticles`, `factBasis`, `legalProfiles`, and optionally `lawRefs`/`articleTexts`.
- **New KSH guide topic**: add to `kshGuideTopics` with the correct `part`, `range`, and `articles` array. Add article summaries to `articleTexts` if not already present.
- **New quiz question**: add to `questions` with `q`, `a` (correct answer string), and `o` (array of 3 options including the correct one).
- **New case study**: add to `legalCases` with `title`, `facts`, `question`, `answer`, and `checklist`.

## File naming convention

Document files use Polish descriptive names following the pattern:  
`typ_Kodeks_spółek_handlowych_w_pracy_biegłego_rewidenta_2025.ext`

Keep filenames stable once shared externally.
