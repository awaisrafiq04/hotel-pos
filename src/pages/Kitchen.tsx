import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types.js';

export const Kitchen: React.FC = () => {
  const { orders, menuItems, updateOrderStatus, logout, user } = useApp();
  const [, setTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Update timer every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const filteredOrders = statusFilter === 'active'
    ? activeOrders
    : statusFilter === 'ready'
      ? readyOrders
      : statusFilter === 'completed'
        ? completedOrders
        : orders.filter(o => o.status !== 'cancelled');

  const getTimeElapsed = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    return minutes;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const getTimeColor = (minutes: number) => {
    if (minutes < 10) return 'text-emerald-500';
    if (minutes < 20) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTimeBg = (minutes: number) => {
    if (minutes < 10) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (minutes < 20) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const statusColors: Record<OrderStatus, string> = {
    pending: 'border-l-slate-400 bg-slate-50 dark:bg-slate-800',
    accepted: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
    preparing: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
    ready: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    served: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20',
    completed: 'border-l-slate-300 bg-slate-50 dark:bg-slate-800',
    cancelled: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
      {/* Header */}
      <header className="h-24 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Kitchen Monitor</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
              </div>
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              {activeOrders.length} active • {readyOrders.length} ready for pickup
            </p>
          </div>

          <div className="h-10 w-[1px] bg-gray-100 mx-2 hidden md:block"></div>

          <div className="hidden md:flex gap-2">
            {[
              { id: 'active', label: 'Active', count: activeOrders.length },
              { id: 'ready', label: 'Ready', count: readyOrders.length },
              { id: 'completed', label: 'Done', count: completedOrders.length },
              { id: 'all', label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${statusFilter === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-pink-100'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-lg ${statusFilter === tab.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Current Session</p>
            <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{user?.name}</p>
          </div>

          <button
            onClick={logout}
            className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100"
          >
            <i className="fa-solid fa-power-off text-xl"></i>
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white px-4 py-3 border-b border-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
        {['active', 'ready', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${statusFilter === tab ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-10 bg-bg-soft no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filteredOrders.map((order) => {
            const minutes = getTimeElapsed(order.createdAt);
            const timeColor = getTimeColor(minutes);
            const timeBg = getTimeBg(minutes);

            return (
              <div
                key={order.id}
                className="bg-white rounded-[32px] shadow-sm border border-white overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className="p-5 pb-4 border-b border-gray-50 relative bg-gray-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-gray-800 tracking-tighter">#{order.orderNumber.toString().slice(-3)}</span>
                    <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${timeBg}`}>
                      <i className={`fa-solid fa-clock text-[9px] ${timeColor}`}></i>
                      <span className={`text-[11px] font-black ${timeColor}`}>{formatTime(minutes)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {order.tableName && (
                      <span className="px-2 py-1 bg-primaryLight text-primary text-[8px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                        {order.tableName}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-white text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                      {order.orderType}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 p-5 pt-4 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 group/item">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-primaryLight transition-colors border border-gray-100">
                        <span className="font-black text-gray-800 text-[10px] group-hover/item:text-primary">x{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-gray-800 leading-tight text-xs">{item.name}</p>
                          <i className="fa-solid fa-circle-check text-gray-100 text-[10px] group-hover/item:text-emerald-400 transition-colors"></i>
                        </div>
                        {item.notes && (
                          <div className="mt-1.5 p-2 bg-amber-50/50 rounded-lg flex items-start gap-1.5 border border-amber-100/30">
                            <i className="fa-solid fa-message text-[8px] text-amber-500 mt-0.5"></i>
                            <p className="text-[9px] font-bold text-amber-700 leading-normal">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer / Actions */}
                <div className="p-5 pt-0">
                  {order.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border-l-2 border-primary/20">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Chef Instructions</p>
                      <p className="text-[10px] font-bold text-gray-600 italic">"{order.notes}"</p>
                    </div>
                  )}

                  {(user?.role === 'chef' || user?.role === 'admin') ? (
                    <div className="flex flex-col gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-md shadow-blue-100 uppercase tracking-widest text-[9px]"
                        >
                          Confirm Receipt
                        </button>
                      )}

                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-md shadow-amber-100 uppercase tracking-widest text-[9px]"
                        >
                          Start Cooking
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 uppercase tracking-widest text-[9px]"
                        >
                          Order Ready
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <div className="w-full py-4 bg-emerald-50 text-emerald-600 font-black rounded-2xl text-center uppercase tracking-widest text-[9px] border border-emerald-100 flex items-center justify-center gap-2">
                          <i className="fa-solid fa-circle-check"></i>
                          Awaiting Pickup
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full py-4 bg-gray-50 text-gray-400 font-black rounded-2xl text-center uppercase tracking-widest text-[9px] border border-gray-100">
                      {order.status === 'ready' ? 'Ready for pickup' : 'Being Prepared'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="h-full py-40 flex flex-col items-center justify-center opacity-30">
            <i className="fa-solid fa-utensils text-9xl mb-8"></i>
            <h3 className="text-3xl font-black text-gray-800">No Orders in Queue</h3>
            <p className="font-black text-gray-400 uppercase tracking-widest mt-2">Take a breath, you're all caught up!</p>
          </div>
        )}
      </div>

      {/* Footer Stats Bar */}
      <footer className="h-20 bg-white border-t border-gray-50 px-10 flex items-center justify-center gap-12 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incoming</span>
          <span className="text-lg font-black text-gray-800">{orders.filter(o => o.status === 'pending').length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmed</span>
          <span className="text-lg font-black text-gray-800">{orders.filter(o => o.status === 'accepted').length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cooking</span>
          <span className="text-lg font-black text-gray-800">{orders.filter(o => o.status === 'preparing').length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready</span>
          <span className="text-lg font-black text-gray-800">{readyOrders.length}</span>
        </div>
      </footer>
    </div>
  );
};
