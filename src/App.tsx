import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Orders } from './pages/Orders';
import { Tables } from './pages/Tables';
import { Kitchen } from './pages/Kitchen';
import { Menu } from './pages/Menu';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Purchases } from './pages/Purchases';
import { Display } from './pages/Display';
import { MenuIcon } from './components/Icons';

const MainApp: React.FC = () => {
  const { user, kitchenMode } = useApp();
  const [currentPage, setCurrentPage] = useState(() => sessionStorage.getItem('currentPage') || '');
  const [initialized, setInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Sync currentPage to sessionStorage
  useEffect(() => {
    if (currentPage) {
      sessionStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  // Set default page based on role - only once when user logs in if no saved page
  useEffect(() => {
    if (user && !initialized) {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        setCurrentPage(savedPage);
      } else {
        if (user.role === 'chef') {
          setCurrentPage('kitchen');
        } else if (user.role === 'waiter') {
          setCurrentPage('pos');
        } else {
          setCurrentPage('dashboard');
        }
      }
      setInitialized(true);
    }
    if (!user) {
      setInitialized(false);
    }
  }, [user, initialized]);

  // Public Order Status Display URL
  if (window.location.pathname === '/orderstatus') {
    return (
      <div className="h-screen bg-[#0f172a] overflow-hidden">
        <Display />
        <ToastContainer />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showForgotPassword ? (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        ) : (
          <Login onForgotPassword={() => setShowForgotPassword(true)} />
        )}
        <ToastContainer />
      </>
    );
  }

  const renderPage = () => {
    // Chef can only access Kitchen and Orders
    if (user.role === 'chef') {
      switch (currentPage) {
        case 'kitchen': return kitchenMode ? <Kitchen /> : <Orders onNavigate={setCurrentPage} />;
        case 'orders': return <Orders onNavigate={setCurrentPage} />;
        default: return kitchenMode ? <Kitchen /> : <Orders onNavigate={setCurrentPage} />;
      }
    }

    // Waiter can access POS, Orders, Tables
    if (user.role === 'waiter') {
      switch (currentPage) {
        case 'pos': return <POS />;
        case 'orders': return <Orders onNavigate={setCurrentPage} />;
        case 'tables': return <Tables />;
        default: return <POS />;
      }
    }

    // Admin has full access
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'orders': return <Orders onNavigate={setCurrentPage} />;
      case 'tables': return <Tables />;
      case 'kitchen': return kitchenMode ? <Kitchen /> : <Orders onNavigate={setCurrentPage} />;
      case 'menu': return <Menu />;
      case 'inventory': return <Inventory />;
      case 'reports': return <Reports />;
      case 'purchases': return <Purchases />;
      case 'display': return <Display />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  // Public Order Status Display URL is ALWAYS full-screen and public
  if (window.location.pathname === '/orderstatus') {
    return (
      <div className="h-screen bg-[#0f172a] overflow-hidden">
        <Display />
        <ToastContainer />
      </div>
    );
  }

  const isKitchenFullScreen = user.role === 'chef' && currentPage === 'kitchen';
  
  // Kitchen page is full-screen for chef
  if (isKitchenFullScreen) {
    return (
      <div className="h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <Kitchen />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col lg:flex-row font-sans">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-primary shadow-sm"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      <main className="flex-1 overflow-hidden relative">
        {renderPage()}
      </main>
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
