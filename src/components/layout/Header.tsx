import { UserButton } from '@clerk/clerk-react';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <div className="lg:pl-64 ">
      <div className="sticky top-0 z-40 flex rounded-xl mx-4   shadow-2xl h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
            <input
              className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Search..."
              type="search"
              name="search"
            />
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            >
              <Bell className="h-6 w-6" />
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