# University Spinout Radar

A production-ready Next.js application for tracking and managing university spinout companies and contacts, with subscription-based access control.

## Features

- **Multi-University Architecture**: Routes scoped by university slug (`/u/[slug]/...`)
- **Authentication**: Clerk-based sign-in/sign-up with protected routes
- **Subscription Management**: Stripe integration with Pro monthly/annual plans
- **Directory**: Filterable directory of companies and people
- **Quarterly Workflow**: Track and manage outreach with automated reminders
- **Email Templates**: Pre-configured templates for outreach
- **Admin Dashboard**: CRUD operations for universities, companies, people, and templates
- **Subscription Gating**: Free users see limited data; Pro users get full access

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Vercel Postgres (Neon) with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe (Checkout, Webhooks, Billing Portal)
- **Styling**: Tailwind CSS

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- A Vercel account (for database)
- A Clerk account
- A Stripe account

### 2. Clone and Install

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...

# Database (Vercel Postgres - will be auto-populated when you create the database in Vercel)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
DATABASE_URL=postgres://... (use POSTGRES_PRISMA_URL for Prisma)

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Clerk Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy the publishable key and secret key to your `.env` file
4. Configure sign-in/sign-up URLs in Clerk dashboard to match your `.env` values
5. To set an admin user:
   - Go to Users in Clerk dashboard
   - Select a user
   - In the Metadata section, add `role: admin` to public metadata

### 5. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create two products:
   - **Pro Monthly**: Recurring monthly subscription ($29/month)
   - **Pro Annual**: Recurring annual subscription ($290/year)
4. Copy the Price IDs to your `.env` file
5. Set up webhook endpoint:
   - Go to Developers > Webhooks in Stripe Dashboard
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret to your `.env` file

### 6. Vercel Postgres Setup

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database** and select **Postgres**
3. Choose a name for your database and region
4. Once created, Vercel will automatically add these environment variables:
   - `POSTGRES_URL` - Connection pooling URL (for serverless)
   - `POSTGRES_PRISMA_URL` - Prisma connection URL (use this for Prisma)
   - `POSTGRES_URL_NON_POOLING` - Direct connection URL
5. Set `DATABASE_URL` to the same value as `POSTGRES_PRISMA_URL` in your `.env` file
6. Run Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

**Note**: For local development, you can use the connection strings from Vercel dashboard, or set up a local Postgres database.

### 7. Seed Database

Run the seed script to create initial data:

```bash
npm run db:seed
```

This will create:
- Oxford University
- Sample companies (DeepMind, Oxford Robotics Institute)
- Sample people
- Sample email templates

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Update Stripe webhook URL to `https://yourdomain.vercel.app/api/stripe/webhook`
6. Deploy!

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── admin/          # Admin CRUD APIs
│   │   ├── stripe/         # Stripe checkout, webhook, billing portal
│   │   └── people/         # People-specific APIs
│   ├── u/[slug]/           # University-scoped routes
│   │   ├── directory/      # Directory listing
│   │   ├── companies/      # Company detail pages
│   │   ├── people/         # Person detail pages
│   │   └── quarterly/      # Quarterly workflow
│   ├── admin/              # Admin dashboard
│   ├── account/            # Account/subscription page
│   ├── pricing/            # Pricing page
│   └── sign-in/            # Clerk sign-in
├── components/             # React components
├── lib/                    # Utilities and helpers
│   ├── prisma.ts          # Prisma client
│   ├── stripe.ts          # Stripe client
│   ├── subscription.ts    # Subscription helpers
│   ├── access.ts          # Access control
│   ├── admin.ts           # Admin check
│   └── utils.ts           # General utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
└── middleware.ts           # Clerk middleware
```

## Key Features Explained

### Subscription Gating

- Free users can view directory with names and public links only
- Pro users can access emails, templates, quarterly workflow, and outreach logging
- Server-side checks prevent unauthorized access

### Multi-University Architecture

All entities are scoped by `universityId`. To add a new university:
1. Use admin dashboard or API to create a university
2. Add companies, people, and templates for that university
3. Routes automatically work: `/u/cambridge/directory`, etc.

### Quarterly Workflow

- Lists people where `next_touch_at <= today`
- Allows opening email drafts with templates
- "Mark Contacted" button updates `last_contacted_at` and sets `next_touch_at` to 90 days from now

### Admin Access

- Admin role is stored in Clerk user metadata (`publicMetadata.role === 'admin'`)
- Admin dashboard provides full CRUD for all entities
- Access is checked server-side on all admin routes

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Generate Prisma client
npm run db:generate

# Push database schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## License

MIT
