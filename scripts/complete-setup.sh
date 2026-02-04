#!/bin/bash

set -e

echo "🚀 Complete Database Setup for University Spinout Radar"
echo "=================================================="
echo ""

# Step 1: Check if database exists in Vercel
echo "Step 1: Checking for Vercel Postgres database..."
vercel env pull .env.vercel > /dev/null 2>&1

if grep -q "POSTGRES_PRISMA_URL" .env.vercel 2>/dev/null; then
    echo "✅ Database connection found!"
    
    # Extract the connection string
    POSTGRES_PRISMA_URL=$(grep "^POSTGRES_PRISMA_URL=" .env.vercel | cut -d '=' -f2- | sed 's/^"//;s/"$//' | tr -d '\n')
    
    if [ -z "$POSTGRES_PRISMA_URL" ]; then
        echo "❌ Could not extract POSTGRES_PRISMA_URL"
        exit 1
    fi
    
    echo ""
    echo "Step 2: Setting DATABASE_URL in Vercel..."
    echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL production
    echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL preview  
    echo "$POSTGRES_PRISMA_URL" | vercel env add DATABASE_URL development
    
    echo ""
    echo "Step 3: Setting up local environment for testing..."
    export DATABASE_URL="$POSTGRES_PRISMA_URL"
    echo "DATABASE_URL=$POSTGRES_PRISMA_URL" > .env.local
    
    echo ""
    echo "Step 4: Generating Prisma Client..."
    npx prisma generate
    
    echo ""
    echo "Step 5: Pushing database schema..."
    npx prisma db push --accept-data-loss
    
    echo ""
    echo "Step 6: Seeding database with initial data..."
    npm run db:seed
    
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Test locally: npm run dev"
    echo "2. Deploy: git push (Vercel will auto-deploy)"
    
else
    echo "❌ Database not found. Please create it first:"
    echo ""
    echo "1. Go to: https://vercel.com/jeffs-projects-9be53fec/university-spinout-radar/storage"
    echo "2. Click 'Create Database' → Select 'Postgres'"
    echo "3. Name: university-spinout-radar-db"
    echo "4. Choose region and click 'Create'"
    echo ""
    echo "Then run this script again: ./scripts/complete-setup.sh"
    exit 1
fi
