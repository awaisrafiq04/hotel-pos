import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';

export const Tables: React.FC = () => {
  const { tables, updateTableStatus, orders, setTables, user } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });

  const filteredTables = tables.filter(table => {
    if (statusFilter === 'all') return true;
    return table.status === statusFilter;
  });

  const statusStyles = {
    free: { 
      bg: 'bg-emerald-50 border-emerald-100', 
      text: 'text-emerald-700', 
      badge: 'bg-emerald-500',
      btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
    },
    occupied: { 
      bg: 'bg-pink-50 border-pink-100', 
      text: 'text-primary', 
      badge: 'bg-primary',
      btn: 'bg-primary hover:bg-pink-600 shadow-pink-100'
    },
    reserved: { 
      bg: 'bg-amber-50 border-amber-100', 
      text: 'text-amber-700', 
      badge: 'bg-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
    },
  };

  const getTableOrder = (tableId: string) => {
    return orders.find(o => o.tableId === tableId && !['completed', 'cancelled'].includes(o.status));
  };

  const stats = {
    total: tables.length,
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTable)
      });
      if (res.ok) {
        const addedTable = await res.json();
        setTables(prev => [...prev, addedTable]);
        setShowAddModal(false);
        setNewTable({ name: '', capacity: 4 });
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleDeleteTable = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tables/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTables(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
      {/* Header */}
      <header className="h-24 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 z-20">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Floor Management</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Real-time table status & occupancy</p>
        </div>

        <div className="flex items-center gap-4">
           {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 text-sm uppercase tracking-wider"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              Add Table
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Floor', value: stats.total, icon: 'fa-table-cells', color: 'bg-gray-100 text-gray-400' },
            { label: 'Available', value: stats.free, icon: 'fa-circle-check', color: 'bg-emerald-50 text-emerald-500' },
            { label: 'Occupied', value: stats.occupied, icon: 'fa-circle-user', color: 'bg-pink-50 text-primary' },
            { label: 'Reserved', value: stats.reserved, icon: 'fa-calendar-check', color: 'bg-amber-50 text-amber-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[32px] p-8 shadow-sm border border-white flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl ${stat.color}`}>
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex gap-3">
            {['all', 'free', 'occupied', 'reserved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                  ? 'bg-primary text-white shadow-lg shadow-pink-100'
                  : 'bg-white text-gray-400 hover:bg-gray-50 border border-transparent'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing {filteredTables.length} Tables
          </span>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {filteredTables.map((table) => {
            const styles = statusStyles[table.status];
            const tableOrder = getTableOrder(table.id);

            return (
              <div
                key={table.id}
                className={`group relative bg-white rounded-[40px] p-8 border-2 ${styles.bg} ${styles.border} flex flex-col items-center transition-all hover:shadow-2xl hover:-translate-y-2`}
              >
                {/* Status Indicator */}
                <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${styles.badge} ${table.status === 'occupied' ? 'animate-pulse' : ''}`} />

                {/* Admin Actions */}
                {user?.role === 'admin' && (
                  <button
                    onClick={(e) => handleDeleteTable(table.id, e)}
                    className="absolute top-5 left-5 w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                )}

                {/* Table Icon */}
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${styles.bg} ${styles.text} text-3xl transition-transform group-hover:scale-110 duration-500`}>
                   <i className="fa-solid fa-chair"></i>
                </div>

                <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-1">{table.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-6">
                  <i className="fa-solid fa-users text-xs"></i>
                  <span>{table.capacity} Capacity</span>
                </div>

                {tableOrder && (
                  <div className="w-full mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Active Order</p>
                    <p className="text-sm font-black text-gray-800 text-center tracking-tight">#{tableOrder.orderNumber.toString().slice(-3)}</p>
                    <p className="text-lg font-black text-primary text-center mt-1">
                       ${tableOrder.total.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="w-full mt-auto grid grid-cols-1 gap-2">
                  {table.status !== 'free' && (
                    <button
                      onClick={() => updateTableStatus(table.id, 'free')}
                      className="w-full py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-check"></i>
                      Set Free
                    </button>
                  )}
                  {table.status !== 'occupied' && (
                    <button
                      onClick={() => updateTableStatus(table.id, 'occupied')}
                      className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-utensils"></i>
                      Occupy
                    </button>
                  )}
                  {table.status !== 'reserved' && (
                    <button
                      onClick={() => updateTableStatus(table.id, 'reserved')}
                      className="w-full py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-calendar-day"></i>
                      Reserve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Table Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Table"
        size="md"
      >
        <form onSubmit={handleAddTable} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Table Identifier</label>
            <input
              required
              placeholder="Ex: Table 04 or VIP-1"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
              value={newTable.name}
              onChange={e => setNewTable({ ...newTable, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Guest Capacity</label>
            <div className="relative">
               <i className="fa-solid fa-users absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
               <input
                required
                type="number"
                min="1"
                placeholder="4"
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                value={newTable.capacity}
                onChange={e => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
             <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-2 py-4 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs"
            >
              Create Table
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
