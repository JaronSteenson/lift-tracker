# AGENTS.md
## Project Overview
Lift Tracker is a Vue.js SPA with a .NET Core API backend for tracking workout programs and sessions. 
The project uses Vue 3 with Vuetify 3 for UI, TanStack Query for server and shared app state, and integrates with Auth0 for authentication.

## Development Philosophy
This is a non-commercial sandbox. 
Prioritize experimentation and rapid feature delivery over strict architectural consistency.

## UX Philosophy
Prioritise 'Optimistic UI' and perceived performance. 
The frontend should act as the source of truth; 
use autosave and skeletons to eliminate wait states. 
Frontend speed and 'feel' take precedence over strict backend-driven data ownership.

Prefer small, intentional UI feedback over noisy status churn.
For save indicators, smooth rapid optimistic saves and hide secondary text on constrained mobile layouts when the screen is already busy.

## Tech Stack
- Frontend: Vue 3.5, Vuetify 3.7, tanstack/vue-query 5.92, Vue Router 4.5
- Build: Vite, Node.js 22
- Backend: .NET 9, ASP.NET Core, Entity Framework Core with MySQL
- Authentication: Auth0
- Testing: Vitest (frontend), xUnit (.NET)

## Development Commands
### Frontend (.NET API)
```shell
# Testing
npm run test

# Linting
npm run lint-fix
```

### Backend (.NET API)
```bash
# Testing
cd LiftTrackerApi && dotnet test

# Database migrations
cd LiftTrackerApi
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update
ASPNETCORE_ENVIRONMENT=Test dotnet ef database update
dotnet ef migrations add MigrationName
```

## Architecture
### Frontend Structure
- `resources/js/app.js` - Entry point, Vue app initialization
- `resources/js/components/` - Vue components organized by domain:
  - `pages/` - Route components
  - `domain/programBuilder/` - Program builder functionality
  - `domain/workoutSessions/` - Workout session components
  - `formFields/` - Reusable form components
- `resources/js/api/` - API service classes
- `resources/js/router/` - Vue Router configuration

### Backend Structure
- `LiftTrackerApi/Controllers/` - API controllers
- `LiftTrackerApi/Entities/` - EF Core entities and DbContext
- `LiftTrackerApi/Dtos/` - Dtos
- `LiftTrackerApi/Services/` - Business logic services
- `LiftTrackerApi/Middleware/` - Custom middleware
- `LiftTrackerApi/Migrations/` - EF Core migrations

### Key Patterns
- API services use consistent naming (e.g., `WorkoutProgramService.js`)
- Controllers follow RESTful conventions
- Entity Framework uses code-first approach with migrations
- Frontend uses domain-driven component organization
- Server state and shared app state live in TanStack Query
- Prop drilling or provide/inject is acceptable to avoid reintroducing store-level complexity
- Prefer `<script setup>` for new Vue components and conversions unless there is a strong reason not to
- For route-aware components, prefer `useRoute()` / `useRouter()` over instance access patterns

#### TanStack Query
- Domain mutations and queries should live in composables next to the domain (`programBuilderQueries.js`, `workoutSessionQueries.js`)
- Prefer optimistic cache updates for program builder and workout session flows
- If a save indicator or other UI state needs to observe mutations started from multiple components, use a shared `mutationKey` plus `useIsMutating` / `useMutationState`
- If the UI is driven by one local mutation instance only, reading that local mutation state directly is acceptable
- Prefer query cache state over local storage for active session or save-state behavior

#### Frontend State Boundaries
- Do not reintroduce store-based state containers for program builder, workout sessions, or auth flows
- Do not add new local-only or local-storage persistence flows for programs/sessions without explicit direction
- `ServerSyncInfo` should stay dumb; derive `status` / `updatedAt` in an adapter composable instead of passing raw query objects into the component

#### Dtos
- Canonical example LiftTrackerApi/Dtos/WorkoutSessionDto.cs
- Always use plain classes
- Always leave all setters and getters
- Parent-child relationships should flow downward in DTOs
- Child collections can be embedded on the parent DTO
- Upward relationships should be represented only by the parent GUID/UUID on the child DTO when needed
- Avoid embedding full parent DTOs on child DTOs
- If a child-focused response needs a parent-derived display field, flatten that field onto a dedicated DTO instead of forcing the frontend to traverse back up the graph
- Always add the following ReSharper disable block before the namespace
```csharp
// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
```

## Configuration
### Frontend Config
- Copy `config.development.json` to `config.json` for Auth0 setup
- Frontend runs through Vite

### Backend Config  
- `appsettings.json` - Production config
- `appsettings.Development.json` - Development config
- `appsettings.Test.json` - Test environment config

## Testing
### Frontend Tests
- Vitest runner
- Dedicated test dir resources/js/test, with .spec files
- Component testing testing-library/vue
  - Prefer wider, human-realistic tests over small units
  - Dedicated unit tests are ok for pure functions
- Vue Test Utils is also used heavily for component/spec coverage
- When mocking query composables, keep mocks in sync with newly added named exports to avoid false-negative failures
- Prefer updating shared test helpers when introducing new app-wide providers like Vue Query plugins

### Backend Tests
- xUnit framework in `LiftTrackerApi.Tests/`
- Integration tests for controllers
- Uses test database configuration
