import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import { pool, testDbConnection } from './mysql.ts';

export async function runDatabaseSeed() {
  console.log('[Seed] Starting database migration & seeding into MySQL...');
  const connected = await testDbConnection();
  if (!connected) {
    throw new Error('Cannot connect to MySQL database. Ensure MySQL is running on localhost:3306');
  }

  const conn = await pool.getConnection();

  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Roles
    console.log('[Seed] Seeding roles...');
    const roles = [
      [1, 'super_admin', 'Super Administrator', 'Full unconstrained system access', 1],
      [2, 'admin', 'Store Administrator', 'Manage products, orders, customers, and CMS', 1],
      [3, 'manager', 'Store Manager', 'Manage inventory, catalog and fulfillment', 1],
      [4, 'customer', 'Registered Customer', 'Standard shopping account', 1],
      [5, 'editor', 'Content Editor', 'Manage blogs, banners, and static pages', 1],
      [6, 'support', 'Customer Support', 'View orders and assist customer accounts', 1],
    ];
    for (const r of roles) {
      await conn.query(
        `INSERT INTO roles (id, slug, name, description, is_system)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        r
      );
    }

    // 2. Users
    console.log('[Seed] Seeding default users...');
    const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);
    for (const u of db.users) {
      await conn.query(
        `INSERT INTO users (id, role_id, first_name, last_name, email, password_hash, phone, avatar_url, is_active, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), phone=VALUES(phone), is_active=VALUES(is_active)`,
        [
          u.id,
          u.role_id,
          u.first_name,
          u.last_name,
          u.email,
          defaultPasswordHash,
          u.phone || null,
          u.avatar_url || null,
          u.is_active ? 1 : 0,
          u.notes || null,
        ]
      );
    }

    // 3. Categories
    console.log('[Seed] Seeding categories...');
    for (const c of db.categories) {
      await conn.query(
        `INSERT INTO categories (id, name, slug, description, image_url, banner_url, is_featured, is_active, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url), banner_url=VALUES(banner_url)`,
        [
          c.id,
          c.name,
          c.slug,
          c.description || null,
          c.image_url || null,
          c.banner_url || null,
          c.is_featured ? 1 : 0,
          c.is_active ? 1 : 0,
          c.display_order || 0,
        ]
      );
    }

    // 4. Brands
    console.log('[Seed] Seeding brands...');
    for (const b of db.brands) {
      await conn.query(
        `INSERT INTO brands (id, name, slug, description, logo_url, is_featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), logo_url=VALUES(logo_url)`,
        [
          b.id,
          b.name,
          b.slug,
          b.description || null,
          b.logo_url || null,
          b.is_featured ? 1 : 0,
          b.is_active ? 1 : 0,
        ]
      );
    }

    // 5. Products & Variants & Images
    console.log(`[Seed] Seeding ${db.products.length} luxury products with variants and images...`);
    for (const p of db.products) {
      await conn.query(
        `INSERT INTO products (
          id, category_id, brand_id, title, slug, sku, barcode,
          short_description, description, specifications, features,
          price, compare_at_price, cost_price, is_published, is_featured,
          is_flash_sale, flash_sale_ends_at, status, stock_quantity,
          low_stock_threshold, rating, review_count,
          seo_title, seo_description, seo_keywords
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title=VALUES(title), price=VALUES(price), compare_at_price=VALUES(compare_at_price),
          stock_quantity=VALUES(stock_quantity), rating=VALUES(rating), review_count=VALUES(review_count),
          short_description=VALUES(short_description), description=VALUES(description)`,
        [
          p.id,
          p.category_id,
          p.brand_id || null,
          p.title,
          p.slug,
          p.sku,
          p.barcode || null,
          p.short_description || null,
          p.description || null,
          JSON.stringify(p.specifications || {}),
          JSON.stringify(p.features || []),
          p.price,
          p.compare_at_price || null,
          p.cost_price || null,
          p.is_published ? 1 : 0,
          p.is_featured ? 1 : 0,
          p.is_flash_sale ? 1 : 0,
          p.flash_sale_ends_at ? new Date(p.flash_sale_ends_at) : null,
          p.status || 'published',
          p.stock_quantity,
          p.low_stock_threshold || 5,
          p.rating || 5.0,
          p.review_count || 0,
          p.seo_title || null,
          p.seo_description || null,
          p.seo_keywords || null,
        ]
      );

      // Product Images
      if (p.images && p.images.length > 0) {
        for (let i = 0; i < p.images.length; i++) {
          const img = p.images[i];
          await conn.query(
            `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_primary)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE image_url=VALUES(image_url), display_order=VALUES(display_order)`,
            [
              img.id,
              p.id,
              img.image_url,
              img.alt_text || p.title,
              img.display_order ?? i,
              img.is_primary ? 1 : i === 0 ? 1 : 0,
            ]
          );
        }
      }

      // Product Variants
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          await conn.query(
            `INSERT INTO product_variants (id, product_id, sku, title, color_name, color_code, size, price_modifier, stock_quantity, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title=VALUES(title), price_modifier=VALUES(price_modifier), stock_quantity=VALUES(stock_quantity)`,
            [
              v.id,
              p.id,
              v.sku,
              v.title,
              v.color_name || null,
              v.color_code || null,
              v.size || null,
              v.price_modifier || 0,
              v.stock_quantity || 0,
              v.image_url || null,
            ]
          );
        }
      }
    }

    // 6. Coupons
    console.log('[Seed] Seeding coupons...');
    for (const cp of db.coupons) {
      await conn.query(
        `INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, usage_count, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE discount_value=VALUES(discount_value), is_active=VALUES(is_active)`,
        [
          cp.id,
          cp.code,
          cp.discount_type,
          cp.discount_value,
          cp.min_order_amount || 0,
          cp.max_discount || null,
          cp.usage_limit || null,
          cp.usage_count || 0,
          cp.is_active ? 1 : 0,
        ]
      );
    }

    // 7. Banners
    console.log('[Seed] Seeding banners...');
    for (const b of db.banners) {
      await conn.query(
        `INSERT INTO banners (id, title, subtitle, link_url, button_text, image_url, position, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), image_url=VALUES(image_url)`,
        [
          b.id,
          b.title,
          b.subtitle || null,
          b.link_url || null,
          b.button_text || 'Shop Now',
          b.image_url,
          b.position,
          b.display_order || 0,
          b.is_active ? 1 : 0,
        ]
      );
    }

    // 8. Blogs
    console.log(`[Seed] Seeding ${db.blogs.length} editorial journal articles...`);
    for (const bl of db.blogs) {
      await conn.query(
        `INSERT INTO blogs (id, title, slug, excerpt, content, image_url, category, author_name, reading_time, is_published, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), excerpt=VALUES(excerpt)`,
        [
          bl.id,
          bl.title,
          bl.slug,
          bl.excerpt,
          bl.content,
          bl.image_url,
          bl.category,
          bl.author_name,
          bl.reading_time || '5 min read',
          bl.is_published ? 1 : 0,
          bl.published_at ? new Date(bl.published_at) : new Date(),
        ]
      );
    }

    // 9. CMS Static Pages
    console.log('[Seed] Seeding CMS pages...');
    for (const pg of db.pages) {
      await conn.query(
        `INSERT INTO pages (id, slug, title, content, is_published)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), is_published=VALUES(is_published)`,
        [
          pg.id,
          pg.slug,
          pg.title,
          pg.content,
          pg.is_published ? 1 : 0,
        ]
      );
    }

    // 10. Reviews
    console.log(`[Seed] Seeding ${db.reviews.length} product reviews...`);
    for (const r of db.reviews) {
      await conn.query(
        `INSERT INTO reviews (id, product_id, user_id, customer_name, rating, title, comment, is_verified_purchase, is_approved, helpful_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment)`,
        [
          r.id,
          r.product_id,
          r.user_id || null,
          r.customer_name,
          r.rating,
          r.title || null,
          r.comment,
          r.is_verified_purchase ? 1 : 0,
          r.is_approved ? 1 : 0,
          r.helpful_count || 0,
        ]
      );
    }

    // 11. Initial Sample Orders
    console.log(`[Seed] Seeding ${db.orders.length} orders...`);
    for (const o of db.orders) {
      await conn.query(
        `INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone,
          status, payment_status, payment_method, payment_reference,
          subtotal, discount_amount, coupon_code, shipping_amount, shipping_method,
          tax_amount, grand_total, shipping_address, billing_address,
          tracking_number, courier_name, estimated_delivery
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status=VALUES(status), payment_status=VALUES(payment_status)`,
        [
          o.id,
          o.order_number,
          o.user_id || null,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.status,
          o.payment_status,
          o.payment_method,
          o.payment_reference || null,
          o.subtotal,
          o.discount_amount || 0,
          o.coupon_code || null,
          o.shipping_amount || 0,
          o.shipping_method,
          o.tax_amount || 0,
          o.grand_total,
          JSON.stringify(o.shipping_address),
          JSON.stringify(o.billing_address),
          o.tracking_number || null,
          o.courier_name || null,
          o.estimated_delivery ? new Date(o.estimated_delivery) : null,
        ]
      );

      // Order Items
      if (o.items && o.items.length > 0) {
        for (const it of o.items) {
          await conn.query(
            `INSERT INTO order_items (id, order_id, product_id, variant_id, title, sku, variant_name, image_url, unit_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), subtotal=VALUES(subtotal)`,
            [
              it.id,
              o.id,
              it.product_id,
              it.variant_id || null,
              it.title,
              it.sku,
              it.variant_name || null,
              it.image_url || null,
              it.unit_price,
              it.quantity,
              it.subtotal,
            ]
          );
        }
      }

      // Order Timeline
      if (o.timeline && o.timeline.length > 0) {
        for (const tl of o.timeline) {
          await conn.query(
            `INSERT INTO order_timeline (id, order_id, status, message, created_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE message=VALUES(message)`,
            [
              tl.id,
              o.id,
              tl.status,
              tl.message,
              tl.created_at ? new Date(tl.created_at) : new Date(),
            ]
          );
        }
      }
    }

    // 12. Settings
    console.log('[Seed] Seeding store configuration settings...');
    await conn.query(
      `INSERT INTO settings (key_name, value_json, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)`,
      ['store_settings', JSON.stringify(db.settings), 'Main LuxeCommerce platform settings']
    );

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[Seed] Database migration & seeding completed successfully into MySQL!');
  } finally {
    conn.release();
  }
}

if (process.argv[1]?.endsWith('seedDatabase.ts')) {
  runDatabaseSeed()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
