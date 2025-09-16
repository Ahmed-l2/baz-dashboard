// types/onesignal.ts

export interface OneSignalNotificationData {
  app_id: string;
  contents: { [key: string]: string };
  headings?: { [key: string]: string };
  include_aliases?: {
    external_id?: string[];
  };
  included_segments?: string[];
  target_channel: 'push';
  custom_data?: { [key: string]: any };
  big_picture?: string;
  chrome_web_image?: string;
  large_icon?: string;
}

export interface PromotionalNotificationData {
  title: string;
  message: string;
  customData?: { [key: string]: any };
  imageUrl?: string;
}

export interface QuoteStatusNotificationData {
  userId: string;
  quoteId: string;
  status: string;
  quoteDetails?: {
    customerName?: string;
    productType?: string;
    quantity?: number;
    estimatedPrice?: number;
    validUntil?: string;
  };
}

export interface CustomNotificationData {
  userId: string;
  title: string;
  message: string;
  customData?: { [key: string]: any };
}

export interface OneSignalResponse {
  id?: string;
  recipients?: number;
  external_id_hash?: { [key: string]: number };
  errors?: string[] | { [key: string]: any };
}

export interface NotificationStatus {
  success: boolean;
  notificationId?: string;
  recipients?: number;
  error?: string;
}