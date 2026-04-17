Execute the implementation spec located at:

./.ai/scratch/implementation-spec.md

Follow the spec exactly. Do NOT redesign or introduce new approaches unless absolutely necessary.

# Execution Rules
Work step-by-step, following the order defined in the spec
Do NOT batch large unrelated changes
Prefer small, safe, incremental edits
Preserve existing behavior unless a step explicitly changes it
If something is unclear or missing, STOP and ask instead of guessing
For EACH step

# Before making changes:

Explain the goal of the step
List the files that will be modified

Then:
3. Show the proposed changes per file
4. Explain why the change is correct

After:
5. Confirm what was completed
6. Note any side effects or follow-ups

# File Handling
- Use exact repo-relative paths (e.g. ./src/...)
- Do not create new files unless specified in the plan
- Do not rename or move files unless explicitly instructed

# Constraints
- Do NOT write placeholder or pseudo code
- Do NOT skip steps
- Do NOT “optimize” beyond the plan
- Keep changes minimal and consistent with existing patterns
- If you edit frontend files, run `npm run lint-fix` after code changes are complete and before finalizing
- If `npm run lint-fix` changes files, review the diff and rerun relevant JS tests before final output

After completing all steps:

Summarize all changes made
List anything that needs manual verification
Highlight potential regressions or risks
Output Format

For each step:

Step X: [step name]

Goal
...

Files

./path/to/file.ts

Changes
[diff-style or clear code edits]

Notes
