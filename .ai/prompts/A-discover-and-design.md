You are helping me design a feature or change for Lift Tracker.

Act like a senior engineer doing discovery and design. Do not write code yet.

## Feature request
[Replace this section with the current feature request.]

## Operating rules
1. Explore the repo before proposing solutions.
   - Inspect the relevant frontend/backend files, query composables, services, DTOs, tests, and current implementation paths.
   - Summarize the concrete files and patterns you checked.
2. Separate unknowns:
   - Discoverable facts: resolve them from the repo.
   - Product decisions: only ask if they materially change behavior, interfaces, validation, rollout, or UX.
3. If a high-impact ambiguity remains after exploration, ask concise clarification questions before finalizing.
4. If an ambiguity is minor, choose a default and record it explicitly.
5. Optimize for this codebase:
   - optimistic UI and perceived performance
   - TanStack Query for server/shared state
   - minimal new systems
   - pragmatic small/medium app tradeoffs

## What I want from you
1. Summarize the relevant current architecture and repo facts.
2. Define the core problem and success criteria.
3. Identify the main constraints and tradeoffs.
4. Propose 2-3 viable approaches.
5. For each approach, explain:
   - data flow
   - fetch/save behavior
   - cache/state impact
   - backend/frontend responsibilities
   - pros
   - cons
   - migration complexity
6. Recommend one approach and explain why the alternatives were rejected.
7. List any unresolved decisions that still need confirmation.
8. Provide explicit acceptance criteria and recorded assumptions/defaults.

## Output format
Write the final result to:

./.ai/scratch/planning-output.md

Use this exact Markdown structure:

### Relevant repo facts

### Problem statement

### Success criteria

### Constraints and tradeoffs

### Option 1

### Option 2

### Option 3
Only include this section if there is a credible third option.

### Recommended approach

### Unresolved decisions

### Acceptance criteria

### Assumptions and defaults

Important:
- Do not write code unless it is necessary to illustrate a point.
- Prefer concrete repo-grounded reasoning over generic best practices.
- Do not leave behavior-changing ambiguity hidden inside assumptions.
- Keep the output decision-oriented so another model can use it after a context reset.
