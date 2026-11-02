export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id: string;
  category_name?: string;
  stock_quantity: number;
  is_featured: boolean;
  is_archived?: boolean;
  images: ProductImage[];
  tags: string[];
  dimensions?: string;
  materials?: string;
  care_instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  image_public_id?: string;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "cod";
export type PaymentMethod = "razorpay" | "cod";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  order_status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  image_public_id?: string;
  mobile_image_url?: string;
  mobile_image_public_id?: string;
  badge?: string;
  title: string;
  description: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  is_active: boolean;
  sort_order: number;
}

export interface CMSHomeContent {
  announcement_bar: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_image_public_id?: string;
  hero_floating_badge_title: string;
  hero_floating_badge_desc: string;
  hero_slides?: HeroSlide[];
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  newsletter_title: string;
  newsletter_subtitle: string;
}

export interface CMSAboutContent {
  badge: string;
  headline: string;
  subheadline: string;
  story_paragraphs: string[];
  vision_title: string;
  vision_text: string;
  collection_inspiration: string;
  banner_image: string;
  banner_image_public_id?: string;
  philosophy_items: {
    title: string;
    description: string;
  }[];
  closing_tagline: string;
  closing_subtagline: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "customer";
  phone?: string;
  avatar_url?: string;
}
