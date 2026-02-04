#!/bin/bash

echo "Adding Clerk environment variables to Vercel..."
echo ""
echo "You'll need your Clerk keys from: https://dashboard.clerk.com/last-active?path=api-keys"
echo ""

read -p "Enter NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " PUBLISHABLE_KEY
read -p "Enter CLERK_SECRET_KEY: " SECRET_KEY

if [ -z "$PUBLISHABLE_KEY" ] || [ -z "$SECRET_KEY" ]; then
  echo "Error: Both keys are required"
  exit 1
fi

echo "Adding environment variables to Vercel..."

vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production <<< "$PUBLISHABLE_KEY"
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview <<< "$PUBLISHABLE_KEY"
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development <<< "$PUBLISHABLE_KEY"

vercel env add CLERK_SECRET_KEY production <<< "$SECRET_KEY"
vercel env add CLERK_SECRET_KEY preview <<< "$SECRET_KEY"
vercel env add CLERK_SECRET_KEY development <<< "$SECRET_KEY"

vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production <<< "/sign-in"
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL preview <<< "/sign-in"
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL development <<< "/sign-in"

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production <<< "/sign-up"
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL preview <<< "/sign-up"
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL development <<< "/sign-up"

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production <<< "/"
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL preview <<< "/"
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL development <<< "/"

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production <<< "/"
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL preview <<< "/"
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL development <<< "/"

echo ""
echo "✅ Clerk environment variables added successfully!"
echo "Run 'vercel env list' to verify"
