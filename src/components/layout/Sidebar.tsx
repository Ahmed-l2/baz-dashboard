import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Image,
  FileText,
  Users,
  Bell,
  Briefcase,
  Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navigation = [
  { key: 'dashboard', href: '/', icon: BarChart3 },
  { key: 'metalPrices', href: '/metal-prices', icon: Activity },
  { key: 'products', href: '/products', icon: Package },
  { key: 'banners', href: '/banners', icon: Image },
  { key: 'quoteRequests', href: '/quote-requests', icon: FileText },
  { key: 'users', href: '/users', icon: Users },
  { key: 'pushNotifications', href: '/promotions', icon: Bell },
  { key: 'employements', href: '/employements', icon: Briefcase }
];

export default function Sidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0" >
      <div className="flex flex-col flex-grow shadow-2xl bg-gradient-to-b from-white via-baz/5 to-baz/10 backdrop-blur-lg rounded-br-3xl pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center w-full">
            <img src="./assets/logo/baz-logo-nobg.svg" className="w-10 h-auto" />
            <span className="ml-2 rtl:mr-2 text-2xl font-bold text-baz">
            {t(`sidebar.title`)}

            </span>
          </div>
        </div>

        <nav className="mt-8 flex-1 flex flex-col divide-y divide-gray-800 overflow-y-auto">
          <div className="px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md transition-colors duration-200
                    ${isActive ? 'bg-baz text-white' : 'text-gray-600'}
                  `}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <item.icon
                    className={`h-6 w-6 flex-shrink-0 ${
                      isRTL ? 'ml-4' : 'mr-4'
                    } ${
                      isActive
                        ? 'text-white transform scale-125 transition-all duration-300'
                        : 'text-gray-600'
                    }`}
                  />
                  {t(`sidebar.${item.key}`)}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
    </div>
  );
}
