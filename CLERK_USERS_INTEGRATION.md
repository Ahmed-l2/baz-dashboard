# Users Page - Clerk Integration Guide

## Overview

The Users page is now properly configured to fetch user data from **Clerk** (not Supabase). This document explains the current setup and what needs to be deployed.

## Current Architecture

```
Frontend (Users.tsx)
    ↓
Supabase Edge Functions (Proxy)
    ↓
Clerk API (Auth Provider)
```

### Why Supabase Edge Functions?

Even though you're using Clerk for authentication, we use Supabase Edge Functions as a proxy because:
1. **Security**: Your Clerk Secret Key stays server-side, never exposed to the browser
2. **CORS**: Edge functions handle cross-origin requests properly
3. **Error Handling**: Centralized error handling and response formatting
4. **Caching**: Potential to add caching layer if needed

## What's Already Working

The `Users.tsx` page is already correctly configured to:

✅ Fetch users from `/functions/v1/get-all-users` endpoint
✅ Fetch stats from the same endpoint (with limit=250)
✅ Handle pagination (limit/offset)
✅ Perform user actions via `/functions/v1/user-actions` endpoint
✅ Display Clerk user data (name, email, security status, etc.)
✅ Format dates in Gregorian calendar (Arabic: ar-EG, English: en-US)

## What You Need to Deploy

### 1. Deploy Edge Functions

Two new edge functions have been created in `/supabase/functions/`:

#### `get-all-users/index.ts`
- Fetches users from Clerk API
- Supports pagination with `limit`, `offset`, `order_by` parameters
- Returns Clerk user data directly

#### `user-actions/index.ts`
- Performs actions on Clerk users: ban (`lock`), unban (`unlock`), delete
- Takes `id` and `action` query parameters

### 2. Add Clerk Secret Key to Supabase

Before deploying, add your Clerk Secret Key to Supabase:

```bash
# Set the secret in Supabase
npx supabase secrets set CLERK_SECRET_KEY=<your-clerk-secret-key>
```

Or via Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add secret: `CLERK_SECRET_KEY` with your Clerk secret key value

### 3. Deploy Commands

```bash
# Make sure you're logged in
npx supabase login

# Link your project (if not already linked)
npx supabase link --project-ref <your-project-ref>

# Deploy both functions
npx supabase functions deploy get-all-users
npx supabase functions deploy user-actions
```

### 4. Verify Deployment

Test the functions are working:

```bash
# Test fetching users (should return Clerk users)
curl "https://<your-project-ref>.supabase.co/functions/v1/get-all-users?limit=5"

# Test user action (replace with real user ID)
curl -X POST "https://<your-project-ref>.supabase.co/functions/v1/user-actions?id=user_xxx&action=lock"
```

## Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_SERVICE_KEY=<your-supabase-service-key>
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
VITE_CLERK_SECRET_KEY=<your-clerk-secret-key>
```

### Supabase Edge Functions (Secrets)
```env
CLERK_SECRET_KEY=<your-clerk-secret-key>
```

## Clerk API Endpoints Used

The edge functions use these Clerk API v1 endpoints:

1. **List Users**: `GET /v1/users?limit=X&offset=Y&order_by=Z`
2. **Ban User**: `POST /v1/users/{user_id}/ban`
3. **Unban User**: `POST /v1/users/{user_id}/unban`
4. **Delete User**: `DELETE /v1/users/{user_id}`

## Clerk User Data Structure

The Clerk API returns users with this structure (matches `ClerkUser` interface):

```typescript
{
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  banned: boolean;
  locked: boolean;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  last_sign_in_at: number | null;  // Unix timestamp
  last_active_at: number | null;   // Unix timestamp
  created_at: number;               // Unix timestamp
  email_addresses: Array<{
    email_address: string;
    verification?: { status: string };
  }>;
  public_metadata?: {
    role?: string;
    department?: string;
  };
  // ... other Clerk user fields
}
```

## How the Users Page Works

### 1. Fetching Stats
```typescript
// Fetches up to 250 users to calculate stats
GET /functions/v1/get-all-users?limit=250&order_by=-created_at
```

Calculates:
- Total users
- Active users (not banned/locked)
- Banned users
- Locked users
- High security users (score >= 5)
- Online users (active in last 5 minutes)

### 2. Fetching Paginated Users
```typescript
// Fetches 10 users per page
GET /functions/v1/get-all-users?limit=10&offset=0&order_by=-created_at
```

### 3. User Actions
```typescript
// Ban a user
POST /functions/v1/user-actions?id=user_xxx&action=lock

// Unban a user
POST /functions/v1/user-actions?id=user_xxx&action=unlock

// Delete a user
POST /functions/v1/user-actions?id=user_xxx&action=delete
```

## Security Score Calculation

The page calculates a security score for each user:
- Password enabled: +1 point
- Two-factor enabled: +2 points
- TOTP enabled: +1 point
- Passkeys configured: +2 points

**Security Levels:**
- High: >= 5 points (green badge)
- Medium: 3-4 points (yellow badge)
- Low: < 3 points (red badge)

## Active Status Detection

Users are marked as "online" if their `last_active_at` timestamp is within the last 5 minutes (300,000 milliseconds).

This is checked every 30 seconds via a `setInterval`.

## Date Formatting

All dates are now displayed in **Gregorian calendar**:
- **Arabic (RTL)**: Uses `ar-EG` locale
- **English (LTR)**: Uses `en-US` locale

Example format: `Oct 27, 2025, 02:30 PM`

## Troubleshooting

### Users not loading?
1. Check Supabase Edge Functions are deployed
2. Verify `CLERK_SECRET_KEY` is set in Supabase secrets
3. Check browser console for errors
4. Verify `VITE_SUPABASE_URL` in `.env` is correct

### User actions failing?
1. Ensure Clerk Secret Key has proper permissions
2. Check the user ID is valid in Clerk
3. Review Supabase Edge Function logs

### Dates showing Hijri calendar?
1. Verify the locale is `ar-EG` (not `ar-SA`)
2. Check the `formatDate` function in Users.tsx

## Next Steps

After deploying the edge functions, the Users page will:
1. ✅ Fetch all user data from Clerk
2. ✅ Display accurate user counts and stats
3. ✅ Allow banning/unbanning users in Clerk
4. ✅ Allow deleting users from Clerk
5. ✅ Show real-time active status
6. ✅ Display dates in Gregorian calendar with proper localization

No changes needed to the frontend code - just deploy the edge functions!
