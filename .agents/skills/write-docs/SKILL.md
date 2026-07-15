---
name: write-docs
description: Coordinate practical documentation writing in this Nx workspace. Use when the user asks to add, write, improve, update, or review README files, API documentation, public usage docs, contributor-facing docstrings, JSDoc comments, generated docs guidance, or documentation coverage. Uses an orchestrator agent to plan documentation work and dedicated worker sub-agents for README, docstring/JSDoc, and API documentation tasks.
---

# Write Docs

## Overview

Use an orchestrator-led workflow for documentation work. The main agent stays responsible for final integration, review, validation, and user communication; the orchestrator agent scopes the documentation audience and split; dedicated worker sub-agents write README, docstring/JSDoc, and API documentation in disjoint areas.

Before running Nx commands, read `$nx-workspace` if project or target discovery is needed, and read `$nx-run-tasks` if running lint, typecheck, build, or documentation targets. Prefer `yarn nx ...` in this workspace unless current files prove another package manager is required.

## Workflow

1. Inspect the user request and identify documentation type: peer-facing README, contributor-facing docstrings/JSDoc, user-facing API docs, generated docs, or mixed documentation coverage.
2. Spawn one orchestrator agent using `multi_agent_v1.spawn_agent` with `agent_type: "default"` and a prompt based on `references/orchestrator-agent.md`.
3. Continue local non-overlapping discovery while the orchestrator works: inspect target package README files, exported APIs, package manifests, schema files, existing JSDoc, and relevant Nx targets.
4. Use the orchestrator's plan to spawn worker sub-agents with `agent_type: "worker"` for disjoint write scopes:
   - README worker: use `references/readme-worker.md`.
   - Docstring/JSDoc worker: use `references/docstring-worker.md`.
   - API documentation worker: use `references/api-worker.md`.
5. Review worker changes before integrating. Reject speculative behavior, stale examples, unverified commands, excessive prose, broad unrelated rewrites, and documentation that contradicts source code.
6. Run the narrowest relevant validation first, then broaden only as risk warrants. Prefer Markdown lint, package lint, typecheck, tests, or docs generation when configured through Nx.
7. Fix obvious documentation failures when the fix is clearly in scope. If source behavior appears unclear or wrong, explain the mismatch before changing production code.
8. Summarize documentation added, audience covered, commands run, remaining gaps, and any unverified assumptions.

## Orchestrator Contract

Ask the orchestrator to produce a compact documentation plan, not prose drafts. It should:

- Identify audiences: peers choosing or using a package, contributors reading code, and end users consuming public APIs.
- Inventory source-of-truth files: README files, package exports, public entry points, schemas, examples, tests, existing JSDoc, and generated documentation config.
- Split work into independent worker tasks with explicit file ownership.
- Specify which worker prompt to use for each task.
- Identify validation commands and docs that must stay synchronized.
- Call out assumptions, missing examples, and source behavior that needs confirmation.

Use `references/orchestrator-agent.md` as the base prompt. Add request-specific details such as changed files, target project, user constraints, and known documentation gaps.

## Worker Contracts

Each worker should edit directly in its assigned forked workspace and report changed files. Tell workers:

- They are not alone in the codebase and must not revert edits made by others.
- Their write scope is limited to named files, exported symbols, package docs, or documentation type.
- They must inspect source code before documenting behavior.
- They must follow nearby documentation style before introducing a new structure.
- They must run the narrowest relevant validation command when feasible and report exact commands and outcomes.
- They must stop and report if accurate documentation requires inventing behavior or making broad source changes.

Assign non-overlapping ownership, such as separate README files, separate exported entry points, separate JSDoc files, or README versus API docs.

## Documentation Priorities

Prioritize correctness and usefulness over volume:

1. Public surface: exported APIs, package entry points, generator/executor schemas, CLI usage, and user-facing examples.
2. Peer-facing package context: purpose, installation, usage, configuration, build/test commands, and important tradeoffs.
3. Contributor-facing source context: non-obvious intent, invariants, constraints, errors, and extension points.
4. Reference completeness only when it avoids repeated source spelunking or supports generated docs.

Avoid documenting private implementation trivia, obvious code, unverified commands, unsupported options, and examples that are not grounded in current source.

## Workspace Style

Keep README files concise. Existing package READMEs usually start with the package name, a short purpose statement, and only the sections needed for real usage, such as Installation, Usage, Configurations, Building, and Running Unit Tests.

Keep JSDoc imperative and compact. In TypeScript, omit types from `@param` and `@returns` tags because the code already carries them. Use examples only when purpose or usage is not obvious.

Keep API docs user-facing: document stable imports, options, return values, errors, and examples. Do not promise internal behavior that is not part of the package's public contract.

## Nx Validation

Prefer commands through Nx:

```bash
yarn nx show project <project> --json
yarn nx run <project>:lint --skip-nx-cache
yarn nx run <project>:typecheck --skip-nx-cache
yarn nx run <project>:test --skip-nx-cache
yarn nx run <project>:build --skip-nx-cache
```

Never guess unfamiliar Nx flags. Check `--help`, `$nx-workspace`, `$nx-run-tasks`, or Nx docs before using them.

## Resources

- `references/orchestrator-agent.md`: Base prompt for the documentation orchestrator agent.
- `references/readme-worker.md`: Base prompt for peer-facing README workers.
- `references/docstring-worker.md`: Base prompt for contributor-facing JSDoc/docstring workers.
- `references/api-worker.md`: Base prompt for user-facing API documentation workers.
