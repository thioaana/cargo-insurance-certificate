# Cargo Insurance Certificate - Project Guide

## Project Overview

A web application for managing cargo insurance certificates. Brokers create certificates based on contracts assigned to them. Admins manage contracts and have full access.

### User Roles
- **Admin:** Full access - manage contracts, full CRUD on all certificates
- **Broker:** Create/manage certificates for contracts matching their broker_code

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript 5
- **Auth & Database:** Supabase (@supabase/ssr)
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives + shadcn/ui pattern
- **Icons:** lucide-react
- **Notifications:** react-hot-toast
- **Testing:** Vitest + React Testing Library
- **PDF:** Server-side generation (library TBD)
- **Currency API:** Bank API for exchange rates (TBD)

## Database Schema

### Users (Supabase auth + profiles table)
- `id`: uuid (from auth.users)
- `full_name`: string
- `role`: enum ('admin', 'broker')
- `broker_code`: string

### Contracts
- `id`: uuid
- `contract_number`: string
- `insured_name`: string
- `coverage_type`: string
- `start_date`: date
- `end_date`: date
- `broker_code`: string (links to user's broker_code)
- `sum_insured`: decimal
- `additional_si_percentage`: decimal
- `created_at`, `updated_at`: timestamp

### Certificates
- `id`: uuid
- `certificate_number`: string (format: CERT-YYYY-NNNN)
- `contract_id`: uuid (FK → contracts)
- `insured_name`: string
- `cargo_description`: text
- `departure_country`: string
- `arrival_country`: string
- `transport_means`: string
- `loading_date`: date (must be within contract's start_date - end_date)
- `currency`: string (dropdown populated from Bank API)
- `value_local`: decimal
- `value_euro`: decimal (auto-calculated via API)
- `exchange_rate`: decimal (stored for audit)
- `issue_date`: date
- `created_by`: uuid (FK → users)
- `created_at`, `updated_at`: timestamp

## Business Rules

### Certificate Constraints
1. **Contract must be active:** Can only create certificates for contracts where `loading_date` falls between contract's `start_date` and `end_date`
2. **Loading date validation:** `loading_date` must be within the selected contract's validity period
3. **Value limit:** `value_euro` cannot exceed contract's `sum_insured * (1 + additional_si_percentage / 100)`
4. **Currency required:** Must select currency from Bank API dropdown before entering local value
5. **API dependency:** Certificate creation blocked if Bank API is unavailable

## Development Workflow

### Branch Strategy 
- Work in feature branches, one module at a time
- Branch naming: `feature/<module-name>

#### Plan
- Describe responsibilities and boundaries of the module.
- Define key classes, functions, and their interfaces.
- Identify dependencies on other modules.
- Propose a set of tests (unit/integration) that cover typical, edge, and error cases.
- Present this as a **module plan**. The plan should be a checklist of todo items.
- Check in with me before start working. I will verify the plan.

#### Implement
- Generate code incrementally, function by function or class by class.
- Include comments explaining logic.
- Ensure code follows project conventions and is idiomatic for the language.
- Try to avoid touching unrelated modules/files unless explicitly necessary. Inform in color red.
- Keep every change simple and minimal. Avoid big rewrites.
- Complete the todos one by one, marking them off as you do. 
- At every step, give me a high level explanation of what you changed.
- At the end add a review section in `tasks/todo.md` summarizing the changes.

#### Test
- Generate tests based on the plan.
- Tests must be deterministic, isolated, and readable.
- Use the project’s test framework as reffered below in section Testing.
- Include mocks/stubs for external dependencies where appropriate.

#### Commit / Push Preparation
- Provide a suggested commit message summarizing the module and tests added.
- List any files modified/added.
- Optionally, include notes on limitations or next steps for the module.

### Current Work
- **Module:** User Roles & Profile
- **Branch:** feature/user-roles
- **Status:** implemented (ready for review)

## Module Roadmap

### Completed Modules
1. [x] **Authentication** (`feature/auth`) - MERGED
   - Login with email/password
   - Sign-up with email confirmation
   - Logout functionality
   - Forgot password / password reset
   - Session management via middleware
   - Profile page
   - Files: `app/auth/*`, `lib/supabase/*`, `components/logout-button.tsx`, `middleware.ts`

2. [x] **User Roles & Profile** (`feature/user-roles`) - IN REVIEW
   - Added `profiles` table with role and broker_code (via Supabase SQL)
   - Database trigger auto-creates profile on sign-up
   - Profile page shows role, broker_code, and editable full_name
   - Role-based route protection in middleware (`/admin/*` routes)
   - Admin user management at `/admin/users`
   - Files: `lib/types/profile.ts`, `lib/services/profiles.ts`, `lib/services/auth.ts`, `app/auth/profile/*`, `app/admin/users/*`, `app/unauthorized/*`

### Upcoming Modules

3. [ ] **NavBar Update** (`feature/navbar`)
   - Dynamic navigation based on role
   - Admin sees: Contracts, All Certificates
   - Broker sees: My Certificates
   - Common: Profile, Logout

4. [ ] **Contracts CRUD** (`feature/contracts`)
   - Admin-only access
   - List all contracts
   - Create contract (assign broker_code)
   - Edit contract
   - Delete contract
   - Files: `app/contracts/*`

5. [ ] **Certificates CRUD** (`feature/certificates`)
   - Broker: create/edit/delete own certificates
   - Broker: select from contracts matching their broker_code
   - Admin: full CRUD on all certificates
   - Auto-generate certificate_number (CERT-YYYY-NNNN)
   - Currency conversion via Bank API (blocks if API unavailable)
   - Files: `app/certificates/*`

6. [ ] **PDF Generation** (`feature/pdf`)
   - Server-side PDF generation
   - Download certificate as PDF
   - PDF template design
   - Files: `app/api/pdf/*`, `lib/pdf/*`

## Coding Conventions

### Component Patterns
- **Server Components:** Default for pages and layouts
- **Client Components:** Mark with `"use client"` only when needed (forms, interactivity)
- **Form Pattern:** State for inputs, `handleSubmit`, loading states, inline errors, toast for success

### Service Layer (Server-Side)
- All CRUD operations must go through server-side services
- Create `lib/services/` directory for service modules
- Services use Supabase server client (not browser client)
- Pages/forms call services via Server Actions or API routes
- Pattern: `lib/services/<entity>.ts` (e.g., `contracts.ts`, `certificates.ts`)

### File Structure
```
app/
  <module>/
    page.tsx          # Server component (thin wrapper)
    <name>-form.tsx   # Client component (logic)
    actions.ts        # Server Actions for this module
components/
  ui/                 # Reusable UI primitives
  <ComponentName>.tsx # Feature components
lib/
  supabase/           # Supabase client utilities
  services/           # Server-side CRUD services
    contracts.ts
    certificates.ts
    users.ts
  utils.ts            # Shared utilities
__tests__/            # Mirror app structure
```

### UI Components
- Use existing `components/ui/*` (Button, Card, Input, Label, Checkbox, DropdownMenu)
- Style with Tailwind CSS classes
- Use `cn()` from `lib/utils.ts` for class merging

### Error Handling
- Try-catch in async operations
- Generic user-facing messages
- Inline error display (`text-red-500`)
- System errors redirect to `/auth/error`

### Testing
- Write tests in `__tests__/` mirroring source structure
- Use Vitest + React Testing Library
- Test rendering, user interactions, error states
- Tests run automatically via GitHub Actions on push/PR

## Instructions for Claude

1. **Check current module status** before starting work
2. **Stay focused** on the current module only
3. **Update this file** when:
   - Starting a new module (update Current Work section)
   - Completing a module (move to Completed, update status)
4. **Follow existing patterns** - check similar completed modules for reference
5. **Write tests** for new functionality
6. **Do not over-engineer** - implement only what's specified

## Pending Decisions

- [ ] Bank API for currency exchange rates (user will provide)
- [ ] PDF library selection (react-pdf, puppeteer, or other)
