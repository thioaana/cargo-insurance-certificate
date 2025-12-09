# Cargo Insurance Certificate - Module Progress

This file tracks completed modules and their implementation details.

---

## Module 1: Authentication (`feature/auth`) - MERGED

**Status:** Completed and merged

### Completed Tasks

- [x] Login with email/password
- [x] Sign-up with email confirmation
- [x] Logout functionality
- [x] Forgot password / password reset
- [x] Session management via middleware
- [x] Profile page

### Files

- `app/auth/*` - Auth pages (login, sign-up, forgot-password, reset-password, confirm, error)
- `lib/supabase/*` - Supabase client utilities (client, server, middleware)
- `components/logout-button.tsx` - Logout button component
- `middleware.ts` - Session management and route protection

---

## Module 2: User Roles & Profile (`feature/user-roles`) - MERGED

**Status:** Completed and merged

### Completed Tasks

- [x] Add `profiles` table with role and broker_code (via Supabase SQL)
- [x] Database trigger auto-creates profile on sign-up
- [x] Profile page shows role, broker_code, and editable full_name
- [x] Role-based route protection in middleware (`/admin/*` routes)
- [x] Admin user management at `/admin/users`

### Files

- `lib/types/profile.ts` - Profile type definition
- `lib/services/profiles.ts` - Profile CRUD service
- `lib/services/auth.ts` - Auth service utilities
- `app/auth/profile/*` - Profile page
- `app/admin/users/*` - Admin user management
- `app/unauthorized/*` - Unauthorized access page

---

## Module 3: NavBar Update (`feature/navbar`) - MERGED

**Branch:** `feature/navbar`
**Status:** Completed and merged
**Date:** 2024-12-09

### Completed Tasks

- [x] Refactor NavBar to server/client component pattern
- [x] Fetch user profile on server side (`NavBar.tsx`)
- [x] Pass profile to client component (`NavBarClient.tsx`)
- [x] Implement role-based navigation links
  - [x] Admin sees: Contracts, All Certificates
  - [x] Broker sees: My Certificates
- [x] Add user dropdown menu with Profile and Logout
- [x] Update mobile menu with role-based links
- [x] Add accessibility features (focus trap, Escape key, aria attributes)
- [x] Write comprehensive tests for NavBarClient

### Files Modified/Added

| File | Change Type | Description |
|------|-------------|-------------|
| `components/NavBar.tsx` | Modified | Converted to async server component that fetches profile |
| `components/NavBarClient.tsx` | Modified | Receives profile as prop, renders role-based UI |
| `__tests__/components/NavBarClient.test.tsx` | Added | 17 test cases covering all states |

### Implementation Details

#### Server Component (`NavBar.tsx`)
- Fetches current user profile using `getCurrentProfile()` service
- Handles auth failures gracefully (user stays logged out)
- Passes profile to client component

#### Client Component (`NavBarClient.tsx`)
- **Props:** `profile: Profile | null`
- **State:** `isOpen` for mobile menu toggle
- **Role Detection:** `isAdmin = profile?.role === "admin"`

#### Desktop Navigation (role-based)
- **Admin:** Shows "Contracts" (`/contracts`) and "All Certificates" (`/certificates`)
- **Broker:** Shows "My Certificates" (`/certificates`)
- **Logged Out:** Shows only Login button

#### User Dropdown Menu
- Profile link → `/auth/profile`
- Logout button (using existing `LogoutButton` component)

#### Mobile Menu
- Same role-based links as desktop
- Profile link for logged-in users
- Login/Logout button
- Focus trap and Escape key support

#### Accessibility Features
- `aria-expanded` on mobile toggle
- `aria-label` on buttons
- Focus trap in mobile menu
- Escape key closes mobile menu
- Focus returns to toggle button on close

### Test Coverage

| Category | Tests |
|----------|-------|
| Logged out state | 3 tests |
| Admin user | 4 tests |
| Broker user | 4 tests |
| User dropdown menu | 2 tests |
| Mobile menu | 2 tests |
| Common elements | 2 tests |

**Total:** 17 test cases

### Commit Message

```
Add role-based navigation to NavBar (Module 3)

- Refactor NavBar to server/client component pattern
- Admin sees: Contracts, All Certificates links
- Broker sees: My Certificates link
- Add user dropdown menu with Profile and Logout
- Update mobile menu with same role-based links
- Add accessibility: focus trap, Escape key, aria attributes
- Add 17 test cases for NavBarClient component
```

---

## Upcoming Modules

### Module 4: Contracts CRUD (`feature/contracts`)
- [ ] Admin-only access
- [ ] List all contracts
- [ ] Create contract (assign broker_code)
- [ ] Edit contract
- [ ] Delete contract

### Module 5: Certificates CRUD (`feature/certificates`)
- [ ] Broker: create/edit/delete own certificates
- [ ] Broker: select from contracts matching their broker_code
- [ ] Admin: full CRUD on all certificates
- [ ] Auto-generate certificate_number (CERT-YYYY-NNNN)
- [ ] Currency conversion via Bank API

### Module 6: PDF Generation (`feature/pdf`)
- [ ] Server-side PDF generation
- [ ] Download certificate as PDF
- [ ] PDF template design
