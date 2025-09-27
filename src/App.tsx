import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { clerkPublishableKey } from './lib/clerk';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import MetalPrices from './pages/MetalPrices';
import Products from './pages/Products';
import Banners from './pages/Banners';
import QuoteRequests from './pages/QuoteRequests';

import Promotions from './pages/Promotions';
import Employements from './pages/Employementes';
import './i18n';
import i18n from './i18n';
import { Users } from './pages/Users';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  return (
    <>
      <SignedIn>
      <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}  className="min-h-screen bg-gradient-to-r from-gray-100 via-baz/15 to-amber-100/20">
          <Sidebar />
          <Header />
          
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
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
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
    </ClerkProvider>
  );
}

export default App;