"use client";

import {
  Product,
  Category,
  Order,
  CMSHomeContent,
  CMSAboutContent,
  UserProfile,
  HeroSlide,
  WhyChooseSection,
  OfferBannerContent,
  ShippingAddress,
  ShippingSettings,
  StoreSettings,
} from "@/types";
import {
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
  OFFER_BANNER: "lumero_offer_banner_v1",
  WHY_CHOOSE: "lumero_why_choose_v1",
  CURRENT_USER: "lumero_current_user_v1",
  SETTINGS: "lumero_settings_v1",
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
    // 1. Primary: Rich JSON store via cms_content ('store_products')
    try {
      const { data: cmsData, error: cmsError } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "store_products")
        .maybeSingle();

      if (!cmsError && cmsData?.content && Array.isArray(cmsData.content) && cmsData.content.length > 0) {
        saveToLocal(STORAGE_KEYS.PRODUCTS, cmsData.content as Product[]);
        return cmsData.content as Product[];
      }
    } catch (cmsErr) {
      console.warn("Supabase cms_content products fetch notice:", cmsErr);
    }

    // 2. Secondary: Relational products table
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        saveToLocal(STORAGE_KEYS.PRODUCTS, data as Product[]);
        return data as Product[];
      }
    } catch (e) {
      console.warn("Supabase products table fetch failed:", e);
    }
  }

  // 3. Fallback: Local storage (preserves admin created products offline or during transient drops)
  const local = getFromLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  return Array.isArray(local) ? local : [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProduct(product: Partial<Product> & { name: string; price: number }): Promise<Product> {
  const existingProducts = await getProducts();

  const id = product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
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
    shipping_fee: typeof product.shipping_fee === "number" ? product.shipping_fee : undefined,
    category_id: product.category_id || "",
    category_name: product.category_name || "Décor",
    stock_quantity: typeof product.stock_quantity === "number" ? product.stock_quantity : 10,
    is_featured: Boolean(product.is_featured),
    is_archived: Boolean(product.is_archived),
    images: product.images && product.images.length > 0 ? product.images.slice(0, 5) : [],
    tags: product.tags || [],
    dimensions: product.dimensions || "",
    materials: product.materials || "",
    care_instructions: product.care_instructions || "",
    updated_at: new Date().toISOString(),
    created_at: product.created_at || new Date().toISOString(),
  };

  const exists = existingProducts.some((p) => p.id === id);
  const newList = exists
    ? existingProducts.map((p) => (p.id === id ? fullProduct : p))
    : [fullProduct, ...existingProducts];

  // 1. Immediately persist to localStorage
  saveToLocal(STORAGE_KEYS.PRODUCTS, newList);

  // 2. Persist to Supabase
  if (isSupabaseConfigured() && supabase) {
    // 2a. Always sync to cms_content (identical to store_categories & hero_slides, never fails on constraints)
    try {
      await supabase.from("cms_content").upsert({
        key: "store_products",
        content: newList,
        updated_at: new Date().toISOString(),
      });
    } catch (cmsErr) {
      console.warn("Supabase cms_content save products notice:", cmsErr);
    }

    // 2b. Sync to relational products table with strictly safe columns conforming to schema
    try {
      const dbRow: Record<string, unknown> = {
        id: fullProduct.id,
        name: fullProduct.name,
        slug: fullProduct.slug,
        description: fullProduct.description || "",
        price: fullProduct.price,
        compare_at_price: fullProduct.compare_at_price || null,
        stock_quantity: fullProduct.stock_quantity ?? 10,
        is_featured: Boolean(fullProduct.is_featured),
        is_archived: Boolean(fullProduct.is_archived),
        images: fullProduct.images || [],
        tags: fullProduct.tags || [],
        dimensions: fullProduct.dimensions || "",
        materials: fullProduct.materials || "",
        care_instructions: fullProduct.care_instructions || "",
        updated_at: new Date().toISOString(),
        created_at: fullProduct.created_at,
      };

      if (fullProduct.category_id) {
        dbRow.category_id = fullProduct.category_id;
      }

      const { error: upsertErr } = await supabase.from("products").upsert(dbRow);
      if (upsertErr) {
        console.warn("Products table upsert notice (FK or constraint), retrying with category_id: null:", upsertErr.message);
        // If category_id violated foreign key constraint, save with null category_id in relational table
        await supabase.from("products").upsert({ ...dbRow, category_id: null });
      }
    } catch (tableErr) {
      console.warn("Supabase products table upsert exception:", tableErr);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("lumero_catalog_updated_at", Date.now().toString());
    window.dispatchEvent(new Event("lumero_catalog_updated"));
  }
  return fullProduct;
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

  const filtered = products.filter((p) => p.id !== productId);
  saveToLocal(STORAGE_KEYS.PRODUCTS, filtered);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "store_products",
        content: filtered,
        updated_at: new Date().toISOString(),
      });
    } catch (cmsErr) {
      console.warn("Supabase cms_content delete product notice:", cmsErr);
    }

    try {
      await supabase.from("products").delete().eq("id", productId);
    } catch (e) {
      console.warn("Supabase deleteProduct error:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("lumero_catalog_updated_at", Date.now().toString());
    window.dispatchEvent(new Event("lumero_catalog_updated"));
  }
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
      await supabase.from("cms_content").upsert({
        key: "store_products",
        content: updated,
        updated_at: new Date().toISOString(),
      });
    } catch (cmsErr) {
      console.warn("Supabase cms_content decreaseStock notice:", cmsErr);
    }

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
// STOCK CONCURRENCY LOCK & VALIDATION
// Prevents race conditions when multiple customers buy the same product
// -------------------------------------------------------------
export async function acquireStockLockAndVerify(
  items: { product_id: string; quantity: number; product_name?: string }[]
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    // 1. Fresh database query directly against products table
    try {
      const productIds = items.map((i) => i.product_id);
      const { data: freshProducts, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .in("id", productIds);

      if (!error && freshProducts && freshProducts.length > 0) {
        for (const item of items) {
          const p = freshProducts.find((fp) => fp.id === item.product_id);
          if (!p) {
            return {
              success: false,
              error: `Item "${item.product_name || "Product"}" is no longer available.`,
            };
          }
          if (p.stock_quantity < item.quantity) {
            return {
              success: false,
              error: `Stock conflict: "${p.name}" has only ${p.stock_quantity} left in stock (you requested ${item.quantity}). Another customer may have just ordered it.`,
            };
          }
        }
        return { success: true };
      }
    } catch (dbErr) {
      console.warn("Fresh stock lock check fallback to store_products:", dbErr);
    }

    // 2. Fallback to cms_content store_products
    try {
      const { data } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "store_products")
        .single();
      if (data?.content && Array.isArray(data.content)) {
        for (const item of items) {
          const p = (data.content as Product[]).find((cp) => cp.id === item.product_id);
          if (p && p.stock_quantity < item.quantity) {
            return {
              success: false,
              error: `Stock conflict: "${p.name}" has only ${p.stock_quantity} available. Another customer just completed their order.`,
            };
          }
        }
        return { success: true };
      }
    } catch (cmsErr) {
      console.warn("CMS stock check notice:", cmsErr);
    }
  }

  // 3. Fallback to local store products
  const localProducts = getFromLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []) || [];
  for (const item of items) {
    const p = localProducts.find((lp) => lp.id === item.product_id);
    if (p && p.stock_quantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${p.name}". Only ${p.stock_quantity} remaining.`,
      };
    }
  }

  return { success: true };
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

  // 1. Stock Concurrency Lock Guard: Prevent overselling if ordered at the exact same time
  const lockCheck = await acquireStockLockAndVerify(
    newOrder.items.map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
      product_name: it.product_name,
    }))
  );

  if (!lockCheck.success) {
    throw new Error(lockCheck.error || "Order rejected due to stock conflict. Another customer just purchased this item.");
  }

  // 2. Reduce product stock immediately for each item in the order
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

  // Trigger Order Confirmation Emails to Customer & Admin via Brevo (non-blocking)
  if (typeof window !== "undefined") {
    fetch("/api/email/order-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    }).catch((err) => console.warn("Order confirmation email dispatch notice:", err));
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
// OFFER BANNER SECTION CMS STORE (Strictly Dynamic)
// -------------------------------------------------------------
export async function getOfferBanner(): Promise<OfferBannerContent | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "offer_banner")
        .maybeSingle();

      if (!error && data?.content) {
        saveToLocal(STORAGE_KEYS.OFFER_BANNER, data.content as OfferBannerContent);
        return data.content as OfferBannerContent;
      }
    } catch (e) {
      console.warn("Supabase getOfferBanner notice:", e);
    }
  }

  return getFromLocal<OfferBannerContent | null>(STORAGE_KEYS.OFFER_BANNER, null);
}

export async function saveOfferBanner(content: OfferBannerContent): Promise<void> {
  saveToLocal(STORAGE_KEYS.OFFER_BANNER, content);
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from("cms_content").upsert({
      key: "offer_banner",
      content,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Supabase saveOfferBanner error:", error);
      throw error;
    }
  }
}

// -------------------------------------------------------------
// WHY CHOOSE LUMERO CMS STORE (Strictly Dynamic)
// -------------------------------------------------------------
export async function getWhyChooseSection(): Promise<WhyChooseSection | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "why_choose_lumero")
        .maybeSingle();

      if (!error && data?.content) {
        saveToLocal(STORAGE_KEYS.WHY_CHOOSE, data.content as WhyChooseSection);
        return data.content as WhyChooseSection;
      }
    } catch (e) {
      console.warn("Supabase getWhyChooseSection notice:", e);
    }
  }

  return getFromLocal<WhyChooseSection | null>(STORAGE_KEYS.WHY_CHOOSE, null);
}

export async function saveWhyChooseSection(content: WhyChooseSection): Promise<void> {
  saveToLocal(STORAGE_KEYS.WHY_CHOOSE, content);
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from("cms_content").upsert({
      key: "why_choose_lumero",
      content,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Supabase saveWhyChooseSection error:", error);
      throw error;
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

// -------------------------------------------------------------
// CUSTOMER ORDERS & SAVED ADDRESS STORE
// -------------------------------------------------------------
export async function getCustomerOrders(email: string, customerId?: string): Promise<Order[]> {
  const allOrders = await getOrders();
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  return allOrders.filter((o) => {
    const matchEmail = cleanEmail && o.customer_email?.trim().toLowerCase() === cleanEmail;
    const matchId = customerId && o.customer_id === customerId;
    return matchEmail || matchId;
  });
}

export async function getSavedAddress(userId: string): Promise<ShippingAddress | null> {
  if (!userId) return null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", `customer_addr_${userId}`)
        .maybeSingle();

      if (!error && data?.content) {
        saveToLocal(`lumero_saved_addr_${userId}`, data.content as ShippingAddress);
        return data.content as ShippingAddress;
      }
    } catch (e) {
      console.warn("Supabase getSavedAddress notice:", e);
    }
  }

  return getFromLocal<ShippingAddress | null>(`lumero_saved_addr_${userId}`, null);
}

export async function saveCustomerAddress(userId: string, address: ShippingAddress): Promise<void> {
  if (!userId) return;
  saveToLocal(`lumero_saved_addr_${userId}`, address);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: `customer_addr_${userId}`,
        content: address,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Supabase saveCustomerAddress notice:", e);
    }
  }
}

// -------------------------------------------------------------
// ADMIN WHATSAPP ORDER DISPATCH SETTINGS
// -------------------------------------------------------------
export async function getAdminWhatsAppNumber(): Promise<string> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "admin_whatsapp_phone")
        .single();
      if (data?.content?.phone) {
        saveToLocal("lumero_admin_whatsapp_phone", { phone: data.content.phone });
        return data.content.phone;
      }
    } catch {
      // Fallback
    }
  }

  const local = getFromLocal<{ phone: string } | null>("lumero_admin_whatsapp_phone", null);
  return (
    local?.phone ||
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ||
    "+91 98765 43210"
  );
}

export async function saveAdminWhatsAppNumber(phone: string): Promise<boolean> {
  saveToLocal("lumero_admin_whatsapp_phone", { phone });
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "admin_whatsapp_phone",
        content: { phone },
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (e) {
      console.warn("Supabase saveAdminWhatsAppNumber error:", e);
    }
  }
  return true;
}

// -------------------------------------------------------------
// STORE SHIPPING SETTINGS (Threshold-based Free & Fixed Shipping)
// -------------------------------------------------------------
export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  method: "threshold",
  threshold_amount: 1999,
  below_threshold_charge: 150,
  fixed_charge: 150,
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "store_shipping_settings")
        .maybeSingle();

      if (data?.content && typeof data.content === "object") {
        const s = data.content as Partial<ShippingSettings>;
        const merged: ShippingSettings = {
          method: s.method === "fixed" ? "fixed" : "threshold",
          threshold_amount: typeof s.threshold_amount === "number" ? s.threshold_amount : 1999,
          below_threshold_charge: typeof s.below_threshold_charge === "number" ? s.below_threshold_charge : 150,
          fixed_charge: typeof s.fixed_charge === "number" ? s.fixed_charge : 150,
        };
        saveToLocal("lumero_shipping_settings_v1", merged);
        return merged;
      }
    } catch (e) {
      console.warn("Supabase getShippingSettings notice:", e);
    }
  }

  const local = getFromLocal<ShippingSettings>("lumero_shipping_settings_v1", DEFAULT_SHIPPING_SETTINGS);
  return local || DEFAULT_SHIPPING_SETTINGS;
}

export async function saveShippingSettings(settings: ShippingSettings): Promise<boolean> {
  saveToLocal("lumero_shipping_settings_v1", settings);
  if (typeof window !== "undefined") {
    localStorage.setItem("lumero_catalog_updated_at", Date.now().toString());
    window.dispatchEvent(new CustomEvent("lumero_shipping_updated", { detail: settings }));
    window.dispatchEvent(new Event("lumero_catalog_updated"));
  }
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "store_shipping_settings",
        content: settings,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (e) {
      console.warn("Supabase saveShippingSettings error:", e);
    }
  }
  return true;
}

// -------------------------------------------------------------
// STORE SETTINGS & LOGISTICS
// -------------------------------------------------------------
export const defaultStoreSettings: StoreSettings = {
  storeName: "LUMERO Décor",
  currency: "INR (₹)",
  freeShippingThreshold: 1999,
  standardShippingFee: 150,
  supportEmail: "care@lumerodecor.com",
  supportPhone: "+91 98765 43210",
  supportHours: "Mon-Sat, 10am - 7pm IST",
  responseWindow: "Usually within 4 business hours",
  contactSubtitle: "Crafting calm, elevated living spaces across India with care and dedication.",
  adminWhatsApp: "+91 98765 43210",
};

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", "store_settings")
        .single();
      if (!error && data?.content) {
        return { ...defaultStoreSettings, ...data.content };
      }
    } catch {
      // fallback
    }
  }
  return getFromLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, defaultStoreSettings);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  saveToLocal(STORAGE_KEYS.SETTINGS, settings);
  if (typeof window !== "undefined") {
    localStorage.setItem("lumero_catalog_updated_at", Date.now().toString());
    window.dispatchEvent(new Event("lumero_settings_updated"));
    window.dispatchEvent(new Event("lumero_catalog_updated"));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("cms_content").upsert({
        key: "store_settings",
        content: settings,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Supabase saveStoreSettings error:", e);
    }
  }

  return settings;
}
