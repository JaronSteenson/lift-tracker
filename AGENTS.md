# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lift Tracker is a Vue.js SPA with a .NET Core API backend for tracking workout programs and sessions. The project uses Vue 3 with Vuetify 3 for UI, Pinia for state management, and integrates with Auth0 for authentication.

**Tech Stack:**
- Frontend: Vue 3.5, Vuetify 3.7, Pinia 2.2, Vue Router 4.5
- Build: Laravel Mix with Webpack, Node.js 14.19.1
- Backend: .NET 9, ASP.NET Core, Entity Framework Core with MySQL
- Authentication: Auth0
- Testing: Jest (frontend), xUnit (.NET)

## Development Commands

### Frontend (Vue App)
```bash
# Use specific Node version
nvm use 14.19.1

# Install dependencies
npm install

# Development server with hot reload
npm run hot

# Development server (standard)
npm run dev

# Production build
npm run prod

# Bundle analysis
npm run prod-size

# Testing
npm test
npm run test-watch

# Linting
npm run lint
npm run lint-fix
```

### Backend (.NET API)
```bash
# Development server
cd LiftTrackerApi && dotnet run

# Testing
cd LiftTrackerApi && dotnet test

# Database migrations
cd LiftTrackerApi
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update
ASPNETCORE_ENVIRONMENT=Test dotnet ef database update
dotnet ef migrations add MigrationName

# Code formatting
dotnet tool restore
dotnet csharpier format . && dotnet csharpier format ../LiftTrackerApi.Tests
dotnet csharpier check . && dotnet csharpier check ../LiftTrackerApi.Tests
```

## Architecture

### Frontend Structure
- `resources/js/app.js` - Entry point, Vue app initialization
- `resources/js/components/` - Vue components organized by domain:
  - `pages/` - Route components
  - `domain/programBuilder/` - Program builder functionality
  - `domain/workoutSessions/` - Workout session components
  - `formFields/` - Reusable form components
- `resources/js/stores/` - Pinia store modules:
  - `app.js` - Global app state
  - `programBuilder.js` - Program creation/editing
  - `workoutSession.js` - Active workout sessions
- `resources/js/api/` - API service classes
- `resources/js/router/` - Vue Router configuration

### Backend Structure
- `LiftTrackerApi/Controllers/` - API controllers
- `LiftTrackerApi/Entities/` - EF Core entities and DbContext
- `LiftTrackerApi/Services/` - Business logic services
- `LiftTrackerApi/Middleware/` - Custom middleware
- `LiftTrackerApi/Migrations/` - EF Core migrations

### Key Patterns
- API services use consistent naming (e.g., `WorkoutProgramService.js`)
- Controllers follow RESTful conventions
- Entity Framework uses code-first approach with migrations
- Frontend uses domain-driven component organization
- State management centralized in Pinia with domain-specific stores

## Configuration

### Frontend Config
- Copy `config.development.json` to `config.json` for Auth0 setup
- Webpack dev server runs on port 8081
- Uses Laravel Mix for build configuration

### Backend Config  
- `appsettings.json` - Production config
- `appsettings.Development.json` - Development config
- `appsettings.Test.json` - Test environment config

## Testing

### Frontend Tests
- Jest with Vue Test Utils
- Test files: `resources/js/test/**/*.spec.js`
- Some legacy tests marked with `.skip` suffix

### Backend Tests
- xUnit framework in `LiftTrackerApi.Tests/`
- Integration tests for controllers
- Uses test database configuration

## Important Notes

- Node.js version 14.19.1 is required (use nvm)
- Frontend uses Vue 3 with Composition API support
- Backend uses .NET 9 with Entity Framework Core
- Code formatting enforced: ESLint + Prettier (frontend), CSharpier (backend)
- TreatWarningsAsErrors enabled for .NET project