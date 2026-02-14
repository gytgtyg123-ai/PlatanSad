import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingCart, TrendingUp, DollarSign, 
  ArrowUpRight, ArrowDownRight, Leaf, Users, Eye,
  ChevronRight, Sparkles, Activity, Bell
} from 'lucide-react';
import { productsApi } from '../../api/productsApi';
import { getAllOrders, getDashboardStats } from '../api/adminApi';
import { useNewOrderNotification } from '../../hooks/useNewOrderNotification';
import NewOrderPopup from '../components/NewOrderPopup';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Hook для сповіщень про нові замовлення (кожну хвилину)
  const { newOrder, showPopup, closePopup, pendingOrdersCount } = useNewOrderNotification(60000);

  useEffect(() => {
    loadDashboardData();
    setTimeout(() => setMounted(true), 100);
  }, []);
  
  // Оновлюємо дашборд коли приходить нове замовлення
  useEffect(() => {
    if (newOrder) {
      loadDashboardData();
    }
  }, [newOrder]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const products = await productsApi.getProducts();
      
      let orders = [];
      try {
        orders = await getAllOrders();
      } catch (e) {
        orders = [];
      }

      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const recentOrders = orders.slice(0, 5);

      setStats({
        totalProducts: Array.isArray(products) ? products.length : (products?.total || products?.products?.length || 0),
        totalOrders: orders.length,
        totalRevenue,
        recentOrders
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Очікує',
      'confirmed': 'Підтверджено',
      'processing': 'В обробці',
      'shipped': 'Відправлено',
      'delivered': 'Доставлено',
      'completed': 'Виконано',
      'cancelled': 'Скасовано'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'confirmed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'processing': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'shipped': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'delivered': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return classMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const StatCard = ({ icon: Icon, label, value, color, trend, delay = 0 }) => (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br from-[#0d1520] to-[#151f2e]
        border border-white/5
        hover:border-${color}-500/30
        group
        transition-all duration-500 ease-out
        hover:-translate-y-1 hover:shadow-xl hover:shadow-${color}-500/10
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glow effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-${color}-500/10 blur-3xl group-hover:bg-${color}-500/20 transition-all duration-500`} />
      
      {/* Icon */}
      <div className={`
        relative inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4
        bg-gradient-to-br from-${color}-500/20 to-${color}-600/10
        border border-${color}-500/20
        group-hover:scale-110 group-hover:rotate-3
        transition-transform duration-300
      `}>
        <Icon className={`w-7 h-7 text-${color}-400`} />
      </div>
      
      {/* Value */}
      <div className="relative">
        <div className={`text-4xl font-black text-white mb-1 tracking-tight group-hover:text-${color}-300 transition-colors`}>
          {typeof value === 'number' ? value.toLocaleString('uk-UA') : value}
        </div>
        <div className="text-sm text-gray-400 font-medium">{label}</div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={`absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}

      {/* Bottom shine line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );

  const QuickAction = ({ href, icon: Icon, title, subtitle, color, delay = 0 }) => (
    <a
      href={href}
      className={`
        relative overflow-hidden block p-6 rounded-2xl
        bg-gradient-to-br from-${color}-600 to-${color}-700
        hover:from-${color}-500 hover:to-${color}-600
        border border-${color}-500/30
        shadow-lg shadow-${color}-500/20
        hover:shadow-xl hover:shadow-${color}-500/30
        hover:-translate-y-1
        group
        transition-all duration-500 ease-out
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>
      
      {/* Icon */}
      <div className="relative mb-4">
        <Icon className="w-10 h-10 text-white/90 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
      </div>
      
      {/* Text */}
      <h3 className="relative font-bold text-xl text-white mb-1">{title}</h3>
      <p className={`relative text-${color}-100/80 text-sm`}>{subtitle}</p>
      
      {/* Arrow */}
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </a>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-white/5 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#0d1520] rounded-2xl p-6 h-40 border border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-xl mb-4" />
              <div className="h-8 bg-white/5 rounded w-20 mb-2" />
              <div className="h-4 bg-white/5 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Popup сповіщення про нове замовлення */}
      <NewOrderPopup 
        order={newOrder} 
        isVisible={showPopup} 
        onClose={closePopup} 
      />
      
      {/* Header */}
      <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Дашборд</h1>
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          
          {/* Індикатор нових замовлень */}
          {pendingOrdersCount > 0 && (
            <a
              href="/admin/orders"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/30 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:-translate-y-0.5"
              data-testid="pending-orders-badge"
            >
              <Bell className="w-5 h-5 animate-bounce" />
              <span className="font-bold">{pendingOrdersCount} нових замовлень</span>
            </a>
          )}
        </div>
        <p className="text-gray-400 ml-14">Огляд статистики магазину PlatanSad</p>
        
        {/* Індикатор активного моніторингу */}
        <div className="ml-14 mt-2 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-gray-500">Моніторинг нових замовлень активний</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          label="Товарів у каталозі"
          value={stats.totalProducts}
          color="blue"
          delay={100}
        />
        <StatCard
          icon={ShoppingCart}
          label="Всього замовлень"
          value={stats.totalOrders}
          color="emerald"
          delay={200}
        />
        <StatCard
          icon={DollarSign}
          label="Загальний дохід"
          value={`${stats.totalRevenue.toLocaleString('uk-UA')} ₴`}
          color="amber"
          delay={300}
        />
        <StatCard
          icon={TrendingUp}
          label="Середній чек"
          value={stats.totalOrders > 0 ? `${Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString('uk-UA')} ₴` : '0 ₴'}
          color="purple"
          delay={400}
        />
      </div>

      {/* Recent Orders */}
      <div 
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br from-[#0d1520] to-[#151f2e]
          border border-white/5 p-6
          transition-all duration-700 delay-500
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Останні замовлення</h2>
          </div>
          <a 
            href="/admin/orders" 
            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Переглянути всі
            <ChevronRight size={16} />
          </a>
        </div>
        
        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg">Замовлень поки немає</p>
            <p className="text-gray-500 text-sm mt-1">Нові замовлення з'являться тут</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentOrders.map((order, index) => (
              <div
                key={order.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl
                  bg-white/[0.02] border border-white/5
                  hover:bg-white/[0.04] hover:border-white/10
                  transition-all duration-300
                  ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        {order.customerName || 'Без імені'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {order.customerPhone} • {order.items?.length || 0} товар(ів)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">
                    {(order.totalAmount || 0).toLocaleString('uk-UA')} ₴
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          href="/admin/products"
          icon={Package}
          title="Товари"
          subtitle="Керувати каталогом"
          color="emerald"
          delay={700}
        />
        <QuickAction
          href="/admin/orders"
          icon={ShoppingCart}
          title="Замовлення"
          subtitle="Переглянути замовлення"
          color="blue"
          delay={800}
        />
        <QuickAction
          href="/admin/categories"
          icon={Leaf}
          title="Категорії"
          subtitle="Керувати категоріями"
          color="purple"
          delay={900}
        />
      </div>

      {/* Animated background elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
};

export default AdminDashboard;
