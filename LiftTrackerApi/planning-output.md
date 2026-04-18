### Current architecture summary

The current shape is a nested builder-to-session copy model.

- Program builder data lives on `RoutineExercise` in the backend and in the workout-program query cache on the frontend. Today the planned training fields are `weight`, `restPeriod`, `warmUp`, and `numberOfSets`.
- Starting a workout is a frontend-driven transform in `resources/js/domain/createSessionFromBuilderWorkout.js`. It copies builder exercise values into a new `WorkoutSessionDto`, including:
  - `RoutineExercise.weight -> SessionExercise.plannedWeight`
  - `RoutineExercise.warmUp -> SessionExercise.warmUpDuration`
  - `RoutineExercise.weight -> SessionSet.weight`
  - `RoutineExercise.restPeriod -> SessionSet.restPeriodDuration`
- Session editing is already optimistic and query-cache centric. `useUpdateWorkoutSession()` mutates the full cached workout session locally, then saves the whole session payload through `PUT /api/workout-sessions`.
- Routing is already stable for this feature. Builder editing happens inside the existing program builder route and modal flow. Session entry/editing happens inside:
  - `/program-builder/:workoutProgramUuid`
  - `/workout-session/:workoutSessionUuid`
  - `/workout-session/:workoutSessionUuid/set/:sessionSetUuid/:fromCheckIn?`
- Stats/history fetch uses `GET /api/session-exercises/history/:uuid`, returning `SessionExerciseStatsDto` with nested `SessionSetDto[]`. The history modal already graphs weight, reps, and rest from `sessionSets`.

Assumptions I am making:

- `plannedRpe` means planned/default RPE, not live auto-derived exertion.
- RPE should behave like weight semantically: planned in the builder, copied into the session when the workout starts, then editable per set during the workout.
- "Graph it like reps after reps" means add an RPE sparkline/values section in the session history modal immediately after the reps section.
- No new page or route is needed.

### Core problem

You need to add RPE without breaking the current "frontend is the source of truth during the session" model.

The real design decision is not routing. It is where the canonical planned/default value should live and how much of the existing session-copy pattern RPE should reuse:

- builder-level default only
- session-exercise planned default plus session-set actual value
- or some backend-driven normalization that makes the copy rules more explicit

Because the app already copies planned training fields from builder to session and then edits the session optimistically, RPE should fit that same lifecycle unless there is a strong reason to treat it differently.

### Constraints and tradeoffs

- The app already has a clear split between builder defaults and session execution. Adding RPE outside that pattern would create a one-off field model.
- Session UI speed matters more than backend purity. Any approach that requires extra fetches or non-optimistic save handling is a mismatch.
- Mobile layout is the real constraint. Weight and reps currently share a two-column first row in `SetOverview.vue`. Adding RPE there can either preserve density or improve readability depending on layout choice.
- The builder currently edits a whole `WorkoutProgram` object optimistically. Adding a field there is cheap if it stays inside that payload.
- Session updates currently save the entire workout session object, not isolated set patches. That reduces API surface growth but means DTO/entity parity matters.
- Stats/history already operate on nested `SessionSetDto` values. If RPE is stored only on `SessionExercise`, graphing per-set history becomes awkward and semantically lossy.
- DB type:
  - `int?` is simpler, matches the dropdown, and keeps mapping friction low.
  - enum adds semantic clarity, but in this app it is mostly ceremony unless you expect special RPE values beyond `null` and `1..10`.
- Validation matters because dropdowns can still be bypassed via API payloads. If you use `int?`, you should still enforce `null or 1..10`.

Viable approaches:

1. Minimal-change approach
   Store `Rpe` only on `SessionSet`, and store builder default on `RoutineExercise` as `Rpe`. Do not add `plannedRpe` to `SessionExercise`.
2. Frontend-leaning approach
   Store builder default on `RoutineExercise.rpe`, add `SessionExercise.plannedRpe`, and add `SessionSet.rpe`. Keep the copy logic primarily in `createSessionFromBuilderWorkout.js` and continue saving full optimistic session payloads.
3. API/backend-involved approach
   Same data shape as approach 2, but move the builder-to-session copy/defaulting rules into backend session creation/update logic so the API becomes the canonical source for RPE propagation.

### Recommended approach

Recommend the frontend-leaning approach: add builder-level `RoutineExercise.Rpe`, session-level `SessionExercise.PlannedRpe`, and set-level `SessionSet.Rpe`, with `int?` in the database and DTOs.

Why this is the best fit:

- It matches the existing architecture exactly. Weight already has a planned value on `SessionExercise` and an actual value on `SessionSet`.
- It gives the session screen a stable planned/default field without forcing every UI consumer to infer the intended RPE from the first set.
- It keeps workout start instant and optimistic because the existing frontend session factory already performs this copy work.
- It supports history graphing correctly because actual recorded RPE lives on `SessionSet`.
- It avoids unnecessary new endpoints or route changes.
- It keeps backend changes straightforward: entity/DTO/migration mapping only, plus validation.

How the three approaches compare:

#### Approach 1: Minimal-change

Routing:

- No route changes.
- Builder continues to use the existing modal in the program builder route.
- Session continues to use the existing set overview route.

Fetch:

- Workout program fetch includes `RoutineExercise.rpe`.
- Workout session fetch includes `SessionSet.rpe`.
- No `SessionExercise.plannedRpe`, so any session UI that wants the default RPE must infer it from builder source or first-set data.

Save:

- Builder save remains whole-program optimistic save through `PUT /api/workout-programs`.
- Session save remains whole-session optimistic save through `PUT /api/workout-sessions`, but only `sessionSets[].rpe` changes during workout.

Impact on cache/state management:

- Lowest cache surface change.
- Slightly worse session-state ergonomics because the default/planned RPE does not exist in the session cache as its own field.

Pros:

- Smallest backend and DTO change set.
- Smallest migration.
- Fastest to build.

Cons:

- Breaks the pattern you explicitly asked for: no `plannedRpe` on `SessionExercise`.
- Makes planned/default RPE harder to display in session-level summaries.
- If you later want "planned vs actual RPE" comparisons, you will have to add `plannedRpe` anyway.

Migration complexity:

- Low.
- New nullable `rpe` column on `RoutineExercises` and `SessionSets`, DTO updates, frontend form changes.

#### Approach 2: Frontend-leaning

Routing:

- No route changes.
- Builder uses existing `EditExerciseModal`.
- Session uses existing `SetOverviewPage` and history modal.

Fetch:

- Existing workout-program fetch returns `RoutineExercise.rpe`.
- Existing workout-session fetch returns both `SessionExercise.plannedRpe` and `SessionSet.rpe`.
- Existing exercise-history fetch returns `SessionSet.rpe` via `SessionExerciseStatsDto -> SessionSetDto[]`.

Save:

- Builder save remains whole-program optimistic save.
- Workout start copies:
  - `RoutineExercise.rpe -> SessionExercise.plannedRpe`
  - `RoutineExercise.rpe -> each SessionSet.rpe` as the initial default
- Session save remains whole-session optimistic save through the existing `useUpdateWorkoutSession()` helpers.
- Add a focused frontend helper like `updateSetRpe(sessionUuid, setUuid, rpe)` for parity with weight/reps.

Impact on cache/state management:

- Clean fit with current TanStack Query setup.
- Only adds fields to existing cached objects.
- No new query keys, no new fetch sequence, no new invalidation model.

Pros:

- Matches the current data lifecycle and UX philosophy.
- Easy to reason about in the UI: planned/default on exercise, actual on set.
- Supports history graphing and future planned-vs-actual UI.
- Keeps implementation local and low-risk.

Cons:

- Copy logic remains duplicated in the frontend session factory rather than centralized server-side.
- Requires touching both builder and session DTO/entity layers.

Migration complexity:

- Medium-low.
- New nullable `rpe` column on `RoutineExercises`.
- New nullable `plannedRpe` column on `SessionExercises`.
- New nullable `rpe` column on `SessionSets`.
- DTO mapper and frontend payload changes.

#### Approach 3: API/backend-involved

Routing:

- No route changes.

Fetch:

- Same fetch shape as approach 2 once persisted.
- The difference is that the backend, not the frontend, becomes responsible for ensuring `plannedRpe` and seeded set `rpe` values are present when a session is created.

Save:

- Builder save stays the same.
- Workout start can send a thinner session creation payload, or the current full payload, but backend creation logic enforces/corrects RPE propagation from source exercises.
- Session updates still save through `PUT /api/workout-sessions`; backend may normalize missing set RPE values from `plannedRpe`.

Impact on cache/state management:

- Cache structure can stay the same.
- But optimistic assumptions become slightly less trustworthy if the backend is doing silent normalization on create/update and the client intentionally ignores returned session payloads during in-session updates.

Pros:

- Copy/defaulting rules are centralized on the server.
- Better long-term protection if multiple clients ever create sessions.

Cons:

- More moving parts than this app needs right now.
- Fights the current frontend-first architecture.
- Higher risk of client/server drift during optimistic session editing unless you also change how successful session saves refresh cache.

Migration complexity:

- Medium.
- Same schema changes as approach 2 plus backend creation/update logic changes and more careful testing around optimistic consistency.

Concrete UI recommendation within approach 2:

- Builder:
  - Add `RPE` before `Rest period` and after `Warm-up` or after `Weight`, depending on which feels more natural in the existing modal. Given your note, I would place it before rest and warm-up only if you also want the exercise prescription fields grouped as `Weight / Sets / RPE / Warm-up / Rest`.
  - In the exercise card blurb, do not force RPE into the summary text unless it stays readable. Weight and set count are still the higher-signal summary.
- Session set screen:
  - Put `RPE` after `Reps`.
  - On mobile, use three stacked full-width fields for `Weight`, `Reps`, and `RPE` rather than trying to keep three cramped half-width controls in one row. This is slower vertically but better for the main target screen size.
  - On `sm` and up, a 3-column row is fine.
- History modal:
  - Add `RPE` immediately after `Reps` using the same sparkline/value rendering pattern.

### Implementation plan

Phase 1: Data model and payload shape

1. Add nullable `int` RPE fields to the model:
   - `RoutineExercise.Rpe`
   - `SessionExercise.PlannedRpe`
   - `SessionSet.Rpe`
2. Update `LiftTrackerDbContext` mappings for the new columns.
3. Add DTO fields:
   - program payloads will expose `rpe` through the existing entity serialization path for `WorkoutProgram`
   - `SessionExerciseDto.PlannedRpe`
   - `SessionExerciseStatsDto.PlannedRpe`
   - `SessionSetDto.Rpe`
4. Update `WorkoutSessionDtoMapper` so fetch responses include the new fields.
5. Create the EF migration.

Phase 2: Session creation/copy behavior

1. Update `createSessionFromBuilderWorkout.js` so workout start copies:
   - `builderExercise.rpe -> sessionExercise.plannedRpe`
   - `builderExercise.rpe -> each created sessionSet.rpe`
2. Update tests around workout creation to cover:
   - builder exercise with `rpe`
   - builder exercise with `null` rpe
   - empty workout fallback path

Phase 3: Builder UI

1. Add an RPE dropdown to `EditExerciseModal.vue` with options:
   - `N/A -> null`
   - `1..10`
2. Persist it through the existing `updateExercise()` optimistic save path.
3. Consider whether to show RPE in `ExerciseCard.vue`.
   - My recommendation: only show it if weight is absent or if you can fit a compact secondary row cleanly. Do not overpack the card.

Phase 4: Session UI

1. Add an RPE dropdown to `SetOverview.vue`.
2. Add a composable mutation helper parallel to `updateSetWeight` and `updateSetReps`, likely `updateSetRpe`.
3. Keep save-on-blur / save-on-change behavior aligned with the existing optimistic pattern.
4. Adjust the mobile layout so `Weight`, `Reps`, and `RPE` are full width on xs and compressed only on larger screens.

Phase 5: History/stats

1. Update `SessionExerciseHistoryModal.vue` to compute `rpe` from `sessionSets`.
2. Render an `RPE` section immediately after `Reps`.
3. Decide how to display `null` values:
   - recommended: graph as `0` only if you clearly label `N/A` in the textual row, otherwise the graph becomes misleading
   - better option: render textual `N/A` values and only show sparkline when at least one numeric RPE exists

Phase 6: Validation and cleanup

1. Add backend validation so RPE is either `null` or `1..10`.
2. Audit any blank-exercise validation logic so an exercise with only RPE is treated consistently with other training fields.
3. Run:
   - `npm run lint-fix`
   - relevant frontend tests
   - `dotnet test`

### Risks and test cases

Main risks:

- Null vs zero confusion. RPE uses `N/A`, so `0` should not become a stored value accidentally through dropdown coercion or chart fallback.
- Frontend numeric coercion. `VSelect` can return strings unless configured carefully; make sure the persisted value is `null` or integer.
- History graph distortion. If `null` is converted to `0` for sparklines, the chart can imply very easy sets rather than "not recorded".
- Inconsistent planned vs actual semantics. If the user edits set RPE, the exercise-level `plannedRpe` should usually remain unchanged.
- Blank routine validation. `WorkoutProgramController.IsBlankRoutineExercise()` currently considers only name, sets, weight, rest, and warm-up. If RPE is added as a valid prescription field, that method should include it or a legitimate "RPE-only" exercise could be rejected.
- Mobile density. A third input on the set screen can make the main flow worse if forced into the existing 2-column row.

Edge cases to test:

- Builder exercise with `RPE = N/A` starts a session with `plannedRpe = null` and all seeded sets `rpe = null`.
- Builder exercise with `RPE = 8` starts a session with `plannedRpe = 8` and all seeded sets `rpe = 8`.
- Editing builder RPE after sessions already exist does not retroactively change old sessions.
- Session user changes one set from planned RPE to another; other sets remain unchanged.
- Session user clears a previously set RPE back to `N/A`.
- History modal shows mixed RPE values including nulls without misleading graph output.
- Existing sessions/programs without RPE still fetch and render cleanly after migration.
- `PUT /api/workout-sessions` rejects invalid RPE values like `0`, `11`, or non-numeric payloads.
- `PUT /api/workout-programs` accepts `null` and `1..10` and preserves them through a round trip.
- Set overview navigation, previous/next set logic, and autosave indicators still behave normally when RPE is edited rapidly.

If you want, the next step should be turning this recommended approach into a concrete change list by file, but I would not change code until you confirm the exact UI placement decision for builder and mobile set layout.
