import { Menu, X, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../lib/contexts/AuthContext";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { session, signOut } = useAuth();
  const user = session?.user || null;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`sticky top-0 z-40 ${isRTL ? "lg:pr-64" : "lg:pl-64"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-lg px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          {sidebarOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>

        {/* Mobile logo - only show when sidebar is closed */}
        <div className="flex lg:hidden items-center flex-1">
          {!sidebarOpen && (
            <div className="flex items-center">
              <img
                src="./assets/logo/baz-logo-nobg.svg"
                className="w-8 h-auto"
                alt="Logo"
              />
              <span
                className={`${
                  isRTL ? "mr-2" : "ml-2"
                } text-lg font-bold text-baz`}
              >
                {t("sidebar.title")}
              </span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
          {/* Language switcher */}
          <button
            onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            className="bg-baz/10 hover:bg-baz/20 text-baz px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-baz/20 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </span>
            <span className="sm:hidden">
              {i18n.language === 'ar' ? 'EN' : 'ع'}
            </span>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" />

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.user_metadata?.full_name ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"
                )}&background=0D8ABC&color=fff`}
                alt="User Avatar"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
              />

              {/* User info */}
              <div className="hidden sm:flex flex-col text-sm">
                <span className="font-medium">
                  {user.user_metadata?.full_name || "No name"}
                </span>
                <span className="text-gray-500 text-xs">{user.email}</span>
              </div>

              {/* Logout button */}
              <button
                onClick={signOut}
                className="ml-2 p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
