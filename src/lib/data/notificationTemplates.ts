// lib/data/notificationTemplates.ts

export interface NotificationTemplate {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  category: string;
  imageUrl?: string;
}

export const steelNotificationTemplates: { [category: string]: NotificationTemplate[] } = {
  sales: [
    {
      id: 'steel_sale',
      name: 'Steel Products Sale',
      nameAr: 'تخفيض على المنتجات المعدنية',
      category: 'sales',
      title: '🔥 Special Offer on Steel Products - 15% Discount',
      titleAr: '🔥 عرض خاص على المنتجات المعدنية - خصم 15%',
      message: 'Get high-quality steel products at unbeatable prices! Limited offer on all our steel products.',
      messageAr: 'احصل على منتجات معدنية عالية الجودة بأسعار لا تُقاوم! عرض محدود على جميع منتجاتنا المعدنية.',
    },
    {
      id: 'bulk_discount',
      name: 'Bulk Order Discount',
      nameAr: 'خصم الكميات الكبيرة',
      category: 'sales',
      title: '💰 Bulk Order Special - Up to 25% Discount',
      titleAr: '💰 عرض الكميات الكبيرة - خصم يصل إلى 25%',
      message: 'Order in bulk and get massive discounts! Perfect for construction projects and industrial needs.',
      messageAr: 'اطلب بالجملة واحصل على خصومات كبيرة! مثالي لمشاريع البناء والاحتياجات الصناعية.',
    },
    {
      id: 'weekend_special',
      name: 'Weekend Special',
      nameAr: 'عرض نهاية الأسبوع',
      category: 'sales',
      title: '🎉 Weekend Special - 20% Off All Products',
      titleAr: '🎉 عرض نهاية الأسبوع - خصم 20% على جميع المنتجات',
      message: 'Enjoy 20% discount on all steel products this weekend. Request a quote now!',
      messageAr: 'استمتع بخصم 20% على جميع المنتجات المعدنية خلال نهاية الأسبوع. اطلب عرض سعر الآن!',
    },
    {
      id: 'new_customer_offer',
      name: 'New Customer Offer',
      nameAr: 'عرض العملاء الجدد',
      category: 'sales',
      title: '🎁 New Customer Offer - 10% Discount',
      titleAr: '🎁 عرض العملاء الجدد - خصم 10%',
      message: 'Welcome to Baz Steel! Get 10% off your first quote request.',
      messageAr: 'مرحباً بك في باز ستيل! احصل على خصم 10% على أول طلب عرض سعر لك.',
    }
  ],

  updates: [
    {
      id: 'price_update',
      name: 'Steel Price Update',
      nameAr: 'تحديث أسعار المعادن',
      category: 'updates',
      title: '📊 Steel Price Update - New Prices Available',
      titleAr: '📊 تحديث أسعار المعادن - أسعار جديدة متاحة',
      message: 'Steel prices updated according to global market. Request an updated quote now.',
      messageAr: 'تم تحديث أسعار المعادن حسب السوق العالمي. اطلب عرض سعر محدث الآن.',
    },
    {
      id: 'new_steel_grade',
      name: 'New Steel Grade',
      nameAr: 'منتج جديد - درجة فولاذ',
      category: 'updates',
      title: '🆕 New Product - High-Grade Steel',
      titleAr: '🆕 منتج جديد - درجة فولاذ عالية الجودة',
      message: 'Introducing high-strength steel grades for advanced industrial applications. Request a quote for new products.',
      messageAr: 'نقدم درجات فولاذ عالية القوة للتطبيقات الصناعية المتقدمة. اطلب عرض سعر للمنتجات الجديدة.',
    },
    {
      id: 'inventory_update',
      name: 'Inventory Update',
      nameAr: 'تحديث المخزون',
      category: 'updates',
      title: '📦 Inventory Update - New Products Available',
      titleAr: '📦 تحديث المخزون - منتجات جديدة متاحة',
      message: 'New shipment of premium steel products has arrived. Request a quote from our fresh inventory.',
      messageAr: 'وصلت شحنة جديدة من أفضل المنتجات المعدنية. اطلب عرض سعر من المخزون الجديد.',
    }
  ],

  services: [
    {
      id: 'quote_service',
      name: 'Quote Request Service',
      nameAr: 'خدمة طلب عروض الأسعار',
      category: 'services',
      title: '📋 Quote Request Service',
      titleAr: '📋 خدمة طلب عروض الأسعار',
      message: 'Get a free and detailed quote for all your steel product needs within 24 hours.',
      messageAr: 'احصل على عرض سعر مجاني ومفصل لجميع احتياجاتك من المنتجات المعدنية خلال 24 ساعة.',
    },
    {
      id: 'consultation_service',
      name: 'Technical Consultation',
      nameAr: 'استشارة فنية مجانية',
      category: 'services',
      title: '🔧 Free Technical Consultation',
      titleAr: '🔧 استشارة فنية مجانية',
      message: 'Get free technical consultation from our experts to choose the best steel products for your project.',
      messageAr: 'احصل على استشارة فنية مجانية من خبرائنا لاختيار أفضل المنتجات المعدنية لمشروعك.',
    },
    {
      id: 'delivery_service',
      name: 'Delivery Service',
      nameAr: 'خدمة التوصيل السريع',
      category: 'services',
      title: '🚛 Fast Delivery Service',
      titleAr: '🚛 خدمة التوصيل السريع',
      message: 'Fast and reliable delivery service for all steel products in Jeddah and Makkah regions.',
      messageAr: 'خدمة توصيل سريعة وموثوقة لجميع المنتجات المعدنية داخل منطقة جدة ومكة.',
    }
  ],

  quality: [
    {
      id: 'quality_assurance',
      name: 'Quality Assurance',
      nameAr: 'ضمان الجودة',
      category: 'quality',
      title: '✅ Quality Assurance - International Certifications',
      titleAr: '✅ ضمان الجودة - شهادات دولية',
      message: 'All our steel products are internationally certified and meet the highest quality and safety standards.',
      messageAr: 'جميع منتجاتنا المعدنية معتمدة دولياً وتخضع لأعلى معايير الجودة والسلامة.',
    },
    {
      id: 'testing_services',
      name: 'Material Testing',
      nameAr: 'خدمات فحص المواد',
      category: 'quality',
      title: '🔬 Material Testing Services',
      titleAr: '🔬 خدمات فحص المواد',
      message: 'We provide comprehensive testing services for steel materials to ensure compliance with required specifications.',
      messageAr: 'نوفر خدمات فحص شاملة للمواد المعدنية لضمان المطابقة للمواصفات المطلوبة.',
    }
  ]
};

export const templateCategories = {
  sales: { en: 'Sales & Offers', ar: 'العروض والمبيعات' },
  updates: { en: 'Product Updates', ar: 'تحديثات المنتجات' },
  services: { en: 'Services', ar: 'الخدمات' },
  quality: { en: 'Quality & Certification', ar: 'الجودة والاعتماد' }
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): NotificationTemplate[] => {
  return steelNotificationTemplates[category] || [];
};

// Helper function to get template by ID
export const getTemplateById = (id: string): NotificationTemplate | undefined => {
  for (const categoryTemplates of Object.values(steelNotificationTemplates)) {
    const template = categoryTemplates.find(t => t.id === id);
    if (template) return template;
  }
  return undefined;
};

// Helper function to get all templates
export const getAllTemplates = (): NotificationTemplate[] => {
  return Object.values(steelNotificationTemplates).flat();
};
