import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Image,
  FileText,
  Users,
  Bell,
  Briefcase,
  Activity,
  X,
  UserCog
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/contexts/AuthContext'; // <-- import your auth hook

const navigation = [
  { key: 'dashboard', href: '/', icon: BarChart3 },
  { key: 'metalPrices', href: '/metal-prices', icon: Activity },
  { key: 'products', href: '/products', icon: Package },
  { key: 'banners', href: '/banners', icon: Image },
  { key: 'quoteRequests', href: '/quote-requests', icon: FileText },
  { key: 'users', href: '/users', icon: Users },
  { key: 'pushNotifications', href: '/promotions', icon: Bell },
  { key: 'employements', href: '/employements', icon: Briefcase },
  { key: 'agents', href: '/agents', icon: UserCog}
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { allowedRoutes, user } = useAuth(); // <-- get allowedRoutes from context

  // Filter navigation based on allowedRoutes
  const filteredNavigation = allowedRoutes.includes('all')
    ? navigation
    : navigation.filter((item) => allowedRoutes.includes(item.href));

  const sidebarContent = (
    <div className="flex flex-col flex-grow shadow-2xl bg-white backdrop-blur-lg rounded-br-3xl pt-5 pb-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4">
        <div className="flex items-center w-full">
          <img src="./assets/logo/baz-logo-nobg.svg" className="w-10 h-auto" alt="Logo" />
          <span className="ml-2 rtl:mr-2 text-2xl font-bold text-baz">
            {t(`sidebar.title`)}
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 flex flex-col divide-y divide-gray-800 overflow-y-auto">
        <div className="px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md transition-colors duration-200
                  ${isActive ? 'bg-baz text-white' : 'text-gray-600 hover:bg-baz/10'}
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
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 z-40 bg-gray-900/80 transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-64 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
          }`}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </div>
    </div>
  );
}
