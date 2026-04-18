Write a detailed implementation spec based on option [n] from: ./.ai/scratch/planning-output.md

Do NOT write any code. This spec will be executed by another model, so it must be explicit, unambiguous, and step-by-step.

Place the final spec in:

./.ai/scratch/implementation-spec.md

# Requirements

Your spec must include:

1. Summary
   Brief description of the goal
   What is changing and why
2. Scope
   What is included
   What is explicitly NOT included
3. Assumptions
   Any assumptions made from the plan
   Call out uncertainties
4. Affected Areas 
   List specific files or areas of the codebase: ./path/to/file.ts (what role it plays)
Group by frontend / backend if applicable
5. Step-by-Step Implementation Plan
   Ordered, atomic steps
   Each step should:
   describe the change
   reference files
   be independently executable
   Avoid large, vague steps
6. Data Flow / Architecture Changes
   How data fetching, saving, and routing behave after changes
   Highlight differences from current behavior
7. Edge Cases
   List important edge cases
   Include failure scenarios
8. Testing Plan
   What needs to be tested
   Manual vs automated
   Key scenarios to validate
9. Risks
   Potential breakages or regressions
   Migration risks
10. Rollback / Safety
    How to revert if something goes wrong
    Constraints
    Do NOT invent large new systems unless explicitly required
    Prefer minimal, incremental changes
    Be concrete and specific (file-level where possible)
    If something is unclear, state assumptions instead of guessing
    Output Format

Use the exact section headings above.
Do not include code unless absolutely necessary for clarity.
