"use client";

import {
  Product,
  Category,
  Order,
  CMSHomeContent,
  CMSAboutContent,
  UserProfile,
  HeroSlide,
} from "@/types";
import {
  initialProducts,
  initialHomeCMS,
  initialAboutCMS,
} from "./mockData";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEYS = {
  PRODUCTS: "lumero_products_v1",
  CATEGORIES: "lumero_categories_v1",
  ORDERS: "lumero_orders_v1",
  HOME_CMS: "lumero_home_cms_v1",
  ABOUT_CMS: "lumero_about_cms_v1",
  HERO_SLIDES: "lumero_hero_slides_v1",
  CURRENT_USER: "lumero_current_user_v1",
};

// -------------------------------------------------------------
// HELPER FOR LOCALSTORAGE
// -------------------------------------------------------------
function getFromLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLocal<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage save error", e);
  }
}

// -------------------------------------------------------------
// PRODUCTS STORE
// -------------------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn("Supabase products fetch failed, using local store:", e);
    }
  }

  const local = getFromLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (local.length === 0) {
    saveToLocal(STORAGE_KEYS.PRODUCTS, initialProducts);
    return initialProducts;
  }
  return local;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProduct(product: Partial<Product> & { name: string; price: number }): Promise<Product> {
  const existingProducts = await getProducts();
  let updatedProduct: Product;

  const id = product.id || `prod_${Date.now()}`;
  const slug =
    product.slug ||
    product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const fullProduct: Product = {
    id,
    name: product.name,
    slug,
    description: product.description || "",
    price: Number(product.price),
    compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : undefined,
    category_id: product.category_id || "home-essentials",
    category_name: product.category_name || "Home Essentials",
    stock_quantity: typeof product.stock_quantity === "number" ? product.stock_quantity : 10,
    is_featured: Boolean(product.is_featured),
    images: product.images && product.images.length > 0 ? product.images.slice(0, 5) : [],
    tags: product.tags || [],
    dimensions: product.dimensions || "",
    materials: product.materials || "",
    care_instructions: product.care_instructions || "",
    updated_at: new Date().toISOString(),
    created_at: product.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("products").upsert(fullProduct);
    } catch (e) {
      console.warn("Supabase saveProduct error:", e);
    }
  }

  const exists = existingProducts.some((p) => p.id === id);
  let newList: Product[];
  if (exists) {
    newList = existingProducts.map((p) => (p.id === id ? fullProduct : p));
  } else {
    newList = [fullProduct, ...existingProducts];
  }

  saveToLocal(STORAGE_KEYS.PRODUCTS, newList);
  updatedProduct = fullProduct;
  return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const products = await getProducts();
  const productToDelete = products.find((p) => p.id === productId);

  if (productToDelete && productToDelete.images && productToDelete.images.length > 0) {
    // Delete all associated images from Cloudinary!
    const publicIds = productToDelete.images
      .map((img) => img.public_id)
      .filter(Boolean);

    if (publicIds.length > 0) {
      try {
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_ids: publicIds }),
        });
      } catch (err) {
        console.error("Failed to delete Cloudinary images for product:", err);
      }
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("products").delete().eq("id", productId);
    } catch (e) {
      console.warn("Supabase deleteProduct error:", e);
    }
  }

  const filtered = products.filter((p) => p.id !== productId);
  saveToLocal(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
}

export async function decreaseProductStock(productId: string, quantityToDeduct: number): Promise<void> {
  const products = await getProducts();
  const updated = products.map((p) => {
    if (p.id === productId) {
      const newStock = Math.max(0, p.stock_quantity - quantityToDeduct);
      return { ...p, stock_quantity: newStock };
    }
    return p;
  });

  saveToLocal(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.rpc("decrease_product_stock", {
        p_product_id: productId,
        p_quantity: quantityToDeduct,
      });
    } catch (e) {
      console.warn("Supabase decreaseProductStock error:", e);
    }
  }
}

// -------------------------------------------------------------
// CATEGORIES STORE
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    // 1. Primary: Rich JSON store via cms_content (supports full image_url & image_public_id with zero schema restrictions)
    try {
      const { data: cmsData, error: cmsError } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "store_categories")
        .maybeSingle();

      if (!cmsError && cmsData?.content && Array.isArray(cmsData.content) && cmsData.content.length > 0) {
        const sorted = (cmsData.content as Category[]).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        saveToLocal(STORAGE_KEYS.CATEGORIES, sorted);
        return sorted;
      }
    } catch (cmsErr) {
      console.warn("Supabase cms_content categories fetch notice:", cmsErr);
    }

    // 2. Secondary: Relational categories table
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const sorted = (data as Category[]).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        saveToLocal(STORAGE_KEYS.CATEGORIES, sorted);
        return sorted;
      }
    } catch (e) {
      console.warn("Supabase categories table fetch failed:", e);
    }
  }

  // 3. Fallback: Local storage (preserves user-created categories offline or on connection drop)
  const local = getFromLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  if (Array.isArray(local) && local.length > 0) {
    return local.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  // Pure dynamic storage — returns empty array if no categories configured yet (no mock data)
  return [];
}

export async function saveCategory(category: Category): Promise<Category> {
  const existing = await getCategories();
  const exists = existing.some((c) => c.id === category.id);
  const updatedList = exists
    ? existing.map((c) => (c.id === category.id ? category : c))
    : [...existing, category];

  // 1. Immediately persist to localStorage
  saveToLocal(STORAGE_KEYS.CATEGORIES, updatedList);

  // 2. Persist to Supabase
  if (isSupabaseConfigured() && supabase) {
    // 2a. Always sync to cms_content (identical to hero_slides, never fails on column constraints)
    try {
      await supabase.from("cms_content").upsert({
        key: "store_categories",
        content: updatedList,
        updated_at: new Date().toISOString(),
      });
    } catch (cmsErr) {
      console.warn("Supabase cms_content save categories notice:", cmsErr);
    }

    // 2b. Sync to relational categories table with strictly safe columns
    try {
      const row: Record<string, unknown> = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        sort_order: Number(category.sort_order) || 1,
      };
      if (category.image_url) {
        row.image_url = category.image_url;
      }
      await supabase.from("categories").upsert(row);
    } catch (tableErr) {
      console.warn("Supabase categories table upsert notice:", tableErr);
    }
  }

  return category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const existing = await getCategories();
  const filtered = existing.filter((c) => c.id !== id);

  // 1. Update localStorage
  saveToLocal(STORAGE_KEYS.CATEGORIES, filtered);

  // 2. Update Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "store_categories",
        content: filtered,
        updated_at: new Date().toISOString(),
      });
    } catch (cmsErr) {
      console.warn("Supabase cms_content delete notice:", cmsErr);
    }

    try {
      await supabase.from("categories").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete category error:", e);
    }
  }

  return true;
}

// -------------------------------------------------------------
// ORDERS STORE
// -------------------------------------------------------------
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as Order[];
      }
    } catch (e) {
      console.warn("Supabase orders fetch error:", e);
    }
  }

  return getFromLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export async function createOrder(orderInput: Omit<Order, "id" | "order_number" | "created_at">): Promise<Order> {
  const orderNumber = `LUM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const orderId = `ord_${Date.now()}`;

  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    order_number: orderNumber,
    created_at: new Date().toISOString(),
  };

  // Reduce product stock immediately for each item in the order
  for (const item of newOrder.items) {
    await decreaseProductStock(item.product_id, item.quantity);
  }

  const existingOrders = await getOrders();
  const updatedOrders = [newOrder, ...existingOrders];
  saveToLocal(STORAGE_KEYS.ORDERS, updatedOrders);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("orders").insert({
        id: newOrder.id,
        order_number: newOrder.order_number,
        customer_id: newOrder.customer_id,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        customer_phone: newOrder.customer_phone,
        shipping_address: newOrder.shipping_address,
        subtotal: newOrder.subtotal,
        shipping_fee: newOrder.shipping_fee,
        discount_amount: newOrder.discount_amount,
        total_amount: newOrder.total_amount,
        payment_status: newOrder.payment_status,
        payment_method: newOrder.payment_method,
        razorpay_order_id: newOrder.razorpay_order_id,
        razorpay_payment_id: newOrder.razorpay_payment_id,
        order_status: newOrder.order_status,
        notes: newOrder.notes,
        created_at: newOrder.created_at,
      });

      if (newOrder.items && newOrder.items.length > 0) {
        const orderItemsPayload = newOrder.items.map((it) => ({
          order_id: newOrder.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_image: it.product_image,
          price: it.price,
          quantity: it.quantity,
          total: it.total,
        }));
        await supabase.from("order_items").insert(orderItemsPayload);
      }
    } catch (e) {
      console.warn("Supabase createOrder error:", e);
    }
  }

  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["order_status"],
  paymentStatus?: Order["payment_status"]
): Promise<boolean> {
  const orders = await getOrders();
  const updated = orders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        order_status: status,
        ...(paymentStatus ? { payment_status: paymentStatus } : {}),
        updated_at: new Date().toISOString(),
      };
    }
    return ord;
  });

  saveToLocal(STORAGE_KEYS.ORDERS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from("orders")
        .update({
          order_status: status,
          ...(paymentStatus ? { payment_status: paymentStatus } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    } catch (e) {
      console.warn("Supabase updateOrderStatus error:", e);
    }
  }

  return true;
}

// -------------------------------------------------------------
// CMS CONTENT STORE
// -------------------------------------------------------------
export async function getHomeCMS(): Promise<CMSHomeContent> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.from("cms_content").select("content").eq("key", "home").single();
      if (data?.content) return data.content as CMSHomeContent;
    } catch {
      // fallback
    }
  }
  return getFromLocal<CMSHomeContent>(STORAGE_KEYS.HOME_CMS, initialHomeCMS);
}

export async function saveHomeCMS(content: CMSHomeContent): Promise<void> {
  saveToLocal(STORAGE_KEYS.HOME_CMS, content);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "home",
        content,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Supabase saveHomeCMS error:", e);
    }
  }
}

// -------------------------------------------------------------
// HERO SLIDES CMS STORE (Strictly Dynamic, No Dummy Fallbacks)
// -------------------------------------------------------------
export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "hero_slides")
        .maybeSingle();

      if (!error && data?.content && Array.isArray(data.content)) {
        return (data.content as HeroSlide[]).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      }
    } catch (e) {
      console.warn("Supabase hero slides fetch failed:", e);
    }
  }

  const local = getFromLocal<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
  if (Array.isArray(local) && local.length > 0) {
    return local.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  // Returns empty array if none configured in database/store.
  // No mock data or hardcoded fallback data.
  return [];
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<void> {
  const sorted = slides.map((s, idx) => ({ ...s, sort_order: idx }));
  saveToLocal(STORAGE_KEYS.HERO_SLIDES, sorted);

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from("cms_content").upsert({
      key: "hero_slides",
      content: sorted,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Supabase saveHeroSlides error:", error);
      throw error;
    }
  }
}

export async function getAboutCMS(): Promise<CMSAboutContent> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.from("cms_content").select("content").eq("key", "about").single();
      if (data?.content) return data.content as CMSAboutContent;
    } catch {
      // fallback
    }
  }
  return getFromLocal<CMSAboutContent>(STORAGE_KEYS.ABOUT_CMS, initialAboutCMS);
}

export async function saveAboutCMS(content: CMSAboutContent): Promise<void> {
  saveToLocal(STORAGE_KEYS.ABOUT_CMS, content);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "about",
        content,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Supabase saveAboutCMS error:", e);
    }
  }
}

// -------------------------------------------------------------
// USER / ADMIN AUTH STORE
// -------------------------------------------------------------
export function getCurrentUser(): UserProfile | null {
  return getFromLocal<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: UserProfile | null) {
  saveToLocal(STORAGE_KEYS.CURRENT_USER, user);
}
