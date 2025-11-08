# Resend Email Integration - Deployment Guide

## Overview

The employment applications page now has email forwarding functionality using Resend. This allows you to send employment application details to any email address in a beautifully formatted HTML email.

## Features

✅ **Beautiful HTML Email Template**
- Responsive design with Baz Steel branding
- Clean, professional layout
- Gradient header with company colors
- Contact information with clickable links
- Bilingual support (English & Arabic)

✅ **Language Support**
- English emails (LTR layout)
- Arabic emails (RTL layout)
- Proper date formatting for each language

✅ **User-Friendly Interface**
- Modal dialog to enter recipient email
- Language selector for email content
- Visual preview of application being forwarded
- Loading states and error handling
- Success/error toast notifications

## Setup Instructions

### 1. Add Resend API Key to Supabase

Set your Resend API key as an environment variable:

```bash
npx supabase secrets set RESEND_API_KEY=re_Qc73Xtng_6s4sJE5wHD6yq16pUPZDmYFP
```

Or via Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add secret: `RESEND_API_KEY` with your Resend API key

### 2. Deploy the Edge Function

```bash
# Deploy the send-application-email function
npx supabase functions deploy send-application-email
```

### 3. Verify Deployment

Test the function:

```bash
curl -X POST 'https://<your-project-ref>.supabase.co/functions/v1/send-application-email' \
  -H 'Content-Type: application/json' \
  -d '{
    "application": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "field_of_work": "Engineering",
      "created_at": "2025-11-08T10:00:00Z"
    },
    "recipientEmail": "hr@company.com",
    "language": "en"
  }'
```

## How to Use

### From the Dashboard

1. **Navigate to Employment Applications page**
2. **Click the "Forward" button** on any application row
3. **Enter recipient email** in the modal
4. **Select email language** (English or Arabic)
5. **Click "Send Email"**
6. **Wait for confirmation** toast notification

### Email Content

The email includes:
- Application badge (New Application)
- Full applicant name
- Email address (clickable mailto link)
- Phone number (clickable tel link)
- Field of work with icon
- Application submission date
- Baz Steel branding footer

### Email Template Preview

**English Email:**
```
┌─────────────────────────────────┐
│  📋 New Employment Application  │ (Green gradient header)
├─────────────────────────────────┤
│ 🔔 New Application              │
│                                 │
│ Full Name                       │
│ ┌─────────────────────────────┐ │
│ │ John Doe                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Email Address    Phone Number  │
│ john@example.com +1234567890   │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Field of Work                   │
│ 💼 Engineering                  │
│                                 │
│ Application Date                │
│ 📅 November 8, 2025, 10:00 AM  │
├─────────────────────────────────┤
│ This email was sent from        │
│ Baz Steel Dashboard             │
│ © 2025 Baz Steel                │
└─────────────────────────────────┘
```

**Arabic Email (RTL):**
Same layout but mirrored with Arabic text.

## API Endpoint

### POST `/functions/v1/send-application-email`

**Request Body:**
```json
{
  "application": {
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "field_of_work": "string",
    "created_at": "ISO date string"
  },
  "recipientEmail": "string",
  "language": "en" | "ar"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "email-id-from-resend"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Configuration

### Sender Email

Currently set to: `Baz Steel <onboarding@resend.dev>`

To use a custom domain:
1. Verify your domain in Resend dashboard
2. Update the `from` field in `/supabase/functions/send-application-email/index.ts`:

```typescript
from: "Baz Steel <noreply@yourdomain.com>",
```

### Default Recipient

You can add a default recipient (like HR email) in the frontend:

```typescript
const [recipientEmail, setRecipientEmail] = useState('hr@bazsteel.com');
```

## Troubleshooting

### Email not sending?
1. Check Resend API key is correct in Supabase secrets
2. Verify edge function is deployed
3. Check browser console for errors
4. Review Supabase edge function logs

### Email going to spam?
1. Verify your domain in Resend
2. Set up SPF, DKIM, and DMARC records
3. Use a custom domain instead of `resend.dev`

### Wrong language in email?
1. Verify the `language` parameter is being sent correctly
2. Check translation files have all required keys

## Security

- ✅ API key is stored server-side (never exposed to browser)
- ✅ Email validation on both frontend and backend
- ✅ CORS properly configured
- ✅ No sensitive data logged

## Future Enhancements

Possible improvements:
- [ ] Save sent emails history in database
- [ ] Bulk forward multiple applications
- [ ] Email templates with custom branding
- [ ] Attachment support (CV/Resume)
- [ ] Scheduled sends
- [ ] Email analytics/tracking

## Cost Considerations

Resend Pricing:
- **Free tier**: 100 emails/day, 3,000 emails/month
- **Pro tier**: $20/month for 50,000 emails/month
- Check [resend.com/pricing](https://resend.com/pricing) for latest pricing

## Support

For issues related to:
- **Resend API**: Check [resend.com/docs](https://resend.com/docs)
- **Supabase Edge Functions**: Check Supabase documentation
- **This integration**: Review code in `/supabase/functions/send-application-email/`

---

✨ **Ready to use!** The forward functionality is now available in the Employment Applications page.
