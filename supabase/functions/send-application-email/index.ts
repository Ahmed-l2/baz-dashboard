import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_Qc73Xtng_6s4sJE5wHD6yq16pUPZDmYFP";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { application, recipientEmail, language } = await req.json();

    if (!application || !recipientEmail) {
      throw new Error("Missing required fields: application and recipientEmail");
    }

    // Format the date
    const formatDate = (dateString: string, lang: string) => {
      const date = new Date(dateString);
      const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Create email template
    const isArabic = language === 'ar';
    const direction = isArabic ? 'rtl' : 'ltr';

    const subject = isArabic
      ? `طلب توظيف جديد - ${application.full_name}`
      : `New Employment Application - ${application.full_name}`;

    const htmlContent = `
<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans Arabic', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      direction: ${direction};
    }
    .email-wrapper {
      background-color: #f5f5f5;
      padding: 40px 20px;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      background-color: #ffffff;
      padding: 30px 40px 20px;
      text-align: center;
      border-bottom: 3px solid #23b478;
    }
    .logo {
      max-width: 280px;
      height: auto;
      margin-bottom: 20px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .header-title {
      color: #1f2937;
      font-size: 24px;
      font-weight: 600;
      margin: 15px 0 5px;
    }
    .header-subtitle {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
    .content {
      padding: 40px;
    }
    .section-title {
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
      ${isArabic ? 'text-align: right;' : 'text-align: left;'}
    }
    .info-row {
      margin-bottom: 18px;
    }
    .info-label {
      color: #6b7280;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      display: block;
      ${isArabic ? 'text-align: right;' : 'text-align: left;'}
    }
    .info-value {
      color: #1f2937;
      font-size: 15px;
      padding: 12px 16px;
      background-color: #f9fafb;
      border-left: 3px solid #23b478;
      border-radius: 4px;
      margin: 0;
      ${isArabic ? 'text-align: right; border-left: none; border-right: 3px solid #23b478;' : 'text-align: left;'}
    }
    .info-value strong {
      color: #111827;
      font-weight: 600;
    }
    .info-value a {
      color: #2563eb;
      text-decoration: none;
    }
    .info-value a:hover {
      text-decoration: underline;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 25px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      ${isArabic ? 'text-align: right;' : 'text-align: left;'}
    }
    .highlight-label {
      color: #065f46;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    .highlight-value {
      color: #047857;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 30px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
      margin: 0 0 10px;
    }
    .footer-copyright {
      color: #9ca3af;
      font-size: 12px;
      margin: 10px 0 0;
    }
    @media (max-width: 600px) {
      .content {
        padding: 30px 25px;
      }
      .grid {
        grid-template-columns: 1fr;
      }
      .header {
        padding: 25px 25px 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <img src="https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/logo's-01.png" alt="Baz Steel" class="logo">
        <h1 class="header-title">${isArabic ? 'طلب توظيف جديد' : 'New Employment Application'}</h1>
        <p class="header-subtitle">${isArabic ? 'تفاصيل المتقدم للوظيفة' : 'Applicant Details'}</p>
      </div>

      <div class="content">
        <h2 class="section-title">${isArabic ? 'المعلومات الشخصية' : 'Personal Information'}</h2>

        <div class="info-row">
          <span class="info-label">${isArabic ? 'الاسم الكامل' : 'Full Name'}</span>
          <div class="info-value"><strong>${application.full_name}</strong></div>
        </div>

        <div class="grid">
          <div class="info-row">
            <span class="info-label">${isArabic ? 'البريد الإلكتروني' : 'Email Address'}</span>
            <div class="info-value">
              <a href="mailto:${application.email}">${application.email}</a>
            </div>
          </div>

          <div class="info-row">
            <span class="info-label">${isArabic ? 'رقم الهاتف' : 'Phone Number'}</span>
            <div class="info-value">
              <a href="tel:${application.phone}">${application.phone}</a>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <h2 class="section-title">${isArabic ? 'معلومات التقديم' : 'Application Information'}</h2>

        <div class="highlight-box">
          <div class="highlight-label">${isArabic ? 'مجال العمل المطلوب' : 'Requested Position'}</div>
          <div class="highlight-value">${application.field_of_work}</div>
        </div>

        <div class="info-row">
          <span class="info-label">${isArabic ? 'تاريخ تقديم الطلب' : 'Application Submitted'}</span>
          <div class="info-value">${formatDate(application.created_at, language)}</div>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">
          ${isArabic
            ? 'تم إرسال هذا البريد الإلكتروني تلقائياً من نظام إدارة شركة باز العالمية للصناعة'
            : 'This email was sent automatically from BAZ INTL. Industry CO. Management System'
          }
        </p>
        <p class="footer-copyright">
          ${isArabic ? '© جميع الحقوق محفوظة لدى شركة باز العالمية للصناعة 2025' : '© All rights reserved to BAZ INTL. INDUSTRY CO. 2025'}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Baz Steel <onboarding@resend.dev>",
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      throw new Error(`Resend API error: ${resendResponse.status} - ${errorData}`);
    }

    const result = await resendResponse.json();

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send email"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
