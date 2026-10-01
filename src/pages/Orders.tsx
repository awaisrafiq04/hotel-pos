import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SearchIcon, FilterIcon, ClockIcon, CheckIcon, PlayIcon,
  XIcon, EditIcon, PrinterIcon, DownloadIcon, TruckIcon, CalendarIcon
} from '../components/Icons';
import { Order, OrderStatus } from '../types.js';
import { Price } from '../components/Price';
import { printOrder, downloadReceipt } from '../utils/receipt';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

export const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const {
    orders, updateOrderStatus, user, loadOrderForEditing,
    restaurant_name, restaurantLogo, restaurantAddress, formatPrice, kitchenMode
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string | null>(() => {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  });

  // Filter orders based on role
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toString().includes(searchQuery) ||
      order.tableName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.waiterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesRole = user?.role === 'admin' || user?.role === 'chef' || order.waiterId === user?.id;

    // Convert order.createdAt (Date object) to local YYYY-MM-DD
    const orderDateObj = new Date(order.createdAt);
    const orderDateStr = orderDateObj.getFullYear() + '-' +
      String(orderDateObj.getMonth() + 1).padStart(2, '0') + '-' +
      String(orderDateObj.getDate()).padStart(2, '0');

    const matchesDate = !dateFilter || orderDateStr === dateFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesDate;
  });

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    served: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'completed',
      completed: null,
      cancelled: null,
    };
    return flow[status];
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const handleEditOrder = (order: Order) => {
    loadOrderForEditing(order);
    onNavigate('pos');
  };

  return (
    <div className="p-8 space-y-8 bg-bg-soft min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Order History</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live System</span>
            </div>
          </div>
          <p className="text-gray-500 font-medium mt-1">
            {user?.role === 'waiter' ? 'Manage your personal orders' : 'Full restaurant order stream'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, table or waiter..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
          />
        </div>

        <div className="relative">
          <i className="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold appearance-none focus:outline-none focus:border-primary transition-all shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="relative">
          <i className="fa-solid fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="date"
            value={dateFilter || ''}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Order Header */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-gray-800">#{order.orderNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'completed' ? 'bg-gray-50 text-gray-400' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                    'bg-primaryLight text-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <i className="fa-solid fa-clock"></i>
                  <span>{getTimeAgo(order.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-y-2 gap-x-4 items-center">
                {order.tableName && (
                  <div className="flex items-center gap-2 text-gray-700 font-extrabold text-sm">
                    <i className="fa-solid fa-table-cells text-primary"></i>
                    <span>{order.tableName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <i className="fa-solid fa-user"></i>
                  <span>{order.waiterName}</span>
                </div>
              </div>

              {(order.customerPhone || order.customerAddress) && (
                <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                    <i className="fa-solid fa-truck"></i>
                    <span>Delivery Link</span>
                  </div>
                  <div className="space-y-1.5">
                    {order.customerName && <p className="text-sm font-bold text-gray-800"><span className="text-gray-400 font-medium">To:</span> {order.customerName}</p>}
                    {order.customerPhone && <p className="text-sm font-bold text-gray-800"><span className="text-gray-400 font-medium">Tel:</span> {order.customerPhone}</p>}
                    {order.customerAddress && <p className="text-sm font-bold text-gray-800 leading-relaxed"><span className="text-gray-400 font-medium">At:</span> {order.customerAddress}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="p-6 max-h-48 overflow-y-auto space-y-4 no-scrollbar">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-gray-400 text-xs shrink-0">x{item.quantity}</span>
                    <p className="font-bold text-gray-700 truncate text-sm">{item.name}</p>
                  </div>
                  <span className="font-black text-gray-800 text-sm whitespace-nowrap">
                    <Price amount={item.price * item.quantity} />
                  </span>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/50 mt-auto">
              <div className="flex items-center justify-between mb-5">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Grand Total</span>
                <span className="text-2xl font-black text-primary"><Price amount={order.total} /></span>
              </div>

              <div className="flex gap-3">
                {(user?.role === 'admin' || user?.role === 'waiter') && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleEditOrder(order)}
                    className={`py-3 bg-white border border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm ${order.status === 'completed' ? 'w-12' : 'flex-1'}`}
                    title="Edit Order"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    {order.status !== 'completed' && <span className="ml-2">Edit</span>}
                  </button>
                )}

                {kitchenMode && getNextStatus(order.status) && (
                  (() => {
                    const nextStatus = getNextStatus(order.status)!;
                    let canUpdate = false;

                    if (user?.role === 'admin') canUpdate = true;
                    else if (user?.role === 'chef') canUpdate = ['accepted', 'preparing', 'ready'].includes(nextStatus);
                    else if (user?.role === 'waiter') canUpdate = ['served', 'completed'].includes(nextStatus);

                    if (!canUpdate) return null;

                    return (
                      <button
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        className="flex-2 py-3 bg-primary text-white font-black rounded-xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 text-sm uppercase tracking-wider"
                      >
                        {order.status === 'pending' ? 'Accept Order' : 
                         order.status === 'accepted' ? 'Start Cooking' :
                         order.status === 'preparing' ? 'Ready for Pickup' :
                         order.status === 'ready' ? 'Serve Table' : 'Finalize Pay'}
                      </button>
                    );
                  })()
                )}

                {kitchenMode && order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="w-12 py-3 bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}


                <button
                  onClick={() => printOrder(order, restaurant_name, restaurantLogo, restaurantAddress, formatPrice)}
                  className="flex-1 py-3 bg-primary text-white font-black rounded-xl hover:bg-[#b01356] transition-colors shadow-lg shadow-pink-100 text-sm"
                >
                  <i className="fa-solid fa-print mr-2"></i>
                  Print
                </button>
                <button
                  onClick={() => downloadReceipt(order, restaurant_name, restaurantLogo, restaurantAddress, formatPrice)}
                  className="w-12 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <i className="fa-solid fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-32 bg-white rounded-3xl border border-gray-100">
          <i className="fa-solid fa-box-open text-7xl text-gray-100 mb-6"></i>
          <h3 className="text-xl font-extrabold text-gray-800">No Orders Found</h3>
          <p className="text-gray-400 font-medium mt-1">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};
