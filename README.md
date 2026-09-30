# LuxeCommerce - Complete Luxury E-Commerce Platform

A production-grade, enterprise luxury e-commerce web platform built with **React 19, TypeScript, Tailwind CSS, Node.js / Express**, and a fully relational **MySQL (XAMPP)** database backend.

---

## 🌟 Key Features

* **High-End Luxury Storefront**:
  * Hero sliders, curated collections, promotional grids, and luxury editorial blog.
  * Live category filtering (Horology & Watches, Leather Goods, Audio & Refined Tech, Designer Apparel, Fine Living).
  * Brand filter, dynamic price sliders, in-stock & flash sale filters.
  * Real-time search suggestions with instant debounce.
  * Product quick-view modal and rich product detail pages with multi-image gallery, specifications, and variants.
  * Persistent Cart drawer with coupon code discount engine.
  * Wishlist management with local and database sync.
  * Multi-step checkout with real-time tax calculation, shipping rate computation, order notes, and payment selection.
  * Order confirmation and real-time shipment lifecycle tracking.
  * Verified customer reviews with dynamic star rating aggregation.

* **Full-Featured Relational MySQL Database**:
  * 25 normalized tables covering roles, permissions, users, categories, brands, products, product images, variants, inventory transactions, addresses, carts, wishlists, coupons, orders, order items, timeline logs, reviews, media assets, banners, blogs, CMS static pages, settings, and audit logs.
  * Connected directly to XAMPP MySQL running on `localhost:3306`.
  * Direct phpMyAdmin access under database `luxe_ecommerce`.

* **Admin CMS Suite (Protected with RBAC)**:
  * Executive Analytics dashboard with revenue, order velocity, and inventory statistics.
  * Complete Product Management (CRUD).
  * Real-time Inventory tracking with stock adjustments and audit history.
  * Order lifecycle management with status progression (Pending → Processing → Shipped → Delivered).
  * Category and Brand taxonomy editor.
  * Coupon & discount code manager.
  * Customer accounts overview with total order and lifetime spend calculations.
  * Product reviews moderation.
  * Store settings editor (currency, shipping thresholds, tax rates, announcement bar).

---

## 🚀 Quick Start Guide

### 1. Database Configuration
Ensure MySQL is running in your **XAMPP Control Panel** (default port: `3306`).

Database settings in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=luxe_ecommerce
DB_USER=root
DB_PASSWORD=
PORT=3000
JWT_SECRET=super_secure_luxe_jwt_secret_key_production_2026_luxury_commerce_token
```

### 2. Database Migration & Seeding
To apply the schema and seed all 20+ luxury products, variants, images, blogs, and settings into MySQL:
```bash
npx tsx server/seedDatabase.ts
```

Alternatively, you can import `database/seed/seed_data.sql` directly into phpMyAdmin:
`http://localhost/phpmyadmin` -> Database: `luxe_ecommerce`

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@luxecommerce.com` | `Password123!` | Full unconstrained control across all CMS modules |
| **Store Manager**| `manager@luxecommerce.com`| `Password123!` | Catalog, Inventory, and Order fulfillment |
| **Customer** | `customer@example.com` | `Password123!` | Standard shopping account with order history |

> *Tip: You can also use the interactive demo role switcher on the login page or admin navbar for instant testing.*

---

## 📡 API Health & Database Status

* `GET /api/health` - Basic health check
* `GET /api/db/status` - Detailed MySQL connection and table count telemetry
* `GET /api/products` - Filtered & paginated product catalog from MySQL
* `GET /api/categories` - Categories with dynamic product count
* `GET /api/brands` - Luxury brand roster
* `POST /api/orders` - Multi-line order creation with automatic stock deduction in MySQL
