import { UserButton } from '@clerk/clerk-react';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <div className="lg:pl-64 ">
      <div className="sticky top-0 z-40 flex rounded-br-3xl shadow-lg h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white backdrop-blur-lg px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex  py-2 flex-1">
            <Search className="pointer-events-none absolute  inset-y-0 rounded-3xl left-0 h-full w-5 text-gray-500 ml-3" />
            <input
              className="block h-full w-full  transition-all duration-700 rounded-3xl bg-baz/5 border-0 outline-none py-0 pl-10 pr-0 text-white placeholder:text-gray-500 focus:ring-0 sm:text-sm"
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