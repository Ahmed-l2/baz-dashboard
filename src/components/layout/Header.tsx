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
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="rounded-full border bg-baz/20 text-black px-2 py-2 text-sm focus:outline-none min-w-0"
          >
            <option className="bg-white text-baz" value="en">
              EN
            </option>
            <option className="bg-white text-baz" value="ar">
              AR
            </option>
          </select>

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
