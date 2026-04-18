You are helping me design the 531/progression schemes.

Your job is to act like a senior engineer doing an architecture review and implementation plan, not to jump straight into coding.

## Rough plan/goal
We are adding the concept of progression schemes to the system and one scheme 531 based on Jim wendler 531 program.

Program exercises will have a new drop down option, "Progression scheme" with two options None, 531.

In the database this will be a nullable enum on SessionExercise and ProgramExercise
programExercise.weight, becomes "Traning max" in the ui when 531 progrsssion scheme is selected.  When 531 is selected a  531ProgressionSchemeSettings component will display, this will house a dropdwon "Current cycle week" with the options "Week 1: The "5s" Week (3x5+) ", "Week 2: The "3s" Week (3x3+) " , "Week 2: The "3s" Week (3x3+) " , "Week 4: The Deload Week" .
Upper body (2.5kg increase per cycle) or Lower body (5kg increase per cycle) drop donw.   
A projection for the entire cycle will be displayed also, I'm hoping this math is in your traning data or I can supply the equations round to the nearest weight plate (2.5kg), with all planned/previous reps and weights for the cycle. When the 531 settings are shown reps id disabled, this should be driven by a single point static config, rather than messy if 531 disable reps, more like if progssionScheme.handlesReps, and progressionScheme.weightLabel.

The 531 settings excluding the projections (these are readily calculated, for display here and starting the workout) are saved in a single json database column on programExercise "progressionSchemeSettings".

Start workout checks for progression schemes on each builder exercise, and determines if we need to populate weight and reps based on it. Again this should use the  progressionScheme same helper js object that holds handlesReps and weightLabel, it will defer the poulation of these fields to it. The start processing can remain in the front end for now, it may move to the backend at some stage, but it's not hurting anyone where it is currently.

On workout end the backend will need to have check for the existence of progressionScheme on every sessionExercise. We will create a simple ProgressionScheme strategy pattern system similar to the front end one used for projections and will advance source programExercise to the next cycle week, if it is on the deload week (last cycle step), it loops back to week one, but and increases the "Weights"/"Traning max" by 2.5kg if marked upperBody, or 5kg if marked lowerBody. This is fine to happen inline on the request, we do not need fire and forget or a queue.


I am open to multiple approaches/variations of what I have roughly proposed. I want the best balance of simplicity, correctness, maintainability, and UX.

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

Use this exact structure in a Markdown file: ./.ai/scratch/planning-output.md

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
