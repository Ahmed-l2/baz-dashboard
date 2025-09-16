// lib/data/notificationTemplates.ts

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  category: string;
  imageUrl?: string;
}

export const steelNotificationTemplates: { [category: string]: NotificationTemplate[] } = {
  sales: [
    {
      id: 'steel_sale',
      name: 'Steel Products Sale',
      category: 'sales',
      title: '🔥 عرض خاص على المنتجات المعدنية - خصم 15%',
      message: 'احصل على منتجات معدنية عالية الجودة بأسعار لا تُقاوم! عرض محدود على جميع منتجاتنا المعدنية.',
    },
    {
      id: 'bulk_discount',
      name: 'Bulk Order Discount',
      category: 'sales',
      title: '💰 عرض الكميات الكبيرة - خصم يصل إلى 25%',
      message: 'اطلب بالجملة واحصل على خصومات كبيرة! مثالي لمشاريع البناء والاحتياجات الصناعية.',
    },
    {
      id: 'weekend_special',
      name: 'Weekend Special',
      category: 'sales',
      title: '🎉 عرض نهاية الأسبوع - خصم 20% على جميع المنتجات',
      message: 'استمتع بخصم 20% على جميع المنتجات المعدنية خلال نهاية الأسبوع. اطلب عرض سعر الآن!',
    },
    {
      id: 'new_customer_offer',
      name: 'New Customer Offer',
      category: 'sales',
      title: '🎁 عرض العملاء الجدد - خصم 10%',
      message: 'مرحباً بك في باز ستيل! احصل على خصم 10% على أول طلب عرض سعر لك.',
    }
  ],
  
  updates: [
    {
      id: 'price_update',
      name: 'Steel Price Update',
      category: 'updates',
      title: 'تحديث أسعار المعادن - أسعار جديدة متاحة',
      message: 'تم تحديث أسعار المعادن حسب السوق العالمي. اطلب عرض سعر محدث الآن.',
    },
    {
      id: 'new_steel_grade',
      name: 'New Steel Grade',
      category: 'updates',
      title: 'منتج جديد - درجة فولاذ عالية الجودة',
      message: 'نقدم درجات فولاذ عالية القوة للتطبيقات الصناعية المتقدمة. اطلب عرض سعر للمنتجات الجديدة.',
    },
    {
      id: 'inventory_update',
      name: 'Inventory Update',
      category: 'updates',
      title: 'تحديث المخزون - منتجات جديدة متاحة',
      message: 'وصلت شحنة جديدة من أفضل المنتجات المعدنية. اطلب عرض سعر من المخزون الجديد.',
    }
  ],
  
  services: [
    {
      id: 'quote_service',
      name: 'Quote Request Service',
      category: 'services',
      title: '📋 خدمة طلب عروض الأسعار',
      message: 'احصل على عرض سعر مجاني ومفصل لجميع احتياجاتك من المنتجات المعدنية خلال 24 ساعة.',
    },
    {
      id: 'consultation_service',
      name: 'Technical Consultation',
      category: 'services',
      title: '🔧 استشارة فنية مجانية',
      message: 'احصل على استشارة فنية مجانية من خبرائنا لاختيار أفضل المنتجات المعدنية لمشروعك.',
    },
    {
      id: 'delivery_service',
      name: 'Delivery Service',
      category: 'services',
      title: '🚛 خدمة التوصيل السريع',
      message: 'خدمة توصيل سريعة وموثوقة لجميع المنتجات المعدنية داخل منطقة جدة ومكة.',
    }
  ],
  
  quality: [
    {
      id: 'quality_assurance',
      name: 'Quality Assurance',
      category: 'quality',
      title: '✅ ضمان الجودة - شهادات دولية',
      message: 'جميع منتجاتنا المعدنية معتمدة دولياً وتخضع لأعلى معايير الجودة والسلامة.',
    },
    {
      id: 'testing_services',
      name: 'Material Testing',
      category: 'quality',
      title: '🔬 خدمات فحص المواد',
      message: 'نوفر خدمات فحص شاملة للمواد المعدنية لضمان المطابقة للمواصفات المطلوبة.',
    }
  ]
};

export const templateCategories = {
  sales: 'العروض والمبيعات',
  updates: 'تحديثات المنتجات', 
  services: 'الخدمات',
  quality: 'الجودة والاعتماد'
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