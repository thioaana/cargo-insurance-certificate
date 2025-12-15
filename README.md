# Cargo Insurance Certificate Management

A web application for managing cargo insurance certificates. Brokers create certificates based on contracts assigned to them, while administrators manage contracts and have full system access.

## Features

- **Authentication** - Email/password login, sign-up with email confirmation, password reset
- **Role-based Access** - Admin and Broker roles with different permissions
- **Contract Management** - Admins create and assign contracts to brokers
- **Certificate Management** - Create certificates with automatic numbering and validation
- **Currency Conversion** - Real-time exchange rates via Frankfurter API
- **PDF Export** - Generate professional PDF certificates
- **Dark/Light Theme** - User-selectable theme preference

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Auth & Database | Supabase |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| Icons | Lucide React |
| PDF Generation | jsPDF |
| Testing | Vitest + React Testing Library |

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cargo-insurance-certificate.git
cd cargo-insurance-certificate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/00_full_setup.sql
   ```
   Run sections 1-3 to create tables, triggers, and policies.

3. Create demo users in **Authentication > Users**:
   - `admin@demo.com` (password: demo123456)
   - `broker@demo.com` (password: demo123456)

4. Update demo user profiles (Section 4 of the migration) with actual UUIDs

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these values in your Supabase project: **Settings > API**

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

### Administrator
- Manage all contracts (create, edit, delete)
- View and manage all certificates
- Assign contracts to brokers via broker codes
- Manage user roles and permissions

### Broker
- View contracts assigned to their broker code
- Create certificates for assigned contracts
- Edit and delete their own certificates
- Download PDF certificates

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin-only routes
│   ├── auth/               # Authentication pages
│   ├── certificates/       # Certificate CRUD
│   ├── contracts/          # Contract CRUD (admin)
│   └── api/                # API routes (PDF generation)
├── components/             # React components
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── services/           # Server-side business logic
│   ├── supabase/           # Supabase client utilities
│   ├── types/              # TypeScript interfaces
│   └── pdf/                # PDF generation
├── supabase/
│   └── migrations/         # Database migration files
└── __tests__/              # Test files (mirrors app structure)
```

## Business Rules

1. **Contract Validity** - Certificates can only be created for active contracts
2. **Loading Date** - Must fall within the contract's start and end dates
3. **Value Limit** - Certificate value cannot exceed contract's sum insured + additional percentage
4. **Currency** - Must be selected before entering local value; auto-converts to EUR

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Other Platforms

Build the production bundle:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

For production with rate limiting (optional):
| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |

## License

MIT
