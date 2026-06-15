## Git workflow

- Never commit directly to `main`. All work happens on a branch
  (`feat/<slug>`, `fix/<slug>`, `chore/<slug>`).
- **Agents: MANDATORY worktree isolation.** Before touching any file,
  create a dedicated worktree and work exclusively inside it:
  ```
  git worktree add ../hevyier-<slug> -b feat/<slug>
  cd ../hevyier-<slug>
  ```
  Rules to avoid inter-agent conflicts:
  - Slug must be unique (e.g. include task ID or short description).
    Never reuse an existing branch or worktree path.
  - All work — including `npm install`, builds, tests — runs inside
    the worktree dir, not the main checkout.
  - Never edit files in `/home/heitor/hevyier` directly.
  - Never run git ops (commit, fetch, rebase) on a branch another
    agent owns. Coordinate through `main` only.
- Prefer a git worktree per branch (`git worktree add ../hevyier-<slug> <branch>`)
  over switching branches in place — keeps main checkout clean and
  lets parallel work run without stashing.
- Commit early and often. Every commit compiles and passes typecheck.
  Commit after each discrete step — don't batch unrelated changes:
  - types/interfaces added or changed → commit
  - new function or module → commit
  - wiring/integration of existing pieces → commit
  - test added or updated → commit
  - bug fixed → commit
  A feature with 5 steps = 5+ commits. Never accumulate more than
  one logical change before committing.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`,
  `refactor:`, `test:`, `docs:`). Subject ≤50 chars, imperative mood.
  Body explains WHY only when not obvious from the diff.
- **Agents must never merge into `main`** — except in the explicit
  `/review` workflow:
  1. User runs `/review <PR#>`
  2. Agent spawns a subagent to fix any blocking errors found
  3. After fixes are committed and pushed, agent merges via squash:
     ```
     gh pr merge <number> --squash --delete-branch=false
     ```
  Outside that workflow: push the branch and open a PR for the user:
  ```
  git push -u origin feat/<slug>
  gh pr create --title "..." --body "..."
  ```
  Stop after the PR is open. Do not merge, squash, or rebase onto main.
- Merge into `main` only working changes: typecheck, lint, and tests
  green before merging. Broken main blocks everyone.
- Merge via fast-forward or squash-merge. Keep merged branches —
  they track work history. Don't delete them.
- Ask the user before major repository changes (history rewrites,
  force pushes, branch/tag deletion, remote changes). Everything
  else proceeds without asking.
- Tag releases with semver (`v0.1.0`). Bump in `package.json` +
  `app.json` together.

## Releasing

- Releases are signed Android APKs published to GitHub Releases by
  pushing a `v*` tag (`.github/workflows/release.yml`).
- When the user asks to cut/create a release, follow the agent runbook
  in `docs/RELEASING.md` step by step. Do not push a tag without
  confirming the version and passing the preflight checks.

## Running on web

- Web is browser-preview only. **Use `npm run web`** (builds `dist/` +
  serves on `:8085` with cross-origin-isolation headers). Never use
  `expo start --web`, `npm start` → web, or the IDE preview button — the
  dev server can't set COOP/COEP on the top-level document, so
  `SharedArrayBuffer` is unavailable and expo-sqlite's web backend throws.
  Full explanation + troubleshooting in `docs/WEB.md`.

## Code style

- Functions: 4-20 lines. Split if longer.
- Files: under 500 lines. Split by responsibility.
- One thing per function, one responsibility per module (SRP).
- Names: specific and unique. Avoid `data`, `handler`, `Manager`.
  Prefer names that return <5 grep hits in the codebase.
- Types: explicit. No `any`, no `Dict`, no untyped functions.
- No code duplication. Extract shared logic into a function/module.
- Early returns over nested ifs. Max 2 levels of indentation.
- Exception messages must include the offending value and expected shape.

## Comments

- Keep your own comments. Don't strip them on refactor — they carry
  intent and provenance.
- Write WHY, not WHAT. Skip `// increment counter` above `i++`.
- Docstrings on public functions: intent + one usage example.
- Reference issue numbers / commit SHAs when a line exists because
  of a specific bug or upstream constraint.

## Tests

- Tests run with a single command: `<project-specific>`.
- Every new function gets a test. Bug fixes get a regression test.
- Mock external I/O (API, DB, filesystem) with named fake classes,
  not inline stubs.
- Tests must be F.I.R.S.T: fast, independent, repeatable,
  self-validating, timely.

## Dependencies

- Inject dependencies through constructor/parameter, not global/import.
- Wrap third-party libs behind a thin interface owned by this project.

## Structure

- Follow the framework's convention (Rails, Django, Next.js, etc.).
- Prefer small focused modules over god files.
- Predictable paths: controller/model/view, src/lib/test, etc.

## Formatting

- Use the language default formatter (`cargo fmt`, `gofmt`, `prettier`,
  `black`, `rubocop -A`). Don't discuss style beyond that.

## Logging

- Structured JSON when logging for debugging / observability.
- Plain text only for user-facing CLI output.