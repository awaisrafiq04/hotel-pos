import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon, LockIcon, SunIcon, MoonIcon } from '../components/Icons';

interface LoginProps {
  onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onForgotPassword }) => {
  const { login, darkMode, toggleDarkMode, restaurant_name, restaurantLogo } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(username || 'demo', password);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            {restaurantLogo && (
              <div className="flex justify-center mb-6">
                <img 
                  src={restaurantLogo} 
                  alt="Restaurant Logo" 
                  className="h-24 w-auto object-contain"
                />
              </div>
            )}
            <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">{restaurant_name || 'Nexus POS'}.</h1>
            <p className="text-gray-400 font-semibold text-sm tracking-wide uppercase">Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-user text-gray-300"></i>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary transition-all font-bold"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-lock text-gray-300"></i>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary transition-all font-bold"
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[10px] font-black text-gray-300 hover:text-primary uppercase tracking-widest transition-all"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-extrabold rounded-xl shadow-lg shadow-pink-100 hover:bg-[#b01356] focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Hard Reset */}
          <div className="mt-8 pt-4 border-t border-gray-50 text-center">
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="text-gray-300 hover:text-gray-500 text-[10px] uppercase font-bold tracking-widest transition-colors"
            >
              Reset Application Cache
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8 font-medium">
          2026 All Rights Reserved. Designed and developed by Awais Rafiq with ❤️
        </p>
      </div>
    </div>
  );
};
