Read the recommended approach in:

./.ai/scratch/planning-output.md

Turn it into a decision-complete implementation spec.

Do NOT write code. This spec will be executed by another model after a context reset, so it must stand on its own.

Place the final spec in:

./.ai/scratch/implementation-spec.md

## Operating rules
1. Restate the chosen approach and accepted assumptions at the top.
2. Close any remaining unresolved decisions before finalizing.
   - If a missing decision would materially change correctness, call it out as blocking.
   - Otherwise choose a default and record it explicitly.
3. Be specific about behavior, interfaces, validation, and persistence.
4. Prefer minimal, incremental changes that fit the existing codebase.
5. Use exact repo-relative paths where possible.

## Requirements

Your spec must include:

1. Summary
   - What is changing and why
   - Intended user outcome

2. Chosen approach and assumptions
   - Recommended option being implemented
   - Defaults chosen
   - Remaining blockers, if any

3. Scope and non-goals
   - What is included
   - What is explicitly not included

4. Public interfaces and contract changes
   - API routes/payloads
   - DTO/entity/type changes
   - frontend query/mutation/data-shape changes
   - validation and persistence rules

5. Behavioral rules and defaults
   - Exact runtime behavior
   - Edge-case decisions
   - Error handling expectations
   - Any ordering, precedence, fallback, or state-transition rules

6. Affected areas
   - Specific files or areas of the codebase and what role each plays
   - Group by frontend/backend if applicable

7. Ordered implementation steps
   - Atomic steps that can be executed in order
   - For each step include:
     - Preconditions
     - Concrete change
     - Files
     - Expected result
     - Dependencies on prior steps

8. Acceptance criteria
   - Observable conditions that define done

9. Test plan
   - Automated tests to add/update
   - Manual verification
   - Key happy paths, regressions, and failure cases

10. Risks and rollback
    - Likely breakages or migration risks
    - How to back out safely if needed

## Output format
Use the exact section headings above.
Do not include code unless it is necessary for clarity.
This spec must be strong enough that a fresh model can implement it without access to the planning conversation.
