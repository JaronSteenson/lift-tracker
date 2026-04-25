Execute the implementation spec located at:

./.ai/scratch/implementation-spec.md

Follow the spec. Do not redesign the solution unless the current repo proves the spec is wrong or incomplete.

## Before editing
1. Re-ground in the repo.
   - Confirm the target files still exist.
   - Confirm the current implementation still matches the spec closely enough to proceed.
2. If the spec and repo materially disagree, stop and report the mismatch before making changes.
3. If the spec leaves a correctness-critical gap, stop and report it before making changes.

## Execution rules
- Work step-by-step in spec order.
- Keep changes small, safe, and incremental.
- Preserve existing behavior unless the spec explicitly changes it.
- Do not introduce new systems or architecture beyond the spec.
- Do not perform git add, commit, or push unless separately asked.

## For each step
Before editing:
- State the step goal.
- List the files you will modify.
- Note any spec-to-repo alignment checks that matter for this step.

During editing:
- Make the minimum changes needed to satisfy the step.
- If the repo forces a deviation, stop and explain it before continuing.

After editing:
- Confirm what was completed.
- Note follow-ups, side effects, or residual risk.

## Verification
Run the checks required by the repo instructions for the files you changed.

- If frontend files changed:
  - run `npm run lint-fix`
  - if lint changes files, review the diff
  - run `npm run test`
- If backend files changed:
  - run `cd LiftTrackerApi && dotnet test`
- If both changed, run both relevant verification flows.

Summarize actual results, not just the commands.

## Final output
Include:
- a concise summary of implemented changes
- verification results
- any manual follow-up or residual risks
- any spec drift or assumptions that were resolved during execution

Use this per-step structure:

Step X: [step name]

Goal
...

Files

./path/to/file.ts

Notes
...
