// Tipos del modelo de datos (espejo de supabase/schema.sql).
// Módulo seguro para cliente y servidor: no importa nada de next/ ni supabase.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price_retail: number;
  price_b2b: number;
  stock: number;
  image_url: string;
  unit: string;
  is_active: boolean;
}

export type CustomerType = 'retail' | 'b2b';
export type DeliveryMode = 'pickup' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered';

export interface Order {
  id: string;
  customer_type: CustomerType;
  customer_name: string;
  phone: string;
  email: string;
  business_name: string | null;
  lot_number: string | null;
  address: string;
  delivery_mode: DeliveryMode | null;
  status: OrderStatus;
  notes: string | null;
  total: number;
  user_id: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

// Perfil opcional del cliente (tabla profiles, ligada a auth.users).
// Sus datos autocompletan el checkout de quienes inician sesión.
export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  lot_number: string;
  business_name: string;
  customer_type: CustomerType;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products?: { name: string } | null;
}

// Umbral de alerta de stock bajo (panel admin y tarjetas de producto)
export const LOW_STOCK_THRESHOLD = 5;
