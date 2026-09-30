import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';

// Storefront components & pages
import { StorefrontLayout } from './components/common/StorefrontLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.tsx';
import { CustomerAccountPage } from './pages/CustomerAccountPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { BlogPage } from './pages/BlogPage.tsx';
import { BlogPostPage } from './pages/BlogPostPage.tsx';
import { CMSContentPage } from './pages/CMSContentPage.tsx';

// Admin CMS
import { AdminLayout } from './admin/AdminLayout.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { AdminProducts } from './admin/AdminProducts.tsx';
import { AdminInventory } from './admin/AdminInventory.tsx';
import { AdminOrders } from './admin/AdminOrders.tsx';
import { AdminTaxonomy } from './admin/AdminTaxonomy.tsx';
import { AdminCoupons } from './admin/AdminCoupons.tsx';
import { AdminCustomers } from './admin/AdminCustomers.tsx';
import { AdminUsers } from './admin/AdminUsers.tsx';
import { AdminReviews } from './admin/AdminReviews.tsx';
import { AdminMedia } from './admin/AdminMedia.tsx';
import { AdminAuditLogs } from './admin/AdminAuditLogs.tsx';
import { AdminSettings } from './admin/AdminSettings.tsx';

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isManager } = useAuth();
  if (!user || !isManager) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                {/* 1. Public Storefront Routes */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmed/:orderNumber" element={<OrderConfirmationPage />} />
                  <Route path="/account/*" element={<CustomerAccountPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/about" element={<CMSContentPage />} />
                  <Route path="/faq" element={<CMSContentPage />} />
                  <Route path="/terms" element={<CMSContentPage />} />
                  <Route path="/privacy" element={<CMSContentPage />} />
                </Route>

                {/* 2. Admin CMS Suite */}
                <Route
                  path="/admin"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout />
                    </AdminRouteGuard>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="taxonomy" element={<AdminTaxonomy />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
