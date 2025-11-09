import { createClient } from 'npm:@supabase/supabase-js@2';
import { Document, Page, Text, View, Image, StyleSheet, pdf, Font } from "npm:@react-pdf/renderer@4.3.0";
import React from "npm:react@18.2.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Translation dictionaries
const translations = {
  en: {
    quotation: "QUOTATION",
    customerInformation: "Customer Information",
    quoteInformation: "Quote Information",
    name: "Name:",
    email: "Email:",
    phone: "Phone:",
    company: "Company:",
    project: "Project:",
    date: "Date:",
    validUntil: "Valid Until:",
    status: "Status:",
    validity: "Validity:",
    days: "days",
    detailedQuoteItems: "Detailed Quote Items",
    quoteItemsContinued: "Quote Items (Continued - Page",
    productDetails: "Product Details",
    specifications: "Specifications",
    qty: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    specialNotes: "Special Notes & Terms",
    quoteSummary: "Quote Summary",
    subtotal: "Subtotal:",
    taxApplicable: "Tax (if applicable):",
    totalAmount: "TOTAL:",
    tbd: "TBD",
    noItems: "No items found",
    pending: "Pending",
    na: "N/A"
  },
  ar: {
    quotation: "عرض سعر",
    customerInformation: "معلومات العميل",
    quoteInformation: "معلومات العرض",
    name: ":الاسم",
    email: ":البريد الإلكتروني",
    phone: ":الهاتف",
    company: ":الشركة",
    project: ":المشروع",
    date: ":التاريخ",
    validUntil: ":صالح حتى",
    status: ":الحالة",
    validity: ":الصلاحية",
    days: "يوم",
    detailedQuoteItems: "تفاصيل العناصر",
    quoteItemsContinued: "العناصر (استمرار - صفحة",
    productDetails: "تفاصيل المنتج",
    specifications: "المواصفات",
    qty: "الكمية",
    unitPrice: "سعر الوحدة",
    total: "المجموع",
    specialNotes: "ملاحظات وشروط خاصة",
    quoteSummary: "ملخص العرض",
    subtotal: ":المجموع الفرعي",
    taxApplicable: ":الضريبة (إن وجدت)",
    totalAmount: ":المجموع الكلي",
    tbd: "يحدد لاحقاً",
    noItems: "لا توجد عناصر",
    pending: "قيد الانتظار",
    na: "غير متوفر",
    // Specification translations
    thickness: "السماكة",
    width: "العرض",
    length: "الطول",
    height: "الارتفاع",
    weight: "الوزن",
    diameter: "القطر",
    size: "الحجم",
    material: "المادة",
    grade: "الدرجة",
    finish: "التشطيب",
    color: "اللون",
    type: "النوع"
  }
};
// Font registration function
const registerFonts = async ()=>{
  try {
    // Register Arabic font from CDN
    await Font.register({
      family: 'Noto Sans Arabic',
      fonts: [
        {
          src: 'https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/Cairo-Regular.ttf',
          fontWeight: 'normal'
        },
        {
          src: 'https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/Cairo-Bold.ttf',
          fontWeight: 'bold'
        }
      ]
    });
    // Register English font from CDN
    await Font.register({
      family: 'Open Sans',
      fonts: [
        {
          src: 'https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/Cairo-Regular.ttf',
          fontWeight: 'normal'
        },
        {
          src: 'https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/Cairo-Bold.ttf',
          fontWeight: 'bold'
        }
      ]
    });
    console.log('CDN fonts registered successfully');
    return true;
  } catch (error) {
    console.warn('CDN font registration failed, using fallback fonts:', error);
    // Fallback to system fonts
    try {
      await Font.register({
        family: 'Helvetica'
      });
      console.log('Fallback to Helvetica font');
      return true;
    } catch (fallbackError) {
      console.error('Fallback font registration also failed:', fallbackError);
      return false;
    }
  }
};
// Initialize fonts
let fontsRegistered = false;
registerFonts().then((success)=>{
  fontsRegistered = success;
}).catch((error)=>{
  console.error('Font registration failed completely:', error);
});
// RTL-aware styles with font support
const getStyles = (language)=>{
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const alignSelf = isRTL ? 'flex-end' : 'flex-start';
  // Use custom fonts if registered, otherwise fallback
  const fontFamily = fontsRegistered ? language === 'ar' ? 'Noto Sans Arabic' : 'Open Sans' : 'Helvetica';
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 20,
      fontFamily: fontFamily,
      fontSize: 10,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 3,
      borderBottomColor: '#23b478',
      height: 80
    },
    headerLeft: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start'
    },
    headerCenter: {
      flex: 2,
      alignItems: 'center'
    },
    headerRight: {
      flex: 1,
      alignItems: isRTL ? 'flex-start' : 'flex-end'
    },
    companyTitle: {
      color: '#23b478',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: isRTL ? 0 : 1,
      marginBottom: 4,
      textAlign: 'center',
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    companySubtitle: {
      color: '#374151',
      fontSize: 10,
      marginBottom: 2,
      textAlign: 'center',
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    companyContact: {
      color: '#666666',
      fontSize: 9,
      textAlign: 'center',
      fontFamily: fontFamily
    },
    quoteTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#23b478',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginBottom: 15,
      alignSelf: alignSelf,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: textAlign
    },
    infoGrid: {
      flexDirection: flexDirection,
      marginBottom: 20,
      gap: 15
    },
    infoBox: {
      flex: 1,
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 6,
      borderLeftWidth: isRTL ? 0 : 4,
      borderRightWidth: isRTL ? 4 : 0,
      borderLeftColor: isRTL ? 'transparent' : '#23b478',
      borderRightColor: isRTL ? '#23b478' : 'transparent',
      direction: isRTL ? 'rtl' : 'ltr'
    },
    customerInfoBox: {
      borderLeftColor: isRTL ? 'transparent' : '#23b478',
      borderRightColor: isRTL ? '#23b478' : 'transparent'
    },
    quoteInfoBox: {
      borderLeftColor: isRTL ? 'transparent' : '#059669',
      borderRightColor: isRTL ? '#059669' : 'transparent'
    },
    infoBoxTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#23b478',
      textAlign: textAlign,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    infoBoxTitleGreen: {
      color: '#059669'
    },
    infoRow: {
      flexDirection: flexDirection,
      marginBottom: 3,
      fontSize: 9,
      color: '#374151',
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    infoLabel: {
      fontWeight: 'bold',
      marginRight: isRTL ? 0 : 5,
      marginLeft: isRTL ? 5 : 0,
      fontFamily: fontFamily
    },
    statusBadge: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 6,
      fontSize: 7,
      textTransform: 'uppercase',
      fontFamily: fontFamily
    },
    tableSection: {
      flex: 1,
      marginBottom: 15,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    tableSectionTitle: {
      color: '#23b478',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: textAlign,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    // Updated table styles for better RTL support
    table: {
      width: '100%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      direction: isRTL ? 'rtl' : 'ltr'
    },
    tableHeader: {
      backgroundColor: '#23b478',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      direction: isRTL ? 'rtl' : 'ltr'
    },
    tableHeaderCell: {
      color: '#ffffff',
      fontSize: 8,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRightWidth: 1,
      borderRightColor: 'rgba(255,255,255,0.2)',
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      minHeight: 40,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    tableRowEven: {
      backgroundColor: '#f8fafc'
    },
    tableCell: {
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRightWidth: 1,
      borderRightColor: '#e5e7eb',
      fontSize: 9,
      color: '#374151',
      flexWrap: 'wrap',
      fontFamily: fontFamily,
      fontWeight: 'normal',
      direction: isRTL ? 'rtl' : 'ltr',
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    },
    // Specific alignment classes for table cells
    tableCellLeft: {
      textAlign: 'left',
      alignItems: 'flex-start'
    },
    tableCellCenter: {
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tableCellRight: {
      textAlign: 'right',
      alignItems: 'flex-end',
      justifyContent: 'flex-end'
    },
    // RTL-specific cell styles
    tableCellRTL: {
      textAlign: 'right',
      alignItems: 'flex-end'
    },
    tableCellLTR: {
      textAlign: 'left',
      alignItems: 'flex-start'
    },
    productName: {
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 2,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    productType: {
      fontSize: 8,
      color: '#6b7280',
      marginBottom: 1,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    productNotes: {
      fontSize: 7,
      color: '#9ca3af',
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    unitPrice: {
      fontWeight: 'bold',
      color: '#1f2937',
      fontFamily: fontFamily
    },
    totalPrice: {
      fontWeight: 'bold',
      color: '#23b478',
      fontFamily: fontFamily
    },
    summarySection: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: 15,
      marginTop: 15
    },
    notesSection: {
      flex: 1,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    notesBox: {
      backgroundColor: '#fffbeb',
      padding: 12,
      borderRadius: 6,
      borderLeftWidth: isRTL ? 0 : 4,
      borderRightWidth: isRTL ? 4 : 0,
      borderLeftColor: isRTL ? 'transparent' : '#f59e0b',
      borderRightColor: isRTL ? '#f59e0b' : 'transparent',
      direction: isRTL ? 'rtl' : 'ltr'
    },
    notesTitle: {
      color: '#d97706',
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 6,
      textAlign: textAlign,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    notesText: {
      color: '#92400e',
      fontSize: 9,
      lineHeight: 1.4,
      textAlign: textAlign,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    summaryBox: {
      width: 200,
      backgroundColor: '#23b478',
      color: '#ffffff',
      padding: 15,
      borderRadius: 8,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    summaryTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: textAlign,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    summaryRow: {
      flexDirection: flexDirection,
      justifyContent: 'space-between',
      paddingBottom: 4,
      marginBottom: 6,
      fontSize: 10,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    summaryTotal: {
      flexDirection: flexDirection,
      justifyContent: 'space-between',
      fontSize: 14,
      fontWeight: 'bold',
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: 'white',
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    },
    noItemsText: {
      textAlign: 'center',
      color: '#6b7280',
      fontSize: 10,
      paddingVertical: 20,
      fontFamily: fontFamily,
      direction: isRTL ? 'rtl' : 'ltr'
    }
  });
};
// Define column widths
const columnWidths = {
  productDetails: '35%',
  specifications: '25%',
  quantity: '10%',
  unitPrice: '15%',
  total: '15%'
};
// Helper function to clean text and handle numbers properly
const cleanText = (text, language)=>{
  if (!text) return '';
  // Remove unwanted Unicode control characters that can cause rendering issues
  let cleaned = String(text).replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
  // Remove Arabic diacritics that might interfere with numbers
  if (language === 'ar') {
    cleaned = cleaned.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
  }
  return cleaned;
};
// Helper function to format Arabic numbers
const formatNumber = (num, language)=>{
  if (num === null || num === undefined) return '0';
  // Always return numbers in Western format, but clean any interference
  const numStr = num.toString();
  return cleanText(numStr, language);
};
// Helper function to format currency
const formatCurrency = (amount, language)=>{
  const formatted = amount.toFixed(2);
  if (language === 'ar') {
    return `${formatted} ر.س`; // Number first, then currency
  } else {
    return `${formatted} SAR`; // Currency first, then number
  }
};
const formatCurrencySummary = (amount, language)=>{
  const formatted = amount.toFixed(2);
  if (language === 'ar') {
    return React.createElement(Text, {
      style: {
        direction: 'rtl',
        unicodeBidi: 'bidi-override'
      }
    }, React.createElement(Text, {
      style: {
        fontFamily: 'Open Sans'
      }
    }, formatted), React.createElement(Text, {
      style: {
        fontFamily: 'Noto Sans Arabic'
      }
    }, ' ر.س'));
  } else {
    return React.createElement(Text, {
      style: {
        fontFamily: 'Open Sans'
      }
    }, `SAR ${formatted}`);
  }
};
// Quote PDF Document Component
const QuoteDocument = ({ quoteRequest, language })=>{
  const t = translations[language];
  const styles = getStyles(language);
  const isRTL = language === 'ar';
  const items = quoteRequest.quote_items || [];
  const ITEMS_PER_FIRST_PAGE = 8;
  const ITEMS_PER_OTHER_PAGE = 12;
  const ITEMS_PER_LAST_PAGE = 8;
  // Smart pagination logic
  const pages = [];
  let remainingItems = [
    ...items
  ];
  let pageIndex = 0;
  if (items.length === 0) {
    pages.push({
      items: [],
      isFirst: true,
      isLast: true
    });
  } else {
    while(remainingItems.length > 0){
      const isFirst = pageIndex === 0;
      const isLast = remainingItems.length <= (isFirst ? ITEMS_PER_FIRST_PAGE : ITEMS_PER_OTHER_PAGE);
      let itemsForThisPage;
      if (isFirst && isLast) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_LAST_PAGE);
      } else if (isFirst) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_FIRST_PAGE);
      } else if (isLast) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_LAST_PAGE);
      } else {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_OTHER_PAGE);
      }
      pages.push({
        items: remainingItems.splice(0, itemsForThisPage),
        isFirst,
        isLast
      });
      pageIndex++;
    }
  }
  const formatSpecs = (specs, language = 'en')=>{
    const styles = getStyles(language);
    const isRTL = language === 'ar';
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch (e) {
        return specs?.substring(0, 80) + (specs?.length > 80 ? '...' : '') || t.na;
      }
    }
    if (specs && typeof specs === 'object') {
      const entries = Object.entries(specs).slice(0, 3);
      // Create a single Text element with line breaks
      const specLines = entries.map(([key, value], index)=>{
        const translatedKey = t[key] || key;
        const safeValue = String(value);
        const truncatedValue = safeValue.substring(0, 20) + (safeValue.length > 20 ? '...' : '');
        return [
          // Arabic text with Arabic font
          React.createElement(Text, {
            key: `key-${index}`,
            style: {
              fontFamily: 'Noto Sans Arabic',
              fontWeight: 'normal'
            }
          }, translatedKey + ': '),
          // Numbers with Latin font
          React.createElement(Text, {
            key: `value-${index}`,
            style: {
              fontFamily: 'Open Sans',
              fontWeight: 'normal'
            }
          }, truncatedValue),
          // Add line break except for the last item
          index < entries.length - 1 ? '\n' : ''
        ];
      }).flat();
      return React.createElement(Text, {
        style: {
          fontSize: 9,
          direction: isRTL ? 'rtl' : 'ltr',
          lineHeight: 1.3
        }
      }, specLines);
    }
    return t.na;
  };
  const formatDate = (dateString)=>{
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory' // Force Gregorian calendar
    };
    if (language === 'ar') {
      // Use Arabic locale but with Gregorian calendar
      return new Date(dateString).toLocaleDateString('ar-EG', options);
    }
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  // Updated table columns with proper RTL handling
  const getTableColumns = ()=>{
    const baseColumns = [
      {
        key: 'productDetails',
        width: columnWidths.productDetails,
        align: 'left'
      },
      {
        key: 'specifications',
        width: columnWidths.specifications,
        align: 'left'
      },
      {
        key: 'quantity',
        width: columnWidths.quantity,
        align: 'center'
      },
      {
        key: 'unitPrice',
        width: columnWidths.unitPrice,
        align: 'right'
      },
      {
        key: 'total',
        width: columnWidths.total,
        align: 'right'
      }
    ];
    // For RTL, reverse the entire array and adjust alignments
    if (isRTL) {
      return baseColumns.reverse().map((col)=>({
          ...col,
          align: col.align === 'left' ? 'right' : col.align === 'right' ? 'left' : 'center'
        }));
    }
    return baseColumns;
  };
  const tableColumns = getTableColumns();
  return React.createElement(Document, {}, pages.map((page, pageIndex)=>React.createElement(Page, {
      key: pageIndex,
      size: "A4",
      style: styles.page
    }, React.createElement(View, {
      style: styles.header
    }, React.createElement(View, {
      style: styles.headerLeft
    }), React.createElement(View, {
      style: styles.headerCenter
    }, React.createElement(Image, {
      src: "https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/logo's-01.png",
      style: {
        width: 'auto',
        height: 55,
        marginBottom: 8
      }
    }), React.createElement(Text, {
      style: styles.companyContact
    }, "bazsteel.com | 920018077 | sales@bazsteel.com")), React.createElement(View, {
      style: styles.headerRight
    }, React.createElement(Image, {
      src: language === 'ar' ? "https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/saudi-made.jpg" : "https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/saudi-made-en.png",
      style: {
        width: 70,
        height: 'auto',
        borderRadius: 4
      }
    }))), page.isFirst && React.createElement(View, {}, React.createElement(Text, {
      style: styles.quoteTitle
    }, `${t.quotation} #${quoteRequest.id.slice(0, 8).toUpperCase()}`), React.createElement(View, {
      style: styles.infoGrid
    }, React.createElement(View, {
      style: [
        styles.infoBox,
        styles.customerInfoBox
      ]
    }, React.createElement(Text, {
      style: styles.infoBoxTitle
    }, t.customerInformation), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.name), React.createElement(Text, {}, quoteRequest.customer_name || t.na)), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.email), React.createElement(Text, {}, quoteRequest.customer_email || t.na)), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.phone), React.createElement(Text, {}, quoteRequest.customer_phone || t.na)), quoteRequest.customer_company && React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.company), React.createElement(Text, {}, quoteRequest.customer_company)), quoteRequest.project_name && React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.project), React.createElement(Text, {}, quoteRequest.project_name))), React.createElement(View, {
      style: [
        styles.infoBox,
        styles.quoteInfoBox
      ]
    }, React.createElement(Text, {
      style: [
        styles.infoBoxTitle,
        styles.infoBoxTitleGreen
      ]
    }, t.quoteInformation), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.date), React.createElement(Text, {}, formatDate(quoteRequest.created_at))), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.validUntil), React.createElement(Text, {}, quoteRequest.quote_responses[0]?.expires_at ? formatDate(quoteRequest.quote_responses[0]?.expires_at) : t.na)), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.status), React.createElement(Text, {
      style: styles.statusBadge
    }, quoteRequest.status || t.pending)), React.createElement(View, {
      style: styles.infoRow
    }, React.createElement(Text, {
      style: styles.infoLabel
    }, t.validity), React.createElement(Text, {}, `${quoteRequest.quote_responses[0]?.validity_period || t.na} ${t.days}`))))), React.createElement(View, {
      style: styles.tableSection
    }, React.createElement(Text, {
      style: styles.tableSectionTitle
    }, pageIndex === 0 ? t.detailedQuoteItems : `${t.quoteItemsContinued} ${formatNumber(pageIndex + 1, language)})`), React.createElement(View, {
      style: styles.table
    }, React.createElement(View, {
      style: styles.tableHeader
    }, tableColumns.map((col, index)=>{
      let cellStyle = [
        styles.tableHeaderCell,
        {
          width: col.width
        }
      ];
      // Apply alignment based on column alignment and RTL
      if (col.align === 'center') {
        cellStyle.push(styles.tableCellCenter);
      } else if (col.align === 'right') {
        cellStyle.push(styles.tableCellRight);
      } else {
        cellStyle.push(styles.tableCellLeft);
      }
      return React.createElement(Text, {
        key: col.key,
        style: cellStyle
      }, col.key === 'productDetails' ? t.productDetails : col.key === 'specifications' ? t.specifications : col.key === 'quantity' ? t.qty : col.key === 'unitPrice' ? t.unitPrice : t.total);
    })), page.items.length > 0 ? page.items.map((item, index)=>React.createElement(View, {
        key: index,
        style: [
          styles.tableRow,
          index % 2 === 1 && styles.tableRowEven
        ]
      }, tableColumns.map((col)=>{
        let content;
        let cellStyle = [
          styles.tableCell,
          {
            width: col.width
          }
        ];
        // Apply alignment
        if (col.align === 'center') {
          cellStyle.push(styles.tableCellCenter);
        } else if (col.align === 'right') {
          cellStyle.push(styles.tableCellRight);
        } else {
          cellStyle.push(styles.tableCellLeft);
        }
        switch(col.key){
          case 'productDetails':
            // Create content with proper line breaks
            const productNameText = (language === 'ar' ? item.product?.arabic_name : item.product?.name) || (language === 'ar' ? 'منتج غير معروف' : 'Unknown Product');
            let contentParts = [
              productNameText
            ];
            // Add product type if exists
            // if (item.product?.type) {
            //   const typeText = Array.isArray(item.product.type) ? language === 'ar' ? `الأنواع: ${item.product.type.join(', ')}` : `Types: ${item.product.type.join(', ')}` : language === 'ar' ? `النوع: ${item.product.type}` : `Type: ${item.product.type}`;
            //   contentParts.push(typeText);
            // }
            // Add notes if exists
            if (item.notes) {
              const notesText = `${item.notes.replace(/"/g, '').substring(0, 100)}${item.notes.length > 100 ? '...' : ''}`;
              contentParts.push(notesText);
            }
            // Join with line breaks and create a single Text element
            content = React.createElement(Text, {
              style: {
                fontSize: 9,
                color: '#374151',
                direction: isRTL ? 'rtl' : 'ltr',
                lineHeight: 1.3
              }
            }, contentParts.map((part, index)=>[
                React.createElement(Text, {
                  key: `part-${index}`,
                  style: {
                    fontWeight: index === 0 ? 'bold' : 'normal',
                    color: index === 0 ? '#1f2937' : index === 1 ? '#6b7280' : '#9ca3af',
                    fontSize: index === 0 ? 9 : index === 1 ? 8 : 7
                  }
                }, part),
                // Add line break except for the last item
                index < contentParts.length - 1 ? '\n' : ''
              ]).flat());
            break;
          case 'specifications':
            content = formatSpecs(item.requested_specs, language);
            break;
          case 'quantity':
            content = formatNumber(item.quantity, language);
            break;
          case 'unitPrice':
            content = formatCurrency(item.unit_price || 0, language);
            break;
          case 'total':
            content = formatCurrency(item.total_price || 0, language);
            break;
          default:
            content = t.na;
        }
        return React.createElement(Text, {
          key: col.key,
          style: cellStyle
        }, content);
      }))) : React.createElement(View, {
      style: styles.tableRow
    }, React.createElement(Text, {
      style: [
        styles.noItemsText,
        {
          width: '100%'
        }
      ]
    }, t.noItems)))), page.isLast && React.createElement(View, {
      style: styles.summarySection
    }, React.createElement(View, {
      style: styles.notesSection
    }, quoteRequest.quote_responses[0]?.response_notes && React.createElement(View, {
      style: styles.notesBox
    }, React.createElement(Text, {
      style: styles.notesTitle
    }, t.specialNotes), React.createElement(Text, {
      style: styles.notesText
    }, quoteRequest.quote_responses[0]?.response_notes)), !quoteRequest.quote_responses[0]?.response_notes && React.createElement(View, {
      style: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: isRTL ? 'flex-end' : 'flex-start'
      }
    }, React.createElement(Image, {
      src: "https://cxvokxwjbvjmazowwuvu.supabase.co/storage/v1/object/public/bucket/logo's-02.png",
      style: {
        width: 300,
        height: 'auto'
      }
    }))), React.createElement(View, {
      style: styles.summaryBox
    }, React.createElement(Text, {
      style: styles.summaryTitle
    }, t.quoteSummary), React.createElement(View, {
      style: styles.summaryRow
    }, React.createElement(Text, {}, t.subtotal), React.createElement(Text, {}, formatCurrencySummary(quoteRequest.quote_responses[0]?.total_amount || 0, language))), React.createElement(View, {
      style: styles.summaryRow
    }, React.createElement(Text, {}, t.taxApplicable), React.createElement(Text, {}, t.tbd)), React.createElement(View, {
      style: styles.summaryTotal
    }, React.createElement(Text, {}, t.totalAmount), React.createElement(Text, {}, formatCurrencySummary(quoteRequest.quote_responses[0]?.total_amount || 0, language))))))));
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Wait for fonts to be registered if not already
    if (!fontsRegistered) {
      console.log('Waiting for font registration...');
      fontsRegistered = await registerFonts();
    }
    // Get quote ID and language from request
    const { quoteId, language = 'en' } = await req.json();
    if (!quoteId) {
      return new Response(JSON.stringify({
        error: 'Quote ID is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate language
    const validLanguage = language === 'ar' ? 'ar' : 'en';
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Query the quote data with all related information
    const { data: quoteData, error } = await supabase.from('quote_requests').select(`
        *,
        quote_items (
          *,
          product:products (*)
        ),
        quote_responses (*)
      `).eq('id', quoteId).single();
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to fetch quote data',
        details: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!quoteData) {
      return new Response(JSON.stringify({
        error: 'Quote not found'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Generate PDF
    const quoteDocument = React.createElement(QuoteDocument, {
      quoteRequest: quoteData,
      language: validLanguage
    });
    const pdfBuffer = await pdf(quoteDocument).toBuffer();
    // Create filename with language indicator
    const quoteNumber = quoteData.id.slice(0, 8).toUpperCase();
    const customerName = quoteData.customer_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
    const date = new Date().toISOString().split('T')[0];
    const langSuffix = validLanguage === 'ar' ? '_AR' : '_EN';
    const filename = `BAZ_Quote_${quoteNumber}_${customerName}_${date}${langSuffix}.pdf`;
    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
      fontsRegistered: fontsRegistered
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
