You are helping me design the [FEATURE]

Your job is to act like a senior engineer doing an architecture review and implementation plan, not to jump straight into coding.

## Goal

I want to evaluate whether I should {low-level-details}.
This may involve:

* [1]
* [2]
* [3]

I am open to multiple approaches. I want the best balance of simplicity, correctness, maintainability, and UX.

## Current context

[PASTE YOUR CURRENT ARCHITECTURE HERE]

Include:

* [1]
* [2]
* [3]
* 
## Specific problem

[DESCRIBE THE PAIN CLEARLY]

Examples:

* [1]
* [2]
* [3]

## What I want from you

Please do the following in order:

1. Summarize the current architecture and the core design problem.
2. Identify the main constraints and tradeoffs.
3. Propose 3 viable approaches, including:

    * minimal-change approach
    * frontend-leaning approach
    * API/backend-involved approach
4. For each approach, explain:

    * how routing would work
    * how fetch would work
    * how save would work
    * impact on cache/state management
    * pros
    * cons
    * migration complexity
5. Recommend one approach and explain why.
6. Provide a phased implementation plan.
7. Call out risks, edge cases, and what to test.

## Output format

Use this exact structure in a Markdown file: ./.ai./scratch/planning-output.md

### Current architecture summary

### Core problem

### Constraints and tradeoffs

### Option 1

### Option 2

### Option 3

### Recommended approach

### Implementation plan

### Risks and test cases

Important:

* Do not write code yet unless it is necessary to illustrate a point.
* Prefer concrete reasoning over generic best practices.
* If there is ambiguity, make the most reasonable assumptions and state them explicitly.
* Optimize for a small/medium personal fitness app, not enterprise complexity.
