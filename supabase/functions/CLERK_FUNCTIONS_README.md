# Clerk Integration Edge Functions

This directory contains Supabase Edge Functions that integrate with Clerk's API to manage users.

## Functions

### 1. get-all-users
Fetches users from Clerk API with pagination support.

**Parameters:**
- `limit` (optional): Number of users to fetch (default: 10)
- `offset` (optional): Offset for pagination (default: 0)
- `order_by` (optional): Sort order (default: -created_at)

**Example:**
```
GET /functions/v1/get-all-users?limit=10&offset=0&order_by=-created_at
```

### 2. user-actions
Performs actions on Clerk users (ban, unban, delete).

**Parameters:**
- `id` (required): User ID
- `action` (required): Action to perform (`lock`, `unlock`, `delete`)

**Example:**
```
POST /functions/v1/user-actions?id=user_123&action=lock
```

## Setup

### 1. Add Clerk Secret Key to Supabase

You need to add your Clerk Secret Key as an environment variable in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Project Settings > Edge Functions
3. Add a new secret:
   - Name: `CLERK_SECRET_KEY`
   - Value: Your Clerk Secret Key (starts with `sk_`)

### 2. Deploy the Functions

Deploy these functions to Supabase:

```bash
# Login to Supabase CLI (if not already logged in)
npx supabase login

# Link your project
npx supabase link --project-ref <your-project-ref>

# Deploy the functions
npx supabase functions deploy get-all-users
npx supabase functions deploy user-actions
```

### 3. Verify Deployment

Test the functions:

```bash
# Test get-all-users
curl -i --location --request GET 'https://<project-ref>.supabase.co/functions/v1/get-all-users?limit=5'

# Test user-actions
curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/user-actions?id=user_123&action=lock'
```

## Environment Variables

Make sure you have the following in your `.env` file:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_CLERK_SECRET_KEY=sk_test_...
```

And in Supabase Edge Functions secrets:
- `CLERK_SECRET_KEY` - Your Clerk Secret Key

## Notes

- The functions handle CORS automatically
- Error handling is built-in
- The functions use Clerk's REST API v1
- Make sure your Clerk Secret Key has the necessary permissions
