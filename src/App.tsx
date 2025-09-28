import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import MetalPrices from './pages/MetalPrices';
import Products from './pages/Products';
import Banners from './pages/Banners';
import QuoteRequests from './pages/QuoteRequests';
import Promotions from './pages/Promotions';
import Employements from './pages/Employementes';
import Users from './pages/Users';

import './i18n';
import i18n from './i18n';

import { useState } from 'react';
import { AuthProvider } from "./lib/contexts/AuthContext";
import RequireAuth from './lib/contexts/RequireAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-r from-gray-100 via-baz/15 to-amber-100/20"
    >
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <main className="min-h-screen  transition-all duration-300">
        <div className="">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/metal-prices" element={<MetalPrices />} />
            <Route path="/products" element={<Products />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/quote-requests" element={<QuoteRequests />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/employements" element={<Employements />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <RequireAuth>
            <AppContent />
          </RequireAuth>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
