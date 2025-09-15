import { Users as UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function Users() {
  const { t } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className={` ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className={`text-3xl font-bold leading-tight tracking-tight text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('users.title')}
              </h1>
              <p className={`mt-2 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('users.description')}
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-500">
              {t('users.managementTitle')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('users.managementDescription')}
            </p>
            <div className="mt-6">
              <a
                href="https://clerk.dev/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-baz hover:bg-baz/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('users.openClerkDashboard')}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}