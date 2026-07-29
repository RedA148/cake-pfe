export type Cart = { id: number; profile_id: string; created_at: string };

export type CakeCustomization = {
  id?: number;
  cart_item_id?: number;
  size_id: number;
  shape_id: number;
  flavor_id: number;
  color_id: number;
  custom_text: string | null;
  instructions: string | null;
  image_url: string | null;
  created_at?: string;
};

export type GuestCartItem = {
  productId: number;
  productName?: string;
  productImage?: string;
  category?: string;
  shape_id: number;
  size_id: number;
  flavor_id: number;
  color_id: number;
  shape?: string;
  size?: string;
  flavor?: string;
  color?: string;
  customText: string;
  instructions: string;
  uploadedImage: string | null;
  quantity: number;
};

export type CartItem = GuestCartItem & {
  id?: number;
  cart_id?: number;
  productName: string;
  productImage: string;
  isAvailable: boolean;
  shape: string;
  size: string;
  flavor: string;
  color: string;
  unitPrice: number;
  totalPrice: number;
};

export type Address = {
  id: number;
  profile_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  created_at: string;
};

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type PaymentMethod = "cash_on_delivery" | "card";

export type OrderItemSnapshot = {
  product_name: string;
  product_image: string | null;
  shape: string;
  size: string;
  flavor: string;
  color: string;
  shape_id: number;
  size_id: number;
  flavor_id: number;
  color_id: number;
  custom_text: string | null;
  instructions: string | null;
  image_url: string | null;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  customization_id: number | null;
  quantity: number;
  price: number | string;
  snapshot?: OrderItemSnapshot | null;
};

export type Order = {
  id: number;
  profile_id: string;
  address_id: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  total_price: number | string;
  created_at: string;
  addresses?: Address | Address[] | null;
  profiles?: { full_name: string | null; email: string | null; phone?: string | null } | { full_name: string | null; email: string | null; phone?: string | null }[] | null;
  order_items?: OrderItem[];
};

export type CartResult = {
  authenticated: boolean;
  items: CartItem[];
  total: number;
  error: string | null;
};
