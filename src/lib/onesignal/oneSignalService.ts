// lib/data/onesignal/oneSignalService.ts

import {
  OneSignalNotificationData,
  PromotionalNotificationData,
  QuoteStatusNotificationData,
  CustomNotificationData,
  OneSignalResponse,
  NotificationStatus
} from '../../types/onesignal';

export class OneSignalService {
  private readonly apiKey: string;
  private readonly appId: string;
  private readonly apiUrl = 'https://api.onesignal.com/notifications';

  constructor() {
    // Get from environment variables
    this.apiKey = import.meta.env.VITE_ONESIGNAL_API_KEY;
    this.appId = import.meta.env.VITE_ONESIGNAL_APP_ID;

    if (!this.apiKey || !this.appId) {
      throw new Error(
        'Missing OneSignal environment variables. Please set VITE_ONESIGNAL_API_KEY and VITE_ONESIGNAL_APP_ID in your .env file.'
      );
    }
  }

  /**
   * Private method to send notification via OneSignal API
   */
  private async sendNotification(data: OneSignalNotificationData): Promise<NotificationStatus> {
    try {
      const response = await fetch(`${this.apiUrl}?c=push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.apiKey}`
        },
        body: JSON.stringify(data)
      });

      const result: OneSignalResponse = await response.json();

      if (!response.ok) {
        console.error('OneSignal API Error:', result);
        return {
          success: false,
          error: result.errors ? JSON.stringify(result.errors) : 'Unknown API error'
        };
      }

      // Check if notification was sent successfully
      if (result.id && result.id !== '') {
        console.log('Notification sent successfully:', result.id);
        return {
          success: true,
          notificationId: result.id,
          recipients: result.recipients || 0
        };
      } else {
        console.error('Notification not sent:', result.errors || 'Unknown error');
        return {
          success: false,
          error: result.errors ? JSON.stringify(result.errors) : 'Failed to send notification'
        };
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Send promotional notification to all subscribers
   */
  async sendPromotionalNotification({
    title,
    message,
    customData,
    imageUrl
  }: PromotionalNotificationData): Promise<NotificationStatus> {
    const notificationData: OneSignalNotificationData = {
      app_id: this.appId,
      contents: {
        ar: message,
        en: message
      },
      headings: {
        ar: title,
        en: title
      },
      included_segments: ['All'], // Send to all subscribers
      target_channel: 'push',
      custom_data: {
        type: 'promotional',
        campaign: 'baz_steel_promotion',
        timestamp: new Date().toISOString(),
        ...customData
      }
    };

    // Add image if provided
    if (imageUrl) {
      notificationData.big_picture = imageUrl;
      notificationData.chrome_web_image = imageUrl;
      notificationData.large_icon = imageUrl;
    }

    return this.sendNotification(notificationData);
  }

  /**
   * Send quote status notification to specific user when admin updates quote status
   */
  async sendQuoteStatusNotification({
    userId,
    quoteId,
    status,
    quoteDetails
  }: QuoteStatusNotificationData): Promise<NotificationStatus> {
    // Quote status messages in Arabic for Baz Steel
    const statusMessages = {
      replied: {
        title: '   طلب التسعير - باز ستيل',
        message: `تم الرد على طلب التعير رقم #${quoteId.slice(0, 8)}`
      },
    };

    const statusMessage = statusMessages[status as keyof typeof statusMessages];

    if (!statusMessage) {
      console.warn(`Unknown quote status: ${status}`);
      return {
        success: false,
        error: `Unknown quote status: ${status}`
      };
    }

  

    const notificationData: OneSignalNotificationData = {
      app_id: this.appId,
 
      headings: {
        ar: statusMessage.title,
        en: statusMessage.title
      },
      include_aliases: {
        external_id: [userId]
      },
      target_channel: 'push',
      custom_data: {
        type: 'quote_status_update',
        quote_id: quoteId,
        status: status,
        user_id: userId,
        ...quoteDetails
      }
    };

    return this.sendNotification(notificationData);
  }

  /**
   * Send notification when admin responds to customer inquiry
   */
  async sendInquiryResponseNotification(
    userId: string,
    inquiryId: string,
    responseMessage: string,
    adminName?: string
  ): Promise<NotificationStatus> {
    const title = 'رد على استفسارك - باز ستيل';
    const message = `تم الرد على استفسارك رقم #${inquiryId.slice(0, 8)}. ${adminName ? `من قبل: ${adminName}` : ''}`;

    const notificationData: OneSignalNotificationData = {
      app_id: this.appId,
      contents: {
        ar: message,
        en: message
      },
      headings: {
        ar: title,
        en: title
      },
      include_aliases: {
        external_id: [userId]
      },
      target_channel: 'push',
      custom_data: {
        type: 'inquiry_response',
        inquiry_id: inquiryId,
        user_id: userId,
        admin_name: adminName,
        response_preview: responseMessage.substring(0, 100)
      }
    };

    return this.sendNotification(notificationData);
  }

  /**
   * Send notification to multiple specific users
   */
  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    customData?: { [key: string]: any }
  ): Promise<NotificationStatus> {
    const notificationData: OneSignalNotificationData = {
      app_id: this.appId,
      contents: {
        ar: message,
        en: message
      },
      headings: {
        ar: title,
        en: title
      },
      include_aliases: {
        external_id: userIds
      },
      target_channel: 'push',
      custom_data: {
        type: 'bulk',
        target_users: userIds.length,
        timestamp: new Date().toISOString(),
        ...customData
      }
    };

    return this.sendNotification(notificationData);
  }

  /**
   * Send notification to specific segment
   */
  async sendSegmentNotification(
    segment: string,
    title: string,
    message: string,
    customData?: { [key: string]: any },
    imageUrl?: string
  ): Promise<NotificationStatus> {
    const notificationData: OneSignalNotificationData = {
      app_id: this.appId,
      contents: {
        ar: message,
        en: message
      },
      headings: {
        ar: title,
        en: title
      },
      included_segments: [segment],
      target_channel: 'push',
      custom_data: {
        type: 'segment',
        segment: segment,
        timestamp: new Date().toISOString(),
        ...customData
      }
    };

    // Add image if provided
    if (imageUrl) {
      notificationData.big_picture = imageUrl;
      notificationData.chrome_web_image = imageUrl;
      notificationData.large_icon = imageUrl;
    }

    return this.sendNotification(notificationData);
  }

  /**
   * Get app info and statistics (requires admin access)
   */
  async getAppInfo(): Promise<any> {
    try {
      const response = await fetch(`https://api.onesignal.com/apps/${this.appId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching app info:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const oneSignalService = new OneSignalService();
export default oneSignalService;