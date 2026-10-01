import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { InventoryItem } from '../types';

export const Inventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const [itemModal, setItemModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [itemForm, setItemForm] = useState({ name: '', quantity: '', unit: '', minStock: '', image: '' });

  const [addStockModal, setAddStockModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [addStockQty, setAddStockQty] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !showLowStock || item.quantity <= item.minStock;
    return matchesSearch && matchesLowStock;
  });

  const stats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.quantity > i.minStock).length,
    lowStock: inventory.filter(i => i.quantity <= i.minStock && i.quantity > 0).length,
    outOfStock: inventory.filter(i => i.quantity === 0).length,
  };

  const openItemModal = (item?: InventoryItem) => {
    if (item) {
      setItemForm({
        name: item.name,
        quantity: item.quantity.toString(),
        unit: item.unit,
        minStock: item.minStock.toString(),
        image: item.image,
      });
      setItemModal({ open: true, item });
    } else {
      setItemForm({ name: '', quantity: '', unit: 'pcs', minStock: '', image: '' });
      setItemModal({ open: true, item: null });
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.quantity || !itemForm.unit) return;

    const formData = new FormData();
    formData.append('name', itemForm.name);
    formData.append('quantity', itemForm.quantity);
    formData.append('unit', itemForm.unit);
    formData.append('min_stock', itemForm.minStock || '5');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (itemModal.item) {
      updateInventoryItem(itemModal.item.id, formData);
    } else {
      addInventoryItem(formData);
    }
    setItemModal({ open: false, item: null });
    setImageFile(null);
  };

  const handleAddStock = () => {
    if (!addStockModal.item || !addStockQty) return;
    const newQty = addStockModal.item.quantity + parseFloat(addStockQty);
    updateInventoryItem(addStockModal.item.id, { quantity: newQty });
    setAddStockModal({ open: false, item: null });
    setAddStockQty('');
  };

  const getStockLevel = (item: InventoryItem) => {
    if (item.quantity === 0) return { bg: 'bg-red-50 text-red-500', bar: 'bg-red-500', text: 'Out of Stock' };
    if (item.quantity <= item.minStock) return { bg: 'bg-amber-50 text-amber-500', bar: 'bg-amber-500', text: 'Low Stock' };
    return { bg: 'bg-emerald-50 text-emerald-500', bar: 'bg-emerald-500', text: 'Healthy' };
  };

  return (
    <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
      {/* Header */}
      <header className="h-24 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 z-20">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Stock Inventory</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage supplies & raw materials</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => openItemModal()}
            className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 text-sm uppercase tracking-wider"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            New Item
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Tracking Items', value: stats.total, icon: 'fa-boxes-stacked', color: 'bg-gray-50 text-gray-400' },
            { label: 'Adequate Stock', value: stats.inStock, icon: 'fa-square-check', color: 'bg-emerald-50 text-emerald-500' },
            { label: 'Critical Level', value: stats.lowStock, icon: 'fa-triangle-exclamation', color: 'bg-amber-50 text-amber-500' },
            { label: 'Stock Exhausted', value: stats.outOfStock, icon: 'fa-ban', color: 'bg-red-50 text-red-500' },
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

        {/* Search & Actions */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
             <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
             <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by item name..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-transparent rounded-[24px] text-gray-800 font-bold focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all ${showLowStock
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-100'
              : 'bg-white text-gray-400 hover:text-amber-500'
            }`}
          >
            <i className="fa-solid fa-bell-slash mr-2"></i>
            Low Stock Only
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Vol</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Health</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.map((item) => {
                const level = getStockLevel(item);
                const percentage = Math.min((item.quantity / (item.minStock * 2)) * 100, 100);

                return (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] overflow-hidden border border-gray-100 shrink-0">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-800 tracking-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min: {item.minStock} {item.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div>
                         <p className="text-2xl font-black text-gray-800 tracking-tight">{item.quantity} <span className="text-sm text-gray-400 font-bold ml-1">{item.unit}</span></p>
                         <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                            <div className={`h-full ${level.bar} rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${level.bg}`}>
                         {level.text}
                       </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setAddStockModal({ open: true, item });
                            setAddStockQty('');
                          }}
                          className="px-5 py-2.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-50"
                        >
                          Fill Stock
                        </button>
                        <button
                          onClick={() => openItemModal(item)}
                          className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <i className="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredInventory.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center opacity-30">
               <i className="fa-solid fa-warehouse text-9xl mb-8"></i>
               <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Inventory Clear</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">No matching resources found</p>
            </div>
          )}
        </div>
      </div>

      {/* Item Modal */}
      <Modal
        isOpen={itemModal.open}
        onClose={() => setItemModal({ open: false, item: null })}
        title={itemModal.item ? 'Update Resource' : 'Register New Resource'}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Item Descriptor</label>
            <input
              type="text"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g. Fresh Tomatoes"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Initial Vol</label>
              <input
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Unit System</label>
              <select
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="liters">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Safety Threshold (Min)</label>
            <input
              type="number"
              value={itemForm.minStock}
              onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
              placeholder="5"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resource Asset</label>
             <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                   {imageFile || itemForm.image ? (
                     <img
                       src={imageFile ? URL.createObjectURL(imageFile) : itemForm.image}
                       alt="Preview"
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-200"></i>
                   )}
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                   >
                     <i className="fa-solid fa-camera"></i>
                   </button>
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-500 mb-2">High-res PNG or JPG</p>
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all"
                   >
                    Pick File
                   </button>
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
          </div>

          <div className="flex gap-4 pt-4">
             <button
              onClick={() => setItemModal({ open: false, item: null })}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
            >
              Discard
            </button>
            <button
              onClick={handleSaveItem}
              className="flex-2 py-4 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs"
            >
              {itemModal.item ? 'Apply Changes' : 'Confirm Entry'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        isOpen={addStockModal.open}
        onClose={() => setAddStockModal({ open: false, item: null })}
        title="Refill Inventory"
        size="sm"
      >
        <div className="space-y-6">
          {addStockModal.item && (
            <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                 <img src={addStockModal.item.image} alt={addStockModal.item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 tracking-tight">{addStockModal.item.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Stock: {addStockModal.item.quantity} {addStockModal.item.unit}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Refill Quantity ({addStockModal.item?.unit})</label>
            <input
              type="number"
              value={addStockQty}
              onChange={(e) => setAddStockQty(e.target.value)}
              placeholder="0"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
             <button
              onClick={() => setAddStockModal({ open: false, item: null })}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStock}
              className="flex-2 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-50 uppercase tracking-widest text-xs"
            >
              Submit Refill
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
