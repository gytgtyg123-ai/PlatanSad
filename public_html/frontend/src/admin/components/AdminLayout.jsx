import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  LogOut,
  Leaf,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  MessageSquare
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nav = useMemo(
    () => [
      { to: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard, color: 'emerald' },
      { to: '/admin/orders', label: 'Замовлення', icon: ShoppingCart, color: 'blue' },
      { to: '/admin/products', label: 'Товари', icon: Package, color: 'amber' },
      { to: '/admin/categories', label: 'Категорії', icon: FolderTree, color: 'purple' },
      { to: '/admin/reviews', label: 'Відгуки', icon: MessageSquare, color: 'pink' }
    ],
    []
  );

  const pageTitle = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/admin/dashboard')) return 'Дашборд';
    if (p.startsWith('/admin/orders')) return 'Замовлення';
    if (p.startsWith('/admin/products')) return 'Товари';
    if (p.startsWith('/admin/categories')) return 'Категорії';
    if (p.startsWith('/admin/reviews')) return 'Відгуки';
    return 'Адмінка';
  }, [location.pathname]);

  return (
    <div className="dark min-h-screen bg-[#080d14] text-gray-100">
      <div className="flex min-h-screen">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          w-72 flex flex-col
          bg-gradient-to-b from-[#0d1520] to-[#0a0f18]
          border-r border-white/5
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo Section */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`
                p-2.5 rounded-xl
                bg-gradient-to-br from-emerald-500 to-green-600
                shadow-lg shadow-emerald-500/30
                transition-transform duration-500
                ${mounted ? 'scale-100 rotate-0' : 'scale-75 rotate-12'}
              `}>
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-tight">
                  PlatanSad
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                  <Sparkles size={10} />
                  <span>Адмін Панель</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {nav.map(({ to, label, icon: Icon, color }, index) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `
                    group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                    font-semibold transition-all duration-300
                    ${isActive
                      ? `bg-gradient-to-r from-${color}-500/20 to-${color}-600/10 text-white border border-${color}-500/30 shadow-lg shadow-${color}-500/10`
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                    ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `
                }
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {({ isActive }) => (
                  <>
                    <div className={`
                      p-2 rounded-lg transition-all duration-300
                      ${isActive 
                        ? `bg-${color}-500/20` 
                        : 'bg-white/5 group-hover:bg-white/10'
                      }
                    `}>
                      <Icon size={18} className={isActive ? `text-${color}-400` : 'text-gray-400 group-hover:text-white'} />
                    </div>
                    <span>{label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className={`absolute right-2 w-2 h-2 rounded-full bg-${color}-400 animate-pulse`} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5 space-y-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-white/20
                text-gray-300 hover:text-white
                font-medium transition-all duration-300
                group
              "
            >
              <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
              Перейти на сайт
            </a>
            
            <button
              onClick={() => {
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/login';
              }}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                bg-red-500/10 hover:bg-red-500/20
                border border-red-500/20 hover:border-red-500/40
                text-red-400 hover:text-red-300
                font-medium transition-all duration-300
                group
              "
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              Вийти
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Top Bar */}
          <header className="
            sticky top-0 z-30
            bg-[#0d1520]/80 backdrop-blur-xl
            border-b border-white/5
          ">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Page info */}
              <div className="flex-1 lg:flex-none ml-4 lg:ml-0">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Панель керування
                </div>
                <div className="text-lg font-bold text-white">
                  {pageTitle}
                </div>
              </div>

              {/* Right side - could add notifications, user menu, etc. */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Онлайн</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8">
            <div className={`
              transition-all duration-500
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="px-4 lg:px-8 py-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2024 PlatanSad. Всі права захищені.</span>
              <span className="flex items-center gap-1">
                <Leaf size={12} className="text-emerald-500" />
                Розсадник декоративних рослин
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global background effects */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

export default AdminLayout;