import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Image, 
  FileText, 
  Users,
  Settings,
  Activity,
  Bell
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Metal Prices', href: '/metal-prices', icon: Activity },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Banners', href: '/banners', icon: Image },
  { name: 'Quote Requests', href: '/quote-requests', icon: FileText },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Push Notifications', href: '/promotions', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col ml-1 my-1 flex-grow shadow-2xl bg-gradient-to-b from-baz/90 via-baz to-black backdrop-blur-lg rounded-3xl pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Baz Admin</span>
          </div>
        </div>
        <nav className="mt-8 flex-1 flex flex-col divide-y divide-gray-800 overflow-y-auto">
          <div className="px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-baz border-l-4  transition-all duration-300  text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-black'
                    }
                  `}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      isActive ? 'text-white  transition-all duration-300 rotate-12 transform scale-150' : 'text-green-200 group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}