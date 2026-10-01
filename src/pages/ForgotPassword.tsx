import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const { sendOtp, resetPassword, restaurant_name, restaurantLogo, restaurantEmail } = useApp();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    const success = await sendOtp();
    setLoading(false);
    if (success) {
      setStep(2);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    const success = await resetPassword({
      otp,
      password: newPassword,
      password_confirmation: confirmPassword
    });
    setLoading(false);
    if (success) {
      onBack(); // Go back to login on success
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4">
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
            <p className="text-gray-400 font-semibold text-sm tracking-wide uppercase">Password Recovery</p>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-xs font-bold text-blue-600 leading-relaxed text-center">
                  An OTP will be sent to the configured recovery email:<br/>
                  <span className="text-blue-800 font-black uppercase tracking-wider">{restaurantEmail || 'Not Configured'}</span>
                </p>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || !restaurantEmail}
                className="w-full py-4 bg-primary text-white font-extrabold rounded-xl shadow-lg shadow-pink-100 hover:bg-[#b01356] focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP to Email'}
              </button>
              <button 
                onClick={onBack}
                className="w-full text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-key text-gray-300"></i>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-Digit OTP"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary transition-all font-bold text-center tracking-[0.5em]"
                  maxLength={6}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-300"></i>
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary transition-all font-bold"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-shield-check text-gray-300"></i>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary transition-all font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all text-center"
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
