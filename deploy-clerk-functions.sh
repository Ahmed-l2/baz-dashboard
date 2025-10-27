#!/bin/bash

# Clerk Integration Deployment Script
# This script deploys the Clerk integration edge functions to Supabase

echo "🚀 Deploying Clerk Integration Edge Functions..."
echo ""

# Check if CLERK_SECRET_KEY environment variable is set
if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "⚠️  CLERK_SECRET_KEY environment variable not set"
    echo "Please set it with: export CLERK_SECRET_KEY=your_clerk_secret_key"
    echo ""
    read -p "Enter your Clerk Secret Key (starts with sk_): " clerk_key
    if [ -z "$clerk_key" ]; then
        echo "❌ No Clerk Secret Key provided. Exiting."
        exit 1
    fi
    export CLERK_SECRET_KEY=$clerk_key
fi

# Set the secret in Supabase
echo "📝 Setting Clerk Secret Key in Supabase..."
npx supabase secrets set CLERK_SECRET_KEY="$CLERK_SECRET_KEY"

if [ $? -ne 0 ]; then
    echo "❌ Failed to set secret. Make sure you're logged in with: npx supabase login"
    exit 1
fi

echo "✅ Secret set successfully"
echo ""

# Deploy get-all-users function
echo "📦 Deploying get-all-users function..."
npx supabase functions deploy get-all-users

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy get-all-users function"
    exit 1
fi

echo "✅ get-all-users deployed successfully"
echo ""

# Deploy user-actions function
echo "📦 Deploying user-actions function..."
npx supabase functions deploy user-actions

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy user-actions function"
    exit 1
fi

echo "✅ user-actions deployed successfully"
echo ""

# Get project URL for testing
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the get-all-users endpoint:"
echo "   curl 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-all-users?limit=5'"
echo ""
echo "2. Test the user-actions endpoint:"
echo "   curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/user-actions?id=USER_ID&action=lock'"
echo ""
echo "3. Your Users page should now fetch data from Clerk!"
echo ""
