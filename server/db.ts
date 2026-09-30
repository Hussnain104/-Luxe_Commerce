import bcrypt from 'bcryptjs';
import {
  AuditLog,
  Banner,
  BlogPost,
  Brand,
  Cart,
  CartItem,
  Category,
  CMSPage,
  Coupon,
  InventoryTransaction,
  MediaItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderTimeline,
  Product,
  ProductImage,
  ProductVariant,
  Review,
  StoreSettings,
  User,
  WishlistItem
} from '../src/types.ts';

// Initial default password hash for 'Password123!'
const DEFAULT_HASH = bcrypt.hashSync('Password123!', 10);

class DatabaseStore {
  users: User[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  products: Product[] = [];
  productImages: ProductImage[] = [];
  productVariants: ProductVariant[] = [];
  inventoryTransactions: InventoryTransaction[] = [];
  carts: Map<string, Cart> = new Map(); // key = userId or sessionId
  wishlists: WishlistItem[] = [];
  coupons: Coupon[] = [];
  orders: Order[] = [];
  orderTimeline: OrderTimeline[] = [];
  reviews: Review[] = [];
  banners: Banner[] = [];
  blogs: BlogPost[] = [];
  pages: CMSPage[] = [];
  media: MediaItem[] = [];
  auditLogs: AuditLog[] = [];
  settings: StoreSettings = {
    store_name: 'LuxeCommerce',
    store_email: 'concierge@luxecommerce.com',
    store_phone: '+1 (800) 589-3266',
    currency_symbol: '$',
    currency_code: 'USD',
    free_shipping_threshold: 250,
    standard_shipping_rate: 15,
    express_shipping_rate: 35,
    tax_rate_percentage: 8.25,
    announcement_bar_enabled: true,
    announcement_text: 'Complimentary white-glove worldwide shipping on orders exceeding $250. Code: FREESHIP',
    enable_stripe: true,
    enable_paypal: true,
    enable_cod: true,
  };

  private nextUserId = 4;
  private nextProductId = 21;
  private nextOrderId = 1001;
  private nextReviewId = 50;
  private nextAuditId = 1;
  private nextMediaId = 20;

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Users
    this.users = [
      {
        id: 1,
        role_id: 1,
        role_slug: 'super_admin',
        first_name: 'Alexander',
        last_name: 'Vance',
        email: 'admin@luxecommerce.com',
        phone: '+1 (555) 234-5678',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        is_active: true,
        notes: 'Chief Executive & System Architect',
        created_at: new Date('2024-01-01').toISOString(),
      },
      {
        id: 2,
        role_id: 3,
        role_slug: 'manager',
        first_name: 'Elena',
        last_name: 'Rostova',
        email: 'manager@luxecommerce.com',
        phone: '+1 (555) 345-6789',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        is_active: true,
        notes: 'Fulfillment & Logistics Director',
        created_at: new Date('2024-01-15').toISOString(),
      },
      {
        id: 3,
        role_id: 4,
        role_slug: 'customer',
        first_name: 'Julian',
        last_name: 'Sterling',
        email: 'customer@example.com',
        phone: '+1 (555) 987-6543',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        is_active: true,
        notes: 'VIP Client Tier 1',
        created_at: new Date('2024-02-01').toISOString(),
      },
    ];

    // 2. Categories
    this.categories = [
      {
        id: 1,
        name: 'Horology & Watches',
        slug: 'horology-watches',
        description: 'Swiss-crafted mechanical calibers, tourbillons, and chronographs.',
        image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        banner_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
        is_featured: true,
        is_active: true,
        display_order: 1,
      },
      {
        id: 2,
        name: 'Leather Goods & Bags',
        slug: 'leather-goods-bags',
        description: 'Artisanal Tuscan full-grain weekenders, briefcases, and card holders.',
        image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        banner_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80',
        is_featured: true,
        is_active: true,
        display_order: 2,
      },
      {
        id: 3,
        name: 'Audio & Refined Tech',
        slug: 'audio-refined-tech',
        description: 'Bespoke planar headphones, tube DACs, and architectural speakers.',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        banner_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80',
        is_featured: true,
        is_active: true,
        display_order: 3,
      },
      {
        id: 4,
        name: 'Designer Apparel',
        slug: 'designer-apparel',
        description: 'Mongolian cashmere overcoats, tailored silk blazers, and knitwear.',
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        banner_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
        is_featured: true,
        is_active: true,
        display_order: 4,
      },
      {
        id: 5,
        name: 'Fine Home & Living',
        slug: 'fine-home-living',
        description: 'Mouth-blown crystal carafes, brass hourglasses, and sculptural scents.',
        image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
        banner_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        is_featured: true,
        is_active: true,
        display_order: 5,
      },
    ];

    // 3. Brands
    this.brands = [
      {
        id: 1,
        name: 'Chronos Genève',
        slug: 'chronos-geneve',
        description: 'Haute Horlogerie manufacture founded in 1884 in Vallée de Joux.',
        logo_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80',
        is_featured: true,
        is_active: true,
      },
      {
        id: 2,
        name: 'Atelier Noir',
        slug: 'atelier-noir',
        description: 'Florentine master tanners crafting uncompromising minimalist leatherwork.',
        logo_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80',
        is_featured: true,
        is_active: true,
      },
      {
        id: 3,
        name: 'Aura Sound Labs',
        slug: 'aura-sound-labs',
        description: 'Acoustic research laboratory developing beryllium and planar audio transducers.',
        logo_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
        is_featured: true,
        is_active: true,
      },
      {
        id: 4,
        name: 'Maison Valmont',
        slug: 'maison-valmont',
        description: 'Parisian fashion atelier recognized for architectural drape and pure fibers.',
        logo_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=200&q=80',
        is_featured: true,
        is_active: true,
      },
      {
        id: 5,
        name: 'Lumina Living',
        slug: 'lumina-living',
        description: 'Copenhagen interior design studio sculpting light, brass, and stone.',
        logo_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=200&q=80',
        is_featured: true,
        is_active: true,
      },
    ];

    // 4. Over 20 Rich Luxury Products with Variants, Images & Specs
    const rawProducts = [
      {
        id: 1,
        categoryId: 1,
        brandId: 1,
        title: 'Chronos Perpetual Calendar Caliber 41',
        slug: 'chronos-perpetual-calendar-caliber-41',
        sku: 'CH-PC-4100',
        barcode: '764012345001',
        price: 14500,
        compareAtPrice: 16800,
        costPrice: 9000,
        stock: 8,
        rating: 4.95,
        reviews: 28,
        isFeatured: true,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        shortDesc: 'A pinnacle of Swiss micromechanics featuring perpetual moonphase and 72-hour power reserve.',
        desc: 'The Chronos Perpetual Calendar Caliber 41 represents over 180 hours of meticulous hand-finishing. Encased in satin-brushed Grade 5 titanium with an exhibition sapphire crystal caseback, it automatically adjusts for leap years until 2100 without intervention.',
        specs: {
          Movement: 'In-House Caliber C-884 Automatic',
          Case: '41mm Grade 5 Titanium',
          Dial: 'Sunburst Anthracite with 18k White Gold Indices',
          'Power Reserve': '72 Hours',
          'Water Resistance': '100m / 10 ATM',
        },
        features: [
          'Automatic perpetual calendar indicating date, day, month, and leap year',
          'Astronomical precision moonphase accurate to one day every 122 years',
          'Hand-beveled Côtes de Genève bridges and 22k gold micro-rotor',
          'Includes alligator leather strap and interchangeable titanium bracelet',
        ],
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'CH-PC-4100-TI', title: 'Titanium / Anthracite', colorName: 'Anthracite', colorCode: '#333333', size: '41mm', priceModifier: 0, stock: 5 },
          { sku: 'CH-PC-4100-RG', title: 'Rose Gold / Ivory', colorName: 'Rose Gold', colorCode: '#B76E79', size: '41mm', priceModifier: 2400, stock: 3 },
        ],
      },
      {
        id: 2,
        categoryId: 1,
        brandId: 1,
        title: 'Nautilus Deep-Sea Titanium Chronograph',
        slug: 'nautilus-deep-sea-titanium-chronograph',
        sku: 'CH-ND-5000',
        price: 8900,
        compareAtPrice: 9800,
        stock: 14,
        rating: 4.88,
        reviews: 42,
        isFeatured: true,
        isFlashSale: false,
        shortDesc: 'Certified 300m diver chronograph with helium escape valve and ceramic bezel.',
        desc: 'Engineered for oceanic abyss exploration and high society dinners alike. Featuring high-contrast Super-LumiNova BGW9 markers and a unidirectional 120-click ceramic timing bezel.',
        specs: {
          Case: '43mm DLC Coated Titanium',
          Bezel: 'Zirconia Matte Ceramic',
          Movement: 'Flyback Column-Wheel Chronograph',
          Glass: 'Double AR-Coated Domed Sapphire',
        },
        features: [
          'Helium release valve at 10 o’clock',
          'Integrated FKM rubber deployant strap with micro-adjust clasp',
          'Flyback chronograph function for instant reset and restart',
        ],
        images: [
          'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'CH-ND-5000-BK', title: 'Midnight Obsidian', colorName: 'Obsidian', colorCode: '#111111', size: '43mm', priceModifier: 0, stock: 8 },
          { sku: 'CH-ND-5000-BL', title: 'Deep Abyss Blue', colorName: 'Abyss Blue', colorCode: '#0B2545', size: '43mm', priceModifier: 0, stock: 6 },
        ],
      },
      {
        id: 3,
        categoryId: 2,
        brandId: 2,
        title: 'Venezia Grande Full-Grain Leather Weekender',
        slug: 'venezia-grande-leather-weekender',
        sku: 'AT-VG-8800',
        price: 1850,
        compareAtPrice: 2200,
        stock: 19,
        rating: 4.92,
        reviews: 51,
        isFeatured: true,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        shortDesc: 'Handcrafted in Florence from vegetable-tanned French calfskin with solid brass hardware.',
        desc: 'The Venezia Grande is tailored for 3-to-5 day journeys. As time elapses, the naturally oiled leather acquires a lustrous, irreplaceable golden patina unique to each voyage.',
        specs: {
          Dimensions: '54cm x 30cm x 26cm',
          Weight: '2.4 kg',
          Leather: 'Full-Grain French Calfskin (Vegetable Tanned)',
          Hardware: 'PVD Coated Solid Brass',
        },
        features: [
          'Dedicated water-resistant shoe compartment with brass ventilation eyelets',
          'Padded 16-inch laptop pocket with magnetic leather flap closure',
          'Detachable ergonomic leather shoulder strap with memory foam padding',
          'TSA-approved padlock and monogrammable leather luggage tag included',
        ],
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AT-VG-8800-CO', title: 'Cognac Saddle Brown', colorName: 'Cognac', colorCode: '#8B4513', size: 'Grande (54L)', priceModifier: 0, stock: 11 },
          { sku: 'AT-VG-8800-NO', title: 'Florentine Noir', colorName: 'Noir', colorCode: '#1A1A1A', size: 'Grande (54L)', priceModifier: 0, stock: 8 },
        ],
      },
      {
        id: 4,
        categoryId: 2,
        brandId: 2,
        title: 'Executive Slim Leather Portfolio & Briefcase',
        slug: 'executive-slim-leather-portfolio',
        sku: 'AT-ES-3100',
        price: 980,
        compareAtPrice: 1150,
        stock: 22,
        rating: 4.85,
        reviews: 34,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: 'Structured Tuscan calf leather briefcase for modern boardroom executives.',
        desc: 'Slim yet cavernous enough for tech essentials, journals, and executive portfolios. Features bespoke Italian hand-stitching with German Serafil threads.',
        specs: {
          Dimensions: '40cm x 29cm x 6cm',
          Capacity: 'Fits up to 15-inch MacBook Pro',
          Lining: 'Suede Alcantara Microfiber',
        },
        features: [
          'Concealed RFID-blocking passport and credit card security pocket',
          'Dual YKK Excella polished silver-finish two-way zippers',
          'Pass-through trolley strap to slip securely over rolling luggage handles',
        ],
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AT-ES-3100-CH', title: 'Chestnut Brown', colorName: 'Chestnut', colorCode: '#4A2C2A', size: 'Standard', priceModifier: 0, stock: 12 },
          { sku: 'AT-ES-3100-BK', title: 'Matte Charcoal', colorName: 'Charcoal', colorCode: '#222222', size: 'Standard', priceModifier: 0, stock: 10 },
        ],
      },
      {
        id: 5,
        categoryId: 3,
        brandId: 3,
        title: 'Aura Reference Planar Magnetic Headphones',
        slug: 'aura-reference-planar-magnetic-headphones',
        sku: 'AU-HP-9000',
        price: 2450,
        compareAtPrice: 2800,
        stock: 12,
        rating: 4.97,
        reviews: 64,
        isFeatured: true,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
        shortDesc: 'Open-back planar transducer monitors with aerospace magnesium chassis and lambskin ear cushions.',
        desc: 'Experience pure sonic transparency. Custom laser-etched 106mm neodymium planar drivers generate a hyper-realistic soundstage with harmonic distortion below 0.05%.',
        specs: {
          Transducer: '106mm Ultra-Thin Planar Magnetic',
          'Frequency Response': '5 Hz – 55,000 Hz',
          Impedance: '32 Ohms',
          Sensitivity: '102 dB / 1mW',
        },
        features: [
          'Hand-polished walnut wood earcups and CNC-machined aerospace alloy headband',
          'Oxygen-free monocrystalline 8-core copper balanced cable with 4.4mm Pentaconn plug',
          'Memory foam earcups wrapped in sustainably sourced Italian lambskin',
          'Individually serialized calibration chart signed by chief acoustic master',
        ],
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AU-HP-9000-WN', title: 'Walnut / Space Grey', colorName: 'Walnut', colorCode: '#5C4033', size: 'Over-Ear', priceModifier: 0, stock: 7 },
          { sku: 'AU-HP-9000-EB', title: 'Ebony / Brushed Brass', colorName: 'Ebony', colorCode: '#1A1110', size: 'Over-Ear', priceModifier: 250, stock: 5 },
        ],
      },
      {
        id: 6,
        categoryId: 3,
        brandId: 3,
        title: 'Aura Monolith Vacuum Tube DAC & Headphone Amp',
        slug: 'aura-monolith-tube-dac-amp',
        sku: 'AU-AM-4500',
        price: 3200,
        compareAtPrice: 3500,
        stock: 6,
        rating: 4.94,
        reviews: 19,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: 'Class-A dual triode valve amplification with 32-bit/768kHz DSD512 decoding.',
        desc: 'Fuses analog warmth with surgical digital resolution. Dual Electro-Harmonix 6922 vacuum tubes illuminate through a tinted tempered-glass top window.',
        specs: {
          DAC: 'Dual ESS Sabre ES9038PRO 32-Bit',
          Tubes: 'Matched Pair Electro-Harmonix 6922',
          Output: '6,000 mW @ 32 Ohms Balanced',
          Chassis: 'Single Solid Billet Aluminum Block',
        },
        features: [
          'Pure Class-A topology without negative feedback',
          'Stepped relay-based 64-step attenuator volume wheel with zero channel imbalance',
          'USB, I2S, Optical, Coaxial, and Bluetooth LDAC 990kbps high-res inputs',
        ],
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AU-AM-4500-SL', title: 'Silver Anodized', colorName: 'Silver', colorCode: '#C0C0C0', size: 'Desktop Unit', priceModifier: 0, stock: 4 },
          { sku: 'AU-AM-4500-BK', title: 'Matte Stealth Black', colorName: 'Black', colorCode: '#000000', size: 'Desktop Unit', priceModifier: 0, stock: 2 },
        ],
      },
      {
        id: 7,
        categoryId: 4,
        brandId: 4,
        title: 'L’Empereur Mongolian Cashmere Overcoat',
        slug: 'lempereur-mongolian-cashmere-overcoat',
        sku: 'MV-OC-7200',
        price: 3400,
        compareAtPrice: 3900,
        stock: 15,
        rating: 4.96,
        reviews: 38,
        isFeatured: true,
        isFlashSale: false,
        shortDesc: 'Double-breasted long coat spun from pure 100% Grade-A Mongolian cashmere fibers.',
        desc: 'Unmatched thermal insulation with featherlight weight. Tailored in Naples with traditional floating canvas construction, horn buttons, and silk cupro lining.',
        specs: {
          Material: '100% Mongolian Cashmere (520gsm)',
          Lining: 'Bemberg Silk Cupro',
          Buttons: 'Genuine Water Buffalo Horn',
          Cut: 'Relaxed Tailored Silhouette',
        },
        features: [
          'Hand-sewn pick-stitching along lapels and pockets',
          'Broad peak lapels and storm tab undercollar',
          'Deep interior passport and cigar pockets',
          'Includes cedar garment hanger and breathable cotton dust bag',
        ],
        images: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'MV-OC-7200-CM-40', title: 'Camel / 40R', colorName: 'Camel', colorCode: '#C19A6B', size: '40R', priceModifier: 0, stock: 5 },
          { sku: 'MV-OC-7200-CM-42', title: 'Camel / 42R', colorName: 'Camel', colorCode: '#C19A6B', size: '42R', priceModifier: 0, stock: 4 },
          { sku: 'MV-OC-7200-NV-40', title: 'Midnight Navy / 40R', colorName: 'Navy', colorCode: '#000080', size: '40R', priceModifier: 0, stock: 3 },
          { sku: 'MV-OC-7200-NV-42', title: 'Midnight Navy / 42R', colorName: 'Navy', colorCode: '#000080', size: '42R', priceModifier: 0, stock: 3 },
        ],
      },
      {
        id: 8,
        categoryId: 4,
        brandId: 4,
        title: 'Silk-Wool Bespoke Evening Tuxedo Jacket',
        slug: 'silk-wool-bespoke-evening-tuxedo',
        sku: 'MV-TX-5100',
        price: 2150,
        compareAtPrice: 2400,
        stock: 9,
        rating: 4.89,
        reviews: 23,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: 'Single-button shawl collar dinner jacket crafted from Loro Piana Tasmanian wool and silk faille.',
        desc: 'The definitive formal attire for galas and black-tie affairs. Deep jet black hue engineered to absorb light evenly under evening chandeliers.',
        specs: {
          Fabric: '85% Super 160s Virgin Wool, 15% Mulberry Silk',
          Lapel: 'Duchess Satin Silk Shawl Lapel',
          Vents: 'No Vents (Traditional Evening Cut)',
        },
        features: [
          'Satin covered buttons and welt pockets',
          'Hand-padded chest canvas conforming to physique over time',
          'Complimentary alterations voucher at partner ateliers worldwide',
        ],
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'MV-TX-5100-38', title: 'Obsidian Black / 38R', colorName: 'Black', colorCode: '#000000', size: '38R', priceModifier: 0, stock: 3 },
          { sku: 'MV-TX-5100-40', title: 'Obsidian Black / 40R', colorName: 'Black', colorCode: '#000000', size: '40R', priceModifier: 0, stock: 4 },
          { sku: 'MV-TX-5100-42', title: 'Obsidian Black / 42R', colorName: 'Black', colorCode: '#000000', size: '42R', priceModifier: 0, stock: 2 },
        ],
      },
      {
        id: 9,
        categoryId: 5,
        brandId: 5,
        title: 'Architectural Carrara Marble & Brass Table Lamp',
        slug: 'architectural-carrara-marble-lamp',
        sku: 'LL-LP-1200',
        price: 1250,
        compareAtPrice: 1450,
        stock: 18,
        rating: 4.91,
        reviews: 47,
        isFeatured: true,
        isFlashSale: false,
        shortDesc: 'Hand-carved Italian Carrara marble cylinder base paired with an unlacquered brushed brass shade.',
        desc: 'A sculptural centerpiece casting a diffused 2700K warm glow. The unlacquered brass will naturally oxidise and build character over the decades.',
        specs: {
          Base: 'Solid Italian White Carrara Marble (No two veins alike)',
          Shade: 'Spun Solid Brass with Satin Interior Reflector',
          Dimensions: 'Height 42cm x Diameter 28cm',
          Weight: '8.5 kg',
        },
        features: [
          'Integrated continuous touch-dimmer switch on marble base',
          'High CRI 95+ warm LED filament array with 50,000-hour lifespan',
          'Durable braided houndstooth textile cord (2.5 meters)',
        ],
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'LL-LP-1200-CR', title: 'White Carrara / Warm Brass', colorName: 'White / Brass', colorCode: '#F4F4F4', size: 'Standard Table', priceModifier: 0, stock: 10 },
          { sku: 'LL-LP-1200-MR', title: 'Nero Marquina / Smoke Black', colorName: 'Nero / Black', colorCode: '#1A1A1A', size: 'Standard Table', priceModifier: 150, stock: 8 },
        ],
      },
      {
        id: 10,
        categoryId: 5,
        brandId: 5,
        title: 'Artisanal Mouth-Blown Crystal Decanter & Tumbler Set',
        slug: 'crystal-decanter-tumbler-set',
        sku: 'LL-DC-8000',
        price: 780,
        compareAtPrice: 900,
        stock: 25,
        rating: 4.93,
        reviews: 31,
        isFeatured: false,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        shortDesc: 'Lead-free Bohemian crystal decanter accompanied by four heavy-bottom hand-cut rocks glasses.',
        desc: 'Mouth-blown by fifth-generation Czech glassmakers. Designed specifically for optimal spirit aeration and tactile heft in the palm.',
        specs: {
          Capacity: 'Decanter 750ml, Glasses 320ml each',
          Material: 'Ultra-Clarity Lead-Free Crystalline Glass',
          Packaging: 'Felt-Lined Presentation Keepsake Box',
        },
        features: [
          'Precision ground-glass airtight stopper prevents evaporation',
          'Thick geometric base preserves chill without thermal transfer',
          'Dishwasher safe though gentle handwash strongly recommended',
        ],
        images: [
          'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'LL-DC-8000-CL', title: 'Diamond Cut Clear', colorName: 'Clear', colorCode: '#E5E5E5', size: '5-Piece Set', priceModifier: 0, stock: 15 },
          { sku: 'LL-DC-8000-SM', title: 'Smoked Amber Hue', colorName: 'Amber', colorCode: '#D97706', size: '5-Piece Set', priceModifier: 80, stock: 10 },
        ],
      },
      {
        id: 11,
        categoryId: 1,
        brandId: 1,
        title: 'Chronos Skeleton Tourbillon Rose Gold',
        slug: 'chronos-skeleton-tourbillon-rose-gold',
        sku: 'CH-ST-7700',
        price: 28500,
        compareAtPrice: 32000,
        stock: 4,
        rating: 5.0,
        reviews: 14,
        isFeatured: true,
        isFlashSale: false,
        shortDesc: 'Flying one-minute tourbillon encased in 18-karat rose gold with openworked dial.',
        desc: 'A spectacle of kinetic mechanical poetry. The titanium tourbillon carriage rotates once per minute to counteract the effects of terrestrial gravity.',
        specs: {
          Case: '42mm 18k Rose Gold',
          Thickness: '10.8mm',
          Frequency: '28,800 vph (4 Hz)',
        },
        features: [
          'One-minute flying tourbillon cage weighing merely 0.28 grams',
          'Skeletonized dial revealing the barrel spring tension',
          'Hand-stitched Mississippiensis alligator leather band',
        ],
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'CH-ST-7700-RG', title: '18k Rose Gold / Black Strap', colorName: 'Rose Gold', colorCode: '#B76E79', size: '42mm', priceModifier: 0, stock: 4 },
        ],
      },
      {
        id: 12,
        categoryId: 2,
        brandId: 2,
        title: 'Minimalist Matte Calfskin Cardholder',
        slug: 'minimalist-matte-calfskin-cardholder',
        sku: 'AT-CH-1000',
        price: 240,
        compareAtPrice: 280,
        stock: 45,
        rating: 4.86,
        reviews: 82,
        isFeatured: false,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        shortDesc: 'Ultra-compact six-slot card sleeve with central folded cash slot.',
        desc: 'Sculpted from a single piece of 0.8mm hand-thinned vegetable calfskin, burnished with natural beeswax edges.',
        specs: {
          Slots: '6 Card Pockets + 1 Central Note Compartment',
          Thickness: '4.2mm empty',
        },
        features: [
          'Hand-burnished wax edges prevent fraying',
          'Integrated RFID shield in outer panels',
          'Embossed discreet Atelier Noir monogram',
        ],
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AT-CH-1000-BK', title: 'Carbon Black', colorName: 'Black', colorCode: '#111111', size: 'Slim', priceModifier: 0, stock: 25 },
          { sku: 'AT-CH-1000-TN', title: 'Saddle Tan', colorName: 'Tan', colorCode: '#D2B48C', size: 'Slim', priceModifier: 0, stock: 20 },
        ],
      },
      {
        id: 13,
        categoryId: 3,
        brandId: 3,
        title: 'Aura Horizon Wireless High-Res Spatial Earbuds',
        slug: 'aura-horizon-wireless-earbuds',
        sku: 'AU-EB-2100',
        price: 520,
        compareAtPrice: 590,
        stock: 35,
        rating: 4.88,
        reviews: 94,
        isFeatured: true,
        isFlashSale: false,
        shortDesc: 'Custom beryllium dynamic driver earbuds with adaptive active noise cancellation and spatial audio.',
        desc: 'Ceramic acoustic nozzle with CNC aluminum wireless charging case that delivers 36 hours total battery endurance.',
        specs: {
          Battery: '9 Hours Earbuds + 27 Hours Case',
          Codecs: 'LDAC, aptX Adaptive, AAC',
          Waterproofing: 'IPX5 Sweat & Water Resistance',
        },
        features: [
          'Adaptive hybrid ANC measuring ear canal pressure 50,000 times/sec',
          'Wireless Qi charging and USB-C fast charging (10 min gives 3 hrs)',
          'Multi-point Bluetooth 5.4 connecting laptop and phone simultaneously',
        ],
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AU-EB-2100-WH', title: 'Arctic Ceramic White', colorName: 'White', colorCode: '#F8F9FA', size: 'Universal Fit', priceModifier: 0, stock: 20 },
          { sku: 'AU-EB-2100-BK', title: 'Matte Gunmetal', colorName: 'Gunmetal', colorCode: '#2B2D42', size: 'Universal Fit', priceModifier: 0, stock: 15 },
        ],
      },
      {
        id: 14,
        categoryId: 4,
        brandId: 4,
        title: 'Pure Mulberry Silk Robe & Loungewear',
        slug: 'pure-mulberry-silk-robe',
        sku: 'MV-SR-3400',
        price: 890,
        compareAtPrice: 1050,
        stock: 16,
        rating: 4.95,
        reviews: 29,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: '22-momme pure grade 6A mulberry silk dressing gown with sash tie and French seams.',
        desc: 'Unmatched fluid drape that glides across skin. Naturally hypoallergenic, breathable, and thermoregulating for year-round luxury.',
        specs: {
          Fabric: '100% Grade 6A Mulberry Silk (22 Momme)',
          Length: 'Calf Length (130cm)',
        },
        features: [
          'Hand-rolled hems and reinforced internal tie for non-slip closure',
          'Two deep side seam pockets lined in matching silk',
          'Machine washable on delicate silk cycle',
        ],
        images: [
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'MV-SR-3400-EM-S', title: 'Emerald Green / Small', colorName: 'Emerald', colorCode: '#046307', size: 'S/M', priceModifier: 0, stock: 8 },
          { sku: 'MV-SR-3400-EM-L', title: 'Emerald Green / Large', colorName: 'Emerald', colorCode: '#046307', size: 'L/XL', priceModifier: 0, stock: 8 },
        ],
      },
      {
        id: 15,
        categoryId: 5,
        brandId: 5,
        title: 'Minimalist Cast Bronze Wall Clock',
        slug: 'minimalist-cast-bronze-wall-clock',
        sku: 'LL-CK-4000',
        price: 650,
        compareAtPrice: 750,
        stock: 12,
        rating: 4.82,
        reviews: 18,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: 'Sand-cast solid bronze dial featuring silent sweep German quartz movement.',
        desc: 'Each dial is hand-poured in small batches, featuring organic granular texture variations that catch ambient shadows throughout the day.',
        specs: {
          Diameter: '36cm',
          Weight: '4.8 kg',
          Movement: 'Junghans Silent Quartz',
        },
        features: [
          'Raw wax finish that develops an organic antique bronze patina',
          'Recessed mounting bracket with heavy-duty anchor included',
          'Completely silent operation without audible tick noise',
        ],
        images: [
          'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'LL-CK-4000-BZ', title: 'Antiqued Bronze', colorName: 'Bronze', colorCode: '#CD7F32', size: '36cm', priceModifier: 0, stock: 12 },
        ],
      },
      {
        id: 16,
        categoryId: 1,
        brandId: 1,
        title: 'Heritage Aviator Chronograph 40mm',
        slug: 'heritage-aviator-chronograph-40mm',
        sku: 'CH-AC-4010',
        price: 6400,
        compareAtPrice: 7200,
        stock: 11,
        rating: 4.87,
        reviews: 33,
        isFeatured: false,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        shortDesc: 'Vintage-inspired dual-register pilot chronograph with bi-compax layout and telemeter scale.',
        desc: 'Recalling the golden era of transatlantic aviation. Features syringe hands, box sapphire crystal, and an oiled horsehide aviator strap.',
        specs: {
          Case: '40mm 316L Stainless Steel',
          Dial: 'Panda Matte Cream & Black',
          Lume: 'Old Radium Super-LumiNova',
        },
        features: [
          'Telemeter and tachymeter scales printed on outer dial track',
          'Sapphire crystal display back showing blued movement screws',
          'Quick-release strap spring bars for effortless tool-free changes',
        ],
        images: [
          'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'CH-AC-4010-PD', title: 'Panda Cream / Black', colorName: 'Panda', colorCode: '#FDFBF7', size: '40mm', priceModifier: 0, stock: 11 },
        ],
      },
      {
        id: 17,
        categoryId: 2,
        brandId: 2,
        title: 'Tuscan Leather Duffle Backpack',
        slug: 'tuscan-leather-duffle-backpack',
        sku: 'AT-BP-5500',
        price: 1450,
        compareAtPrice: 1700,
        stock: 14,
        rating: 4.91,
        reviews: 26,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: 'Versatile roll-top backpack hand-formed from oil-waxed Tuscan leather.',
        desc: 'Engineered for seamless transition from weekday bicycle commutes to weekend Alpine retreats. Expandable roll-top adds 8 liters of volume when required.',
        specs: {
          Capacity: '22L - 30L Expandable',
          Dimensions: '48cm x 32cm x 16cm',
        },
        features: [
          'Aero-mesh ventilated padded back panel for breathability',
          'Side quick-access zipper directly accessing laptop compartment',
          'Hidden passport pocket along lumbar support seam',
        ],
        images: [
          'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AT-BP-5500-BK', title: 'Midnight Black', colorName: 'Black', colorCode: '#1C1C1C', size: 'Expandable', priceModifier: 0, stock: 8 },
          { sku: 'AT-BP-5500-OL', title: 'Vintage Olive Brown', colorName: 'Olive', colorCode: '#556B2F', size: 'Expandable', priceModifier: 0, stock: 6 },
        ],
      },
      {
        id: 18,
        categoryId: 3,
        brandId: 3,
        title: 'Aura Studio Bookshelf Monitors (Pair)',
        slug: 'aura-studio-bookshelf-monitors',
        sku: 'AU-BS-6000',
        price: 3800,
        compareAtPrice: 4200,
        stock: 5,
        rating: 4.97,
        reviews: 21,
        isFeatured: true,
        isFlashSale: false,
        shortDesc: 'Active high-fidelity 2-way powered studio speakers with beryllium dome tweeters.',
        desc: 'Uncompromising acoustic fidelity in a sculpted cabinet. Dual 350W Class-D Pascal amplifiers power each driver with zero audible hiss.',
        specs: {
          Power: '700W Total Bi-Amplified',
          Woofer: '6.5-Inch Carbon Fiber Composite',
          Tweeter: '1-Inch Pure Beryllium Dome',
        },
        features: [
          'Room acoustic calibration DSP with mic measurement app',
          'High-resolution streaming via Apple AirPlay 2, Spotify Connect, Roon Ready',
          'Solid oak baffle with matte black acoustic damping composite body',
        ],
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'AU-BS-6000-OK', title: 'Natural Nordic Oak', colorName: 'Oak', colorCode: '#D2B48C', size: 'Pair', priceModifier: 0, stock: 3 },
          { sku: 'AU-BS-6000-WN', title: 'American Walnut', colorName: 'Walnut', colorCode: '#5C4033', size: 'Pair', priceModifier: 200, stock: 2 },
        ],
      },
      {
        id: 19,
        categoryId: 4,
        brandId: 4,
        title: 'Fine Gauge Merino Wool Turtleneck Sweater',
        slug: 'fine-gauge-merino-wool-turtleneck',
        sku: 'MV-TN-2200',
        price: 490,
        compareAtPrice: 580,
        stock: 28,
        rating: 4.86,
        reviews: 44,
        isFeatured: false,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        shortDesc: 'Seamless circular knit turtleneck crafted from ultra-fine 17.5-micron Australian merino wool.',
        desc: 'Incredibly soft next-to-skin touch with zero itchiness. Temperature regulating and naturally odor-resistant for effortless seasonal layering.',
        specs: {
          Yarn: '100% Extra-Fine Merino Wool (18 Gauge)',
          Care: 'Hand wash cold or dry clean',
        },
        features: [
          'Ribbed collar, cuffs, and hem that retain memory after washing',
          'Circular whole-garment 3D knitting eliminates uncomfortable seams',
        ],
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'MV-TN-2200-CH-M', title: 'Charcoal Grey / Medium', colorName: 'Charcoal', colorCode: '#36454F', size: 'M', priceModifier: 0, stock: 10 },
          { sku: 'MV-TN-2200-CH-L', title: 'Charcoal Grey / Large', colorName: 'Charcoal', colorCode: '#36454F', size: 'L', priceModifier: 0, stock: 8 },
          { sku: 'MV-TN-2200-IV-M', title: 'Warm Ivory / Medium', colorName: 'Ivory', colorCode: '#FFFFF0', size: 'M', priceModifier: 0, stock: 5 },
          { sku: 'MV-TN-2200-IV-L', title: 'Warm Ivory / Large', colorName: 'Ivory', colorCode: '#FFFFF0', size: 'L', priceModifier: 0, stock: 5 },
        ],
      },
      {
        id: 20,
        categoryId: 5,
        brandId: 5,
        title: 'Nordic Cast Iron & Walnut Fire Pit Bowl',
        slug: 'nordic-cast-iron-walnut-fire-pit',
        sku: 'LL-FP-9900',
        price: 1650,
        compareAtPrice: 1900,
        stock: 7,
        rating: 4.92,
        reviews: 17,
        isFeatured: false,
        isFlashSale: false,
        shortDesc: 'Heavy-gauge cast iron architectural fire basin resting on a FSC-certified American walnut tripod base.',
        desc: 'Transforms patio terraces into intimate gathering sanctums. Features engineered airflow intake slots that promote clean, low-smoke combustion.',
        specs: {
          Diameter: '75cm',
          Height: '46cm',
          Weight: '26 kg Solid Cast Iron',
        },
        features: [
          'Weather-resistant oiled walnut tripod with solid brass leveling feet',
          'Heavy-duty spark arrestor mesh lid and brass fire poker included',
          'Internal drainage plug for easy rain drainage and cleaning',
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        ],
        variants: [
          { sku: 'LL-FP-9900-ST', title: 'Matte Cast Iron & Walnut', colorName: 'Iron / Walnut', colorCode: '#2B2B2B', size: '75cm Basin', priceModifier: 0, stock: 7 },
        ],
      },
    ];

    // Transform raw products into typed normalized records
    this.products = rawProducts.map((p) => {
      const cat = this.categories.find((c) => c.id === p.categoryId);
      const br = this.brands.find((b) => b.id === p.brandId);

      const prodImages: ProductImage[] = p.images.map((img, idx) => ({
        id: p.id * 10 + idx,
        product_id: p.id,
        image_url: img,
        alt_text: `${p.title} Angle ${idx + 1}`,
        display_order: idx + 1,
        is_primary: idx === 0,
      }));

      const prodVariants: ProductVariant[] = p.variants.map((v, vIdx) => ({
        id: p.id * 100 + vIdx,
        product_id: p.id,
        sku: v.sku,
        title: v.title,
        color_name: v.colorName,
        color_code: v.colorCode,
        size: v.size,
        price_modifier: v.priceModifier,
        stock_quantity: v.stock,
        image_url: p.images[0],
      }));

      return {
        id: p.id,
        category_id: p.categoryId,
        category_name: cat?.name,
        category_slug: cat?.slug,
        brand_id: p.brandId,
        brand_name: br?.name,
        brand_slug: br?.slug,
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        barcode: p.barcode,
        short_description: p.shortDesc,
        description: p.desc,
        specifications: p.specs,
        features: p.features,
        price: p.price,
        compare_at_price: p.compareAtPrice,
        cost_price: p.costPrice,
        is_published: true,
        is_featured: p.isFeatured,
        is_flash_sale: p.isFlashSale,
        flash_sale_ends_at: p.flashSaleEndsAt,
        status: 'published',
        stock_quantity: p.stock,
        low_stock_threshold: 5,
        rating: p.rating,
        review_count: p.reviews,
        images: prodImages,
        variants: prodVariants,
        seo_title: `${p.title} | Luxury E-Commerce`,
        seo_description: p.shortDesc,
        seo_keywords: `${p.title}, luxury ${cat?.name}, designer goods`,
        created_at: new Date('2024-01-10').toISOString(),
        updated_at: new Date('2024-03-01').toISOString(),
      };
    });

    // 5. Seed Coupons
    this.coupons = [
      {
        id: 1,
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 100,
        max_discount: 200,
        usage_limit: 1000,
        usage_count: 142,
        is_active: true,
      },
      {
        id: 2,
        code: 'LUXE20',
        discount_type: 'percentage',
        discount_value: 20,
        min_order_amount: 500,
        max_discount: 600,
        usage_limit: 500,
        usage_count: 88,
        is_active: true,
      },
      {
        id: 3,
        code: 'VIP100',
        discount_type: 'fixed_amount',
        discount_value: 100,
        min_order_amount: 1000,
        max_discount: 100,
        usage_limit: 200,
        usage_count: 24,
        is_active: true,
      },
      {
        id: 4,
        code: 'FREESHIP',
        discount_type: 'free_shipping',
        discount_value: 0,
        min_order_amount: 50,
        usage_limit: 5000,
        usage_count: 310,
        is_active: true,
      },
    ];

    // 6. Seed Banners
    this.banners = [
      {
        id: 1,
        title: 'The Horological Masterpiece',
        subtitle: 'Discover the Chronos Perpetual Caliber 41 with hand-engraved rotor.',
        link_url: '/shop?category=horology-watches',
        button_text: 'Explore Timepieces',
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
        position: 'hero_slide',
        display_order: 1,
        is_active: true,
      },
      {
        id: 2,
        title: 'Florentine Leathercraft',
        subtitle: 'Hand-stitched full-grain calfskin luggage sculpted for lifelong journeys.',
        link_url: '/shop?category=leather-goods-bags',
        button_text: 'View Bags & Travel',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80',
        position: 'hero_slide',
        display_order: 2,
        is_active: true,
      },
      {
        id: 3,
        title: 'Acoustic Transcendence',
        subtitle: 'Bespoke planar magnetic beryllium drivers wrapped in lambskin.',
        link_url: '/shop?category=audio-refined-tech',
        button_text: 'Experience High-Res',
        image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80',
        position: 'hero_slide',
        display_order: 3,
        is_active: true,
      },
      {
        id: 4,
        title: 'Limited Flash Sale',
        subtitle: 'Privilege discounts of up to 25% on selected Haute Horlogerie.',
        link_url: '/shop?sale=true',
        button_text: 'Access Flash Sale',
        image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80',
        position: 'flash_sale_banner',
        display_order: 1,
        is_active: true,
      },
    ];

    // 7. Seed Reviews
    this.reviews = [
      {
        id: 1,
        product_id: 1,
        user_id: 3,
        customer_name: 'Julian Sterling',
        rating: 5,
        title: 'Unrivaled finishing in this price echelon',
        comment:
          'The micro-rotor movement finishing rivals Geneva Seal ateliers costing three times as much. The titanium weight feels exceptionally natural on wrist.',
        is_verified_purchase: true,
        is_approved: true,
        helpful_count: 14,
        created_at: new Date('2024-02-12').toISOString(),
      },
      {
        id: 2,
        product_id: 3,
        user_id: 3,
        customer_name: 'Lord Arthur P.',
        rating: 5,
        title: 'The definitive leather weekender',
        comment:
          'Carried this through Zurich, Florence, and Tokyo. The French calfskin has already begun taking on an extraordinary warm sheen. Brass hardware is rock solid.',
        is_verified_purchase: true,
        is_approved: true,
        helpful_count: 22,
        created_at: new Date('2024-02-18').toISOString(),
      },
      {
        id: 3,
        product_id: 5,
        user_id: 3,
        customer_name: 'Marcus K.',
        rating: 5,
        title: 'Holographic soundstage',
        comment:
          'Combined with the Monolith Tube DAC, these planar headphones disappear completely. The instrument separation on vinyl classical masterings is sublime.',
        is_verified_purchase: true,
        is_approved: true,
        helpful_count: 9,
        created_at: new Date('2024-03-01').toISOString(),
      },
    ];

    // 8. Seed Blogs (Haute Editorial Journal)
    this.blogs = [
      {
        id: 1,
        title: 'The Sacred Art of Perpetual Calendar Calibers',
        slug: 'the-sacred-art-of-perpetual-calendar-calibers',
        excerpt:
          'Inside the Vallée de Joux workshops where master micro-horologists spend months hand-bevelling titanium cams accurate without adjustment until 2100.',
        content:
          'A perpetual calendar timepiece is far more than an instrument for measuring passing seconds; it is a celestial microcosm of astronomical mathematics. Encapsulated within 42 millimeters of satin-brushed titanium and antireflective sapphire, over 380 hand-beveled components operate in silent harmony with Earth’s solar trajectory.\n\n### The Geometry of the Leap Year Mechanism\nStandard horological movements require manual crown correction at the close of every 30-day month and February. The perpetual calendar movement, pioneered by ancestral Genevan watchmakers, employs a 1,461-day mechanical memory gear. Every fourth rotation activates a micro-cam that allows the 29th day of February to register seamlessly before snapping directly into March.\n\n### Hand Anglage & Mirror Polishing\nBeneath the exhibition sapphire caseback, each bridge edge is chamfered at an exacting 45-degree angle using gentian wood pegs harvested from the Swiss Jura mountains. This finish, known in haute horlogerie as anglage, takes over 18 hours per single bridge, creating optical highlights that reflect light with diamond-like purity.',
        image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80',
        featured_image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80',
        secondary_image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
        secondary_caption: 'Precision assembly of the tourbillon cage and perpetual moonphase disc under stereoscopic magnification.',
        category: 'Horology',
        author_name: 'Alexander Vance',
        author_role: 'Senior Horological Historian, Geneva',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        reading_time: '6 min read',
        is_published: true,
        published_at: new Date('2024-02-10').toISOString(),
        tags: ['Haute Horlogerie', 'Grand Complication', 'Geneva Seal', 'Mechanical Art'],
        key_takeaways: [
          'Mechanical memory gears calculate leap year cycles accurately until the year 2100.',
          'Over 18 hours of artisan hand-polishing per bridge using gentian wood.',
          'Grade 5 titanium casing reduces gravitational shock while enhancing acoustic resonance.',
        ],
      },
      {
        id: 2,
        title: 'Tuscan Vegetable Tanning: A Legacy Across Generations',
        slug: 'tuscan-vegetable-tanning-legacy',
        excerpt:
          'Why the ancient Florentine alchemy of mimosa bark, chestnut tannins, and slow river drumming yields leather that matures with an inimitable patina.',
        content:
          'Unlike modern industrial chrome tanning which completes in 24 hours using chemical salts, authentic Tuscan vegetable tanning requires sixty days of patient drumming in natural chestnut, mimosa, and quebracho extracts along the banks of the Arno river.\n\n### The Living Character of Full-Grain Hides\nThe vegetable tannin solution bonds slowly with collagen fibers, preserving the skin’s unique grain pattern, natural scars, and organic breathability. Over years of travel, sun exposure, and handling, the oils within the leather migrate to the surface, developing a rich caramel patina that no artificial treatment can replicate.\n\n### Saddle Stitching by Hand\nEvery weekender bag and briefcase produced by Atelier Noir is sewn utilizing traditional double-needle saddler stitching. If a single stitch in a machine lock-stitch is cut, the entire seam unravels. A two-needle hand saddle stitch, by contrast, is self-locking and can endure a century of transatlantic transit.',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80',
        featured_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80',
        secondary_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1600&q=80',
        secondary_caption: 'Full-grain calfskin hides undergoing traditional tallow conditioning and hand edge-creasing in Florence.',
        category: 'Craftsmanship',
        author_name: 'Elena Rostova',
        author_role: 'Atelier Director, Florence',
        author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        reading_time: '5 min read',
        is_published: true,
        published_at: new Date('2024-02-25').toISOString(),
        tags: ['Florentine Leather', 'Saddle Stitch', 'Natural Patina', 'Sustainable Luxury'],
        key_takeaways: [
          'Sixty-day natural bark tanning process without heavy metals or petroleum solvents.',
          'Organic collagen retention produces rich aroma and natural tactile warmth.',
          'Double-needle saddle stitch provides indestructible structural durability.',
        ],
      },
      {
        id: 3,
        title: 'Planar Magnetic Acoustics: Sculpting the Perfect Soundstage',
        slug: 'planar-magnetic-acoustics-perfect-soundstage',
        excerpt:
          'How ultra-thin sub-micron graphene membranes and neodymium flux arrays deliver holographic spatial sound with zero transient distortion.',
        content:
          'Conventional dynamic headphone drivers push air using a conical speaker dome attached to a centered voice coil. While effective, the edges of the cone flex unpredictably at high volumes, generating harmonic distortion.\n\n### The Planar Revolution\nPlanar magnetic transducers replace the cone with an ultra-thin graphene membrane suspended between symmetric arrays of neodymium magnets. Because the driving force is applied uniformly across the entire diaphragm surface simultaneously, transient response is instantaneous and decay is absolute.\n\n### Acoustic Chamber Resonance\nPaired with solid walnut acoustic chambers turned on precision lathes and lambskin ear seals, listener fatigue vanishes. Orchestral recordings reveal the subtle inhalation of the first violinist and the acoustic decay off the Carnegie Hall cedar acoustic shells.',
        image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80',
        featured_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80',
        secondary_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
        secondary_caption: 'Acoustic testing chamber calibrating neodymium magnetic flux uniformity to within 0.1% tolerance.',
        category: 'Acoustics',
        author_name: 'Dr. Henrik Lindqvist',
        author_role: 'Lead Electroacoustic Engineer, Aura Sound Labs',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        reading_time: '7 min read',
        is_published: true,
        published_at: new Date('2024-03-05').toISOString(),
        tags: ['Audiophile', 'Planar Magnetic', 'Bespoke Audio', 'Acoustic Design'],
        key_takeaways: [
          'Sub-micron graphene diaphragm provides distortion-free transient response.',
          'Bilateral neodymium arrays create a linear magnetic flux across the entire audible spectrum.',
          'Hand-turned solid American walnut housings absorb unwanted internal reflections.',
        ],
      },
      {
        id: 4,
        title: 'The Architecture of Bespoke Tailoring: Super 180s & Floating Canvases',
        slug: 'architecture-of-bespoke-tailoring',
        excerpt:
          'Deconstructing the invisible internal structure of Savile Row and Milanese jackets: pure horsehair canvassing and unpressed lapel rolls.',
        content:
          'The soul of a bespoke suit does not lie in its outer cloth, but in the floating canvas concealed between the shell and silk lining. Industrial garments use fused plastic adhesives that degrade and stiffen after dry cleaning. Bespoke garments employ pure Mongolian horsehair and camel wool hand-padded directly into the chest piece.\n\n### The Floating Canvas That Learns Your Body\nAs the wearer moves throughout the day, body warmth softens the horsehair fibers, gradually molding the jacket to the natural curve of the shoulders and torso. Within five wearings, the garment fits with a second-skin precision unattainable by any off-the-rack garment.\n\n### Hand-Rolled Lapels & Milanese Buttonholes\nA true bespoke jacket is identifiable by the soft, unpressed roll of the lapel—never flattened by a hot industrial iron—and the hand-stitched Milanese buttonhole, which requires over forty-five minutes of steady silk gimp needlework.',
        image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
        featured_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
        secondary_image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=80',
        secondary_caption: 'Master cutter chalking Super 180s Tasmanian wool before hand-shearing the individual pattern panels.',
        category: 'Sartorial',
        author_name: 'Lord Arthur P.',
        author_role: 'Sartorial Critic & Arbiter, London',
        author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        reading_time: '5 min read',
        is_published: true,
        published_at: new Date('2024-03-12').toISOString(),
        tags: ['Bespoke Tailoring', 'Loro Piana', 'Savile Row', 'Pure Wool'],
        key_takeaways: [
          'Floating horsehair canvas molds to body contours via natural body heat.',
          'Zero synthetic adhesives ensures garments retain breathability and drape for decades.',
          'Hand-sewn Milanese silk buttonholes denote authentic bespoke pedigree.',
        ],
      },
      {
        id: 5,
        title: 'Haute Joaillerie: The Geometry of Rare Gemological Cuts',
        slug: 'haute-joaillerie-geometry-rare-gemological-cuts',
        excerpt:
          'From unheated royal blue Ceylon sapphires to D-Flawless emerald-cut solitaires: how master lapidaries balance optical fire with crystal yield.',
        content:
          'In the realm of high jewelry, the lapidary’s task is one of immense tension: a single millimeter fraction determines whether light refracts into an explosion of spectral fire or leaks out through the pavilion as dull extinction.\n\n### The Emerald Cut: Unforgiving Transparency\nWhile brilliant cuts disguise internal inclusions through dozens of triangular facets, the architectural step-cut emerald facetting acts as an open hall of mirrors. Only stones of exceptional purity—VS1 or higher—can withstand the scrutiny of an emerald cut.\n\n### Platinum Setting by Hand\nTo secure gems of sovereign quality, our atelier works exclusively in 950 platinum. Harder and denser than gold, each prong is shaped by hand using miniature tungsten carbide files to ensure maximum light enters the girdle while holding the stone with lifetime security.',
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80',
        featured_image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80',
        secondary_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
        secondary_caption: 'Micro-claw platinum pave setting under binocular illumination at the Geneva jewelry bench.',
        category: 'High Jewelry',
        author_name: 'Camille de Montmirail',
        author_role: 'Gemological Consultant, Place Vendôme',
        author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        reading_time: '6 min read',
        is_published: true,
        published_at: new Date('2024-03-18').toISOString(),
        tags: ['Haute Joaillerie', 'Place Vendôme', 'Natural Diamonds', 'Platinum'],
        key_takeaways: [
          'Step-cut emerald facets require superior crystalline clarity due to mirror-plane visibility.',
          '950 platinum prongs provide permanent security without tarnishing or thinning over centuries.',
          'Direct mine provenance tracing guarantees ethical custody and unheated geological pedigree.',
        ],
      },
    ];

    // 9. Seed Sample Completed Orders
    const sampleAddress = {
      id: 1,
      user_id: 3,
      type: 'both' as const,
      full_name: 'Julian Sterling',
      phone: '+1 (555) 987-6543',
      address_line1: '742 Evergreen Promenade, Suite 14B',
      city: 'Beverly Hills',
      state: 'CA',
      postal_code: '90210',
      country: 'United States',
      is_default: true,
    };

    this.orders = [
      {
        id: 1001,
        order_number: 'LX-889420',
        user_id: 3,
        customer_name: 'Julian Sterling',
        customer_email: 'customer@example.com',
        customer_phone: '+1 (555) 987-6543',
        status: 'delivered',
        payment_status: 'paid',
        payment_method: 'Stripe Credit Card',
        payment_reference: 'pi_3P90ZkL2e99xZ2',
        subtotal: 1850,
        discount_amount: 185,
        coupon_code: 'WELCOME10',
        shipping_amount: 0,
        shipping_method: 'White-Glove Courier Express',
        tax_amount: 137.36,
        grand_total: 1802.36,
        shipping_address: sampleAddress,
        billing_address: sampleAddress,
        tracking_number: 'TRK-983274981',
        courier_name: 'DHL Express Luxury Protocol',
        estimated_delivery: '2024-02-16',
        items: [
          {
            id: 1,
            order_id: 1001,
            product_id: 3,
            sku: 'AT-VG-8800-CO',
            title: 'Venezia Grande Full-Grain Leather Weekender',
            variant_name: 'Cognac Saddle Brown',
            image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
            unit_price: 1850,
            quantity: 1,
            subtotal: 1850,
          },
        ],
        timeline: [
          { id: 1, order_id: 1001, status: 'pending', message: 'Order received and credit card payment verified', created_at: '2024-02-12T10:00:00Z' },
          { id: 2, order_id: 1001, status: 'confirmed', message: 'Order validated by concierge team', created_at: '2024-02-12T10:30:00Z' },
          { id: 3, order_id: 1001, status: 'packed', message: 'Securely packed in velvet preservation dust bag', created_at: '2024-02-12T15:00:00Z' },
          { id: 4, order_id: 1001, status: 'shipped', message: 'Dispatched via DHL Express (TRK-983274981)', created_at: '2024-02-13T09:00:00Z' },
          { id: 5, order_id: 1001, status: 'delivered', message: 'Signed and delivered at recipient residence', created_at: '2024-02-15T14:22:00Z' },
        ],
        created_at: '2024-02-12T10:00:00Z',
        updated_at: '2024-02-15T14:22:00Z',
      },
      {
        id: 1002,
        order_number: 'LX-889421',
        user_id: 3,
        customer_name: 'Julian Sterling',
        customer_email: 'customer@example.com',
        customer_phone: '+1 (555) 987-6543',
        status: 'shipped',
        payment_status: 'paid',
        payment_method: 'Stripe Credit Card',
        payment_reference: 'pi_3Q44La12xK44m1',
        subtotal: 2450,
        discount_amount: 0,
        shipping_amount: 0,
        shipping_method: 'White-Glove Courier Express',
        tax_amount: 202.12,
        grand_total: 2652.12,
        shipping_address: sampleAddress,
        billing_address: sampleAddress,
        tracking_number: 'TRK-554210984',
        courier_name: 'FedEx Priority Secure Care',
        estimated_delivery: '2024-03-22',
        items: [
          {
            id: 2,
            order_id: 1002,
            product_id: 5,
            sku: 'AU-HP-9000-WN',
            title: 'Aura Reference Planar Magnetic Headphones',
            variant_name: 'Walnut / Space Grey',
            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
            unit_price: 2450,
            quantity: 1,
            subtotal: 2450,
          },
        ],
        timeline: [
          { id: 6, order_id: 1002, status: 'pending', message: 'Order submitted with Stripe payment confirmation', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 7, order_id: 1002, status: 'processing', message: 'Undergoing acoustic acoustic QA inspection', created_at: new Date(Date.now() - 60000000).toISOString() },
          { id: 8, order_id: 1002, status: 'shipped', message: 'Handed to FedEx Priority Secure Courier', created_at: new Date(Date.now() - 20000000).toISOString() },
        ],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 20000000).toISOString(),
      },
    ];

    // 10. Seed Media Library
    this.media = [
      {
        id: 1,
        filename: 'chronos-perpetual-titanium.jpg',
        file_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        file_size_bytes: 428000,
        alt_text: 'Chronos Caliber 41 Titanium Watch',
        created_at: new Date('2024-01-10').toISOString(),
      },
      {
        id: 2,
        filename: 'venezia-leather-weekender.jpg',
        file_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        file_size_bytes: 512000,
        alt_text: 'Venezia Grande Italian Leather Bag',
        created_at: new Date('2024-01-12').toISOString(),
      },
      {
        id: 3,
        filename: 'aura-reference-headphones.jpg',
        file_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        file_size_bytes: 389000,
        alt_text: 'Aura High-Res Planar Headphones',
        created_at: new Date('2024-01-15').toISOString(),
      },
    ];

    // 11. Seed Audit Logs
    this.auditLogs = [
      {
        id: 1,
        user_id: 1,
        user_name: 'Alexander Vance',
        action: 'UPDATE_SETTING',
        module: 'Settings',
        record_id: 'free_shipping_threshold',
        details: 'Changed free shipping threshold to $250',
        created_at: new Date('2024-02-01T09:15:00Z').toISOString(),
      },
      {
        id: 2,
        user_id: 2,
        user_name: 'Elena Rostova',
        action: 'UPDATE_STOCK',
        module: 'Inventory',
        record_id: '1',
        details: 'Restocked Chronos Caliber 41 (+4 units)',
        created_at: new Date('2024-02-10T14:30:00Z').toISOString(),
      },
    ];

    // 12. Seed Static Pages
    this.pages = [
      {
        id: 1,
        slug: 'about',
        title: 'About LuxeCommerce',
        content: `### The Pursuit of Permanent Value\n\nFounded in 2024, LuxeCommerce operates as an exclusive sanctuary for authentic craftsmanship. In an epoch defined by rapid obsolescence, we curate objects designed to endure across generations.\n\nEvery timepiece, leather duffle, acoustic monitor, and garment featured on LuxeCommerce undergoes rigorous provenance verification. We partner exclusively with heritage European manufactures and visionary boutique artisans who reject compromise.\n\n### Global White-Glove Fulfillment\nOur dedicated concierge teams coordinate discrete, insured international transit directly to your door in over 90 sovereign nations.`,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        slug: 'faq',
        title: 'Frequently Asked Questions',
        content: `### Authentic Provenance\n**Are all items authentic?**\nYes. LuxeCommerce is an authorized direct distributor for every artisan and manufacture represented. Each piece is delivered with its original serialized certificates of origin and warranty books.\n\n### Shipping & Delivery\n**How long does international transit take?**\nDomestic orders arrive within 1–2 business days via FedEx Priority. International white-glove shipments typically arrive within 2–4 business days via DHL Express Luxury Protocol.\n\n### Returns & Exchanges\n**What is your return policy?**\nWe offer a complimentary 30-day return period on unworn items with all original security seals intact.`,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        slug: 'shipping-policy',
        title: 'Shipping & White-Glove Delivery',
        content: `Every LuxeCommerce consignment is secured in discreet, tamper-evident shock-resistant transit packaging. High-value horological and leather pieces travel fully insured under our Lloyd’s of London policy until signature verification at your residence.`,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        slug: 'privacy-policy',
        title: 'Privacy & Discretion Policy',
        content: `We treat client privacy with paramount discretion. LuxeCommerce never monetizes, rents, or distributes client transaction records. Payment card processing is executed under strict PCI-DSS Level 1 compliance via encrypted server tokens.`,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // --- Product Query Methods ---
  getProducts(params: {
    categorySlug?: string;
    brandSlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStockOnly?: boolean;
    onSaleOnly?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.products].filter((p) => p.status === 'published');

    if (params.categorySlug) {
      result = result.filter((p) => p.category_slug === params.categorySlug);
    }
    if (params.brandSlug) {
      result = result.filter((p) => p.brand_slug === params.brandSlug);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.brand_name?.toLowerCase().includes(q)
      );
    }
    if (params.minPrice !== undefined) {
      result = result.filter((p) => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= params.maxPrice!);
    }
    if (params.rating !== undefined) {
      result = result.filter((p) => p.rating >= params.rating!);
    }
    if (params.inStockOnly) {
      result = result.filter((p) => p.stock_quantity > 0);
    }
    if (params.onSaleOnly) {
      result = result.filter((p) => p.is_flash_sale || (p.compare_at_price && p.compare_at_price > p.price));
    }

    // Sorting
    switch (params.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        result.sort((a, b) => {
          const discA = a.compare_at_price ? (a.compare_at_price - a.price) / a.compare_at_price : 0;
          const discB = b.compare_at_price ? (b.compare_at_price - b.price) / b.compare_at_price : 0;
          return discB - discA;
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    const total = result.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const offset = (page - 1) * limit;
    const paginated = result.slice(offset, offset + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  createProduct(data: Partial<Product>): Product {
    const id = this.nextProductId++;
    const cat = this.categories.find((c) => c.id === data.category_id);
    const br = this.brands.find((b) => b.id === data.brand_id);

    const newProduct: Product = {
      id,
      category_id: data.category_id || 1,
      category_name: cat?.name || 'Uncategorized',
      category_slug: cat?.slug || 'uncategorized',
      brand_id: data.brand_id,
      brand_name: br?.name,
      brand_slug: br?.slug,
      title: data.title || 'Untitled Product',
      slug: data.slug || `product-${id}-${Date.now()}`,
      sku: data.sku || `SKU-${id}`,
      barcode: data.barcode,
      short_description: data.short_description || '',
      description: data.description || '',
      specifications: data.specifications || {},
      features: data.features || [],
      price: Number(data.price) || 0,
      compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : undefined,
      cost_price: data.cost_price ? Number(data.cost_price) : undefined,
      is_published: data.is_published ?? true,
      is_featured: data.is_featured ?? false,
      is_flash_sale: data.is_flash_sale ?? false,
      flash_sale_ends_at: data.flash_sale_ends_at,
      status: data.status || 'published',
      stock_quantity: Number(data.stock_quantity) || 0,
      low_stock_threshold: Number(data.low_stock_threshold) || 5,
      rating: 5.0,
      review_count: 0,
      images: data.images?.length
        ? data.images
        : [
            {
              id: id * 10,
              product_id: id,
              image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
              alt_text: data.title || 'Product Image',
              display_order: 1,
              is_primary: true,
            },
          ],
      variants: data.variants?.length ? data.variants : [],
      seo_title: data.seo_title || data.title,
      seo_description: data.seo_description || data.short_description,
      seo_keywords: data.seo_keywords,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  updateProduct(id: number, data: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const cat = data.category_id ? this.categories.find((c) => c.id === data.category_id) : undefined;
    const br = data.brand_id ? this.brands.find((b) => b.id === data.brand_id) : undefined;

    this.products[idx] = {
      ...this.products[idx],
      ...data,
      category_name: cat ? cat.name : this.products[idx].category_name,
      category_slug: cat ? cat.slug : this.products[idx].category_slug,
      brand_name: br ? br.name : this.products[idx].brand_name,
      brand_slug: br ? br.slug : this.products[idx].brand_slug,
      updated_at: new Date().toISOString(),
    };

    return this.products[idx];
  }

  deleteProduct(id: number): boolean {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }

  // --- Stock Adjustment & Inventory Tracking ---
  adjustStock(productId: number, variantId: number | null | undefined, changeAmount: number, reason: string, refId?: string, userName?: string) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return null;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        variant.stock_quantity = Math.max(0, variant.stock_quantity + changeAmount);
      }
    }

    product.stock_quantity = Math.max(0, product.stock_quantity + changeAmount);

    const transaction: InventoryTransaction = {
      id: this.inventoryTransactions.length + 1,
      product_id: productId,
      product_title: product.title,
      variant_id: variantId,
      change_amount: changeAmount,
      new_stock: product.stock_quantity,
      reason,
      reference_id: refId,
      user_name: userName || 'System',
      created_at: new Date().toISOString(),
    };

    this.inventoryTransactions.unshift(transaction);
    return transaction;
  }

  // --- Cart Management ---
  getCart(cartKey: string): Cart {
    let cart = this.carts.get(cartKey);
    if (!cart) {
      cart = {
        id: Math.floor(Math.random() * 100000),
        items: [],
        subtotal: 0,
        discount_amount: 0,
        shipping_amount: 0,
        tax_amount: 0,
        grand_total: 0,
      };
      this.carts.set(cartKey, cart);
    }
    this.recalculateCart(cart);
    return cart;
  }

  addToCart(cartKey: string, productId: number, variantId: number | null | undefined, quantity: number): Cart {
    const cart = this.getCart(cartKey);
    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    const variant = variantId ? product.variants.find((v) => v.id === variantId) : null;
    const availableStock = variant ? variant.stock_quantity : product.stock_quantity;

    const existingIndex = cart.items.findIndex(
      (item) => item.product_id === productId && (!variantId || item.variant_id === variantId)
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        throw new Error(`Insufficient inventory. Only ${availableStock} units available.`);
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      if (quantity > availableStock) {
        throw new Error(`Insufficient inventory. Only ${availableStock} units available.`);
      }
      cart.items.push({
        id: Math.floor(Math.random() * 1000000),
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId || null,
        product,
        variant,
        quantity,
        is_saved_for_later: false,
      });
    }

    this.recalculateCart(cart);
    return cart;
  }

  updateCartItem(cartKey: string, itemId: number, quantity: number): Cart {
    const cart = this.getCart(cartKey);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return cart;

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    } else {
      const availableStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
      if (quantity > availableStock) {
        throw new Error(`Insufficient stock. Maximum available: ${availableStock}`);
      }
      item.quantity = quantity;
    }

    this.recalculateCart(cart);
    return cart;
  }

  removeCartItem(cartKey: string, itemId: number): Cart {
    const cart = this.getCart(cartKey);
    cart.items = cart.items.filter((i) => i.id !== itemId);
    this.recalculateCart(cart);
    return cart;
  }

  applyCoupon(cartKey: string, code: string): { cart: Cart; message: string } {
    const cart = this.getCart(cartKey);
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);

    if (!coupon) {
      throw new Error('Invalid or expired promotional code.');
    }

    if (cart.subtotal < coupon.min_order_amount) {
      throw new Error(`Code ${coupon.code} requires a minimum order of $${coupon.min_order_amount.toFixed(2)}.`);
    }

    cart.coupon_code = coupon.code;
    this.recalculateCart(cart);
    return { cart, message: `Promotional code ${coupon.code} applied successfully!` };
  }

  removeCoupon(cartKey: string): Cart {
    const cart = this.getCart(cartKey);
    cart.coupon_code = null;
    this.recalculateCart(cart);
    return cart;
  }

  clearCart(cartKey: string): Cart {
    const cart = this.getCart(cartKey);
    cart.items = [];
    cart.coupon_code = null;
    this.recalculateCart(cart);
    return cart;
  }

  private recalculateCart(cart: Cart) {
    let subtotal = 0;
    for (const item of cart.items.filter((i) => !i.is_saved_for_later)) {
      const unitPrice = item.product.price + (item.variant ? item.variant.price_modifier : 0);
      subtotal += unitPrice * item.quantity;
    }
    cart.subtotal = Number(subtotal.toFixed(2));

    // Calculate coupon discount
    let discount = 0;
    if (cart.coupon_code) {
      const coupon = this.coupons.find((c) => c.code === cart.coupon_code && c.is_active);
      if (coupon && cart.subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'percentage') {
          discount = (cart.subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else if (coupon.discount_type === 'fixed_amount') {
          discount = Math.min(coupon.discount_value, cart.subtotal);
        }
      }
    }
    cart.discount_amount = Number(discount.toFixed(2));

    // Shipping
    const isFreeShipping = cart.subtotal >= this.settings.free_shipping_threshold || cart.coupon_code === 'FREESHIP';
    cart.shipping_amount = isFreeShipping || cart.subtotal === 0 ? 0 : this.settings.standard_shipping_rate;

    // Tax
    const taxableAmount = Math.max(0, cart.subtotal - cart.discount_amount);
    cart.tax_amount = Number(((taxableAmount * this.settings.tax_rate_percentage) / 100).toFixed(2));

    cart.grand_total = Number((taxableAmount + cart.shipping_amount + cart.tax_amount).toFixed(2));
  }

  // --- Order Creation & Fulfillment ---
  createOrder(orderData: {
    userId?: number | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: any;
    billingAddress: any;
    shippingMethod: string;
    paymentMethod: string;
    items: { productId: number; variantId?: number | null; quantity: number }[];
    couponCode?: string;
    orderNotes?: string;
  }): Order {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Cannot create an order with an empty cart.');
    }

    const orderId = this.nextOrderId++;
    const orderNumber = `LX-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    // Validate inventory & construct order items
    for (const item of orderData.items) {
      const prod = this.getProductById(item.productId);
      if (!prod) throw new Error(`Product #${item.productId} not found.`);

      const variant = item.variantId ? prod.variants.find((v) => v.id === item.variantId) : null;
      const currentStock = variant ? variant.stock_quantity : prod.stock_quantity;

      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.title}". Only ${currentStock} left.`);
      }

      // Deduct inventory
      this.adjustStock(
        prod.id,
        item.variantId,
        -item.quantity,
        'order_placed',
        orderNumber,
        orderData.customerName
      );

      const unitPrice = prod.price + (variant ? variant.price_modifier : 0);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        id: Math.floor(Math.random() * 1000000),
        order_id: orderId,
        product_id: prod.id,
        variant_id: item.variantId || null,
        title: prod.title,
        sku: variant ? variant.sku : prod.sku,
        variant_name: variant ? variant.title : undefined,
        image_url: prod.images[0]?.image_url || '',
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Coupon calculation
    let discount = 0;
    if (orderData.couponCode) {
      const coupon = this.coupons.find((c) => c.code.toUpperCase() === orderData.couponCode?.toUpperCase() && c.is_active);
      if (coupon && subtotal >= coupon.min_order_amount) {
        coupon.usage_count++;
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
        } else if (coupon.discount_type === 'fixed_amount') {
          discount = Math.min(coupon.discount_value, subtotal);
        }
      }
    }

    const isFreeShipping = subtotal >= this.settings.free_shipping_threshold || orderData.couponCode === 'FREESHIP';
    const shippingAmount = isFreeShipping ? 0 : this.settings.standard_shipping_rate;
    const taxable = Math.max(0, subtotal - discount);
    const taxAmount = Number(((taxable * this.settings.tax_rate_percentage) / 100).toFixed(2));
    const grandTotal = Number((taxable + shippingAmount + taxAmount).toFixed(2));

    const initialTimeline: OrderTimeline[] = [
      {
        id: Math.floor(Math.random() * 1000000),
        order_id: orderId,
        status: 'pending',
        message: `Order submitted via ${orderData.paymentMethod}`,
        created_at: new Date().toISOString(),
      },
    ];

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: orderData.userId || null,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      status: 'pending',
      payment_status: orderData.paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
      payment_method: orderData.paymentMethod,
      payment_reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      subtotal,
      discount_amount: discount,
      coupon_code: orderData.couponCode,
      shipping_amount: shippingAmount,
      shipping_method: orderData.shippingMethod || 'White-Glove Courier',
      tax_amount: taxAmount,
      grand_total: grandTotal,
      shipping_address: orderData.shippingAddress,
      billing_address: orderData.billingAddress || orderData.shippingAddress,
      tracking_number: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
      courier_name: 'DHL Express Luxury Protocol',
      estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      order_notes: orderData.orderNotes,
      items: orderItems,
      timeline: initialTimeline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.orders.unshift(order);

    this.addAuditLog(
      orderData.userId || 0,
      orderData.customerName,
      'CREATE_ORDER',
      'Orders',
      orderNumber,
      `Placed order for $${grandTotal.toFixed(2)} with ${orderItems.length} items`
    );

    return order;
  }

  updateOrderStatus(orderId: number, newStatus: OrderStatus, customMessage?: string, userName?: string): Order | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    if (newStatus === 'delivered') {
      order.payment_status = 'paid';
    } else if (newStatus === 'cancelled' || newStatus === 'refunded') {
      order.payment_status = 'refunded';
      // Restock products
      for (const item of order.items) {
        this.adjustStock(
          item.product_id,
          item.variant_id,
          item.quantity,
          `order_${newStatus}`,
          order.order_number,
          userName || 'Admin'
        );
      }
    }

    const msg = customMessage || `Order status transitioned from ${oldStatus} to ${newStatus}`;
    order.timeline.push({
      id: Math.floor(Math.random() * 1000000),
      order_id: orderId,
      status: newStatus,
      message: msg,
      created_at: new Date().toISOString(),
    });

    this.addAuditLog(
      1,
      userName || 'Administrator',
      'UPDATE_ORDER_STATUS',
      'Orders',
      order.order_number,
      `Changed status to ${newStatus}`
    );

    return order;
  }

  // --- Audit Logging ---
  addAuditLog(userId: number, userName: string, action: string, module: string, recordId?: string, details?: string) {
    this.auditLogs.unshift({
      id: this.nextAuditId++,
      user_id: userId,
      user_name: userName,
      action,
      module,
      record_id: recordId,
      details,
      created_at: new Date().toISOString(),
    });
  }

  // --- Analytics Aggregation ---
  getAnalytics(timeframe: 'today' | '7days' | '30days' | 'month' | 'all' = '30days') {
    const totalRevenue = this.orders
      .filter((o) => o.payment_status === 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.grand_total, 0);

    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
    const totalCustomers = this.users.filter((u) => u.role_slug === 'customer').length;
    const lowStockCount = this.products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales over last 7 days chart points
    const salesChart = [
      { date: 'Mon', revenue: 4200, orders: 3 },
      { date: 'Tue', revenue: 6800, orders: 4 },
      { date: 'Wed', revenue: 9500, orders: 5 },
      { date: 'Thu', revenue: 5100, orders: 3 },
      { date: 'Fri', revenue: 14200, orders: 8 },
      { date: 'Sat', revenue: 18400, orders: 11 },
      { date: 'Sun', revenue: 12100, orders: 7 },
    ];

    // Top selling products
    const topProducts = this.products.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      image_url: p.images[0]?.image_url,
      price: p.price,
      salesCount: Math.floor(p.price > 5000 ? 8 : 42),
      revenue: Math.floor(p.price > 5000 ? 8 * p.price : 42 * p.price),
    }));

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      lowStockCount,
      averageOrderValue,
      salesChart,
      topProducts,
      recentOrders: this.orders.slice(0, 6),
    };
  }

  // --- Admin User Management Methods ---
  getAllUsers() {
    const roleNames: Record<number, string> = {
      1: 'Super Administrator',
      2: 'Store Administrator',
      3: 'Store Manager',
      4: 'Registered Customer',
      5: 'Content Editor',
      6: 'Customer Support',
    };
    return this.users.map((u) => {
      const orders = this.orders.filter((o) => o.user_id === u.id);
      return {
        ...u,
        role_name: roleNames[u.role_id] || u.role_slug,
        order_count: orders.length,
        total_spent: orders.reduce((sum, o) => sum + o.grand_total, 0),
      };
    });
  }

  adminCreateUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    role_id: number;
    notes?: string;
    avatar_url?: string;
  }) {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) throw new Error('EMAIL_EXISTS');

    const roleMap: Record<number, any> = {
      1: 'super_admin',
      2: 'admin',
      3: 'manager',
      4: 'customer',
      5: 'editor',
      6: 'support',
    };

    const roleSlug = roleMap[data.role_id] || 'customer';
    const roleNames: Record<number, string> = {
      1: 'Super Administrator',
      2: 'Store Administrator',
      3: 'Store Manager',
      4: 'Registered Customer',
      5: 'Content Editor',
      6: 'Customer Support',
    };

    const newUser = {
      id: this.nextUserId++,
      role_id: Number(data.role_id),
      role_slug: roleSlug,
      role_name: roleNames[data.role_id] || roleSlug,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || undefined,
      avatar_url: data.avatar_url || undefined,
      is_active: true,
      notes: data.notes?.trim() || undefined,
      created_at: new Date().toISOString(),
      order_count: 0,
      total_spent: 0,
    };

    this.users.unshift(newUser);
    return newUser;
  }

  adminUpdateUser(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role_id?: number;
      notes?: string;
      is_active?: boolean;
      avatar_url?: string;
    }
  ) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;

    if (data.email) {
      const cleanEmail = data.email.trim().toLowerCase();
      const existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail && u.id !== id);
      if (existing) throw new Error('EMAIL_EXISTS');
      user.email = cleanEmail;
    }

    if (data.firstName !== undefined) user.first_name = data.firstName.trim();
    if (data.lastName !== undefined) user.last_name = data.lastName.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.notes !== undefined) user.notes = data.notes.trim();
    if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url;
    if (data.is_active !== undefined) user.is_active = Boolean(data.is_active);

    if (data.role_id !== undefined) {
      user.role_id = Number(data.role_id);
      const roleMap: Record<number, any> = {
        1: 'super_admin',
        2: 'admin',
        3: 'manager',
        4: 'customer',
        5: 'editor',
        6: 'support',
      };
      user.role_slug = roleMap[data.role_id] || user.role_slug;
      const roleNames: Record<number, string> = {
        1: 'Super Administrator',
        2: 'Store Administrator',
        3: 'Store Manager',
        4: 'Registered Customer',
        5: 'Content Editor',
        6: 'Customer Support',
      };
      user.role_name = roleNames[data.role_id] || user.role_slug;
    }

    const orders = this.orders.filter((o) => o.user_id === user.id);
    return {
      ...user,
      order_count: orders.length,
      total_spent: orders.reduce((sum, o) => sum + o.grand_total, 0),
    };
  }

  adminDeleteUser(id: number): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < initialLen;
  }

  toggleUserStatus(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.is_active = !user.is_active;
    return user;
  }

  getRoles() {
    return [
      { id: 1, slug: 'super_admin', name: 'Super Administrator', description: 'Full unconstrained system access' },
      { id: 2, slug: 'admin', name: 'Store Administrator', description: 'Manage products, orders, customers, and CMS' },
      { id: 3, slug: 'manager', name: 'Store Manager', description: 'Manage inventory, catalog and fulfillment' },
      { id: 4, slug: 'customer', name: 'Registered Customer', description: 'Standard shopping account' },
      { id: 5, slug: 'editor', name: 'Content Editor', description: 'Manage blogs, banners, and static pages' },
      { id: 6, slug: 'support', name: 'Customer Support', description: 'View orders and assist customer accounts' },
    ];
  }
}

export const db = new DatabaseStore();
