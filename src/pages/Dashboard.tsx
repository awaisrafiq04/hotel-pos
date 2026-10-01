import React from 'react';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const { orders, menuItems, inventory, formatPrice, restaurant_name } = useApp();

  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status)).length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock).length;

  const totalProfit = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const costPrice = item.costPrice || 0;
        return itemSum + (item.price - costPrice) * item.quantity;
      }, 0);
      return sum + orderProfit;
    }, 0);

  const stats = [
    {
      label: "Today's Revenue",
      value: formatPrice(totalSales),
      icon: "fa-coins",
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      shadow: 'shadow-emerald-100/50'
    },
    {
      label: 'Order Volume',
      value: todayOrders.length.toString(),
      icon: "fa-cart-shopping",
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      shadow: 'shadow-blue-100/50'
    },
    {
      label: 'Pending Prep',
      value: pendingOrders.toString(),
      icon: "fa-clock",
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      shadow: 'shadow-amber-100/50'
    },
    {
      label: "Net Earnings",
      value: formatPrice(totalProfit),
      icon: "fa-chart-line",
      color: 'text-primary',
      bgColor: 'bg-primaryLight',
      shadow: 'shadow-pink-100/50'
    },
  ];

  const recentOrders = todayOrders.slice(0, 5);

  const itemSales = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, order) => {
      order.items.forEach(item => {
        const itemId = item.menuItemId;
        acc[itemId] = (acc[itemId] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

  const topItems = Object.entries(itemSales)
    .map(([id, quantity]) => {
      const item = menuItems.find(m => m.id.toString() === id.toString());
      if (!item) return null;
      return { ...item, orders: quantity };
    })
    .filter((item): item is any => item !== null)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  return (
    <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
      {/* Header */}
      <header className="h-20 md:h-24 bg-white border-b border-gray-50 flex items-center justify-between px-6 md:px-10 shrink-0 z-20">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-gray-800 tracking-tight leading-none">{restaurant_name} Executive</h1>
          <p className="text-gray-400 font-bold text-[8px] md:text-[10px] uppercase tracking-widest mt-1">Operational Overview</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-50 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-gray-100 hidden sm:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Current Session</p>
            <p className="text-sm font-black text-gray-800">
              <i className="fa-solid fa-calendar-day text-primary mr-2"></i>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar pb-20 space-y-6 md:space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-[24px] p-4 shadow-sm border border-white flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300">
              <div className={`w-10 h-10 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.color} shadow-lg ${stat.shadow} mb-3`}>
                <i className={`fa-solid ${stat.icon} text-base`}></i>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 truncate px-2">{stat.label}</p>
                <p className="text-sm md:text-lg font-black text-gray-800 tracking-tighter leading-none truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Recent Orders Stream */}
          <div className="lg:col-span-2 bg-white rounded-[32px] md:rounded-[40px] shadow-sm border border-white overflow-hidden flex flex-col">
            <div className="p-6 md:p-10 pb-4 md:pb-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Recent Activity</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live order pipeline</p>
              </div>
              <span className="px-3 md:px-4 py-1 md:py-1.5 bg-primaryLight text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                {todayOrders.length} Trx
              </span>
            </div>
            <div className="p-6 md:p-10 pt-4 md:pt-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-6 p-5 hover:bg-gray-50 transition-all rounded-[32px] group border border-transparent hover:border-gray-100">
                      <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform">
                        #{order.orderNumber.toString().slice(-2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800 text-lg tracking-tight uppercase">{order.tableName || order.orderType}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.items.length} Units</p>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <i className="fa-solid fa-clock-rotate-left mr-1"></i>
                            {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-xl tracking-tight">{formatPrice(order.total)}</p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mt-1.5 ${
                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'ready' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'preparing' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-inbox text-3xl text-gray-200"></i>
                  </div>
                  <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No activity recorded today</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Analytics */}
          <div className="bg-white rounded-[40px] shadow-sm border border-white overflow-hidden flex flex-col">
            <div className="p-10 pb-6 border-b border-gray-50">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Best Sellers</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Today's top performers</p>
            </div>
            <div className="p-10 pt-6">
              <div className="space-y-8">
                {topItems.length > 0 ? topItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-5 group">
                    <div className="relative shrink-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-[24px] object-cover shadow-md group-hover:scale-105 transition-transform" />
                      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-lg border-2 border-white ${
                        item.rank === 1 ? 'bg-amber-400' :
                        item.rank === 2 ? 'bg-slate-400' :
                        item.rank === 3 ? 'bg-orange-700' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {item.rank}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 truncate text-sm leading-tight">{item.name}</p>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-800 leading-none">{item.orders}</p>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Units</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 opacity-30">
                    <i className="fa-solid fa-chart-pie text-5xl mb-4"></i>
                    <p className="font-black text-[10px] uppercase tracking-widest">Awaiting Data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems > 0 && (
          <div className="bg-red-500 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-red-200">
            <div className="w-20 h-20 rounded-[32px] bg-white/20 flex items-center justify-center text-white">
              <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-white tracking-tight">Inventory Shortage Detected</h3>
              <p className="text-white/80 font-black text-[11px] uppercase tracking-widest mt-2">{lowStockItems} items require immediate replenishment</p>
            </div>
            <button className="px-10 py-5 bg-white text-red-600 font-black rounded-[24px] hover:bg-gray-50 transition-all shadow-xl uppercase tracking-widest text-[10px] shrink-0">
              Procure Stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
