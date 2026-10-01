import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Category, MenuItem, Order, OrderItem, Table, InventoryItem, Toast, OrderStatus, Settings } from '../types.js';

const API_URL = import.meta.env.VITE_API_URL;

interface AppContextType {
  // Auth
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Settings
  currency: string;
  tax_rate: number;
  restaurant_name: string;
  restaurant_logo: string | null;
  restaurant_address: string;
  restaurant_email: string;
  restaurantLogo: string | null;
  restaurantAddress: string;
  restaurantEmail: string;
  formatPrice: (amount: number) => string;
  updateSettings: (newSettings: Partial<Settings> | FormData) => Promise<void>;
  factoryReset: () => Promise<void>;
  kitchenMode: boolean;
  waiterMode: boolean;
  setKitchenMode: (v: boolean) => void;
  setWaiterMode: (v: boolean) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: any) => Promise<void>;
  updateMenuItem: (id: string, item: any) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  currentOrder: OrderItem[];
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  addToCurrentOrder: (item: MenuItem) => void;
  updateCurrentOrderItem: (itemId: string, quantity: number, notes?: string) => void;
  removeFromCurrentOrder: (itemId: string) => void;
  clearCurrentOrder: () => void;
  submitOrder: (orderType: 'dine-in' | 'takeaway' | 'delivery', customerName?: string, notes?: string, customerAddress?: string, customerPhone?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrder: (orderId: string, items: OrderItem[]) => Promise<void>;

  // Tables
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  updateTableStatus: (tableId: string, status: 'free' | 'occupied' | 'reserved') => Promise<void>;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: any) => Promise<void>;
  updateInventoryItem: (id: string, item: any) => Promise<void>;

  // Toast
  factoryReset: () => Promise<void>;
  sendOtp: () => Promise<boolean>;
  resetPassword: (data: any) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Order counter
  editingOrder: Order | null;
  loadOrderForEditing: (order: Order) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('pos_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [darkMode, setDarkMode] = useState(false);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]); // TODO: Add inventory API

  // Settings State
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0.00);
  const [restaurantName, setRestaurantName] = useState('Hotel POS');
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantEmail, setRestaurantEmail] = useState('');
  const [kitchenMode, setKitchenModeState] = useState<boolean>(() => localStorage.getItem('kitchenMode') !== 'false');
  const [waiterMode, setWaiterModeState] = useState<boolean>(() => localStorage.getItem('waiterMode') !== 'false');

  const setKitchenMode = (v: boolean) => { setKitchenModeState(v); localStorage.setItem('kitchenMode', String(v)); };
  const setWaiterMode = (v: boolean) => { setWaiterModeState(v); localStorage.setItem('waiterMode', String(v)); };

  // Local State
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, catsRes, menuRes, tablesRes, ordersRes, inventoryRes] = await Promise.all([
        fetch(`${API_URL}/settings`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/menu`),
        fetch(`${API_URL}/tables`),
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/inventory`)
      ]);

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setCurrency(settings.currency || 'USD');
        setTaxRate(parseFloat(settings.tax_rate) || 0.00);
        setRestaurantName(settings.restaurant_name || 'Hotel POS');
        setRestaurantLogo(settings.restaurant_logo || null);
        setRestaurantAddress(settings.restaurant_address || '');
        setRestaurantEmail(settings.restaurant_email || '');
      }

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData.map((c: any) => ({
          ...c,
          id: c.id.toString()
        })));
      }
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData.map((m: any) => ({
          ...m,
          id: m.id.toString(),
          categoryId: m.category_id.toString(),
          // DB might return available as 0/1, convert to boolean if needed
          available: !!m.available,
          costPrice: parseFloat(m.cost_price || 0),
          preparationTime: m.preparation_time
        })));
      }
      if (tablesRes.ok) setTables(await tablesRes.json());
      if (ordersRes.ok) {
        await handleOrdersResponse(ordersRes);
      }
      if (typeof inventoryRes !== "undefined" && inventoryRes.ok) {
        const invData = await inventoryRes.json();
        setInventory(invData.map((i: any) => ({
          ...i,
          id: i.id.toString(),
          minStock: parseFloat(i.min_stock)
        })));
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast('Failed to load data from server', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (res.ok) {
        await handleOrdersResponse(res);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_URL}/tables`);
      if (res.ok) setTables(await res.json());
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  };

  const handleOrdersResponse = async (res: Response) => {
    const ordersData = await res.json();
    setOrders(ordersData.map((o: any) => ({
      id: o.id.toString(),
      orderNumber: o.order_number,
      tableId: o.table_id,
      status: o.status,
      orderType: o.order_type,
      subtotal: parseFloat(o.subtotal),
      tax: parseFloat(o.tax),
      total: parseFloat(o.total),
      waiterId: o.waiter_id,
      waiterName: o.waiter_name || 'System',
      tableName: o.table_name,
      customerName: o.customer_name,
      customerAddress: o.customer_address,
      customerPhone: o.customer_phone,
      notes: o.notes,
      discount: 0,
      createdAt: o.created_at ? new Date(o.created_at.includes('T') || o.created_at.includes('Z') ? o.created_at : o.created_at.replace(' ', 'T') + 'Z') : new Date(),
      updatedAt: o.updated_at ? new Date(o.updated_at.includes('T') || o.updated_at.includes('Z') ? o.updated_at : o.updated_at.replace(' ', 'T') + 'Z') : new Date(),
      items: o.items?.map((i: any) => ({
        id: i.id.toString(),
        menuItemId: i.menu_item_id.toString(),
        name: i.name,
        price: parseFloat(i.price),
        costPrice: parseFloat(i.cost_price || 0),
        quantity: i.quantity,
        notes: i.notes
      })) || []
    })));
  };

  // Setup Polling for real-time updates (Orders & Tables)
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(() => {
      fetchOrders();
      fetchTables();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        sessionStorage.setItem('pos_user', JSON.stringify(userData));
        localStorage.clear(); // Wipe any old localStorage remnants
        showToast(`Welcome back, ${userData.name}!`, 'success');
        return true;
      } else {
        showToast('Invalid credentials', 'error');
        return false;
      }
    } catch (error) {
      showToast('Login failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('pos_user');
    sessionStorage.removeItem('currentPage');
    localStorage.clear(); // Wipe any old localStorage remnants
    setCurrentOrder([]);
    setSelectedTable(null);
    showToast('Logged out successfully', 'info');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const formatPrice = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    // Ensure there is a space between currency and amount if not already present in the string
    const displayCurrency = currency.endsWith(' ') || currency.endsWith('\u00A0') ? currency : `${currency} `;
    return `${displayCurrency.replace(/ /g, '\u00A0')}${formattedAmount}`;
  };

  const updateSettings = async (newSettings: Partial<Settings> | FormData) => {
    try {
      const isFormData = newSettings instanceof FormData;

      const updateRes = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: isFormData ? newSettings : JSON.stringify(newSettings)
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json().catch(() => ({}));
        showToast(errorData.message || 'Server error while updating settings', 'error');
        return;
      }

      // Refresh all settings from server to be sure
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.currency) setCurrency(data.currency);
        if (data.tax_rate) setTaxRate(parseFloat(data.tax_rate));
        if (data.restaurant_name) setRestaurantName(data.restaurant_name);
        if (data.restaurant_logo) setRestaurantLogo(data.restaurant_logo);
        if (data.restaurant_address) setRestaurantAddress(data.restaurant_address);
        
        showToast('Settings updated', 'success');
      }
    } catch (error) {
      console.error("Settings update error:", error);
      showToast('Failed to update settings. Please check your connection.', 'error');
    }
  };

  const factoryReset = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/reset`, { method: 'POST' });
      if (res.ok) {
        setOrders([]);
        setCurrentOrder([]);
        setSelectedTable(null);
        setCategories([]);
        setMenuItems([]);
        logout(); // Force logout as users might have been deleted
        showToast('System data reset successfully. Please log in again.', 'success');
      } else {
        showToast('Reset failed', 'error');
      }
    } catch (error) {
      showToast('Reset failed', 'error');
    }
  };

  const sendOtp = async () => {
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to send OTP', 'error');
        return false;
      }
    } catch (err) {
      showToast('Connection error', 'error');
      return false;
    }
  };

  const resetPassword = async (resetData: any) => {
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to reset password', 'error');
        return false;
      }
    } catch (err) {
      showToast('Connection error', 'error');
      return false;
    }
  };

  const addCategory = async (category: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (category instanceof FormData) {
      body = category;
    } else {
      body = JSON.stringify(category);
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers,
      body
    });
    if (res.ok) {
      const newCategory = await res.json();
      setCategories([...categories, newCategory]);
      showToast('Category added', 'success');
    }
  };

  const updateCategory = async (id: string, category: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (category instanceof FormData) {
      body = category;
      body.append('_method', 'PUT');
    } else {
      body = JSON.stringify(category);
      headers['Content-Type'] = 'application/json';
    }

    const method = category instanceof FormData ? 'POST' : 'PUT';

    const res = await fetch(`${API_URL}/categories/${id}`, {
      method,
      headers,
      body
    });
    if (res.ok) {
      // Refresh to get new image URL if updated
      const catsRes = await fetch(`${API_URL}/categories`);
      if (catsRes.ok) setCategories(await catsRes.json());

      showToast('Category updated', 'success');
    }
  };

  const deleteCategory = async (id: string) => {
    await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
    setCategories(categories.filter(c => c.id !== id));
    showToast('Category deleted', 'success');
  };

  const addMenuItem = async (item: any) => {
    // Check if item is FormData or needs to be converted
    let body;
    let headers: Record<string, string> = {};

    if (item instanceof FormData) {
      body = item;
      // Content-Type header is set automatically by browser with boundary for FormData
    } else {
      body = JSON.stringify(item);
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}/menu`, {
      method: 'POST',
      headers,
      body
    });
    if (res.ok) {
      setMenuItems([...menuItems, await res.json()]);
      showToast('Item added', 'success');
    }
  };

  const updateMenuItem = async (id: string, item: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (item instanceof FormData) {
      body = item;
      body.append('_method', 'PUT'); // Laravel method override for file components with PUT
      // Use POST for file uploads with method override or just POST if route allows
      // Actually standard way for files in PHP/Laravel PUT is tricky.
      // Easiest is POST with _method=PUT.
    } else {
      body = JSON.stringify(item);
      headers['Content-Type'] = 'application/json';
    }

    const method = item instanceof FormData ? 'POST' : 'PUT';

    const res = await fetch(`${API_URL}/menu/${id}`, {
      method,
      headers,
      body
    });
    if (res.ok) {
      // Refresh items to get new image URL if updated
      fetchData();
      showToast('Item updated', 'success');
    }
  };

  const deleteMenuItem = async (id: string) => {
    await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
    setMenuItems(menuItems.filter(m => m.id !== id));
    showToast('Item deleted', 'success');
  };

  const loadOrderForEditing = (order: Order) => {
    setEditingOrder(order);
    setCurrentOrder(order.items);
    if (order.tableId) {
      const table = tables.find(t => t.id === order.tableId);
      if (table) setSelectedTable(table);
    } else {
      setSelectedTable(null);
    }
  };

  // Order Logic
  const addToCurrentOrder = (item: MenuItem) => {
    const existingItem = currentOrder.find(o => o.menuItemId === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(o =>
        o.menuItemId === item.id ? { ...o, quantity: o.quantity + 1 } : o
      ));
    } else {
      setCurrentOrder([...currentOrder, {
        id: `temp_${Date.now()}`, // Temp ID until submitted
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: '',
        image: item.image,
      }]);
    }
    showToast(`${item.name} added`, 'success');
  };

  const updateCurrentOrderItem = (itemId: string, quantity: number, notes?: string) => {
    if (quantity <= 0) {
      removeFromCurrentOrder(itemId);
      return;
    }
    setCurrentOrder(currentOrder.map(o =>
      o.id === itemId ? { ...o, quantity, notes: notes ?? o.notes } : o
    ));
  };

  const removeFromCurrentOrder = (itemId: string) => {
    setCurrentOrder(currentOrder.filter(o => o.id !== itemId));
  };

  const clearCurrentOrder = () => {
    setCurrentOrder([]);
    setSelectedTable(null);
    setEditingOrder(null);
  };

  const submitOrder = async (orderType: 'dine-in' | 'takeaway' | 'delivery', customerName?: string, notes?: string, customerAddress?: string, customerPhone?: string, discountPercent: number = 0) => {
    if (currentOrder.length === 0) return;

    const subtotal = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const discountAmount = (subtotal + tax) * (discountPercent / 100);
    const total = subtotal + tax - discountAmount;

    const payload: any = {
      tableId: selectedTable?.id,
      orderType,
      items: currentOrder,
      subtotal,
      tax,
      discount: discountAmount,
      discountPercent: discountPercent,
      total,
      waiterId: user?.id,
      customerName,
      customerAddress,
      customerPhone,
      notes,
      status: kitchenMode ? 'pending' : 'completed'
    };

    if (editingOrder) {
      payload.orderNumber = editingOrder.orderNumber;
    }

    try {
      const url = editingOrder ? `${API_URL}/orders/${editingOrder.id}` : `${API_URL}/orders`;
      const method = editingOrder ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingOrder ? 'Order updated' : 'Order submitted', 'success');
        clearCurrentOrder();
        // Refresh data
        fetchData();
      } else {
        const errorData = await res.json();
        console.error("Order error:", errorData);
        let errorMessage = errorData.message || (editingOrder ? 'Failed to update order' : 'Failed to submit order');

        // If there are validation errors, append them
        if (errorData.errors) {
          const details = Object.values(errorData.errors).flat().join(', ');
          errorMessage += `: ${details}`;
        }

        showToast(errorMessage, 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      showToast('Order status updated', 'success');
      if (status === 'completed') fetchData(); // Refresh table status
    }
  };

  const updateOrder = async (orderId: string, items: OrderItem[]) => {
    // TODO: Implement update order API logic
    showToast('Update order not fully implemented in backend yet', 'info');
  };

  const updateTableStatus = async (tableId: string, status: 'free' | 'occupied' | 'reserved') => {
    const res = await fetch(`${API_URL}/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setTables(tables.map(t => t.id === tableId ? { ...t, status } : t));
    }
  };

  const addInventoryItem = async (item: any) => {
    try {
      const isFormData = item instanceof FormData;
      const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? item : JSON.stringify(item)
      });
      if (res.ok) {
        const newItem = await res.json();
        setInventory(prev => [...prev, {
          ...newItem,
          id: newItem.id.toString(),
          minStock: parseFloat(newItem.min_stock)
        }]);
        showToast('Inventory item added', 'success');
      }
    } catch (e) {
      showToast('Failed to add inventory item', 'error');
    }
  };

  const updateInventoryItem = async (id: string, item: any) => {
    try {
      const isFormData = item instanceof FormData;
      const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'POST', // Use POST with _method or match route for files
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? (() => {
          if (!item.has('_method')) item.append('_method', 'PUT');
          return item;
        })() : JSON.stringify(item)
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory(prev => prev.map(i => i.id === id ? {
          ...updated,
          id: updated.id.toString(),
          minStock: parseFloat(updated.min_stock)
        } : i));
        showToast('Inventory item updated', 'success');
      }
    } catch (e) {
      showToast('Failed to update inventory item', 'error');
    }
  };

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const toast: Toast = { id: `toast_${Date.now()}`, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => removeToast(toast.id), 4000);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <AppContext.Provider value={{
      user, login, logout,
      darkMode, toggleDarkMode,
      currency, tax_rate: taxRate,
      restaurant_name: restaurantName,
      restaurant_logo: restaurantLogo,
      restaurant_address: restaurantAddress,
      restaurantLogo,
      restaurantAddress,
      restaurantEmail,
      formatPrice,
      updateSettings,
      factoryReset,
      sendOtp,
      resetPassword,
      kitchenMode, waiterMode, setKitchenMode, setWaiterMode,

      categories, addCategory, updateCategory, deleteCategory,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
      orders, currentOrder, selectedTable, setSelectedTable,
      addToCurrentOrder, updateCurrentOrderItem, removeFromCurrentOrder, clearCurrentOrder,
      submitOrder, updateOrderStatus, updateOrder,
      tables, updateTableStatus, setTables,
      inventory, addInventoryItem, updateInventoryItem,
      toasts, showToast, removeToast,
      editingOrder, loadOrderForEditing,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
