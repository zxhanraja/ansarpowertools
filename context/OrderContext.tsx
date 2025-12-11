import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  createOrder: (order: Order) => Promise<{ error: any }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, tracking?: string, courier?: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth(); // Refresh orders when user logs in

  const fetchOrders = async () => {
    // Fetch orders with their items and the product details for the items
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:products (image_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    if (data) {
      // Map DB response to Order type
      const mappedOrders: Order[] = data.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        customerEmail: o.customer_email,
        totalAmount: Number(o.total_amount),
        currency: o.currency,
        status: o.status as OrderStatus,
        shippingDetails: o.shipping_details,
        trackingNumber: o.tracking_number,
        courierName: o.courier_name,
        paymentId: o.payment_id,
        createdAt: o.created_at,
        items: (o.items || []).map((i: any) => ({
          id: i.product_id, // Map order_item.product_id to CartItem.id
          name: i.name,
          price: Number(i.unit_price),
          quantity: i.quantity,
          imageUrl: i.product?.image_url || '',
          // Add default values for other Product fields not stored in order_items
          description: '', 
          currency: o.currency,
          sku: '',
          stock: 0,
          category: '',
          rating: 0
        }))
      }));
      setOrders(mappedOrders);
    }
  };

  // Subscribe to changes or refresh on mount/user change
  useEffect(() => {
    fetchOrders();

    // Setup realtime subscription
    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createOrder = async (order: Order) => {
    // 1. Insert into Orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: order.id, // Use the ID generated in checkout
        order_number: order.orderNumber,
        user_id: order.userId,
        customer_email: order.customerEmail,
        total_amount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        shipping_details: order.shippingDetails,
        payment_id: order.paymentId
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { error: orderError };
    }

    // 2. Insert into Order Items table
    const itemsData = order.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsData);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return { error: itemsError };
    }

    await fetchOrders();
    return { error: null };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, tracking?: string, courier?: string) => {
    const updates: any = { status };
    if (tracking) updates.tracking_number = tracking;
    if (courier) updates.courier_name = courier;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } else {
      await fetchOrders();
    }
  };

  const getOrderById = (orderId: string) => orders.find(o => o.id === orderId);
  const getOrderByNumber = (orderNumber: string) => orders.find(o => o.orderNumber === orderNumber);

  return (
    <OrderContext.Provider value={{ 
      orders, 
      createOrder, 
      updateOrderStatus, 
      getOrderById, 
      getOrderByNumber
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};