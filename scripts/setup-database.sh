#!/bin/bash

echo "🚀 Setting up Vercel Postgres Database..."
echo ""
echo "Step 1: Create the database in Vercel Dashboard"
echo "1. Go to: https://vercel.com/jeffs-projects-9be53fec/university-spinout-radar/storage"
echo "2. Click 'Create Database' → Select 'Postgres'"
echo "3. Name it: university-spinout-radar-db"
echo "4. Choose a region (closest to you)"
echo "5. Click 'Create'"
echo ""
read -p "Press Enter once you've created the database in Vercel..."

echo ""
echo "Step 2: Pulling environment variables..."
vercel env pull .env.vercel

if grep -q "POSTGRES_PRISMA_URL" .env.vercel; then
    echo "✅ Found Postgres connection strings!"
    
    POSTGRES_PRISMA_URL=$(grep POSTGRES_PRISMA_URL .env.vercel | cut -d '=' -f2- | tr -d '"')
    
    echo ""
    echo "Step 3: Setting DATABASE_URL in Vercel..."
    echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL production
    echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL preview
    echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL development
    
    echo ""
    echo "Step 4: Running database migrations..."
    export $(cat .env.vercel | xargs)
    npx prisma db push --accept-data-loss
    
    echo ""
    echo "Step 5: Seeding database..."
    npm run db:seed
    
    echo ""
    echo "✅ Database setup complete!"
else
    echo "❌ Postgres connection strings not found. Please create the database first."
    exit 1
fi
