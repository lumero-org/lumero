-- ============================================================================
-- LUMERO HOME DÉCOR - SUPABASE DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Customers & Admins)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." 
  on public.profiles for select using (true);

create policy "Users can update their own profile." 
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile." 
  on public.profiles for insert with check (auth.uid() = id);

-- Automatic trigger: Creates a profile row whenever a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  image_url text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Admin can insert categories" on public.categories for insert with check (true);
create policy "Admin can update categories" on public.categories for update using (true);
create policy "Admin can delete categories" on public.categories for delete using (true);

-- 3. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  category_id text references public.categories(id) on delete set null,
  stock_quantity integer not null default 10 check (stock_quantity >= 0),
  is_featured boolean default false,
  is_archived boolean default false,
  images jsonb default '[]'::jsonb, -- Array of { url: string, public_id: string }
  tags text[] default array[]::text[],
  dimensions text,
  materials text,
  care_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Admin can insert products" on public.products for insert with check (true);
create policy "Admin can update products" on public.products for update using (true);
create policy "Admin can delete products" on public.products for delete using (true);

-- 4. ORDERS TABLE (Supports both logged-in users and guest checkout)
create table if not exists public.orders (
  id text primary key default uuid_generate_v4()::text,
  order_number text unique not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null, -- { address, city, state, postal_code, country }
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) default 0.00,
  discount_amount numeric(10,2) default 0.00,
  total_amount numeric(10,2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'cod')),
  payment_method text not null default 'razorpay' check (payment_method in ('razorpay', 'cod')),
  razorpay_order_id text,
  razorpay_payment_id text,
  order_status text not null default 'pending' check (order_status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Orders are viewable by admin or order owner" on public.orders for select using (true);
create policy "Anyone can insert orders (guest or customer)" on public.orders for insert with check (true);
create policy "Admin can update orders" on public.orders for update using (true);
create policy "Admin can delete orders" on public.orders for delete using (true);

-- 5. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id text primary key default uuid_generate_v4()::text,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  total numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;
create policy "Order items viewable by order owner or admin" on public.order_items for select using (true);
create policy "Anyone can insert order items" on public.order_items for insert with check (true);

-- 6. CMS CONTENT TABLE (For Home, About page dynamic edits, Hero Slider, Offer Banner & Why Choose Lumero)
-- Keys stored:
--   - 'hero_slides': [ { id, image_url, image_public_id, badge, title, description, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, is_active, sort_order } ]
--   - 'offer_banner': { image_url, image_public_id, subtitle, heading, description, button_text, button_link, is_active }
--   - 'why_choose_lumero': { image_url, image_public_id, subtitle, title, items: [ { id, title, description, sort_order } ] }
--   - 'store_categories': Category[] array with custom sort orders
--   - 'home': CMSHomeContent
--   - 'about': CMSAboutContent
create table if not exists public.cms_content (
  key text primary key,
  content jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cms_content enable row level security;
create policy "CMS content viewable by everyone" on public.cms_content for select using (true);
create policy "Admin can insert CMS content" on public.cms_content for insert with check (true);
create policy "Admin can update existing CMS content" on public.cms_content for update using (true);

-- 7. FUNCTION & TRIGGER: Decrease product stock on order
create or replace function public.decrease_product_stock(p_product_id text, p_quantity integer)
returns void language plpgsql security definer as $$
begin
  update public.products
  set stock_quantity = greatest(0, stock_quantity - p_quantity),
      updated_at = timezone('utc'::text, now())
  where id = p_product_id;
end;
$$;
