# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Setup and Build
```bash
# Enable corepack (required for pnpm)
corepack enable

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific parts
pnpm build:backend   # Backend only
pnpm build:frontend  # Frontend only
pnpm build:nodes     # Node packages only
```

### Development
```bash
# Start development mode (auto-rebuild on changes)
pnpm dev

# Development variants
pnpm dev:be          # Backend only
pnpm dev:fe          # Frontend only
pnpm dev:ai          # AI/LangChain focused

# Start production build
pnpm start

# Start with tunnel support
pnpm start:tunnel
```

### Testing
```bash
# Run all tests
pnpm test

# Test categories
pnpm test:backend    # Backend tests
pnpm test:frontend   # Frontend tests
pnpm test:nodes      # Node tests

# Database-specific tests (in packages/cli)
pnpm test            # SQLite (default)
pnpm test:postgres   # PostgreSQL
pnpm test:mysql      # MySQL
pnpm test:mariadb    # MariaDB

# Coverage
COVERAGE_ENABLED=true pnpm test

# E2E tests (requires pnpm cypress:install first)
pnpm test:e2e:ui     # Interactive with built UI
pnpm test:e2e:dev    # Interactive in dev mode
pnpm test:e2e:all    # Headless run

# Run single test file
pnpm test -- path/to/test.spec.ts
```

### Code Quality
```bash
# Format code
pnpm format
pnpm format:check

# Lint
pnpm lint
pnpm lintfix

# Type checking
pnpm typecheck
```

## Architecture Overview

### Monorepo Structure
n8n uses pnpm workspaces with Turborepo. Key packages:

- **`/packages/cli`**: Main backend application, REST API, webhook handling
- **`/packages/core`**: Workflow execution engine (contact n8n team before modifying)
- **`/packages/editor-ui`**: Vue 3 frontend workflow editor
- **`/packages/workflow`**: Shared interfaces and workflow logic
- **`/packages/nodes-base`**: Built-in integration nodes
- **`/packages/@n8n/*`**: Scoped utility packages (db, config, api-types, etc.)

### Key Architectural Patterns

**Dependency Injection**: Custom DI container in `@n8n/di` used throughout backend:
```typescript
@Service()
export class MyService {
  constructor(private readonly otherService: OtherService) {}
}
```

**Workflow Execution**: Event-driven architecture with:
- `WorkflowExecute` class orchestrates execution
- Nodes implement `INodeType` interface
- Each node execution gets `IExecuteFunctions` context

**Node System**: Plugin-based architecture:
- Nodes in `/packages/nodes-base/nodes/`
- Each node exports class implementing `INodeType`
- Credentials implement `ICredentialType`

**Database**: TypeORM entities in `/packages/@n8n/db/src/entities/`:
- Supports SQLite, PostgreSQL, MySQL, MariaDB
- Migrations in `/packages/@n8n/db/src/migrations/`

**Frontend**: Vue 3 with Pinia stores:
- Component library in `@n8n/design-system`
- Router-based navigation
- WebSocket for real-time updates

### Development Workflow

1. **Making Changes**: 
   - Run `pnpm dev` for auto-rebuild
   - Backend restarts automatically
   - Frontend hot-reloads

2. **Adding Dependencies**:
   - Add to specific package: `pnpm add <package> --filter=<workspace>`
   - Run `pnpm install` from root after changes

3. **Creating Nodes**:
   - Use `packages/node-dev` CLI tool
   - Follow existing node patterns in `nodes-base`
   - Include workflow tests

4. **Database Changes**:
   - Create migration in appropriate database folder
   - Test with all supported databases

5. **Testing Requirements**:
   - Unit tests required for all logic
   - Workflow tests for nodes
   - No `ts-ignore` allowed
   - Follow existing test patterns

### Common Pitfalls

- Always run `pnpm build` before `pnpm start` after pulling changes
- Stop dev server before running E2E tests (port conflicts)
- Use absolute imports with `@/` in frontend code
- Database tests may require local database setup
- Cypress tests need `pnpm cypress:install` first run

### API and Webhook Development

- REST API routes in `/packages/cli/src/`
- Webhook handling in `/packages/cli/src/webhooks/`
- Use decorators for route definitions
- Follow existing middleware patterns