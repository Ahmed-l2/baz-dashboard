import { useMetalPrices } from '../hooks/useMetalPrices';
import { useProducts } from '../hooks/useProducts';
import { useQuoteRequests } from '../hooks/useQuoteRequests';
import { Activity, Package, FileText, TrendingUp } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { data: metalPrices } = useMetalPrices();
  const { data: products } = useProducts();
  const { data: quoteRequests } = useQuoteRequests();

  const isRTL = i18n.language === 'ar';

  const stats = [
    {
      name: t('dashboard.totalProducts'),
      value: products?.length || 0,
      icon: Package,
      color: 'bg-baz',
    },
    {
      name: t('dashboard.metalPrices'),
      value: metalPrices?.length || 0,
      icon: Activity,
      color: 'bg-baz',
    },
    {
      name: t('dashboard.quoteRequests'),
      value: quoteRequests?.length || 0,
      icon: FileText,
      color: 'bg-baz',
    },
    {
      name: t('dashboard.pendingQuotes'),
      value: quoteRequests?.filter((q) => q.status === 'pending')?.length || 0,
      icon: TrendingUp,
      color: 'bg-baz',
    },
  ];

  // Helper to safely format dates
  const safeFormatDate = (dateValue, formatString) => {
    if (!dateValue) return t('dashboard.notAvailable');
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : t('dashboard.invalidDate');
  };

  return (
    <div className="lg:pl-64 rtl:pr-64" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
            {t('dashboard.title')}
          </h1>

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

          {/* Recent Quote Requests */}
          {quoteRequests && quoteRequests.length > 0 && (
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {t('dashboard.recentQuotes')}
                  </h3>
                  <div className="space-y-3">
                    {quoteRequests.slice(0, 5).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <p className="font-medium text-gray-900">
                            {request.customer_name || t('dashboard.anonymous')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.customer_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'responded'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.status || 'pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {safeFormatDate(request.created_at, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
