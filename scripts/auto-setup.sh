#!/bin/bash

echo "🔄 Auto-setup: Waiting for database to be created..."
echo "This script will check every 10 seconds and complete setup automatically."
echo ""
echo "Please create the database at:"
echo "https://vercel.com/jeffs-projects-9be53fec/university-spinout-radar/storage"
echo ""

MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "[Attempt $ATTEMPT/$MAX_ATTEMPTS] Checking for database..."
    
    vercel env pull .env.vercel > /dev/null 2>&1
    
    if grep -q "POSTGRES_PRISMA_URL" .env.vercel 2>/dev/null; then
        echo "✅ Database found! Completing setup..."
        echo ""
        ./scripts/complete-setup.sh
        exit 0
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "⏳ Database not ready yet. Waiting 10 seconds..."
        sleep 10
    fi
done

echo ""
echo "❌ Timeout: Database was not created within 5 minutes."
echo "Please create it manually and run: ./scripts/complete-setup.sh"
exit 1
