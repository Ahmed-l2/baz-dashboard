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

  // Separate notification content language from UI language
  const [notificationLang, setNotificationLang] = useState<'en' | 'ar'>('ar');

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
      // Use the selected notification language for template content
      setPromoTitle(notificationLang === 'ar' ? template.titleAr : template.title);
      setPromoMessage(notificationLang === 'ar' ? template.messageAr : template.message);
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
    <div className={`min-h-screen bg-gradient-to-r from-gray-100 via-baz/15 to-amber-100/20 ${
      isRTL ? 'lg:pr-64' : 'lg:pl-64'
    }`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-8 sm:py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Notification Toast */}
          {notification.type && (
            <div className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-lg max-w-sm sm:max-w-md ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              )}
              <span className="text-sm sm:text-base font-medium flex-1">{notification.message}</span>
              <button
                onClick={() => setNotification({ type: null, message: '' })}
                className={`flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'} text-gray-500 hover:text-gray-700`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-gray-500 text-center sm:text-start">
            {t('promotions.title')}
          </h1>

          {/* Stats Section */}
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`${stat.color} rounded-md p-2 sm:p-3`}>
                          <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                      </div>
                      <div className={`w-0 flex-1 ${isRTL ? 'mr-3 sm:mr-4 text-right' : 'ml-3 sm:ml-4'}`}>
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-lg sm:text-xl font-semibold text-gray-900">
                            {stat.value.toLocaleString()}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Notification Form */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                  {t('promotions.form.title')}
                </h3>
                <p className="text-sm text-gray-500 mb-4 sm:mb-6">
                  {t('promotions.form.description')}
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {/* Notification Content Language Toggle */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Target className="h-5 w-5 text-amber-600" />
                        <label className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {t('promotions.form.notificationLanguage')}
                        </label>
                      </div>
                      <div className="flex bg-white rounded-lg border border-gray-300 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationLang('ar');
                            // Re-apply template if one is selected
                            if (selectedTemplate && selectedTemplate !== 'custom') {
                              const template = getTemplateById(selectedTemplate);
                              if (template) {
                                setPromoTitle(template.titleAr);
                                setPromoMessage(template.messageAr);
                              }
                            }
                          }}
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                            notificationLang === 'ar'
                              ? 'bg-baz text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          العربية
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationLang('en');
                            // Re-apply template if one is selected
                            if (selectedTemplate && selectedTemplate !== 'custom') {
                              const template = getTemplateById(selectedTemplate);
                              if (template) {
                                setPromoTitle(template.title);
                                setPromoMessage(template.message);
                              }
                            }
                          }}
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                            notificationLang === 'en'
                              ? 'bg-baz text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs text-amber-700 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('promotions.form.notificationLanguageHint')}
                    </p>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('promotions.form.templateLabel')}
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 text-base bg-gray-500/15 border-gray-300 focus:outline-none focus:ring-2 focus:ring-baz focus:border-transparent rounded-md ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={notificationLang === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <option value="">{t('promotions.form.templateSelect')}</option>
                      <option value="custom">{t('promotions.form.customMessage')}</option>
                      {Object.entries(templateCategories).map(([category, labels]) => (
                        <optgroup key={category} label={isRTL ? labels.ar : labels.en}>
                          {steelNotificationTemplates[category]?.map((template) => (
                            <option key={template.id} value={template.id}>
                              {notificationLang === 'ar' ? template.nameAr : template.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('promotions.form.titleLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('promotions.form.titlePlaceholder')}
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className={`mt-1 block w-full border border-gray-300 bg-gray-500/15 rounded-md shadow-sm py-2 px-3 sm:py-3 sm:px-4 text-base focus:outline-none focus:ring-2 focus:ring-baz focus:border-transparent ${notificationLang === 'ar' ? 'text-right' : 'text-left'}`}
                      dir={notificationLang === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('promotions.form.messageLabel')}
                    </label>
                    <textarea
                      placeholder={t('promotions.form.messagePlaceholder')}
                      value={promoMessage}
                      onChange={(e) => setPromoMessage(e.target.value)}
                      rows={4}
                      className={`mt-1 block w-full border border-gray-300 bg-gray-500/15 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-baz focus:border-transparent ${notificationLang === 'ar' ? 'text-right' : 'text-left'}`}
                      dir={notificationLang === 'ar' ? 'rtl' : 'ltr'}
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
                      className="mt-1 block w-full border border-gray-300 bg-gray-500/15 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-baz focus:border-transparent"
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
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-baz rounded-full flex items-center justify-center">
                            <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {promoTitle && (
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {promoTitle}
                              </h4>
                            )}
                            {promoMessage && (
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {promoMessage}
                              </p>
                            )}
                            {imageUrl && (
                              <div className="mt-2">
                                <img
                                  src={imageUrl}
                                  alt="Notification preview"
                                  className="max-w-full h-20 sm:h-24 object-cover rounded border"
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
                    className="w-full flex justify-center items-center px-4 py-3 sm:px-6 sm:py-4 border border-transparent text-base sm:text-lg font-medium rounded-md text-white bg-baz hover:bg-baz/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-baz disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? t('promotions.form.sending') : t('promotions.form.sendButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  {t('promotions.tips.title')}
                </h3>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{t('promotions.tips.titleTips')}</h4>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 list-disc list-inside">
                      {t('promotions.tips.titleTipsList', { returnObjects: true }).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{t('promotions.tips.messageTips')}</h4>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 list-disc list-inside">
                      {t('promotions.tips.messageTipsList', { returnObjects: true }).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm sm:text-base mb-2">{t('promotions.tips.exampleTitle')}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
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
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-center justify-between mb-3 sm:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.view.title')}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.view.titleLabel')}</label>
                <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{selectedNotification.title}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.view.messageLabel')}</label>
                <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.view.recipientsLabel')}</label>
                  <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{selectedNotification.recipients.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.view.sentDateLabel')}</label>
                  <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {safeFormatDate(selectedNotification.sent_at, 'full')}
                  </p>
                </div>
              </div>
            </div>
            <div className={`flex mt-4 sm:mt-6 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg lg:max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-center justify-between mb-3 sm:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.edit.title')}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setPromoTitle('');
                  setPromoMessage('');
                  setSelectedTemplate('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.edit.titleLabel')}</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-baz focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.edit.messageLabel')}</label>
                <textarea
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                  rows={4}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-baz focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
            <div className={`flex gap-2 sm:gap-3 mt-4 sm:mt-6 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setPromoTitle('');
                  setPromoMessage('');
                  setSelectedTemplate('');
                }}
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('promotions.modals.edit.cancelButton')}
              </button>
              <button
                onClick={handleUpdateNotification}
                disabled={loading}
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-white bg-baz rounded-md hover:bg-baz/90 disabled:opacity-50"
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
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-center justify-between mb-3 sm:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{t('promotions.modals.delete.title')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <p className={`text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('promotions.modals.delete.confirmMessage', { title: selectedNotification.title })}
            </p>
            <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('promotions.modals.delete.cancelButton')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
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
