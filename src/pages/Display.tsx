import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const Display: React.FC = () => {
  const { orders, restaurant_name, restaurantLogo, fetchOrders } = useApp();
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<any[]>([]);

  // Polling for updates every 5 seconds for a more responsive display
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetchOrders) fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    const ready = orders
      .filter(o => o.status === 'ready')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 8);
    
    const preparing = orders
      .filter(o => ['pending', 'accepted', 'preparing'].includes(o.status))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 12);

    setReadyOrders(ready);
    setPreparingOrders(preparing);
  }, [orders]);

  return (
    <div className="h-full bg-white text-slate-900 overflow-hidden flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Premium Header - Light */}
      <header className="h-28 bg-white border-b border-slate-100 flex items-center justify-between px-16 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          {restaurantLogo ? (
            <img src={restaurantLogo} alt="Logo" className="w-16 h-16 object-contain rounded-xl shadow-lg border border-slate-100" />
          ) : (
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-3xl shadow-xl shadow-primary/20">
              <i className="fa-solid fa-hotel text-white"></i>
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase leading-none">{restaurant_name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em]">Live Order Display</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-right border-r border-slate-100 pr-10">
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Today's Date</p>
            <p className="text-xl font-bold text-slate-700 tabular-nums">
              {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Current Time</p>
            <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Preparing Section - Clean Grid */}
        <div className="flex-1 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="py-10 px-12">
            <h2 className="text-3xl font-black text-slate-300 uppercase tracking-[0.25em] flex items-center gap-4">
              <i className="fa-solid fa-spinner animate-spin-slow text-primary"></i>
              Preparing
            </h2>
          </div>
          <div className="flex-1 px-12 pb-12 grid grid-cols-2 gap-8 auto-rows-max overflow-y-auto no-scrollbar">
            {preparingOrders.map(order => (
              <div 
                key={order.id} 
                className="group bg-white rounded-[40px] p-10 flex flex-col items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-slate-300 font-black text-xs uppercase tracking-widest mb-2">Order No</span>
                <span className="text-7xl font-black text-slate-800 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                  #{order.orderNumber.toString().slice(-3)}
                </span>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center h-full opacity-10 py-20">
                <i className="fa-solid fa-hourglass-start text-8xl mb-6 text-slate-900"></i>
                <p className="font-black uppercase tracking-[0.3em] text-2xl text-slate-900">Kitchen is Clear</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready Section - Vibrant Clean Look */}
        <div className="w-[42%] bg-white flex flex-col z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.03)]">
          <div className="py-10 px-12 bg-emerald-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-[0.25em] flex items-center gap-4 relative z-10">
              <i className="fa-solid fa-utensils"></i>
              Ready
            </h2>
          </div>
          
          <div className="flex-1 p-12 flex flex-col gap-10 overflow-y-auto no-scrollbar bg-slate-50/30">
            {readyOrders.map((order, idx) => (
              <div 
                key={order.id} 
                className={`group relative rounded-[50px] p-12 flex items-center justify-between border-2 transition-all duration-700 animate-in zoom-in-95
                  ${idx === 0 
                    ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 ring-8 ring-emerald-500/5' 
                    : 'bg-white border-slate-100 shadow-sm'}`}
              >
                <div>
                  <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">Order Ready</p>
                  <span className={`text-9xl font-black tracking-tighter ${idx === 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                    #{order.orderNumber.toString().slice(-3)}
                  </span>
                </div>
                {idx === 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-emerald-500 p-6 rounded-full animate-pulse shadow-lg">
                      <i className="fa-solid fa-bell-concierge text-4xl text-white"></i>
                    </div>
                    <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-bounce-subtle">Pickup Now</span>
                  </div>
                )}
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-5 py-20">
                <i className="fa-solid fa-quote-left text-[140px] mb-8 text-slate-900"></i>
                <p className="font-black uppercase tracking-[0.3em] text-4xl text-center text-slate-900">Service Is<br/>Active</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrolling Ticker - Light */}
      <footer className="h-20 bg-white border-t border-slate-100 flex items-center px-16 overflow-hidden z-20">
        <div className="whitespace-nowrap flex items-center gap-20 animate-marquee">
          <div className="flex items-center gap-6">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <p className="text-slate-400 font-black text-sm uppercase tracking-[0.2em]">
              Welcome to {restaurant_name} - Exceptional Dining Experience
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <p className="text-slate-400 font-black text-sm uppercase tracking-[0.2em]">
              Freshness Guaranteed - Every Order Prepared with Excellence
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-slate-400 font-black text-sm uppercase tracking-[0.2em]">
              Serving Quality Food Since 2026 - Designed by Awais Rafiq
            </p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
