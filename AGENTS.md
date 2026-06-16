# Repository Guidelines

## Project Structure & Module Organization

This repository is currently organized as a document package for KSH training materials. The root directory contains the deliverables directly:

- `Skrypt_Kodeks_spółek_handlowych_w_pracy_biegłego_rewidenta_2025.pdf` - main script/manual.
- `pdf_prezentacja_Kodeks_spółek_handlowych_w_pracy_biegłego_rewidenta_2025.pdf` - presentation deck exported as PDF.
- `zadania_pyt_Kodeks_spółek_handlowych_w_pracy_biegłego_rewidenta_2025.pdf` - task/question PDF.
- `zadania_Kodeks_spółek_handlowych_w_pracy_biegłego_rewidenta_2025.xlsx` - workbook with exercises or supporting data.

There is no source code, application module layout, or assets directory at present. If editable sources are added later, place them in a clearly named folder such as `src/` or `materials/` and keep generated exports in the root or an `exports/` directory.

## Build, Test, and Development Commands

No build system is configured. Validate files manually before sharing:

- Open each PDF to confirm it renders and pages are in the expected order.
- Open the XLSX file in Excel or LibreOffice to confirm formulas, sheets, and formatting still work.
- Use `Get-ChildItem -Force` to inspect the repository contents on Windows PowerShell.

If conversion scripts or build tooling are added, document the exact commands here and keep generated files reproducible.

## Coding Style & Naming Conventions

For document files, use descriptive Polish names that identify the material type, subject, and year. Prefer consistent separators and avoid ambiguous abbreviations. Example pattern:

`typ_Kodeks_spółek_handlowych_w_pracy_biegłego_rewidenta_2025.ext`

Keep filenames stable once shared externally, because downstream users may rely on them.

## Testing Guidelines

There is no automated test suite. For changes to documents, perform a manual review covering file integrity, visible formatting, page count, table readability, and workbook formulas. When replacing a file, compare it against the prior version and note material differences in the change description.

## Commit & Pull Request Guidelines

Git history was not available from this workspace, so no existing commit convention could be inferred. Use concise, imperative commit messages such as `Update KSH exercise workbook` or `Add revised presentation PDF`.

Pull requests should include a short summary, list changed files, explain whether files are source documents or generated exports, and mention any manual validation performed. Attach screenshots only when a formatting or layout change is important to review.

