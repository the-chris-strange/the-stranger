---
name: write-tests
description: Coordinate practical unit and end-to-end test writing in this Nx workspace. Use when the user asks to add, write, improve, or increase unit tests, e2e tests, integration coverage, regression tests, or test coverage for project code. Uses an orchestrator agent to plan and manage testing work, and worker sub-agents to implement disjoint test-writing tasks.
---

# Write Tests

## Overview

Use an orchestrator-led workflow for test-writing work. The main agent stays responsible for final integration, review, validation, and user communication; the orchestrator agent manages risk inventory, scope decomposition, worker prompts, and coverage gaps; worker sub-agents write tests in disjoint file areas.

Before running Nx commands, read `$nx-workspace` if project or target discovery is needed, and read `$nx-run-tasks` if running test, lint, build, or e2e targets. Prefer `yarn nx ...` in this workspace unless current files prove another package manager is required.

## Workflow

1. Inspect the user request and identify whether the task is unit, e2e, integration, coverage-focused, or regression-focused.
2. Spawn one orchestrator agent using `multi_agent_v1.spawn_agent` with `agent_type: "default"` and a prompt based on `references/orchestrator-agent.md`.
3. Continue local non-overlapping discovery while the orchestrator works: inspect touched files, existing test patterns, package manager, and likely Nx project targets.
4. Use the orchestrator's plan to spawn worker sub-agents with `agent_type: "worker"` for disjoint write scopes. Pass each worker the relevant slice of `references/test-worker.md`.
5. Review worker changes before integrating. Reject brittle tests, speculative requirements, broad implementation rewrites, unrelated formatting churn, and tests that over-mock behavior into fiction.
6. Run the narrowest relevant Nx test target first, then broaden only as risk warrants. Include lint/typecheck/e2e validation when changed files or target conventions make them relevant.
7. Fix obvious failures when the fix is clearly within the requested testing scope. If production code appears wrong, explain the mismatch before changing it.
8. Summarize added coverage, commands run, remaining gaps, and any high-risk areas intentionally left untested.

## Orchestrator Contract

Ask the orchestrator to produce a compact testing plan, not code. It should:

- Build a lightweight risk inventory.
- Identify candidate coverage areas and rank them by confidence value.
- Split work into independent worker tasks with explicit file ownership.
- Specify likely Nx projects and targets to validate.
- Call out possible blockers, fixture needs, and risky assumptions.
- Keep the worker prompts small enough that each worker can act without rediscovering the entire repo.

Use `references/orchestrator-agent.md` as the base prompt. Add request-specific details such as changed files, target project, user constraints, and any existing failures.

## Worker Contract

Each worker should implement tests directly in its assigned forked workspace and report changed files. Tell workers:

- They are not alone in the codebase and must not revert edits made by others.
- Their write scope is limited to named test files, fixtures, and the smallest production refactor needed for testability.
- They must follow nearby test style and existing helpers before introducing new patterns.
- They must run the narrowest relevant Nx command when feasible and report exact commands and outcomes.
- They must stop and report if the requested test would require inventing behavior or making broad production changes.

Use `references/test-worker.md` as the base worker prompt. Assign non-overlapping ownership, such as separate projects, separate feature areas, separate spec files, or unit versus e2e coverage.

## Testing Priorities

Prioritize confidence over volume:

1. Low-hanging core behavior: business logic, public APIs, data transformations, auth/authorization paths, and user flows that are already structured cleanly enough to test.
2. Predictable misuse: invalid inputs, missing required fields, incorrect argument types, misconfigured environment variables, failed network/API calls, async timing/state issues, empty states, and null handling.
3. Plausible edge-adjacent behavior: boundary values, retry behavior, partial failures, realistic concurrency, serialization/deserialization, and unusual but valid state transitions.
4. True edge cases only when failure would be expensive, destructive, historically fragile, safety-critical, or cheap to cover.

Avoid brittle implementation-coupled tests, low-value snapshots, speculative requirements, and exhaustive permutations that do not improve confidence.

## Nx Validation

Prefer commands through Nx:

```bash
yarn nx show project <project> --json
yarn nx run <project>:test --skip-nx-cache
yarn nx run <project>:e2e --skip-nx-cache
yarn nx run <project>:lint --skip-nx-cache
yarn nx run <project>:typecheck --skip-nx-cache
```

Never guess unfamiliar Nx flags. Check `--help`, `$nx-workspace`, `$nx-run-tasks`, or Nx docs before using them.

When a single spec file is supported by the existing target, run it first. If a target does not support file-level filtering, use the narrowest project-level Nx target.

## Resources

- `references/orchestrator-agent.md`: Base prompt for the testing orchestrator agent.
- `references/test-worker.md`: Base prompt for worker sub-agents that write tests.
