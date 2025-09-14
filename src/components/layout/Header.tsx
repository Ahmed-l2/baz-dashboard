import { UserButton } from '@clerk/clerk-react';
import { Bell, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl'; // use direction instead of language === 'ar'

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`lg:pl-64 ${isRTL ? 'lg:pr-64 lg:pl-0' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white backdrop-blur-lg px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Search box */}
          <div className="relative flex py-2 flex-1">
            <Search
              className={`pointer-events-none absolute inset-y-0 h-full w-5 text-gray-500 ${
                isRTL ? 'right-0 mr-3' : 'left-0 ml-3'
              }`}
            />
            <input
              className={`block h-full w-full transition-all duration-700 rounded-3xl bg-baz/5 border-0 outline-none py-0 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm
                ${isRTL ? 'pr-10 pl-0 text-right' : 'pl-10 pr-0 text-left'}`}
              placeholder={t('header.search')}
              type="search"
              name="search"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Language switcher */}
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            {/* Notifications */}
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 text-black" />
            </button>

            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" />

            <div className="relative">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
