# Promotions Page Enhancements

## Overview
Enhanced the Promotions page to support **bilingual notification templates** with a dedicated language switcher, improving the user experience for sending notifications in both Arabic and English.

---

## 🎯 Key Improvements

### 1. **Bilingual Template System**
- **Before**: Templates were hardcoded in Arabic only
- **After**: Each template now has both Arabic and English versions
  - `title` (English) + `titleAr` (Arabic)
  - `message` (English) + `messageAr` (Arabic)
  - `name` (English) + `nameAr` (Arabic)

### 2. **Notification Content Language Toggle**
- Added a **dedicated language switcher** for notification content
- **Independent from UI language**: You can have an English dashboard UI but create Arabic notifications (and vice versa)
- Located prominently at the top of the form with visual feedback
- Clear hint text explaining the feature

### 3. **Smart Template Selection**
- Template dropdown now shows names in the **selected notification language**
- Categories are displayed in the **UI language** (following dashboard language)
- When switching notification language, templates automatically update to show the correct language version

### 4. **Improved Input Fields**
- Title and message inputs now have **proper text direction** (RTL/LTR) based on notification language
- Maintains proper alignment regardless of dashboard UI language
- Better UX for bilingual content creators

---

## 📋 Template Structure

### Updated Interface
```typescript
export interface NotificationTemplate {
  id: string;
  name: string;           // English template name
  nameAr: string;         // Arabic template name
  title: string;          // English notification title
  titleAr: string;        // Arabic notification title
  message: string;        // English notification message
  messageAr: string;      // Arabic notification message
  category: string;
  imageUrl?: string;
}
```

### Template Categories
Now bilingual with both language versions:
```typescript
export const templateCategories = {
  sales: { en: 'Sales & Offers', ar: 'العروض والمبيعات' },
  updates: { en: 'Product Updates', ar: 'تحديثات المنتجات' },
  services: { en: 'Services', ar: 'الخدمات' },
  quality: { en: 'Quality & Certification', ar: 'الجودة والاعتماد' }
};
```

---

## 🔧 Technical Changes

### Files Modified

1. **`src/lib/data/notificationTemplates.ts`**
   - Updated `NotificationTemplate` interface with bilingual fields
   - Added English versions for all templates
   - Updated category labels to be bilingual objects

2. **`src/pages/Promotions.tsx`**
   - Added `notificationLang` state (independent of UI language)
   - Created language toggle UI with Arabic/English buttons
   - Updated `handleTemplateSelect` to use selected notification language
   - Applied proper `dir` attribute to inputs based on notification language
   - Template dropdown dynamically shows correct language names

3. **`locales/en.json`** & **`locales/ar.json`**
   - Added `notificationLanguage` label
   - Added `notificationLanguageHint` explanation text

---

## 💡 User Experience Flow

### Scenario 1: English UI, Arabic Notification
1. Dashboard is in English
2. User clicks **"العربية"** in notification language toggle
3. Template dropdown shows Arabic template names
4. Selected template populates fields with Arabic content
5. Input fields switch to RTL for easy Arabic typing

### Scenario 2: Arabic UI, English Notification
1. Dashboard is in Arabic (RTL)
2. User clicks **"English"** in notification language toggle
3. Template dropdown shows English template names
4. Selected template populates fields with English content
5. Input fields switch to LTR for easy English typing

### Scenario 3: Quick Language Switching
1. User selects a template in Arabic
2. Clicks "English" toggle
3. **Same template automatically updates** to English version
4. No need to re-select template

---

## 🎨 Visual Enhancements

### Language Toggle Design
- Highlighted with amber background to draw attention
- Icon indicator (🎯 Target) for clarity
- Active language button has baz brand color
- Inactive buttons have subtle hover effect
- Clear explanatory text below

### Template Dropdown
- Categories grouped logically
- Template names in notification language
- Category labels in UI language
- Clear "Custom Message" option

---

## 📊 All Templates (Bilingual)

### Sales & Offers (العروض والمبيعات)
1. **Steel Products Sale** / تخفيض على المنتجات المعدنية
2. **Bulk Order Discount** / خصم الكميات الكبيرة
3. **Weekend Special** / عرض نهاية الأسبوع
4. **New Customer Offer** / عرض العملاء الجدد

### Product Updates (تحديثات المنتجات)
1. **Steel Price Update** / تحديث أسعار المعادن
2. **New Steel Grade** / منتج جديد - درجة فولاذ
3. **Inventory Update** / تحديث المخزون

### Services (الخدمات)
1. **Quote Request Service** / خدمة طلب عروض الأسعار
2. **Technical Consultation** / استشارة فنية مجانية
3. **Delivery Service** / خدمة التوصيل السريع

### Quality & Certification (الجودة والاعتماد)
1. **Quality Assurance** / ضمان الجودة
2. **Material Testing** / خدمات فحص المواد

---

## ✅ Benefits

1. **No Language Conflicts**: UI language and notification language are independent
2. **Easier Workflow**: No need to switch entire dashboard language to create notifications in different language
3. **Better UX**: Clear visual feedback on selected notification language
4. **Flexible**: Support for bilingual teams who need to create content in both languages
5. **Professional**: All templates are professionally translated and culturally appropriate
6. **Consistent**: Template structure maintains consistency across both languages

---

## 🔄 Backward Compatibility

- Existing notification sending logic remains unchanged
- OneSignal integration unaffected
- Mock data structure preserved
- All existing features continue to work

---

## 🚀 Future Enhancements (Suggestions)

1. Add template preview cards showing both languages side-by-side
2. Save draft notifications with language preference
3. Add template management page for admin to add/edit templates
4. Analytics showing which language has better engagement
5. A/B testing capability for bilingual campaigns
6. Template scheduling with language-specific timing

---

## 📝 Notes for Developers

- The `notificationLang` state is separate from `i18n.language`
- Template selection automatically updates when notification language changes
- Input fields use `dir` attribute for proper text direction
- Category labels use UI language, template names use notification language
- No breaking changes to existing functionality
