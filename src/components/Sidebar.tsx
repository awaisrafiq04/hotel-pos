import React from 'react';
import { useApp } from '../context/AppContext';
import {
  HomeIcon, GridIcon, TableIcon, BookIcon, PackageIcon,
  ChartIcon, ClipboardIcon, ChefHatIcon, LogOutIcon, SunIcon, MoonIcon, SettingsIcon,
  CreditCardIcon, XIcon
} from './Icons';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const { user, logout, darkMode, toggleDarkMode, restaurant_name, restaurantLogo, kitchenMode } = useApp();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'pos', label: 'POS', icon: GridIcon },
    { id: 'orders', label: 'Orders', icon: ClipboardIcon },
    { id: 'tables', label: 'Tables', icon: TableIcon },
    { id: 'kitchen', label: 'Kitchen View', icon: ChefHatIcon },
    { id: 'menu', label: 'Menu', icon: BookIcon },
    { id: 'inventory', label: 'Inventory', icon: PackageIcon },
    { id: 'purchases', label: 'Purchases', icon: CreditCardIcon },
    { id: 'reports', label: 'Reports', icon: ChartIcon },
    { id: 'display', label: 'Hall Display', icon: SunIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const waiterMenuItems = [
    { id: 'pos', label: 'New Order', icon: GridIcon },
    { id: 'orders', label: 'My Orders', icon: ClipboardIcon },
    { id: 'tables', label: 'Tables', icon: TableIcon },
  ];

  const chefMenuItems = [
    { id: 'kitchen', label: 'Kitchen', icon: ChefHatIcon },
    { id: 'orders', label: 'All Orders', icon: ClipboardIcon },
  ];

  const menuItems = (user?.role === 'admin'
    ? adminMenuItems
    : user?.role === 'waiter'
      ? waiterMenuItems
      : chefMenuItems
  ).filter(item => item.id !== 'kitchen' ? true : kitchenMode);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-8 py-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-primary tracking-tighter truncate pr-4">
            {restaurant_name}.
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const iconMap: Record<string, string> = {
              'dashboard': 'fa-house',
              'pos': 'fa-utensils',
              'orders': 'fa-list-ul',
              'tables': 'fa-table-cells',
              'kitchen': 'fa-fire-burner',
              'menu': 'fa-book-open',
              'inventory': 'fa-boxes-stacked',
              'purchases': 'fa-cart-shopping',
              'reports': 'fa-chart-line',
              'display': 'fa-tv',
              'settings': 'fa-gear'
            };
            const iconClass = iconMap[item.id] || 'fa-circle';

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                  ? 'bg-primaryLight text-primary font-bold'
                  : 'text-gray-500 hover:bg-gray-50 font-semibold'
                  }`}
              >
                {item.id === 'kitchen' ? (
                  <ChefHatIcon size={20} className={isActive ? 'text-primary' : 'text-black'} />
                ) : (
                  <i className={`fa-solid ${iconClass} w-5 text-center`}></i>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User & Logout Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate text-sm">{user?.name}</p>
              <p className="text-[11px] text-gray-500 capitalize font-medium uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              {darkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
            </button>
            <button
              onClick={logout}
              className="flex-2 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors font-bold text-sm shadow-sm"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
