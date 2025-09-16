import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Send, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Target,
  X,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Import the separated services and templates
import { oneSignalService } from '../lib/onesignal/oneSignalService';
import { 
  steelNotificationTemplates, 
  templateCategories, 
  getTemplateById,
  getAllTemplates,
  type NotificationTemplate 
} from '../lib/data/notificationTemplates';

export default function Promotions() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Notification states
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Mock sent notifications for steel business - now using translations
  const [sentNotifications, setSentNotifications] = useState([
    {
      id: 1,
      title: t('promotions.mockData.notification1.title'),
      message: t('promotions.mockData.notification1.message'),
      recipients: 850,
      sent_at: new Date('2024-08-16'),
      status: 'sent',
      image_url: null
    },
    {
      id: 2,
      title: t('promotions.mockData.notification2.title'),
      message: t('promotions.mockData.notification2.message'),
      recipients: 620,
      sent_at: new Date('2024-08-15'),
      status: 'sent',
      image_url: null
    },
    {
      id: 3,
      title: t('promotions.mockData.notification3.title'),
      message: t('promotions.mockData.notification3.message'),
      recipients: 750,
      sent_at: new Date('2024-08-14'),
      status: 'sent',
      image_url: null
    }
  ]);

  // Show notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 5000);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'custom') {
      setSelectedTemplate('custom');
      setPromoTitle('');
      setPromoMessage('');
      setImageUrl('');
      return;
    }

    const template = getTemplateById(templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setPromoTitle(template.title);
      setPromoMessage(template.message);
      setImageUrl(template.imageUrl || '');
    }
  };

  const sendPromotionalNotification = async () => {
    if (!promoTitle || !promoMessage) {
      showNotification('error', t('promotions.notifications.fillBothFields'));
      return;
    }

    setLoading(true);
    try {
      // Send notification using the separated OneSignal service
      const result = await oneSignalService.sendPromotionalNotification({
        title: promoTitle,
        message: promoMessage,
        customData: {
          campaign: 'baz_steel_promotional',
          template_used: selectedTemplate || 'custom',
          timestamp: new Date().toISOString()
        },
        imageUrl: imageUrl || undefined
      });

      if (result.success) {
        // Add to sent notifications
        const newNotification = {
          id: Date.now(),
          title: promoTitle,
          message: promoMessage,
          recipients: result.recipients || Math.floor(Math.random() * 500) + 400,
          sent_at: new Date(),
          status: 'sent',
          image_url: imageUrl || null
        };
        setSentNotifications(prev => [newNotification, ...prev]);
        
        showNotification('success', t('promotions.notifications.sentSuccessfully'));
        
        // Clear form after successful send
        setPromoTitle('');
        setPromoMessage('');
        setSelectedTemplate('');
        setImageUrl('');
      } else {
        showNotification('error', result.error || t('promotions.notifications.sendError'));
      }
    } catch (error) {
      console.error('Notification error:', error);
      showNotification('error', t('promotions.notifications.generalError'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };

  const handleEditNotification = (notification: any) => {
    setSelectedNotification(notification);
    setPromoTitle(notification.title);
    setPromoMessage(notification.message);
    setShowEditModal(true);
  };

  const handleDeleteNotification = (notification: any) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const handleUpdateNotification = async () => {
    if (!promoTitle || !promoMessage) {
      showNotification('error', t('promotions.notifications.fillBothFields'));
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update notification in list
      setSentNotifications(prev => prev.map(n => 
        n.id === selectedNotification?.id 
          ? { ...n, title: promoTitle, message: promoMessage }
          : n
      ));
      
      showNotification('success', t('promotions.notifications.updatedSuccessfully'));
      setShowEditModal(false);
      setPromoTitle('');
      setPromoMessage('');
      setSelectedTemplate('');
    } catch (error) {
      showNotification('error', t('promotions.notifications.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSentNotifications(prev => prev.filter(n => n.id !== selectedNotification?.id));
      showNotification('success', t('promotions.notifications.deletedSuccessfully'));
      setShowDeleteModal(false);
    } catch (error) {
      showNotification('error', t('promotions.notifications.deleteError'));
    }
  };

  // Helper to safely format dates
  const safeFormatDate = (dateValue: any, formatType: string) => {
    if (!dateValue) return t('promotions.common.notAvailable');
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return t('promotions.common.invalidDate');
      
      if (formatType === 'short') {
        return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      return t('promotions.common.invalidDate');
    }
  };

  // Stats for dashboard - using translations
  const stats = [
    {
      name: t('promotions.stats.totalSent'),
      value: sentNotifications.length,
      icon: Send,
      color: 'bg-baz',
    },
    {
      name: t('promotions.stats.totalRecipients'),
      value: sentNotifications.reduce((sum, n) => sum + n.recipients, 0),
      icon: Users,
      color: 'bg-baz',
    },
    {
      name: t('promotions.stats.thisMonth'),
      value: sentNotifications.filter(n => 
        new Date(n.sent_at).getMonth() === new Date().getMonth()
      ).length,
      icon: Calendar,
      color: 'bg-baz',
    },
    {
      name: t('promotions.stats.templates'),
      value: getAllTemplates().length,
      icon: MessageSquare,
      color: 'bg-baz',
    },
  ];

  return (
    <div className="lg:pl-64 rtl:pr-64" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Notification Toast */}
          {notification.type && (
            <div className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification({ type: null, message: '' })}
                className={`${isRTL ? 'mr-2' : 'ml-2'} text-gray-500 hover:text-gray-700`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
            {t('promotions.title')}
          </h1>

          {/* Main Notification Form */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="h-6 w-6 text-gray-500" />
                  {t('promotions.form.title')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t('promotions.form.description')}
                </p>
                
                <div className="space-y-6">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      {t('promotions.form.templateLabel')}
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-baz/15 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    >
                      <option value="">{t('promotions.form.templateSelect')}</option>
                      <option value="custom">{t('promotions.form.customMessage')}</option>
                      {Object.entries(templateCategories).map(([category, label]) => (
                        <optgroup key={category} label={label}>
                          {steelNotificationTemplates[category]?.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      {t('promotions.form.titleLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('promotions.form.titlePlaceholder')}
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className="mt-1 block w-full border-gray-600 bg-baz/15  rounded-md shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      {t('promotions.form.messageLabel')}
                    </label>
                    <textarea
                      placeholder={t('promotions.form.messagePlaceholder')}
                      value={promoMessage}
                      onChange={(e) => setPromoMessage(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border-gray-600 bg-baz/15 rounded-md shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Image URL Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      {t('promotions.form.imageLabel')}
                    </label>
                    <input
                      type="url"
                      placeholder={t('promotions.form.imagePlaceholder')}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="mt-1 block w-full border-gray-600 bg-baz/15 rounded-md shadow-sm py-2 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500">
                      {t('promotions.form.imageHint')}
                    </p>
                  </div>

                  {/* Preview Section */}
                  {(promoTitle || promoMessage) && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-500">
                        {t('promotions.form.previewLabel')}
                      </label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-baz rounded-full flex items-center justify-center">
                            <Bell className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {promoTitle && (
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {promoTitle}
                              </h4>
                            )}
                            {promoMessage && (
                              <p className="text-gray-500 text-sm leading-relaxed">
                                {promoMessage}
                              </p>
                            )}
                            {imageUrl && (
                              <div className="mt-2">
                                <img 
                                  src={imageUrl} 
                                  alt="Notification preview" 
                                  className="max-w-full h-24 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{t('promotions.form.now')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={sendPromotionalNotification}
                    disabled={loading || !promoTitle || !promoMessage}
                    className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-baz hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? t('promotions.form.sending') : t('promotions.form.sendButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  {t('promotions.tips.title')}
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">{t('promotions.tips.titleTips')}</h4>
                    <ul className="space-y-2 text-sm text-gray-500 list-disc list-inside">
                      {t('promotions.tips.titleTipsList', { returnObjects: true }).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">{t('promotions.tips.messageTips')}</h4>
                    <ul className="space-y-2 text-sm text-gray-500 list-disc list-inside">
                      {t('promotions.tips.messageTipsList', { returnObjects: true }).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">{t('promotions.tips.exampleTitle')}</p>
                  <p className="text-sm text-gray-500">
                    <strong>{t('promotions.tips.exampleTitleLabel')}</strong> {t('promotions.tips.exampleTitleText')}<br />
                    <strong>{t('promotions.tips.exampleMessageLabel')}</strong> {t('promotions.tips.exampleMessageText')}<br />
                    <strong>{t('promotions.tips.exampleImageLabel')}</strong> {t('promotions.tips.exampleImageText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* View Modal */}
      {showViewModal && selectedNotification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('promotions.modals.view.title')}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('promotions.modals.view.titleLabel')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedNotification.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('promotions.modals.view.messageLabel')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('promotions.modals.view.recipientsLabel')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedNotification.recipients.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('promotions.modals.view.sentDateLabel')}</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {safeFormatDate(selectedNotification.sent_at, 'full')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('promotions.modals.view.closeButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNotification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('promotions.modals.edit.title')}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setPromoTitle('');
                  setPromoMessage('');
                  setSelectedTemplate('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('promotions.modals.edit.titleLabel')}</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="mt-1 block w-full border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('promotions.modals.edit.messageLabel')}</label>
                <textarea
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setPromoTitle('');
                  setPromoMessage('');
                  setSelectedTemplate('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('promotions.modals.edit.cancelButton')}
              </button>
              <button
                onClick={handleUpdateNotification}
                disabled={loading}
                className="px-4 py-2 text-white bg-baz rounded-md hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? t('promotions.modals.edit.updating') : t('promotions.modals.edit.updateButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('promotions.modals.delete.title')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-500 mb-6">
              {t('promotions.modals.delete.confirmMessage', { title: selectedNotification.title })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('promotions.modals.delete.cancelButton')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {t('promotions.modals.delete.deleteButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}