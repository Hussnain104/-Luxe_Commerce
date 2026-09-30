import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest, generateToken, requireAuth, requireRole } from './auth.ts';
import { db } from './db.ts';
import { mysqlDb } from './mysqlDb.ts';
import { isDbConnected, pool } from './mysql.ts';
import { OrderStatus } from '../src/types.ts';

export const router = express.Router();

// ==========================================
// 0. SYSTEM & DATABASE HEALTH
// ==========================================

router.get('/db/status', async (req: Request, res: Response) => {
  const connected = isDbConnected();
  let tablesCount = 0;
  let productsCount = 0;

  if (connected) {
    try {
      const [t]: any = await pool.query('SHOW TABLES');
      tablesCount = t.length;
      const [p]: any = await pool.query('SELECT COUNT(*) as cnt FROM products');
      productsCount = p[0]?.cnt || 0;
    } catch {
      // ignore
    }
  }

  res.json({
    success: true,
    data: {
      isDbConnected: connected,
      databaseName: process.env.DB_NAME || 'luxe_ecommerce',
      dbHost: process.env.DB_HOST || 'localhost',
      dbPort: process.env.DB_PORT || 3306,
      tablesCount,
      productsCount,
      engine: connected ? 'MySQL 8.0+ / MariaDB (Active Database Persistence)' : 'In-Memory Failover Store',
    },
  });
});

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  let user: any = null;

  if (isDbConnected()) {
    try {
      const dbUser = await mysqlDb.findUserByEmail(email);
      if (dbUser && dbUser.is_active) {
        const isMatch = dbUser.password_hash ? bcrypt.compareSync(password, dbUser.password_hash) : true;
        if (isMatch) {
          user = dbUser;
        }
      }
    } catch (err) {
      console.warn('[Auth] MySQL error during login, falling back to memory store:', err);
    }
  }

  // Memory fallback
  if (!user) {
    const memoryUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (memoryUser && memoryUser.is_active) {
      user = memoryUser;
    }
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_slug: user.role_slug,
        avatar_url: user.avatar_url,
      },
    },
  });
});

router.post('/auth/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All required registration fields must be filled.' });
  }

  if (isDbConnected()) {
    try {
      const existing = await mysqlDb.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const newUser = await mysqlDb.createUser({ firstName, lastName, email, password, phone });
      db.users.push(newUser);
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Account created and saved in MySQL database',
        data: { token, user: newUser },
      });
    } catch (err: any) {
      console.warn('[Auth] MySQL error during registration, falling back to memory store:', err);
    }
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser = {
    id: db.users.length + 1,
    role_id: 4,
    role_slug: 'customer' as const,
    first_name: firstName,
    last_name: lastName,
    email: email.toLowerCase(),
    phone,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { token, user: newUser },
  });
});

// Quick demo role switcher for interactive testing
router.post('/auth/demo-switch', async (req: Request, res: Response) => {
  const { role } = req.body; // 'super_admin' | 'manager' | 'customer'

  let user: any = null;
  if (isDbConnected()) {
    try {
      const [rows]: any = await pool.query(
        `SELECT u.*, r.slug as role_slug
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE r.slug = ? AND u.deleted_at IS NULL LIMIT 1`,
        [role]
      );
      if (rows.length > 0) user = rows[0];
    } catch {
      // ignore
    }
  }

  if (!user) {
    user = db.users.find((u) => u.role_slug === role) || db.users[0];
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: `Switched to demo account: ${user.first_name} (${user.role_slug})`,
    data: { token, user },
  });
});

router.get('/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ success: true, data: { user: null } });
  }
  res.json({ success: true, data: { user: req.user } });
});

// ==========================================
// 2. PRODUCT CATALOG & PUBLIC STORE
// ==========================================

router.get('/products', async (req: Request, res: Response) => {
  const {
    category,
    brand,
    search,
    minPrice,
    maxPrice,
    rating,
    inStock,
    onSale,
    sort,
    page,
    limit,
  } = req.query;

  if (isDbConnected()) {
    try {
      const result = await mysqlDb.getProducts({
        category: category ? String(category) : undefined,
        brand: brand ? String(brand) : undefined,
        search: search ? String(search) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock === 'true',
        sale: onSale === 'true',
        sort: sort ? String(sort) : 'featured',
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      });
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[MySQL] Error querying products, falling back to memory store:', err);
    }
  }

  const result = db.getProducts({
    categorySlug: category ? String(category) : undefined,
    brandSlug: brand ? String(brand) : undefined,
    search: search ? String(search) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    rating: rating ? Number(rating) : undefined,
    inStockOnly: inStock === 'true',
    onSaleOnly: onSale === 'true',
    sort: sort ? String(sort) : 'featured',
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12,
  });

  res.json({ success: true, data: result });
});

router.get('/products/search/suggestions', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase().trim();

  if (isDbConnected()) {
    try {
      const [prods]: any = await pool.query(
        `SELECT id, title, slug, price
         FROM products
         WHERE deleted_at IS NULL AND is_published = 1 AND (title LIKE ? OR short_description LIKE ?)
         LIMIT 5`,
        [`%${q}%`, `%${q}%`]
      );
      const [images]: any = await pool.query(
        'SELECT product_id, image_url FROM product_images WHERE product_id IN (?) AND (is_primary = 1 OR display_order = 0)',
        [prods.length > 0 ? prods.map((p: any) => p.id) : [0]]
      );
      const imgMap: Record<number, string> = {};
      for (const im of images) imgMap[im.product_id] = im.image_url;

      const [cats]: any = await pool.query('SELECT name, slug FROM categories WHERE is_active = 1 AND name LIKE ? LIMIT 3', [`%${q}%`]);
      const [brands]: any = await pool.query('SELECT name, slug FROM brands WHERE is_active = 1 AND name LIKE ? LIMIT 3', [`%${q}%`]);

      return res.json({
        success: true,
        data: {
          products: prods.map((p: any) => ({ ...p, image: imgMap[p.id] })),
          categories: cats,
          brands: brands,
          popular: ['Tourbillon', 'Weekender', 'Planar Headphones', 'Cashmere', 'Marble Lamp'],
        },
      });
    } catch {
      // fallback
    }
  }

  if (!q) {
    return res.json({
      success: true,
      data: {
        products: db.products.slice(0, 4).map((p) => ({ id: p.id, title: p.title, slug: p.slug, price: p.price, image: p.images[0]?.image_url })),
        categories: db.categories.slice(0, 3).map((c) => ({ name: c.name, slug: c.slug })),
        brands: db.brands.slice(0, 3).map((b) => ({ name: b.name, slug: b.slug })),
        popular: ['Tourbillon', 'Weekender', 'Planar Headphones', 'Cashmere'],
      },
    });
  }

  const matchingProducts = db.products
    .filter((p) => p.title.toLowerCase().includes(q) || p.short_description.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug, price: p.price, image: p.images[0]?.image_url, category: p.category_name }));

  const matchingCategories = db.categories
    .filter((c) => c.name.toLowerCase().includes(q))
    .map((c) => ({ name: c.name, slug: c.slug }));

  const matchingBrands = db.brands
    .filter((b) => b.name.toLowerCase().includes(q))
    .map((b) => ({ name: b.name, slug: b.slug }));

  res.json({
    success: true,
    data: {
      products: matchingProducts,
      categories: matchingCategories,
      brands: matchingBrands,
      popular: ['Tourbillon', 'Weekender', 'Planar Headphones', 'Cashmere'],
    },
  });
});

router.get('/products/:slug', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const product = await mysqlDb.getProductBySlug(req.params.slug);
      if (product) {
        const relatedRes = await mysqlDb.getProducts({ category: String(product.category_id), limit: 4 });
        const related = relatedRes.products.filter((p) => p.id !== product.id).slice(0, 4);
        const reviews = await mysqlDb.getReviews(product.id);

        return res.json({
          success: true,
          data: {
            product,
            related,
            reviews,
          },
        });
      }
    } catch (err) {
      console.error('[MySQL] Error getting product by slug:', err);
    }
  }

  const product = db.getProductBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const related = db.products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const reviews = db.reviews.filter((r) => r.product_id === product.id && r.is_approved);

  res.json({
    success: true,
    data: {
      product,
      related,
      reviews,
    },
  });
});

// Categories & Brands
router.get('/categories', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const cats = await mysqlDb.getCategories();
      const allProds = await mysqlDb.getProducts({ limit: 1000 });
      const catsWithCount = cats.map((c) => ({
        ...c,
        item_count: allProds.products.filter((p) => p.category_id === c.id).length,
      }));
      return res.json({ success: true, data: catsWithCount });
    } catch (err) {
      console.error('[MySQL] Error fetching categories:', err);
    }
  }

  const catsWithCount = db.categories.map((c) => ({
    ...c,
    item_count: db.products.filter((p) => p.category_id === c.id).length,
  }));
  res.json({ success: true, data: catsWithCount });
});

router.get('/brands', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const brands = await mysqlDb.getBrands();
      return res.json({ success: true, data: brands });
    } catch (err) {
      console.error('[MySQL] Error fetching brands:', err);
    }
  }

  res.json({ success: true, data: db.brands });
});

// ==========================================
// 3. SHOPPING CART
// ==========================================

function getCartIdentifier(req: AuthRequest): string {
  if (req.user) return `user_${req.user.id}`;
  const sessionId = req.headers['x-session-id'] as string;
  return sessionId || 'guest_default';
}

router.get('/cart', (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const cart = db.getCart(cartKey);
  res.json({ success: true, data: cart });
});

router.post('/cart/items', (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const { productId, variantId, quantity } = req.body;

  try {
    const cart = db.addToCart(cartKey, Number(productId), variantId ? Number(variantId) : null, Number(quantity) || 1);
    res.json({ success: true, message: 'Added to cart', data: cart });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/cart/items/:id', (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const itemId = Number(req.params.id);
  const { quantity } = req.body;

  try {
    const cart = db.updateCartItem(cartKey, itemId, Number(quantity));
    res.json({ success: true, message: 'Cart updated', data: cart });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/cart/items/:id', (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const itemId = Number(req.params.id);
  const cart = db.removeCartItem(cartKey, itemId);
  res.json({ success: true, message: 'Item removed', data: cart });
});

router.post('/cart/coupon', async (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const { code } = req.body;

  try {
    const result = db.applyCoupon(cartKey, String(code));
    res.json({ success: true, message: result.message, data: result.cart });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/cart/coupon', (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const cart = db.removeCoupon(cartKey);
  res.json({ success: true, message: 'Coupon removed', data: cart });
});

router.delete('/cart/clear', (req: AuthRequest, res: Response) => {
  const cartKey = getCartIdentifier(req);
  const cart = db.clearCart(cartKey);
  res.json({ success: true, message: 'Cart cleared', data: cart });
});

// ==========================================
// 4. WISHLIST
// ==========================================

router.get('/wishlist', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || 3;
  const items = db.wishlists
    .filter((w) => w.user_id === userId)
    .map((w) => {
      const prod = db.getProductById(w.product_id);
      return { ...w, product: prod! };
    })
    .filter((w) => Boolean(w.product));

  res.json({ success: true, data: items });
});

router.post('/wishlist/toggle', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || 3;
  const { productId } = req.body;
  const prodId = Number(productId);

  const idx = db.wishlists.findIndex((w) => w.user_id === userId && w.product_id === prodId);
  let isSaved = false;

  if (idx > -1) {
    db.wishlists.splice(idx, 1);
    isSaved = false;
  } else {
    const prod = db.getProductById(prodId);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
    db.wishlists.push({
      id: db.wishlists.length + 1,
      user_id: userId,
      product_id: prodId,
      product: prod,
      created_at: new Date().toISOString(),
    });
    isSaved = true;
  }

  res.json({
    success: true,
    message: isSaved ? 'Added to wishlist' : 'Removed from wishlist',
    data: { isSaved, count: db.wishlists.filter((w) => w.user_id === userId).length },
  });
});

// ==========================================
// 5. CHECKOUT & ORDERS
// ==========================================

router.post('/orders', async (req: AuthRequest, res: Response) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    billingAddress,
    shippingMethod,
    paymentMethod,
    items,
    couponCode,
    orderNotes,
    shippingAmount,
    discountAmount,
  } = req.body;

  if (isDbConnected()) {
    try {
      const order = await mysqlDb.createOrder({
        userId: req.user?.id || undefined,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        billingAddress,
        shippingMethod: shippingMethod || 'Standard Ground',
        shippingAmount: Number(shippingAmount) || 0,
        paymentMethod: paymentMethod || 'Card',
        couponCode,
        discountAmount: Number(discountAmount) || 0,
        items: items.map((it: any) => ({
          productId: Number(it.productId || it.product_id),
          variantId: it.variantId || it.variant_id ? Number(it.variantId || it.variant_id) : undefined,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price || it.unit_price) || 0,
          title: it.title,
          sku: it.sku || 'SKU-ITEM',
          variantName: it.variantName || it.variant_name,
          imageUrl: it.imageUrl || it.image_url,
        })),
      });

      // Clear user cart upon successful placement
      const cartKey = getCartIdentifier(req);
      db.clearCart(cartKey);

      return res.status(201).json({
        success: true,
        message: 'Order created and persisted to database successfully',
        data: order,
      });
    } catch (err: any) {
      console.error('[MySQL] Error creating order, falling back to memory store:', err);
    }
  }

  try {
    const order = db.createOrder({
      userId: req.user?.id || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      items,
      couponCode,
      orderNotes,
    });

    const cartKey = getCartIdentifier(req);
    db.clearCart(cartKey);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/orders/my-orders', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || 3;

  if (isDbConnected()) {
    try {
      const userOrders = await mysqlDb.getOrders(userId);
      return res.json({ success: true, data: userOrders });
    } catch (err) {
      console.error('[MySQL] Error fetching user orders:', err);
    }
  }

  const userOrders = db.orders.filter((o) => o.user_id === userId);
  res.json({ success: true, data: userOrders });
});

router.get('/orders/:orderNumber', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const order = await mysqlDb.getOrderByNumber(req.params.orderNumber);
      if (order) return res.json({ success: true, data: order });
    } catch (err) {
      console.error('[MySQL] Error looking up order:', err);
    }
  }

  const order = db.orders.find((o) => o.order_number === req.params.orderNumber || String(o.id) === req.params.orderNumber);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  res.json({ success: true, data: order });
});

router.post('/orders/:orderNumber/cancel', async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const order = await mysqlDb.getOrderByNumber(req.params.orderNumber);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      if (order.status !== 'pending' && order.status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'This order has already been processed and cannot be cancelled automatically.' });
      }

      const updated = await mysqlDb.updateOrderStatus(order.id, 'cancelled', 'Order cancelled at customer request');
      return res.json({ success: true, message: 'Order cancelled successfully', data: updated });
    } catch (err) {
      console.error('[MySQL] Error cancelling order:', err);
    }
  }

  const order = db.orders.find((o) => o.order_number === req.params.orderNumber);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: 'This order has already been processed and cannot be cancelled automatically.' });
  }

  const updated = db.updateOrderStatus(order.id, 'cancelled', 'Order cancelled at customer request', req.user?.first_name || 'Customer');
  res.json({ success: true, message: 'Order cancelled successfully', data: updated });
});

// ==========================================
// 6. REVIEWS
// ==========================================

router.post('/reviews', async (req: AuthRequest, res: Response) => {
  const { productId, rating, title, comment, customerName } = req.body;

  if (isDbConnected()) {
    try {
      const newReview = await mysqlDb.createReview({
        productId: Number(productId),
        userId: req.user?.id,
        customerName: customerName || (req.user ? `${req.user.first_name} ${req.user.last_name}` : 'Verified Client'),
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        title: title || 'Exceptional craftsmanship',
        comment,
      });
      return res.status(201).json({ success: true, message: 'Review submitted and saved to database', data: newReview });
    } catch (err) {
      console.error('[MySQL] Error creating review:', err);
    }
  }

  const prod = db.getProductById(Number(productId));
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });

  const newReview = {
    id: db.reviews.length + 1,
    product_id: prod.id,
    user_id: req.user?.id,
    customer_name: customerName || (req.user ? `${req.user.first_name} ${req.user.last_name}` : 'Verified Client'),
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    title,
    comment,
    is_verified_purchase: true,
    is_approved: true,
    helpful_count: 0,
    created_at: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  const prodReviews = db.reviews.filter((r) => r.product_id === prod.id && r.is_approved);
  const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
  prod.rating = Number(avg.toFixed(2));
  prod.review_count = prodReviews.length;

  res.status(201).json({ success: true, message: 'Review submitted successfully', data: newReview });
});

// ==========================================
// 7. CMS CONTENT, BLOGS, SETTINGS
// ==========================================

router.get('/cms/banners', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const banners = await mysqlDb.getBanners();
      return res.json({ success: true, data: banners });
    } catch (err) {
      console.error('[MySQL] Error getting banners:', err);
    }
  }
  res.json({ success: true, data: db.banners.filter((b) => b.is_active) });
});

router.get('/cms/blogs', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const blogs = await mysqlDb.getBlogs();
      return res.json({ success: true, data: blogs });
    } catch (err) {
      console.error('[MySQL] Error getting blogs:', err);
    }
  }
  res.json({ success: true, data: db.blogs.filter((b) => b.is_published) });
});

router.get('/cms/blogs/:slug', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const blog = await mysqlDb.getBlogBySlug(req.params.slug);
      if (blog) return res.json({ success: true, data: blog });
    } catch (err) {
      console.error('[MySQL] Error getting blog:', err);
    }
  }
  const blog = db.blogs.find((b) => b.slug === req.params.slug);
  if (!blog) return res.status(404).json({ success: false, message: 'Article not found.' });
  res.json({ success: true, data: blog });
});

router.get('/cms/pages/:slug', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const page = await mysqlDb.getPageBySlug(req.params.slug);
      if (page) return res.json({ success: true, data: page });
    } catch (err) {
      console.error('[MySQL] Error getting page:', err);
    }
  }
  const page = db.pages.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
  res.json({ success: true, data: page });
});

router.get('/settings', async (req: Request, res: Response) => {
  if (isDbConnected()) {
    try {
      const settings = await mysqlDb.getSettings();
      return res.json({ success: true, data: settings });
    } catch (err) {
      console.error('[MySQL] Error getting settings:', err);
    }
  }
  res.json({ success: true, data: db.settings });
});

// ==========================================
// 8. ADMIN CMS ENDPOINTS (Protected with RBAC)
// ==========================================

// Dashboard analytics
router.get('/admin/analytics', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const analytics = await mysqlDb.getAnalytics();
      return res.json({ success: true, data: analytics });
    } catch (err) {
      console.error('[MySQL] Error getting analytics:', err);
    }
  }
  const timeframe = (req.query.timeframe as any) || '30days';
  const analytics = db.getAnalytics(timeframe);
  res.json({ success: true, data: analytics });
});

// Product CRUD
router.get('/admin/products', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const result = await mysqlDb.getProducts({ limit: 1000 });
      return res.json({ success: true, data: result.products });
    } catch (err) {
      console.error('[MySQL] Error getting admin products:', err);
    }
  }
  res.json({ success: true, data: db.products });
});

router.post('/admin/products', requireRole(['super_admin', 'admin', 'manager']), (req: AuthRequest, res: Response) => {
  try {
    const product = db.createProduct(req.body);
    db.addAuditLog(req.user!.id, req.user!.first_name, 'CREATE_PRODUCT', 'Products', String(product.id), `Added product: ${product.title}`);
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/admin/products/:id', requireRole(['super_admin', 'admin', 'manager']), (req: AuthRequest, res: Response) => {
  const updated = db.updateProduct(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });
  db.addAuditLog(req.user!.id, req.user!.first_name, 'UPDATE_PRODUCT', 'Products', String(updated.id), `Updated: ${updated.title}`);
  res.json({ success: true, message: 'Product updated successfully', data: updated });
});

router.delete('/admin/products/:id', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const prodId = Number(req.params.id);
  const deleted = db.deleteProduct(prodId);
  if (!deleted) return res.status(404).json({ success: false, message: 'Product not found.' });
  db.addAuditLog(req.user!.id, req.user!.first_name, 'DELETE_PRODUCT', 'Products', String(prodId), `Deleted product #${prodId}`);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Inventory adjustments
router.get('/admin/inventory', requireRole(['super_admin', 'admin', 'manager']), (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      transactions: db.inventoryTransactions,
      lowStockProducts: db.products.filter((p) => p.stock_quantity <= p.low_stock_threshold),
    },
  });
});

router.post('/admin/inventory/adjust', requireRole(['super_admin', 'admin', 'manager']), (req: AuthRequest, res: Response) => {
  const { productId, variantId, changeAmount, reason, referenceId } = req.body;
  const txn = db.adjustStock(
    Number(productId),
    variantId ? Number(variantId) : null,
    Number(changeAmount),
    reason || 'Manual Adjustment',
    referenceId,
    req.user!.first_name
  );

  if (!txn) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, message: 'Inventory adjusted successfully', data: txn });
});

// Orders management
router.get('/admin/orders', requireRole(['super_admin', 'admin', 'manager', 'support']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const orders = await mysqlDb.getOrders();
      return res.json({ success: true, data: orders });
    } catch (err) {
      console.error('[MySQL] Error getting admin orders:', err);
    }
  }
  res.json({ success: true, data: db.orders });
});

router.put('/admin/orders/:id/status', requireRole(['super_admin', 'admin', 'manager', 'support']), async (req: AuthRequest, res: Response) => {
  const { status, message } = req.body;

  if (isDbConnected()) {
    try {
      const updated = await mysqlDb.updateOrderStatus(Number(req.params.id), status as OrderStatus, message);
      if (updated) {
        return res.json({ success: true, message: 'Order status updated in database', data: updated });
      }
    } catch (err) {
      console.error('[MySQL] Error updating order status:', err);
    }
  }

  const updated = db.updateOrderStatus(Number(req.params.id), status as OrderStatus, message, req.user!.first_name);
  if (!updated) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true, message: 'Order status updated', data: updated });
});

// Categories & Brands CMS
router.post('/admin/categories', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const newCat = {
    id: db.categories.length + 1,
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
    description: req.body.description,
    image_url: req.body.image_url || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    banner_url: req.body.banner_url,
    is_featured: req.body.is_featured ?? true,
    is_active: true,
    display_order: db.categories.length + 1,
  };
  db.categories.push(newCat);
  res.status(201).json({ success: true, message: 'Category created', data: newCat });
});

router.delete('/admin/categories/:id', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  db.categories = db.categories.filter((c) => c.id !== id);
  res.json({ success: true, message: 'Category deleted' });
});

// Coupons CMS
router.get('/admin/coupons', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const coupons = await mysqlDb.getCoupons();
      return res.json({ success: true, data: coupons });
    } catch (err) {
      console.error('[MySQL] Error getting coupons:', err);
    }
  }
  res.json({ success: true, data: db.coupons });
});

router.post('/admin/coupons', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const newCoupon = {
    id: db.coupons.length + 1,
    code: req.body.code.toUpperCase(),
    discount_type: req.body.discount_type,
    discount_value: Number(req.body.discount_value),
    min_order_amount: Number(req.body.min_order_amount) || 0,
    max_discount: req.body.max_discount ? Number(req.body.max_discount) : undefined,
    usage_limit: req.body.usage_limit ? Number(req.body.usage_limit) : undefined,
    usage_count: 0,
    is_active: req.body.is_active ?? true,
  };
  db.coupons.push(newCoupon);
  res.status(201).json({ success: true, message: 'Coupon created', data: newCoupon });
});

router.delete('/admin/coupons/:id', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  db.coupons = db.coupons.filter((c) => c.id !== id);
  res.json({ success: true, message: 'Coupon removed' });
});

// ==========================================
// USER MANAGEMENT (Admin CRUD)
// ==========================================

// GET all users (with order stats)
router.get('/admin/users', requireRole(['super_admin', 'admin', 'support']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const users = await mysqlDb.getAllUsers();
      return res.json({ success: true, data: users });
    } catch (err) {
      console.error('[MySQL] Error getting users:', err);
    }
  }
  // fallback: in-memory
  const customers = db.users.map((u) => {
    const orders = db.orders.filter((o) => o.user_id === u.id);
    return { ...u, order_count: orders.length, total_spent: orders.reduce((s, o) => s + o.grand_total, 0) };
  });
  res.json({ success: true, data: customers });
});

// GET roles list
router.get('/admin/roles', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const roles = await mysqlDb.getRoles();
      return res.json({ success: true, data: roles });
    } catch (err) {
      console.error('[MySQL] Error getting roles:', err);
    }
  }
  const roles = [
    { id: 1, slug: 'super_admin', name: 'Super Administrator' },
    { id: 2, slug: 'admin',       name: 'Store Administrator' },
    { id: 3, slug: 'manager',     name: 'Store Manager' },
    { id: 4, slug: 'customer',    name: 'Registered Customer' },
    { id: 5, slug: 'editor',      name: 'Content Editor' },
    { id: 6, slug: 'support',     name: 'Customer Support' },
  ];
  res.json({ success: true, data: roles });
});

// POST create new user (any role) — super_admin/admin only
router.post('/admin/users', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, password, phone, role_id, notes, avatar_url } = req.body;
  if (!firstName || !lastName || !email || !password || !role_id) {
    return res.status(400).json({ success: false, message: 'Required: firstName, lastName, email, password, role_id' });
  }

  // Prevent non-super-admin from assigning super_admin role
  if (req.user!.role_slug !== 'super_admin' && Number(role_id) === 1) {
    return res.status(403).json({ success: false, message: 'Only Super Admin can assign the Super Admin role.' });
  }

  if (isDbConnected()) {
    try {
      const newUser = await mysqlDb.adminCreateUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        role_id: Number(role_id),
        notes,
        avatar_url,
      });

      const auditMsg = `Created user ${email} (Role: ${newUser.role_name || newUser.role_slug})`;
      await mysqlDb.addAuditLog(req.user!.id, `${req.user!.first_name} ${req.user!.last_name}`, 'CREATE_USER', 'Users', String(newUser.id), auditMsg);
      db.addAuditLog(req.user!.id, req.user!.first_name, 'CREATE_USER', 'Users', String(newUser.id), auditMsg);

      return res.status(201).json({ success: true, message: `User ${email} created successfully`, data: newUser });
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
      }
      console.error('[MySQL] Error creating user:', err);
      return res.status(500).json({ success: false, message: 'Database error while creating user.' });
    }
  }

  // Fallback memory store
  try {
    const newUser = db.adminCreateUser({
      firstName,
      lastName,
      email,
      password,
      phone,
      role_id: Number(role_id),
      notes,
      avatar_url,
    });
    db.addAuditLog(req.user!.id, req.user!.first_name, 'CREATE_USER', 'Users', String(newUser.id), `Created user ${email}`);
    return res.status(201).json({ success: true, message: `User ${email} created successfully`, data: newUser });
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update user details
router.put('/admin/users/:id', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { firstName, lastName, email, phone, role_id, notes, password, is_active, avatar_url } = req.body;

  // Prevent non-super-admin from assigning super_admin role
  if (req.user!.role_slug !== 'super_admin' && Number(role_id) === 1) {
    return res.status(403).json({ success: false, message: 'Only Super Admin can assign the Super Admin role.' });
  }

  if (isDbConnected()) {
    try {
      // Check target user's current role if requester is not super_admin
      if (req.user!.role_slug !== 'super_admin') {
        const [target]: any = await pool.query('SELECT role_id FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        if (target.length > 0 && target[0].role_id === 1) {
          return res.status(403).json({ success: false, message: 'Only Super Admin can modify another Super Admin account.' });
        }
      }

      const updated = await mysqlDb.adminUpdateUser(id, {
        firstName,
        lastName,
        email,
        phone,
        role_id: role_id ? Number(role_id) : undefined,
        notes,
        password,
        avatar_url,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined,
      });

      if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });

      const auditMsg = `Updated user #${id} (${updated.email})`;
      await mysqlDb.addAuditLog(req.user!.id, `${req.user!.first_name} ${req.user!.last_name}`, 'UPDATE_USER', 'Users', String(id), auditMsg);
      db.addAuditLog(req.user!.id, req.user!.first_name, 'UPDATE_USER', 'Users', String(id), auditMsg);

      return res.json({ success: true, message: 'User updated successfully', data: updated });
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
      }
      console.error('[MySQL] Error updating user:', err);
      return res.status(500).json({ success: false, message: 'Database error while updating user.' });
    }
  }

  // Fallback memory store
  try {
    const updated = db.adminUpdateUser(id, {
      firstName,
      lastName,
      email,
      phone,
      role_id: role_id ? Number(role_id) : undefined,
      notes,
      avatar_url,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
    db.addAuditLog(req.user!.id, req.user!.first_name, 'UPDATE_USER', 'Users', String(id), `Updated user #${id}`);
    return res.json({ success: true, message: 'User updated successfully', data: updated });
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH toggle active/inactive status
router.patch('/admin/users/:id/toggle-status', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
  }

  if (isDbConnected()) {
    try {
      const [rows]: any = await pool.query('SELECT is_active, role_id, email FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
      if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });

      if (rows[0].role_id === 1 && req.user!.role_slug !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only Super Admin can change Super Admin status.' });
      }

      const newStatus = !rows[0].is_active;
      const updated = await mysqlDb.adminUpdateUser(id, { is_active: newStatus });

      const auditMsg = `User #${id} (${rows[0].email}) set to ${newStatus ? 'active' : 'suspended'}`;
      await mysqlDb.addAuditLog(req.user!.id, `${req.user!.first_name} ${req.user!.last_name}`, 'TOGGLE_STATUS', 'Users', String(id), auditMsg);
      db.addAuditLog(req.user!.id, req.user!.first_name, 'TOGGLE_STATUS', 'Users', String(id), auditMsg);

      return res.json({ success: true, message: `User account ${newStatus ? 'activated' : 'suspended'} successfully`, data: updated });
    } catch (err) {
      console.error('[MySQL] Error toggling user status:', err);
      return res.status(500).json({ success: false, message: 'Database error toggling user status.' });
    }
  }

  // Fallback
  const updated = db.toggleUserStatus(id);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  db.addAuditLog(req.user!.id, req.user!.first_name, 'TOGGLE_STATUS', 'Users', String(id), `Toggled user #${id}`);
  return res.json({ success: true, message: `User account status updated`, data: updated });
});

// DELETE user (soft delete) — Super Admin only
router.delete('/admin/users/:id', requireRole(['super_admin']), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }

  if (isDbConnected()) {
    try {
      const [targets]: any = await pool.query('SELECT id, role_id, email FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
      if (!targets.length) return res.status(404).json({ success: false, message: 'User not found or already deleted.' });

      // If target is super_admin, verify there is at least one other active super_admin
      if (targets[0].role_id === 1) {
        const [superAdmins]: any = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE role_id = 1 AND deleted_at IS NULL AND is_active = 1');
        if ((superAdmins[0]?.cnt || 0) <= 1) {
          return res.status(400).json({ success: false, message: 'Cannot delete the only remaining active Super Administrator.' });
        }
      }

      const deleted = await mysqlDb.adminDeleteUser(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'User not found.' });

      const auditMsg = `Deleted user #${id} (${targets[0].email})`;
      await mysqlDb.addAuditLog(req.user!.id, `${req.user!.first_name} ${req.user!.last_name}`, 'DELETE_USER', 'Users', String(id), auditMsg);
      db.addAuditLog(req.user!.id, req.user!.first_name, 'DELETE_USER', 'Users', String(id), auditMsg);

      return res.json({ success: true, message: `User #${id} has been removed successfully.` });
    } catch (err) {
      console.error('[MySQL] Error deleting user:', err);
      return res.status(500).json({ success: false, message: 'Database error while deleting user.' });
    }
  }

  // Fallback
  const deleted = db.adminDeleteUser(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'User not found.' });
  db.addAuditLog(req.user!.id, req.user!.first_name, 'DELETE_USER', 'Users', String(id), `Deleted user #${id}`);
  return res.json({ success: true, message: 'User deleted successfully' });
});

// Legacy alias kept for backward compat
router.get('/admin/customers', requireRole(['super_admin', 'admin', 'support']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const users = await mysqlDb.getAllUsers();
      return res.json({ success: true, data: users });
    } catch (err) { /* fall through */ }
  }
  const customers = db.getAllUsers();
  res.json({ success: true, data: customers });
});


// Reviews moderation
router.get('/admin/reviews', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const reviews = await mysqlDb.getReviews();
      return res.json({ success: true, data: reviews });
    } catch (err) {
      console.error('[MySQL] Error getting reviews:', err);
    }
  }
  res.json({ success: true, data: db.reviews });
});

router.put('/admin/reviews/:id/approve', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const review = db.reviews.find((r) => r.id === Number(req.params.id));
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  review.is_approved = !review.is_approved;
  res.json({ success: true, message: `Review ${review.is_approved ? 'approved' : 'hidden'}`, data: review });
});

router.delete('/admin/reviews/:id', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  db.reviews = db.reviews.filter((r) => r.id !== id);
  res.json({ success: true, message: 'Review deleted' });
});

// Media library
router.get('/admin/media', requireRole(['super_admin', 'admin', 'editor']), (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: db.media });
});

router.post('/admin/media', requireRole(['super_admin', 'admin', 'editor']), (req: AuthRequest, res: Response) => {
  const { filename, fileUrl, mimeType, altText } = req.body;
  const newItem = {
    id: db.media.length + 1,
    filename: filename || 'upload.jpg',
    file_url: fileUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    mime_type: mimeType || 'image/jpeg',
    file_size_bytes: 350000,
    alt_text: altText || 'Media Asset',
    created_at: new Date().toISOString(),
  };
  db.media.unshift(newItem);
  res.status(201).json({ success: true, message: 'Media uploaded', data: newItem });
});

// Audit logs
router.get('/admin/audit-logs', requireRole(['super_admin', 'admin']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const logs = await mysqlDb.getAuditLogs();
      if (logs.length > 0) {
        return res.json({ success: true, data: logs });
      }
    } catch (err) {
      console.warn('[MySQL] Error querying audit logs:', err);
    }
  }
  res.json({ success: true, data: db.auditLogs });
});

// Store Settings update
router.put('/admin/settings', requireRole(['super_admin']), async (req: AuthRequest, res: Response) => {
  if (isDbConnected()) {
    try {
      const updated = await mysqlDb.updateSettings(req.body);
      db.settings = updated;
      db.addAuditLog(req.user!.id, req.user!.first_name, 'UPDATE_SETTINGS', 'Settings', 'global', 'Updated store configuration in MySQL');
      return res.json({ success: true, message: 'Settings updated successfully in database', data: updated });
    } catch (err) {
      console.error('[MySQL] Error updating settings:', err);
    }
  }

  db.settings = { ...db.settings, ...req.body };
  db.addAuditLog(req.user!.id, req.user!.first_name, 'UPDATE_SETTINGS', 'Settings', 'global', 'Updated store configuration');
  res.json({ success: true, message: 'Settings updated successfully', data: db.settings });
});
