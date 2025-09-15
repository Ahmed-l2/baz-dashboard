import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Target
} from 'lucide-react';
import { format, isValid } from 'date-fns';

export default function Promotions() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Mock data for notifications - replace with your actual data hooks
  const [notifications] = useState([
    {
      id: 1,
      title: 'Summer Sale - 20% Off All Products',
      message: 'Get amazing discounts on all our metal products this summer!',
      status: 'sent',
      recipients: 450,
      created_at: new Date('2024-08-15'),
      sent_at: new Date('2024-08-16'),
      type: 'promotion'
    },
    {
      id: 2,
      title: 'New Product Launch - Premium Steel Series',
      message: 'Introducing our new premium steel collection with enhanced durability.',
      status: 'draft',
      recipients: 0,
      created_at: new Date('2024-08-20'),
      sent_at: null,
      type: 'announcement'
    },
    {
      id: 3,
      title: 'Price Update Notification',
      message: 'Metal prices have been updated. Check out the latest rates.',
      status: 'scheduled',
      recipients: 320,
      created_at: new Date('2024-08-18'),
      sent_at: new Date('2024-08-25'),
      type: 'update'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Stats for notifications
  const stats = [
    {
      name: t('promotions.totalNotifications') || 'Total Notifications',
      value: notifications.length,
      icon: Bell,
      color: 'bg-baz',
    },
    {
      name: t('promotions.sentNotifications') || 'Sent Notifications',
      value: notifications.filter(n => n.status === 'sent').length,
      icon: Send,
      color: 'bg-baz',
    },
    {
      name: t('promotions.totalRecipients') || 'Total Recipients',
      value: notifications.reduce((sum, n) => sum + (n.status === 'sent' ? n.recipients : 0), 0),
      icon: Users,
      color: 'bg-baz',
    },
    {
      name: t('promotions.scheduledNotifications') || 'Scheduled',
      value: notifications.filter(n => n.status === 'scheduled').length,
      icon: Calendar,
      color: 'bg-baz',
    },
  ];

  // Helper to safely format dates
  const safeFormatDate = (dateValue, formatString) => {
    if (!dateValue) return t('dashboard.notAvailable') || 'Not Available';
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : t('dashboard.invalidDate') || 'Invalid Date';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'promotion':
        return Target;
      case 'announcement':
        return Bell;
      case 'update':
        return MessageSquare;
      default:
        return Bell;
    }
  };

  return (
    <div className="lg:pl-64 rtl:pr-64" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
              {t('promotions.title') || 'Promotional Notifications'}
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-baz hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-baz"
            >
              <Plus className={`-ml-1 mr-2 h-5 w-5 ${isRTL ? 'ml-2 mr-0' : ''}`} />
              {t('promotions.createNew') || 'Create Notification'}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`${stat.color} rounded-md p-3`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className={`w-0 flex-1 ${isRTL ? 'mr-5 text-right' : 'ml-5'}`}>
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {t('promotions.allNotifications') || 'All Notifications'}
                </h3>
                
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {t('promotions.noNotifications') || 'No notifications'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('promotions.getStarted') || 'Get started by creating a new notification.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => {
                      const TypeIcon = getTypeIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <TypeIcon className="h-5 w-5 text-gray-500" />
                                <h4 className="text-lg font-medium text-gray-900">
                                  {notification.title}
                                </h4>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}
                                >
                                  {notification.status}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-3">
                                {notification.message}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Created: {safeFormatDate(notification.created_at, 'MMM d, yyyy')}
                                </span>
                                {notification.sent_at && (
                                  <span className="flex items-center gap-1">
                                    <Send className="h-4 w-4" />
                                    Sent: {safeFormatDate(notification.sent_at, 'MMM d, yyyy')}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  Recipients: {notification.recipients}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className={`flex items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                <Eye className="h-5 w-5" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                <Edit className="h-5 w-5" />
                              </button>
                              <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('promotions.createNotification') || 'Create New Notification'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('promotions.modalPlaceholder') || 'Notification creation form will be implemented here.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-white bg-baz rounded-md hover:bg-opacity-90"
              >
                {t('common.create') || 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}