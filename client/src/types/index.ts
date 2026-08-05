export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token?: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand: string;
  images: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardStats {
  users: { total: number };
  products: { total: number };
  orders: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    pendingOrders: number;
    completedOrders: number;
  };
  cache: {
    hits: number;
    misses: number;
    errors: number;
    hitRate: string;
  };
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}
