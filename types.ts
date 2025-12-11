
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  stock: number;
  category: string;
  imageUrl: string; // Mapped from image_url in DB
  rating: number;
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string; // UUID
  orderNumber: string; // ANS-YYYYMMDD-XXXXXX
  userId?: string;
  customerEmail: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  shippingDetails: ShippingDetails;
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  paymentId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
