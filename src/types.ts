export type RoleSlug = 'super_admin' | 'admin' | 'manager' | 'editor' | 'support' | 'customer';

export interface Role {
  id: number;
  slug: RoleSlug;
  name: string;
  description?: string;
  is_system?: boolean;
}

export interface User {
  id: number;
  role_id: number;
  role_slug: RoleSlug;
  role_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  banner_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  product_count?: number;
  seo_title?: string;
  seo_description?: string;
  item_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url: string;
  banner_url?: string;
  website?: string;
  origin_country?: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  title: string;
  color_name?: string;
  color_code?: string;
  size?: string;
  price_modifier: number;
  price_override?: number;
  stock_quantity: number;
  image_url?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  brand_id?: number;
  brand_name?: string;
  brand_slug?: string;
  title: string;
  slug: string;
  sku: string;
  barcode?: string;
  short_description: string;
  description: string;
  specifications: Record<string, string>;
  specs?: any;
  features: string[];
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  is_published: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_ends_at?: string;
  status: 'draft' | 'published' | 'archived';
  stock_quantity: number;
  low_stock_threshold: number;
  rating: number;
  review_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id?: number | null;
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  is_saved_for_later: boolean;
  product_image?: string;
  product_title?: string;
  product_slug?: string;
  variant_name?: string;
  unit_price?: number;
}

export interface Cart {
  id: number;
  user_id?: number | null;
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  discount?: number;
  coupon_code?: string | null;
  applied_coupon?: any;
  shipping_amount: number;
  shipping_total?: number;
  tax_amount: number;
  tax_total?: number;
  grand_total: number;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing' | 'both';
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  address_line1: string;
  street_address?: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number | null;
  title: string;
  sku: string;
  variant_name?: string;
  image_url: string;
  product_image?: string;
  product_title?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTimeline {
  id: number;
  order_id: number;
  status: string;
  message: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_reference?: string;
  subtotal: number;
  discount_amount: number;
  discount_total?: number;
  coupon_code?: string;
  shipping_amount: number;
  shipping_total?: number;
  shipping_carrier?: string;
  shipping_method: string;
  tax_amount: number;
  grand_total: number;
  shipping_address: Address;
  billing_address: Address;
  tracking_number?: string;
  courier_name?: string;
  estimated_delivery?: string;
  order_notes?: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_order_amount: number;
  min_spend?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  expires_at?: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id?: number;
  user_name?: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  link_url: string;
  button_text: string;
  image_url: string;
  position: 'hero_slide' | 'promotional_grid' | 'flash_sale_banner';
  display_order: number;
  is_active: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  featured_image?: string;
  category: string;
  author_name: string;
  author_role?: string;
  author_avatar?: string;
  reading_time: string;
  is_published: boolean;
  published_at: string;
  created_at?: string;
  tags?: string[];
  key_takeaways?: string[];
  secondary_image?: string;
  secondary_caption?: string;
}

export interface CMSPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  updated_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  file_url: string;
  mime_type: string;
  file_size_bytes: number;
  alt_text: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name: string;
  user_email?: string;
  action: string;
  module: string;
  entity_type?: string;
  entity_id?: string;
  record_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface InventoryTransaction {
  id: number;
  product_id: number;
  product_title?: string;
  variant_id?: number | null;
  change_amount: number;
  quantity_change?: number;
  new_stock: number;
  reason: string;
  reference_id?: string;
  user_name?: string;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  currency_symbol: string;
  currency_code: string;
  free_shipping_threshold: number;
  standard_shipping_rate: number;
  express_shipping_rate: number;
  tax_rate_percentage: number;
  announcement_bar_enabled: boolean;
  announcement_text: string;
  enable_stripe: boolean;
  enable_paypal: boolean;
  enable_cod: boolean;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  averageOrderValue: number;
  salesByDay?: { date: string; amount: number }[];
}

