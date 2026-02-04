# Database Setup Instructions

## Quick Setup (Automated)

Once you've created the Vercel Postgres database, run:

```bash
./scripts/complete-setup.sh
```

This will:
1. Pull database connection strings from Vercel
2. Set DATABASE_URL environment variable
3. Run database migrations
4. Seed the database with initial data

## Manual Setup Steps

### 1. Create Vercel Postgres Database

1. Go to: https://vercel.com/jeffs-projects-9be53fec/university-spinout-radar/storage
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Name it: `university-spinout-radar-db`
5. Choose a region (closest to your users)
6. Click **"Create"**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`

### 2. Set DATABASE_URL

After the database is created, run:

```bash
# Pull environment variables
vercel env pull .env.vercel

# Get the Prisma URL
POSTGRES_PRISMA_URL=$(grep POSTGRES_PRISMA_URL .env.vercel | cut -d '=' -f2- | sed 's/^"//;s/"$//')

# Set DATABASE_URL in Vercel
echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL production
echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL preview
echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL development
```

### 3. Run Migrations and Seed

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npm run db:seed
```

### 4. Deploy

The app will automatically redeploy when you push. Or manually trigger:

```bash
vercel --prod
```

## Testing Locally

To test locally with the Vercel database:

```bash
# Pull environment variables
vercel env pull .env.local

# Start dev server
npm run dev
```

## What Gets Seeded

The seed script creates:
- Oxford University
- Sample companies (DeepMind, Oxford Robotics Institute)
- Sample people/contacts
- Sample email templates
