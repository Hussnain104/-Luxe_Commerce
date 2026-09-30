# LuxeCommerce Database Setup & Configuration Guide

This document outlines the setup and administration of the MySQL relational database for **LuxeCommerce**.

---

## 1. Prerequisites

* **MySQL 8.0+** or **MariaDB 10.5+** or **AWS Aurora MySQL**
* MySQL CLI client or GUI client (TablePlus, MySQL Workbench, DBeaver)
* UTF-8 (`utf8mb4_unicode_ci`) encoding support

---

## 2. Environment Variables

Configure your database connection parameters in `.env`:

```env
DATABASE_URL=mysql://db_user:db_password@localhost:3306/luxe_ecommerce
DB_HOST=localhost
DB_PORT=3306
DB_NAME=luxe_ecommerce
DB_USER=root
DB_PASSWORD=your_secure_password
```

---

## 3. Creating the Database

Run from your terminal or MySQL shell:

```sql
CREATE DATABASE IF NOT EXISTS `luxe_ecommerce`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'luxe_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON `luxe_ecommerce`.* TO 'luxe_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 4. Applying Schema Migrations

Apply the production schema DDL to create normalized tables with proper foreign keys, cascading rules, and indexes:

```bash
# Execute schema migration
mysql -u luxe_user -p luxe_ecommerce < database/schema.sql
```

---

## 5. Seeding Initial Data

Populate the database with roles, administrative accounts, categories, luxury brands, 20+ products, variants, reviews, coupons, banners, and settings:

```bash
# Seed initial data
mysql -u luxe_user -p luxe_ecommerce < database/seed/seed_data.sql
```

---

## 6. Default Administrative Accounts

| Role | Email | Default Password | Permissions |
|---|---|---|---|
| **Super Admin** | `admin@luxecommerce.com` | `Password123!` | Full unconstrained control |
| **Manager** | `manager@luxecommerce.com` | `Password123!` | Products, Inventory, Orders |
| **Customer** | `customer@example.com` | `Password123!` | Storefront checkout, wishlist, orders |

> **Security Note:** Change all default passwords immediately before pointing any production traffic to your deployment.
