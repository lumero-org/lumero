import { Category, Product, CMSHomeContent, CMSAboutContent } from "@/types";

export const initialCategories: Category[] = [
  {
    id: "wall-decor",
    name: "Wall Décor",
    slug: "wall-decor",
    description: "Architectural mirrors, canvas art, and sculpted relief panels.",
    icon: "🖼️",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
    sort_order: 1,
  },
  {
    id: "lighting",
    name: "Lighting",
    slug: "lighting",
    description: "Warm atmospheric glow, pleated ceramic lamps, and brass pendants.",
    icon: "💡",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop",
    sort_order: 2,
  },
  {
    id: "plants",
    name: "Plants & Pots",
    slug: "plants",
    description: "Fluted earthenware, minimalist planters, and lush botanical accents.",
    icon: "🪴",
    image_url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1200&auto=format&fit=crop",
    sort_order: 3,
  },
  {
    id: "desk-setup",
    name: "Desk Setup",
    slug: "desk-setup",
    description: "Walnut organizers, solid brass stationery, and ergonomic styling.",
    icon: "🖥️",
    image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop",
    sort_order: 4,
  },
  {
    id: "storage",
    name: "Storage",
    slug: "storage",
    description: "Travertine catchall trays, woven neutral baskets, and linen bins.",
    icon: "📦",
    image_url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200&auto=format&fit=crop",
    sort_order: 5,
  },
  {
    id: "home-essentials",
    name: "Home Essentials",
    slug: "home-essentials",
    description: "Hand-poured scented candles, stone coasters, and pure linen throws.",
    icon: "☕",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    sort_order: 6,
  },
];

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Aura Pleated Ceramic Lamp",
    slug: "aura-pleated-ceramic-lamp",
    description:
      "Sculptural terracotta table lamp crowned with an ivory pleated shade. Emits a calming, ambient glow designed to create an intimate sanctuary in your bedroom or study nook.",
    price: 3499,
    compare_at_price: 4499,
    category_id: "lighting",
    category_name: "Lighting",
    stock_quantity: 8,
    is_featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/lighting-1",
      },
      {
        url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/lighting-1-alt",
      },
      {
        url: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/lighting-1-detail",
      },
    ],
    tags: ["Bestseller", "New Arrival", "Lighting"],
    dimensions: "Height: 42cm | Shade Diameter: 28cm",
    materials: "Handmade ceramic base, linen pleated shade, brass finial",
    care_instructions: "Dust gently with a soft micro-fiber cloth. Use LED bulbs up to 40W.",
  },
  {
    id: "prod-2",
    name: "Nordic Arched Travertine Mirror",
    slug: "nordic-arched-travertine-mirror",
    description:
      "Minimalist organic arch mirror framed in natural honed beige travertine. Perfect as a standalone entryway statement or dressing table anchor.",
    price: 5299,
    compare_at_price: 6899,
    category_id: "wall-decor",
    category_name: "Wall Décor",
    stock_quantity: 4,
    is_featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/wall-1",
      },
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/wall-1-alt",
      },
    ],
    tags: ["Premium", "Statement Piece"],
    dimensions: "60cm x 90cm x 3cm",
    materials: "Honed natural travertine stone, high-clarity 5mm silver mirror",
    care_instructions: "Clean mirror with ammonia-free glass cleaner. Wipe stone with damp cloth.",
  },
  {
    id: "prod-3",
    name: "Fluted Terracotta Vessel & Olive Spray",
    slug: "fluted-terracotta-vessel-olive",
    description:
      "Hand-thrown textured fluted pot paired with lifelike botanical faux olive branches. Introduces earthy tranquility and timeless Mediterranean warmth into your living room.",
    price: 1899,
    compare_at_price: 2499,
    category_id: "plants",
    category_name: "Plants & Pots",
    stock_quantity: 12,
    is_featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/plants-1",
      },
      {
        url: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/plants-1-alt",
      },
    ],
    tags: ["Botanical", "Earthy"],
    dimensions: "Vessel Height: 24cm | Overall Height: 65cm",
    materials: "Unglazed natural terracotta, silk & wire botanicals",
    care_instructions: "Indoor use only. Dust sprigs occasionally.",
  },
  {
    id: "prod-4",
    name: "Kyoto Solid Walnut Desk Organizer",
    slug: "kyoto-solid-walnut-desk-organizer",
    description:
      "Crafted from premium sustainable American Walnut. Features precision-milled grooves for smartphones, brass writing pens, wireless earbuds, and everyday pocket carry.",
    price: 2199,
    compare_at_price: 2799,
    category_id: "desk-setup",
    category_name: "Desk Setup",
    stock_quantity: 15,
    is_featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/desk-1",
      },
      {
        url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/desk-1-alt",
      },
    ],
    tags: ["Workspace", "Handcrafted"],
    dimensions: "32cm x 14cm x 2.5cm",
    materials: "FSC certified solid American walnut with matte organic oil seal",
    care_instructions: "Wipe with dry cloth. Recondition with wood balm once a year.",
  },
  {
    id: "prod-5",
    name: "Elysian Beige Travertine Catchall",
    slug: "elysian-beige-travertine-catchall",
    description:
      "Heavy, solid stone valet tray carved with soft radiused edges. Ideal for nightstands, coffee table styling, jewelry, keys, or luxury perfume displays.",
    price: 1599,
    compare_at_price: 2099,
    category_id: "storage",
    category_name: "Storage",
    stock_quantity: 6,
    is_featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/storage-1",
      },
      {
        url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/storage-1-alt",
      },
    ],
    tags: ["Natural Stone", "Minimal"],
    dimensions: "25cm x 15cm x 3cm",
    materials: "100% natural Italian travertine",
    care_instructions: "Avoid acidic liquids. Clean with warm water and neutral soap.",
  },
  {
    id: "prod-6",
    name: "Nocturne Smoked Amber & Cedar Candle",
    slug: "nocturne-smoked-amber-cedar-candle",
    description:
      "Hand-poured 100% soy candle infused with notes of Baltic amber, smoked cedarwood, patchouli, and Madagascar vanilla. Burns cleanly for over 65 hours.",
    price: 1299,
    compare_at_price: 1699,
    category_id: "home-essentials",
    category_name: "Home Essentials",
    stock_quantity: 20,
    is_featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/essentials-1",
      },
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/essentials-1-alt",
      },
    ],
    tags: ["Aromatics", "Soy Wax"],
    dimensions: "340g / 12 oz | 65hr burn time",
    materials: "100% natural soy wax, wooden crackle wick, amber apothecary glass",
    care_instructions: "Trim wick to 5mm before every lighting. Burn for 2-3 hours initially.",
  },
  {
    id: "prod-7",
    name: "Soren Stoneware Teapot & Cup Set",
    slug: "soren-stoneware-teapot-cup-set",
    description:
      "Minimalist Japanese wabi-sabi inspired brewing set. Features unglazed rough stoneware exterior with smooth glazed interior and natural bentwood handle.",
    price: 2799,
    compare_at_price: 3499,
    category_id: "home-essentials",
    category_name: "Home Essentials",
    stock_quantity: 3,
    is_featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/tea-1",
      },
    ],
    tags: ["Ceramics", "Artisanal"],
    dimensions: "Teapot 650ml | 2x Cups 180ml",
    materials: "High-fired refractory clay stoneware, bent steam-treated bamboo",
    care_instructions: "Hand wash only. Do not place bamboo handle in dishwasher.",
  },
  {
    id: "prod-8",
    name: "Solstice Brass Arch Table Lamp",
    slug: "solstice-brass-arch-table-lamp",
    description:
      "A harmonious geometry of brushed brass rod arching over a solid marble plinth. Dimmable warm LED creates stunning shadow play on tabletop surfaces.",
    price: 4199,
    compare_at_price: 5499,
    category_id: "lighting",
    category_name: "Lighting",
    stock_quantity: 7,
    is_featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1200&auto=format&fit=crop",
        public_id: "lumero/lamp-brass-1",
      },
    ],
    tags: ["Lighting", "Brass"],
    dimensions: "Width: 35cm | Height: 48cm | Marble Base: 12cm dia",
    materials: "Brushed aged brass, Carrara marble base",
    care_instructions: "Wipe with dry cotton cloth. Do not use chemical brass polishers.",
  },
];

export const initialHomeCMS: CMSHomeContent = {
  announcement_bar: "Complimentary Pan-India Express Delivery on Orders Over ₹1,999 • Handcrafted with Soul",
  hero_badge: "PREMIUM HOME DÉCOR",
  hero_title: "Make Every Corner Feel Beautiful.",
  hero_subtitle:
    "Discover carefully selected décor pieces that transform ordinary rooms into elegant living spaces. Modern, minimal and made to last.",
  hero_image:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop",
  hero_image_public_id: "lumero/hero-main",
  hero_floating_badge_title: "Elevate Your Everyday Space",
  hero_floating_badge_desc: "Modern aesthetics tailored for peaceful, serene living.",
  cta_primary_text: "Shop Collection",
  cta_primary_link: "/shop",
  cta_secondary_text: "Our Story",
  cta_secondary_link: "/about",
  features: [
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Quick and reliable delivery across India with premium protective packaging.",
    },
    {
      icon: "🏆",
      title: "Premium Quality",
      description: "Carefully selected products made to last, crafted from natural authentic materials.",
    },
    {
      icon: "🔒",
      title: "Secure Payments",
      description: "Safe and trusted payment methods powered by Razorpay with UPI, Cards & COD.",
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description: "We are always here to help you choose the ideal decor for your room.",
    },
  ],
  newsletter_title: "Join the LUMERO Club",
  newsletter_subtitle:
    "Be the first to know about new arrivals, exclusive discounts and premium home styling inspiration.",
};

export const initialAboutCMS: CMSAboutContent = {
  badge: "OUR STORY",
  headline: "Modern spaces. Better living.",
  subheadline: "At LUMERO, we believe that the spaces we live in should reflect who we are.",
  story_paragraphs: [
    "Your room is more than just a place to stay. It's where you relax, dream, work, create and make memories. We believe even the smallest details can transform an ordinary space into something special.",
    "LUMERO was created with a simple vision: to make modern, aesthetic and thoughtfully designed home décor accessible to everyone.",
    "From minimal wall décor and ambient lighting to stylish desk accessories and everyday home essentials, we bring together products that add personality, comfort and style to your space.",
    "Our collection is inspired by modern minimalism, Scandinavian aesthetics and contemporary living. We focus on pieces that look beautiful, feel practical and fit naturally into everyday life.",
    "Whether you're decorating your first room, upgrading your workspace or giving your home a fresh new look, LUMERO is here to help you make it yours.",
  ],
  vision_title: "Thoughtful Form. Everyday Soul.",
  vision_text:
    "We curate designs where gentle tactile textures meet quiet geometry. Every item in our catalog is engineered to bring visual calm and functional satisfaction to modern living.",
  collection_inspiration:
    "Inspired by Nordic serenity and warm architectural minimalism.",
  banner_image:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
  banner_image_public_id: "lumero/about-banner",
  philosophy_items: [
    {
      title: "Modern Design",
      description: "Clean, minimal and timeless aesthetics that harmonize with any room.",
    },
    {
      title: "Everyday Functionality",
      description: "Products that combine effortless style with practical everyday usefulness.",
    },
    {
      title: "Accessible Style",
      description: "Beautiful spaces shouldn't come with an unreasonable price tag.",
    },
    {
      title: "Thoughtful Selection",
      description: "Products chosen to make everyday spaces feel truly distinctive and special.",
    },
  ],
  closing_tagline: "Make Your Space Yours.",
  closing_subtagline: "LUMERO — Modern spaces. Better living.",
};

