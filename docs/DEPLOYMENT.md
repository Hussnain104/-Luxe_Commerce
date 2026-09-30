# LuxeCommerce Local Development & Production Deployment Guide

## 1. Local Development Quickstart

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `JWT_SECRET` is set to a secure string of at least 32 characters.

### Step 3: Start Development Server
```bash
npm run dev
```
The server starts at `http://localhost:3000` with hot API routing, database services, and Vite client middleware.

---

## 2. Production Build & Deployment

### Step 1: Build Application
```bash
npm run build
```
This builds the client assets into `dist/` and bundles `server.ts` into a self-contained Node.js bundle `dist/server.cjs`.

### Step 2: Run Production Server
```bash
npm start
```

### Step 3: Containerized Deployment (Docker / Cloud Run)

#### Dockerfile Example:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 3. Stripe & PayPal Webhook Integration

### Stripe Webhook Handler
Point your Stripe webhook to:
`POST https://yourdomain.com/api/payments/stripe-webhook`

Events to subscribe:
* `payment_intent.succeeded`
* `payment_intent.payment_failed`
* `charge.refunded`

### PayPal IPN / Webhooks
Point your PayPal webhook to:
`POST https://yourdomain.com/api/payments/paypal-webhook`

Events:
* `CHECKOUT.ORDER.APPROVED`
* `PAYMENT.CAPTURE.COMPLETED`
