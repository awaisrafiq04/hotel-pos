export type UserRole = 'admin' | 'waiter' | 'chef';

export type Currency = string;

export interface Settings {
  currency: Currency;
  exchangeRates: Record<Currency, number>;
  tax_rate: number;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_email: string;
  restaurant_logo?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Added for simple auth management
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image: string;
  description: string;
  available: boolean;
  costPrice?: number;
  preparationTime?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  costPrice?: number;
  quantity: number;
  notes: string;
  image: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Order {
  id: string;
  orderNumber: number;
  tableId?: string;
  tableName?: string;
  items: OrderItem[];
  status: OrderStatus;
  orderType: OrderType;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  waiterId: string;
  waiterName: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  notes?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  currentOrderId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  image: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
