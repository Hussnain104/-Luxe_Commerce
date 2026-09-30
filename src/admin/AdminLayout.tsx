import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  FolderTree,
  Tag,
  Users,
  MessageSquare,
  Image as ImageIcon,
  ShieldAlert,
  Settings,
  Store,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminLayout: React.FC = () => {
  const { user, logout, switchDemoRole, isManager } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Product Catalog', path: '/admin/products', icon: Package },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories & Brands', path: '/admin/taxonomy', icon: FolderTree },
    { label: 'Coupons & Promos', path: '/admin/coupons', icon: Tag },
    { label: 'Admin & User Directory', path: '/admin/users', icon: Users },
    { label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Media Assets', path: '/admin/media', icon: ImageIcon },
    { label: 'Security Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'Store Configuration', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col lg:flex-row">
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Admin Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Logo */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="font-serif-luxury text-xl font-bold tracking-widest text-white">
                LUXE<span className="text-amber-400 font-light">CMS</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="p-4 mx-4 my-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'Admin Operative'}
              </p>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block mt-0.5">
                Role: {user?.role_slug || 'super_admin'}
              </span>
            </div>
            <button
              onClick={() => switchDemoRole(user?.role_slug === 'super_admin' ? 'manager' : 'super_admin')}
              className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-amber-300 px-2 py-1 rounded border border-neutral-700 cursor-pointer"
              title="Toggle between Super Admin and Manager permissions"
            >
              Switch
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>View Public Storefront</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-2 w-full px-3.5 py-2 rounded-lg text-rose-400 hover:bg-neutral-900 hover:text-rose-300 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of CMS</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-900">
        {/* Top Header */}
        <header className="h-16 bg-neutral-950 border-b border-neutral-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-neutral-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 hidden sm:inline">
              LuxeCommerce High-Availability Enterprise Control Plane
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Database Online: Production MySQL Cluster
            </span>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
