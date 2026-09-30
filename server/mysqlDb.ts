import { pool, isDbConnected } from './mysql.ts';
import {
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Brand,
  User,
  Coupon,
  Banner,
  BlogPost,
  CMSPage,
  Review,
  Order,
  OrderItem,
  OrderTimeline,
  OrderStatus,
  StoreSettings
} from '../src/types.ts';
import bcrypt from 'bcryptjs';

export class MySQLDatabaseService {
  async getCategories(): Promise<Category[]> {
    const [rows] = await pool.query('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC');
    return rows as Category[];
  }

  async getBrands(): Promise<Brand[]> {
    const [rows] = await pool.query('SELECT * FROM brands WHERE is_active = 1 ORDER BY name ASC');
    return rows as Brand[];
  }

  async getProducts(params: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sale?: boolean;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; totalPages: number; currentPage: number }> {
    let sql = `
      SELECT p.*,
             c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.deleted_at IS NULL AND p.is_published = 1
    `;
    const values: any[] = [];

    if (params.category) {
      sql += ' AND (c.slug = ? OR c.id = ?)';
      values.push(params.category, parseInt(params.category, 10) || 0);
    }

    if (params.brand) {
      sql += ' AND (b.slug = ? OR b.id = ?)';
      values.push(params.brand, parseInt(params.brand, 10) || 0);
    }

    if (params.search) {
      sql += ' AND (p.title LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)';
      const term = `%${params.search}%`;
      values.push(term, term, term);
    }

    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      sql += ' AND p.price >= ?';
      values.push(params.minPrice);
    }

    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      sql += ' AND p.price <= ?';
      values.push(params.maxPrice);
    }

    if (params.inStock) {
      sql += ' AND p.stock_quantity > 0';
    }

    if (params.sale) {
      sql += ' AND (p.is_flash_sale = 1 OR (p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price))';
    }

    if (params.featured) {
      sql += ' AND p.is_featured = 1';
    }

    // Sorting
    switch (params.sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC';
        break;
      case 'newest':
        sql += ' ORDER BY p.created_at DESC';
        break;
      default:
        sql += ' ORDER BY p.is_featured DESC, p.id ASC';
        break;
    }

    // Get total before pagination
    const [allMatching] = await pool.query(sql, values);
    const total = (allMatching as any[]).length;
    const page = params.page || 1;
    const limit = params.limit || 12;
    const offset = (page - 1) * limit;

    sql += ' LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [rows] = await pool.query(sql, values);
    const rawProducts = rows as any[];

    // Fetch images and variants for these products
    const productIds = rawProducts.map((p) => p.id);
    let imagesMap: Record<number, ProductImage[]> = {};
    let variantsMap: Record<number, ProductVariant[]> = {};

    if (productIds.length > 0) {
      const [images] = await pool.query(
        'SELECT * FROM product_images WHERE product_id IN (?) ORDER BY display_order ASC',
        [productIds]
      );
      for (const img of images as any[]) {
        if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
        imagesMap[img.product_id].push({
          id: img.id,
          product_id: img.product_id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          display_order: img.display_order,
          is_primary: Boolean(img.is_primary),
        });
      }

      const [variants] = await pool.query(
        'SELECT * FROM product_variants WHERE product_id IN (?) ORDER BY id ASC',
        [productIds]
      );
      for (const v of variants as any[]) {
        if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
        variantsMap[v.product_id].push({
          id: v.id,
          product_id: v.product_id,
          sku: v.sku,
          title: v.title,
          color_name: v.color_name,
          color_code: v.color_code,
          size: v.size,
          price_modifier: parseFloat(v.price_modifier || 0),
          stock_quantity: v.stock_quantity,
          image_url: v.image_url,
        });
      }
    }

    const products: Product[] = rawProducts.map((p) => ({
      id: p.id,
      category_id: p.category_id,
      category_name: p.category_name,
      category_slug: p.category_slug,
      brand_id: p.brand_id,
      brand_name: p.brand_name,
      brand_slug: p.brand_slug,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode,
      short_description: p.short_description,
      description: p.description,
      specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications || {},
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features || [],
      price: parseFloat(p.price),
      compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
      cost_price: p.cost_price ? parseFloat(p.cost_price) : undefined,
      is_published: Boolean(p.is_published),
      is_featured: Boolean(p.is_featured),
      is_flash_sale: Boolean(p.is_flash_sale),
      flash_sale_ends_at: p.flash_sale_ends_at ? new Date(p.flash_sale_ends_at).toISOString() : undefined,
      status: p.status,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      rating: parseFloat(p.rating || 5),
      review_count: p.review_count || 0,
      images: imagesMap[p.id] || [],
      variants: variantsMap[p.id] || [],
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      seo_keywords: p.seo_keywords,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const [rows] = await pool.query(
      `SELECT p.*,
              c.name as category_name, c.slug as category_slug,
              b.name as brand_name, b.slug as brand_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.slug = ? AND p.deleted_at IS NULL`,
      [slug]
    );

    const list = rows as any[];
    if (list.length === 0) return null;
    const p = list[0];

    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [p.id]
    );
    const [variants] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC',
      [p.id]
    );

    return {
      id: p.id,
      category_id: p.category_id,
      category_name: p.category_name,
      category_slug: p.category_slug,
      brand_id: p.brand_id,
      brand_name: p.brand_name,
      brand_slug: p.brand_slug,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode,
      short_description: p.short_description,
      description: p.description,
      specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications || {},
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features || [],
      price: parseFloat(p.price),
      compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
      cost_price: p.cost_price ? parseFloat(p.cost_price) : undefined,
      is_published: Boolean(p.is_published),
      is_featured: Boolean(p.is_featured),
      is_flash_sale: Boolean(p.is_flash_sale),
      flash_sale_ends_at: p.flash_sale_ends_at ? new Date(p.flash_sale_ends_at).toISOString() : undefined,
      status: p.status,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      rating: parseFloat(p.rating || 5),
      review_count: p.review_count || 0,
      images: (images as any[]).map((img) => ({
        id: img.id,
        product_id: img.product_id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        is_primary: Boolean(img.is_primary),
      })),
      variants: (variants as any[]).map((v) => ({
        id: v.id,
        product_id: v.product_id,
        sku: v.sku,
        title: v.title,
        color_name: v.color_name,
        color_code: v.color_code,
        size: v.size,
        price_modifier: parseFloat(v.price_modifier || 0),
        stock_quantity: v.stock_quantity,
        image_url: v.image_url,
      })),
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      seo_keywords: p.seo_keywords,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }

  async findUserByEmail(email: string): Promise<(User & { password_hash?: string }) | null> {
    const [rows] = await pool.query(
      `SELECT u.*, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL`,
      [email]
    );
    const list = rows as any[];
    if (list.length === 0) return null;
    const u = list[0];
    return {
      id: u.id,
      role_id: u.role_id,
      role_slug: u.role_slug,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      avatar_url: u.avatar_url,
      is_active: Boolean(u.is_active),
      notes: u.notes,
      created_at: u.created_at,
      password_hash: u.password_hash,
    };
  }

  async findUserById(id: number): Promise<User | null> {
    const [rows] = await pool.query(
      `SELECT u.*, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    const list = rows as any[];
    if (list.length === 0) return null;
    const u = list[0];
    return {
      id: u.id,
      role_id: u.role_id,
      role_slug: u.role_slug,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      avatar_url: u.avatar_url,
      is_active: Boolean(u.is_active),
      notes: u.notes,
      created_at: u.created_at,
    };
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const [result]: any = await pool.query(
      `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, is_active)
       VALUES (4, ?, ?, ?, ?, ?, 1)`,
      [data.firstName, data.lastName, data.email.toLowerCase(), passwordHash, data.phone || null]
    );

    const user = await this.findUserById(result.insertId);
    if (!user) throw new Error('User creation failed');
    return user;
  }

  async getCoupons(): Promise<Coupon[]> {
    const [rows] = await pool.query('SELECT * FROM coupons WHERE is_active = 1 ORDER BY id DESC');
    return rows as Coupon[];
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const [rows] = await pool.query(
      `SELECT * FROM coupons
       WHERE UPPER(code) = UPPER(?) AND is_active = 1
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [code]
    );
    const list = rows as any[];
    return list.length > 0 ? (list[0] as Coupon) : null;
  }

  async getBanners(position?: string): Promise<Banner[]> {
    let sql = 'SELECT * FROM banners WHERE is_active = 1';
    const params: any[] = [];
    if (position) {
      sql += ' AND position = ?';
      params.push(position);
    }
    sql += ' ORDER BY display_order ASC';
    const [rows] = await pool.query(sql, params);
    return rows as Banner[];
  }

  async getBlogs(): Promise<BlogPost[]> {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE is_published = 1 ORDER BY published_at DESC');
    return (rows as any[]).map((b) => ({
      ...b,
      is_published: Boolean(b.is_published),
      key_takeaways: typeof b.key_takeaways === 'string' ? JSON.parse(b.key_takeaways) : b.key_takeaways || [],
      tags: typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags || [],
    }));
  }

  async getBlogBySlug(slug: string): Promise<BlogPost | null> {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE slug = ? AND is_published = 1', [slug]);
    const list = rows as any[];
    if (list.length === 0) return null;
    const b = list[0];
    return {
      ...b,
      is_published: Boolean(b.is_published),
      key_takeaways: typeof b.key_takeaways === 'string' ? JSON.parse(b.key_takeaways) : b.key_takeaways || [],
      tags: typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags || [],
    };
  }

  async getPages(): Promise<CMSPage[]> {
    const [rows] = await pool.query('SELECT * FROM pages WHERE is_published = 1');
    return (rows as any[]).map((p) => ({ ...p, is_published: Boolean(p.is_published) }));
  }

  async getPageBySlug(slug: string): Promise<CMSPage | null> {
    const [rows] = await pool.query('SELECT * FROM pages WHERE slug = ? AND is_published = 1', [slug]);
    const list = rows as any[];
    return list.length > 0 ? { ...list[0], is_published: Boolean(list[0].is_published) } : null;
  }

  async getReviews(productId?: number): Promise<Review[]> {
    let sql = 'SELECT * FROM reviews WHERE is_approved = 1';
    const params: any[] = [];
    if (productId) {
      sql += ' AND product_id = ?';
      params.push(productId);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return (rows as any[]).map((r) => ({
      ...r,
      is_verified_purchase: Boolean(r.is_verified_purchase),
      is_approved: Boolean(r.is_approved),
    }));
  }

  async createReview(data: {
    productId: number;
    userId?: number;
    customerName: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<Review> {
    const [res]: any = await pool.query(
      `INSERT INTO reviews (product_id, user_id, customer_name, rating, title, comment, is_verified_purchase, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
      [data.productId, data.userId || null, data.customerName, data.rating, data.title, data.comment]
    );

    // Update product rating and review count
    const [agg]: any = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE product_id = ? AND is_approved = 1',
      [data.productId]
    );
    if (agg.length > 0) {
      await pool.query(
        'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [parseFloat(agg[0].avg_rating || 5).toFixed(2), agg[0].cnt || 1, data.productId]
      );
    }

    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [res.insertId]);
    return (rows as any[])[0] as Review;
  }

  async createOrder(orderData: {
    userId?: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: any;
    billingAddress: any;
    shippingMethod: string;
    shippingAmount: number;
    paymentMethod: string;
    couponCode?: string;
    discountAmount?: number;
    items: {
      productId: number;
      variantId?: number;
      quantity: number;
      price: number;
      title: string;
      sku: string;
      variantName?: string;
      imageUrl?: string;
    }[];
  }): Promise<Order> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const orderNumber = `LX-${Math.floor(100000 + Math.random() * 900000)}`;
      const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = orderData.discountAmount || 0;
      const tax = (subtotal - discount) * 0.0825; // 8.25%
      const grandTotal = Math.max(0, subtotal - discount + orderData.shippingAmount + tax);

      const [orderResult]: any = await conn.query(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone,
          status, payment_status, payment_method, payment_reference,
          subtotal, discount_amount, coupon_code, shipping_amount, shipping_method,
          tax_amount, grand_total, shipping_address, billing_address,
          estimated_delivery
        ) VALUES (?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 3 DAY))`,
        [
          orderNumber,
          orderData.userId || null,
          orderData.customerName,
          orderData.customerEmail,
          orderData.customerPhone,
          orderData.paymentMethod,
          `ref_${Math.random().toString(36).substring(2, 10)}`,
          subtotal,
          discount,
          orderData.couponCode || null,
          orderData.shippingAmount,
          orderData.shippingMethod,
          tax.toFixed(2),
          grandTotal.toFixed(2),
          JSON.stringify(orderData.shippingAddress),
          JSON.stringify(orderData.billingAddress),
        ]
      );

      const orderId = orderResult.insertId;

      // Insert Order Items and decrement stock
      const orderItems: OrderItem[] = [];
      for (const item of orderData.items) {
        const itemSubtotal = item.price * item.quantity;
        const [itemResult]: any = await conn.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, title, sku, variant_name, image_url, unit_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.variantId || null,
            item.title,
            item.sku,
            item.variantName || null,
            item.imageUrl || null,
            item.price,
            item.quantity,
            itemSubtotal,
          ]
        );

        orderItems.push({
          id: itemResult.insertId,
          order_id: orderId,
          product_id: item.productId,
          variant_id: item.variantId,
          title: item.title,
          sku: item.sku,
          variant_name: item.variantName,
          image_url: item.imageUrl,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });

        // Decrement stock
        await conn.query(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [item.quantity, item.productId]
        );

        if (item.variantId) {
          await conn.query(
            'UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
            [item.quantity, item.variantId]
          );
        }
      }

      // Timeline entry
      const [tlResult]: any = await conn.query(
        `INSERT INTO order_timeline (order_id, status, message)
         VALUES (?, 'confirmed', 'Order submitted and white-glove packaging scheduled')`,
        [orderId]
      );

      await conn.commit();

      return {
        id: orderId,
        order_number: orderNumber,
        user_id: orderData.userId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: orderData.paymentMethod,
        subtotal,
        discount_amount: discount,
        coupon_code: orderData.couponCode,
        shipping_amount: orderData.shippingAmount,
        shipping_method: orderData.shippingMethod,
        tax_amount: parseFloat(tax.toFixed(2)),
        grand_total: parseFloat(grandTotal.toFixed(2)),
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        items: orderItems,
        timeline: [
          {
            id: tlResult.insertId,
            order_id: orderId,
            status: 'confirmed',
            message: 'Order submitted and white-glove packaging scheduled',
            created_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getOrders(userId?: number): Promise<Order[]> {
    let sql = 'SELECT * FROM orders';
    const params: any[] = [];
    if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }
    sql += ' ORDER BY created_at DESC';

    const [orders] = await pool.query(sql, params);
    const orderList = orders as any[];
    if (orderList.length === 0) return [];

    const orderIds = orderList.map((o) => o.id);
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds]);
    const [timeline] = await pool.query('SELECT * FROM order_timeline WHERE order_id IN (?) ORDER BY created_at ASC', [orderIds]);

    const itemsMap: Record<number, OrderItem[]> = {};
    for (const it of items as any[]) {
      if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
      itemsMap[it.order_id].push({
        id: it.id,
        order_id: it.order_id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        title: it.title,
        sku: it.sku,
        variant_name: it.variant_name,
        image_url: it.image_url,
        unit_price: parseFloat(it.unit_price),
        quantity: it.quantity,
        subtotal: parseFloat(it.subtotal),
      });
    }

    const timelineMap: Record<number, OrderTimeline[]> = {};
    for (const tl of timeline as any[]) {
      if (!timelineMap[tl.order_id]) timelineMap[tl.order_id] = [];
      timelineMap[tl.order_id].push({
        id: tl.id,
        order_id: tl.order_id,
        status: tl.status,
        message: tl.message,
        created_at: tl.created_at,
      });
    }

    return orderList.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      user_id: o.user_id,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      customer_phone: o.customer_phone,
      status: o.status,
      payment_status: o.payment_status,
      payment_method: o.payment_method,
      payment_reference: o.payment_reference,
      subtotal: parseFloat(o.subtotal),
      discount_amount: parseFloat(o.discount_amount || 0),
      coupon_code: o.coupon_code,
      shipping_amount: parseFloat(o.shipping_amount || 0),
      shipping_method: o.shipping_method,
      tax_amount: parseFloat(o.tax_amount || 0),
      grand_total: parseFloat(o.grand_total),
      shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
      billing_address: typeof o.billing_address === 'string' ? JSON.parse(o.billing_address) : o.billing_address,
      tracking_number: o.tracking_number,
      courier_name: o.courier_name,
      estimated_delivery: o.estimated_delivery,
      items: itemsMap[o.id] || [],
      timeline: timelineMap[o.id] || [],
      created_at: o.created_at,
      updated_at: o.updated_at,
    }));
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const [rows] = await pool.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    const list = rows as any[];
    if (list.length === 0) return null;
    const o = list[0];

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
    const [timeline] = await pool.query('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC', [o.id]);

    return {
      id: o.id,
      order_number: o.order_number,
      user_id: o.user_id,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      customer_phone: o.customer_phone,
      status: o.status,
      payment_status: o.payment_status,
      payment_method: o.payment_method,
      payment_reference: o.payment_reference,
      subtotal: parseFloat(o.subtotal),
      discount_amount: parseFloat(o.discount_amount || 0),
      coupon_code: o.coupon_code,
      shipping_amount: parseFloat(o.shipping_amount || 0),
      shipping_method: o.shipping_method,
      tax_amount: parseFloat(o.tax_amount || 0),
      grand_total: parseFloat(o.grand_total),
      shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
      billing_address: typeof o.billing_address === 'string' ? JSON.parse(o.billing_address) : o.billing_address,
      tracking_number: o.tracking_number,
      courier_name: o.courier_name,
      estimated_delivery: o.estimated_delivery,
      items: (items as any[]).map((it) => ({
        id: it.id,
        order_id: it.order_id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        title: it.title,
        sku: it.sku,
        variant_name: it.variant_name,
        image_url: it.image_url,
        unit_price: parseFloat(it.unit_price),
        quantity: it.quantity,
        subtotal: parseFloat(it.subtotal),
      })),
      timeline: (timeline as any[]).map((tl) => ({
        id: tl.id,
        order_id: tl.order_id,
        status: tl.status,
        message: tl.message,
        created_at: tl.created_at,
      })),
      created_at: o.created_at,
      updated_at: o.updated_at,
    };
  }

  async updateOrderStatus(orderId: number, newStatus: OrderStatus, customMessage?: string): Promise<Order | null> {
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, orderId]
    );

    await pool.query(
      'INSERT INTO order_timeline (order_id, status, message) VALUES (?, ?, ?)',
      [orderId, newStatus, customMessage || `Order status updated to ${newStatus}`]
    );

    const [rows] = await pool.query('SELECT order_number FROM orders WHERE id = ?', [orderId]);
    if ((rows as any[]).length === 0) return null;
    return this.getOrderByNumber((rows as any[])[0].order_number);
  }

  async getSettings(): Promise<StoreSettings> {
    const [rows] = await pool.query('SELECT value_json FROM settings WHERE key_name = ?', ['store_settings']);
    const list = rows as any[];
    if (list.length === 0) {
      return {
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
    }
    return typeof list[0].value_json === 'string' ? JSON.parse(list[0].value_json) : list[0].value_json;
  }

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await pool.query(
      `INSERT INTO settings (key_name, value_json, description)
       VALUES ('store_settings', ?, 'Main LuxeCommerce platform settings')
       ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)`,
      [JSON.stringify(updated)]
    );
    return updated;
  }

  async getAnalytics() {
    const [ordersCount]: any = await pool.query('SELECT COUNT(*) as cnt, SUM(grand_total) as revenue FROM orders WHERE status != "cancelled"');
    const [pendingCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM orders WHERE status IN ("pending", "processing")');
    const [custCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE role_id = 4');
    const [lowStockCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM products WHERE stock_quantity <= low_stock_threshold');

    const totalOrders = ordersCount[0]?.cnt || 0;
    const totalRevenue = parseFloat(ordersCount[0]?.revenue || 0);

    const [recentOrders]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6');

    return {
      totalRevenue,
      totalOrders,
      pendingOrders: pendingCount[0]?.cnt || 0,
      totalCustomers: custCount[0]?.cnt || 0,
      lowStockCount: lowStockCount[0]?.cnt || 0,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      salesChart: [
        { date: 'Mon', revenue: 4200, orders: 3 },
        { date: 'Tue', revenue: 6800, orders: 4 },
        { date: 'Wed', revenue: 9500, orders: 5 },
        { date: 'Thu', revenue: 5100, orders: 3 },
        { date: 'Fri', revenue: 14200, orders: 8 },
        { date: 'Sat', revenue: 18400, orders: 11 },
        { date: 'Sun', revenue: 12100, orders: 7 },
      ],
      recentOrders,
    };
  }

  // ==========================================
  // USER MANAGEMENT (Admin Panel)
  // ==========================================

  async getAllUsers(): Promise<any[]> {
    const [rows] = await pool.query(`
      SELECT
        u.id, u.first_name, u.last_name, u.email, u.phone,
        u.is_active, u.role_id, u.avatar_url, u.notes, u.created_at,
        r.slug   AS role_slug,
        r.name   AS role_name,
        COUNT(DISTINCT o.id) AS order_count,
        COALESCE(SUM(o.grand_total), 0) AS total_spent
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, r.slug, r.name
      ORDER BY u.created_at DESC
    `);
    return (rows as any[]).map((u) => ({
      ...u,
      is_active: Boolean(u.is_active),
      order_count: Number(u.order_count),
      total_spent: Number(u.total_spent),
    }));
  }

  async adminCreateUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role_id: number;
    notes?: string;
    avatar_url?: string;
  }): Promise<any> {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) throw new Error('EMAIL_EXISTS');

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const [result]: any = await pool.query(
      `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, avatar_url, notes, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        data.role_id,
        data.firstName.trim(),
        data.lastName.trim(),
        cleanEmail,
        passwordHash,
        data.phone ? data.phone.trim() : null,
        data.avatar_url || null,
        data.notes || null,
      ]
    );
    const [rows]: any = await pool.query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url, u.is_active, u.notes, u.created_at,
              r.slug as role_slug, r.name as role_name,
              0 as order_count, 0 as total_spent
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [result.insertId]
    );
    return rows[0];
  }

  async adminUpdateUser(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role_id?: number;
      notes?: string;
      password?: string;
      is_active?: boolean;
      avatar_url?: string;
    }
  ): Promise<any | null> {
    if (data.email) {
      const emailClean = data.email.trim().toLowerCase();
      const [existing]: any = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL LIMIT 1',
        [emailClean, id]
      );
      if (existing.length > 0) {
        throw new Error('EMAIL_EXISTS');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (data.firstName !== undefined) { fields.push('first_name = ?'); values.push(data.firstName.trim()); }
    if (data.lastName  !== undefined) { fields.push('last_name = ?');  values.push(data.lastName.trim());  }
    if (data.email     !== undefined) { fields.push('email = ?');      values.push(data.email.trim().toLowerCase()); }
    if (data.phone     !== undefined) { fields.push('phone = ?');      values.push(data.phone ? data.phone.trim() : null); }
    if (data.role_id   !== undefined) { fields.push('role_id = ?');    values.push(data.role_id); }
    if (data.notes     !== undefined) { fields.push('notes = ?');      values.push(data.notes || null); }
    if (data.avatar_url!== undefined) { fields.push('avatar_url = ?'); values.push(data.avatar_url || null); }
    if (data.is_active !== undefined) { fields.push('is_active = ?');  values.push(data.is_active ? 1 : 0); }
    if (data.password && data.password.trim().length > 0) {
      fields.push('password_hash = ?');
      values.push(bcrypt.hashSync(data.password, 10));
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`, values);
    }

    const [rows]: any = await pool.query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url, u.is_active, u.notes, u.created_at,
              r.slug as role_slug, r.name as role_name,
              COUNT(DISTINCT o.id) AS order_count,
              COALESCE(SUM(o.grand_total), 0) AS total_spent
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.id = ?
       GROUP BY u.id, r.slug, r.name`,
      [id]
    );
    return rows.length > 0 ? {
      ...rows[0],
      is_active: Boolean(rows[0].is_active),
      order_count: Number(rows[0].order_count),
      total_spent: Number(rows[0].total_spent),
    } : null;
  }

  async adminDeleteUser(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows > 0;
  }

  async addAuditLog(
    userId: number,
    userName: string,
    action: string,
    module: string,
    recordId?: string,
    details?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, userName, action, module, recordId || null, details || null, ipAddress || '127.0.0.1']
      );
    } catch (err) {
      console.warn('[MySQL] Could not save audit log:', err);
    }
  }

  async getAuditLogs(): Promise<any[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
      return rows as any[];
    } catch {
      return [];
    }
  }

  async getRoles(): Promise<any[]> {
    const [rows] = await pool.query('SELECT id, slug, name, description FROM roles ORDER BY id ASC');
    return rows as any[];
  }
}

export const mysqlDb = new MySQLDatabaseService();

