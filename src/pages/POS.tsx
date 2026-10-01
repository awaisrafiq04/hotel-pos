import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Price } from '../components/Price';
import {
  SearchIcon, PlusIcon, MinusIcon, TrashIcon, NoteIcon,
  TableIcon, ShoppingBagIcon, TruckIcon, XIcon, ClockIcon
} from '../components/Icons';

export const POS: React.FC = () => {
  const {
    categories, menuItems, currentOrder, selectedTable, tables,
    addToCurrentOrder, updateCurrentOrderItem, removeFromCurrentOrder,
    clearCurrentOrder, submitOrder, setSelectedTable, editingOrder, tax_rate, user, kitchenMode
  } = useApp();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteModal, setNoteModal] = useState<{ open: boolean; itemId: string; note: string }>({ open: false, itemId: '', note: '' });
  const [submitModal, setSubmitModal] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableModal, setTableModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Pre-fill when editing
  React.useEffect(() => {
    if (editingOrder) {
      setOrderType(editingOrder.orderType);
      setCustomerName(editingOrder.customerName || '');
      setCustomerAddress(editingOrder.customerAddress || '');
      setCustomerPhone(editingOrder.customerPhone || '');
      setDiscount(editingOrder.discountPercent || 0);
    }
  }, [editingOrder]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const subtotal = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (tax_rate / 100);
  const discountAmount = (subtotal + tax) * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const handleSubmitOrder = () => {
    submitOrder(orderType, customerName, '', customerAddress, customerPhone, discount);
    setSubmitModal(false);
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setDiscount(0);
  };

  const freeTables = tables.filter(t => t.status === 'free');

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden bg-bg-soft">
        {/* Top Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0 bg-bg-soft/80 backdrop-blur-md sticky top-0 z-20">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 capitalize leading-none">{editingOrder ? `Edit #${editingOrder.orderNumber}` : 'Menu'}</h2>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full w-32 md:w-72 focus:outline-none transition-all shadow-sm text-sm"
              />
            </div>

            {/* Table Selection */}
            <button
              onClick={() => setTableModal(true)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border transition-all shadow-sm ${selectedTable
                ? 'bg-primaryLight border-primary text-primary font-bold'
                : 'bg-white border-gray-200 text-gray-600'
                }`}
            >
              <i className="fa-solid fa-table-cells text-xs"></i>
              <span className="text-xs md:text-sm">{selectedTable ? selectedTable.name : 'Table'}</span>
            </button>

            {/* Profile (Placeholder) */}
            <div className="flex items-center gap-2 cursor-pointer bg-white p-1 rounded-full border border-gray-100 shadow-sm sm:px-3 sm:py-1.5">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] md:text-xs font-black">
                {user?.name?.charAt(0)}
              </div>
              <span className="font-bold text-xs text-gray-700 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Middle Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-2">

            {/* Order Lists (Recent/Active) */}
            {/* <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[19px] font-bold text-gray-800">Recent Orders</h3>
              <button className="text-primary text-sm font-bold hover:underline">See All &rarr;</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* This could be mapped from orders state */}
            {/* </div>
          </section> */}

            {/* Choose Category */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-[19px] font-bold text-gray-800">Choose Category</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <div
                  onClick={() => setSelectedCategory('all')}
                  className={`min-w-[90px] h-[100px] rounded-[18px] flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm transition-all border-2 ${selectedCategory === 'all'
                    ? 'bg-primaryLight border-primary'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <span className="text-3xl leading-none">🍱</span>
                  <span className={`text-xs font-bold ${selectedCategory === 'all' ? 'text-gray-800' : 'text-gray-500'}`}>All</span>
                </div>

                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-w-[90px] h-[100px] rounded-[18px] flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm transition-all border-2 ${selectedCategory === cat.id
                      ? 'bg-primaryLight border-primary'
                      : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-full" />
                    <span className={`text-[11px] font-bold truncate max-w-[70px] ${selectedCategory === cat.id ? 'text-gray-800' : 'text-gray-500'}`}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Menu Items */}
            <section>
              <h3 className="text-[19px] font-bold text-gray-800 mb-5">Special Menu For You</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
                {filteredItems.map((item) => {
                  const cartItem = currentOrder.find(o => o.menuItemId === item.id);
                  const isInCart = !!cartItem;

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isInCart && addToCurrentOrder(item)}
                      className={`bg-white rounded-[20px] lg:rounded-2xl overflow-hidden shadow-sm border flex flex-col cursor-pointer transition-all hover:shadow-md lg:hover:-translate-y-1 ${isInCart ? 'border-primary' : 'border-gray-100'}`}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-24 lg:h-32 object-cover" />
                      <div className={`${isInCart ? 'bg-primary text-white' : 'bg-white text-gray-800'} p-2.5 lg:p-4 flex-1 flex flex-col`}>
                        <div className="h-9 lg:h-11 mb-1 lg:mb-2 overflow-hidden flex items-center">
                          <h4 className="font-black lg:font-bold text-[11px] lg:text-sm leading-tight lg:leading-snug uppercase lg:normal-case tracking-tight lg:tracking-normal line-clamp-2">{item.name}</h4>
                        </div>
                        <p className={`text-sm lg:text-lg font-black mt-0.5 mb-2 lg:mb-3 ${isInCart ? 'text-white' : 'text-gray-800'} tracking-tighter lg:tracking-tight`}>
                          <Price amount={item.price} />
                        </p>

                        <div className="mt-auto">
                          {isInCart ? (
                            <div className="flex items-center justify-between border border-white/40 rounded-lg lg:rounded-xl p-1 lg:p-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); updateCurrentOrderItem(cartItem.id, cartItem.quantity - 1); }}
                                className="w-6 h-6 lg:w-8 lg:h-8 rounded-md lg:rounded-full border border-white/80 flex items-center justify-center hover:bg-white/10 transition-colors"
                              >
                                <i className="fa-solid fa-minus text-[8px] lg:text-xs"></i>
                              </button>
                              <span className="font-black text-xs lg:text-lg">{cartItem.quantity}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateCurrentOrderItem(cartItem.id, cartItem.quantity + 1); }}
                                className="w-6 h-6 lg:w-8 lg:h-8 rounded-md lg:rounded-full bg-white text-primary flex items-center justify-center shadow-sm lg:shadow hover:bg-gray-50 transition-colors"
                              >
                                <i className="fa-solid fa-plus text-[8px] lg:text-xs"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] lg:text-xs font-black lg:font-normal text-gray-300 lg:text-gray-400 uppercase lg:normal-case tracking-widest lg:tracking-normal">
                                {item.available ? 'Available' : 'Out of Stock'}
                              </span>
                              <button className="w-7 h-7 lg:w-8 lg:h-8 bg-primaryLight text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                <i className="fa-solid fa-plus text-[10px] lg:text-xs"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <i className="fa-solid fa-utensils text-5xl mb-4 opacity-20"></i>
                  <p className="font-bold">No items found in this category</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar (Cart) */}
          <aside className="w-[300px] xl:w-[360px] bg-white border-l border-gray-100 flex flex-col p-4 xl:p-6 hidden lg:flex shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.03)]">
            {/* Table Details */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">{selectedTable ? selectedTable.name : 'Take Away'}</h2>
                <p className="text-sm text-gray-500 mt-0.5 font-medium">{customerName || 'New Customer'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (window.confirm('Clear current order?')) {
                      clearCurrentOrder();
                      setDiscount(0);
                    }
                  }}
                  className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Clear Cart"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
                <button
                  onClick={() => setSubmitModal(true)}
                  className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <i className="fa-solid fa-pen text-xs"></i>
                </button>
              </div>
            </div>

            {/* Order Type Tabs */}
            <div className="flex bg-primaryLight/50 rounded-xl p-1 mb-6">
              <button
                onClick={() => setOrderType('dine-in')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${orderType === 'dine-in' ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-white/50'}`}
              >
                Dine In
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${orderType === 'takeaway' ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-white/50'}`}
              >
                Take Away
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${orderType === 'delivery' ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-white/50'}`}
              >
                Delivery
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-2 no-scrollbar">
              {currentOrder.map((item) => (
                <div key={item.id} className="flex gap-4 relative group">
                  <img src={item.image} alt={item.name} className="w-[72px] h-[72px] rounded-xl object-cover shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-800 pr-5 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium"><Price amount={item.price} /></p>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCurrentOrderItem(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-100 rounded text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <i className="fa-solid fa-minus text-[10px]"></i>
                        </button>
                        <span className="font-bold text-gray-800 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCurrentOrderItem(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-primaryLight rounded text-primary hover:bg-pink-100 transition-colors"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                        </button>
                      </div>
                      <span className="font-bold text-primary text-sm"><Price amount={item.price * item.quantity} /></span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCurrentOrder(item.id)}
                    className="absolute top-0 right-0 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <i className="fa-solid fa-times text-sm"></i>
                  </button>
                </div>
              ))}

              {currentOrder.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <i className="fa-solid fa-cart-shopping text-6xl mb-4 opacity-20"></i>
                  <p className="text-sm font-bold">Your cart is empty</p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            {currentOrder.length > 0 && (
              <>
                <div className="mt-4 pt-5 border-t border-gray-100 space-y-3 shrink-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-800"><Price amount={subtotal} /></span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Tax ({tax_rate}%)</span>
                      <span className="font-bold text-gray-800"><Price amount={tax} /></span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500 font-medium">Discount (%)</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={discount || ''} 
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-16 px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-right font-bold text-gray-800 focus:bg-white focus:border-primary outline-none transition-all text-xs"
                      />
                      <span className="text-gray-400 text-xs font-black">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[17px] pt-4 mt-2 border-t border-gray-200 border-dashed">
                    <span className="font-extrabold text-gray-800">Total</span>
                    <span className="font-extrabold text-gray-800"><Price amount={total} /></span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6 shrink-0">
                  {!kitchenMode && (
                    <div className="flex items-center gap-1.5 mb-3 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Direct Mode — No Kitchen</span>
                    </div>
                  )}
                  <button
                    onClick={() => kitchenMode ? setSubmitModal(true) : handleSubmitOrder()}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-[#b01356] transition-colors text-sm"
                  >
                    {editingOrder ? 'Update Order' : kitchenMode ? 'Place Order' : '⚡ Complete Order'}
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>

        {/* Note Modal */}
        <Modal
          isOpen={noteModal.open}
          onClose={() => setNoteModal({ open: false, itemId: '', note: '' })}
          title="Item Note"
          size="sm"
        >
          <textarea
            value={noteModal.note}
            onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
            placeholder="Special instructions..."
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-medium"
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setNoteModal({ open: false, itemId: '', note: '' })}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const item = currentOrder.find(o => o.id === noteModal.itemId);
                if (item) updateCurrentOrderItem(item.id, item.quantity, noteModal.note);
                setNoteModal({ open: false, itemId: '', note: '' });
              }}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#b01356] transition-colors shadow-md"
            >
              Save Note
            </button>
          </div>
        </Modal>

        {/* Table Selection Modal */}
        <Modal
          isOpen={tableModal}
          onClose={() => setTableModal(false)}
          title="Select Dining Table"
          size="lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  setOrderType('dine-in');
                  setTableModal(false);
                }}
                disabled={table.status !== 'free' && selectedTable?.id !== table.id}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedTable?.id === table.id
                  ? 'bg-primaryLight border-primary text-primary shadow-md'
                  : table.status === 'free'
                    ? 'bg-white border-gray-100 hover:border-primaryLight text-gray-700'
                    : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                  }`}
              >
                <i className={`fa-solid fa-table-cells text-2xl ${selectedTable?.id === table.id ? 'text-primary' : 'text-gray-300'}`}></i>
                <p className="font-extrabold">{table.name}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">{table.status}</p>
              </button>
            ))}
          </div>
        </Modal>

        {/* Submit Order Modal */}
        <Modal
          isOpen={submitModal}
          onClose={() => setSubmitModal(false)}
          title="Confirm Order Details"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Order Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dine-in', label: 'Dine In', icon: 'fa-chair' },
                  { id: 'takeaway', label: 'Takeaway', icon: 'fa-bag-shopping' },
                  { id: 'delivery', label: 'Delivery', icon: 'fa-truck' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setOrderType(type.id as typeof orderType)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${orderType === type.id
                      ? 'border-primary bg-primaryLight text-primary font-bold'
                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    <i className={`fa-solid ${type.icon} text-xl`}></i>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: John Doe"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {orderType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Enter full address"
                      rows={2}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-5 bg-primaryLight/30 rounded-2xl border border-primaryLight">
              <div className="flex justify-between text-lg font-extrabold text-gray-800">
                <span>Grand Total</span>
                <span className="text-primary"><Price amount={total} /></span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSubmitModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrder}
                className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-[#b01356] transition-colors shadow-lg shadow-pink-100"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </Modal>

        {/* Mobile Cart Toggle (Floating) */}
        {currentOrder.length > 0 && (
          <button
            onClick={() => setShowCart(!showCart)}
            className="lg:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce-subtle"
          >
            <div className="relative">
              <i className="fa-solid fa-cart-shopping text-xl"></i>
              <span className="absolute -top-3 -right-3 w-6 h-6 bg-white text-primary text-[10px] font-extrabold flex items-center justify-center rounded-full border-2 border-primary">
                {currentOrder.length}
              </span>
            </div>
          </button>
        )}

        {/* Mobile Cart Overlay (Drawer) */}
      {showCart && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] animate-in fade-in duration-300"
            onClick={() => setShowCart(false)}
          />
          
          <div className="lg:hidden fixed inset-y-0 right-0 z-[60] w-[85%] sm:w-1/2 md:w-[400px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight leading-none">Order Details</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  {selectedTable ? selectedTable.name : 'Take Away'} • {currentOrder.length} Items
                </p>
              </div>
              <button 
                onClick={() => setShowCart(false)} 
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar mb-6">
              {currentOrder.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-xs text-gray-800 truncate pr-3">{item.name}</h4>
                      <button
                        onClick={() => removeFromCurrentOrder(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <i className="fa-solid fa-times text-[10px]"></i>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-gray-100">
                        <button
                          onClick={() => updateCurrentOrderItem(item.id, item.quantity - 1)}
                          className="text-gray-400 hover:text-primary"
                        >
                          <i className="fa-solid fa-minus text-[8px]"></i>
                        </button>
                        <span className="font-black text-gray-800 text-[10px] w-3 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCurrentOrderItem(item.id, item.quantity + 1)}
                          className="text-primary"
                        >
                          <i className="fa-solid fa-plus text-[8px]"></i>
                        </button>
                      </div>
                      <span className="font-black text-gray-800 text-xs"><Price amount={item.price * item.quantity} /></span>
                    </div>
                  </div>
                </div>
              ))}

              {currentOrder.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <i className="fa-solid fa-shopping-basket text-4xl mb-3 opacity-20"></i>
                  <p className="text-[10px] font-black uppercase tracking-widest">Empty Cart</p>
                </div>
              )}
            </div>

            {currentOrder.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payable</span>
                  <span className="text-xl font-black text-primary"><Price amount={total} /></span>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setSubmitModal(true);
                  }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-pink-100 uppercase tracking-widest text-[10px] hover:bg-[#b01356] transition-all"
                >
                  Confirm Order
                </button>
              </div>
            )}
          </div>
        </>
      )}

      </div>
    </>
  );
};
