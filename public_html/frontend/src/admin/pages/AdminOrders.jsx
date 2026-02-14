import React, { useMemo, useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllOrders, updateOrderStatus, deleteOrder, getQuickOrders, updateQuickOrderStatus, deleteQuickOrder } from '../api/adminApi';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  X,
  Clipboard,
  Phone,
  RefreshCcw,
  ArrowUpDown,
  Trash2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [quickOrders, setQuickOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'quick'

  const loadOrders = useCallback(async () => {
    try {
      const [ordersData, quickOrdersData] = await Promise.all([
        getAllOrders(),
        getQuickOrders()
      ]);
      setOrders(ordersData);
      setQuickOrders(quickOrdersData);
    } catch (error) {
      toast.error('Помилка завантаження замовлень');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus, isQuick = false) => {
    try {
      if (isQuick) {
        await updateQuickOrderStatus(orderId, newStatus);
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
      toast.success('Статус оновлено');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Помилка оновлення статусу');
      console.error(error);
    }
  };

  const handleDeleteOrder = async (orderId, isQuick = false) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це замовлення?')) return;
    
    try {
      if (isQuick) {
        await deleteQuickOrder(orderId);
      } else {
        await deleteOrder(orderId);
      }
      toast.success('Замовлення видалено');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        closeDetails();
      }
    } catch (error) {
      toast.error('Помилка видалення замовлення');
      console.error(error);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleCopy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} скопійовано`);
    } catch (error) {
      toast.error('Не вдалося скопіювати');
      console.error(error);
    }
  };

  const getStatusInfo = (status) => {
    // легкий “3D / glow” відтінок через ring + gradient-пілюлю
    const statusMap = {
      pending: {
        label: 'Очікує',
        pill:
          'bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-800 ring-1 ring-yellow-200/70 dark:from-yellow-900/35 dark:to-yellow-900/10 dark:text-yellow-200 dark:ring-yellow-500/25',
        icon: Clock
      },
      confirmed: {
        label: 'Підтверджено',
        pill:
          'bg-gradient-to-b from-blue-50 to-blue-100 text-blue-800 ring-1 ring-blue-200/70 dark:from-blue-900/35 dark:to-blue-900/10 dark:text-blue-200 dark:ring-blue-500/25',
        icon: CheckCircle
      },
      processing: {
        label: 'Обробляється',
        pill:
          'bg-gradient-to-b from-purple-50 to-purple-100 text-purple-800 ring-1 ring-purple-200/70 dark:from-purple-900/35 dark:to-purple-900/10 dark:text-purple-200 dark:ring-purple-500/25',
        icon: Package
      },
      shipped: {
        label: 'Відправлено',
        pill:
          'bg-gradient-to-b from-indigo-50 to-indigo-100 text-indigo-800 ring-1 ring-indigo-200/70 dark:from-indigo-900/35 dark:to-indigo-900/10 dark:text-indigo-200 dark:ring-indigo-500/25',
        icon: Truck
      },
      delivered: {
        label: 'Доставлено',
        pill:
          'bg-gradient-to-b from-green-50 to-green-100 text-green-800 ring-1 ring-green-200/70 dark:from-green-900/35 dark:to-green-900/10 dark:text-green-200 dark:ring-green-500/25',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Скасовано',
        pill:
          'bg-gradient-to-b from-red-50 to-red-100 text-red-800 ring-1 ring-red-200/70 dark:from-red-900/35 dark:to-red-900/10 dark:text-red-200 dark:ring-red-500/25',
        icon: XCircle
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusStats = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += 1;
        acc.revenue += order.totalAmount;
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        revenue: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.customerPhone.includes(search) ||
          order.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'amount_asc':
            return a.totalAmount - b.totalAmount;
          case 'amount_desc':
            return b.totalAmount - a.totalAmount;
          case 'date_asc':
            return new Date(a.createdAt) - new Date(b.createdAt);
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [orders, search, sortBy, statusFilter]);

  // ===================== 3D UI helpers (Tailwind класами) =====================
  const glassCard =
    'relative rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/55 backdrop-blur-xl shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)]';
  const insetHighlight =
    'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/60 before:to-transparent before:opacity-70 dark:before:from-white/10';
  const hoverLift =
    'transition-transform duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.35)]';
  const softInput =
    'w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/45 backdrop-blur-md px-4 py-2 text-gray-900 dark:text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] focus:ring-2 focus:ring-green-500/60 focus:border-transparent';
  const softSelect = softInput;
  const btnSoft =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-gray-900/45 backdrop-blur-md text-gray-800 dark:text-gray-100 shadow-[0_10px_18px_-14px_rgba(0,0,0,0.35)] hover:bg-white/80 dark:hover:bg-gray-900/65 active:translate-y-[1px] transition';
  const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_14px_28px_-18px_rgba(37,99,235,0.75)] hover:from-blue-500 hover:to-blue-700 active:translate-y-[1px] transition';

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
            <div className="absolute inset-0 rounded-full blur-xl bg-green-500/20" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Background depth */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 -z-10">
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-green-400/15 blur-3xl" />
          <div className="absolute right-0 top-12 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl" />
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Замовлення
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Управління замовленнями клієнтів
              </p>
            </div>
            <button onClick={loadOrders} className={btnSoft}>
              <RefreshCcw size={18} />
              Оновити
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={`${glassCard} ${insetHighlight} ${hoverLift} p-5`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всього замовлень</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {statusStats.total}
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200/60 dark:bg-white/10 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-green-500/70 to-green-600/70" />
              </div>
            </div>

            <div className={`${glassCard} ${insetHighlight} ${hoverLift} p-5`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Виручка</p>
              <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                {statusStats.revenue.toFixed(0)} грн
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Сума всіх замовлень
              </p>
            </div>

            <div className={`${glassCard} ${insetHighlight} ${hoverLift} p-5`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Очікують</p>
              <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {statusStats.pending}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Потрібно підтвердити
              </p>
            </div>

            <div className={`${glassCard} ${insetHighlight} ${hoverLift} p-5`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Доставлено</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {statusStats.delivered}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Завершені замовлення
              </p>
            </div>
          </div>

          {/* Order Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('regular')}
              className={[
                'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all',
                'shadow-[0_10px_20px_-12px_rgba(0,0,0,0.3)]',
                activeTab === 'regular'
                  ? 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-green-500/30'
                  : 'bg-white/60 dark:bg-gray-900/45 text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-white/10 hover:bg-white/80'
              ].join(' ')}
            >
              <ShoppingCart size={18} />
              Звичайні ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={[
                'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all',
                'shadow-[0_10px_20px_-12px_rgba(0,0,0,0.3)]',
                activeTab === 'quick'
                  ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-orange-500/30'
                  : 'bg-white/60 dark:bg-gray-900/45 text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-white/10 hover:bg-white/80'
              ].join(' ')}
            >
              <Zap size={18} />
              Швидкі ({quickOrders.length})
              {quickOrders.filter(q => q.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {quickOrders.filter(q => q.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className={`${glassCard} ${insetHighlight} p-4`}>
            <div className="flex flex-col gap-4">
              {/* Status tabs (pill 3D) */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: '', label: 'Всі', count: statusStats.total },
                  { key: 'pending', label: 'Очікує', count: statusStats.pending },
                  { key: 'confirmed', label: 'Підтверджено', count: statusStats.confirmed },
                  { key: 'processing', label: 'Обробляється', count: statusStats.processing },
                  { key: 'shipped', label: 'Відправлено', count: statusStats.shipped },
                  { key: 'delivered', label: 'Доставлено', count: statusStats.delivered },
                  { key: 'cancelled', label: 'Скасовано', count: statusStats.cancelled }
                ].map((s) => {
                  const active = statusFilter === s.key;
                  return (
                    <button
                      key={s.key || 'all'}
                      onClick={() => setStatusFilter(s.key)}
                      className={[
                        'group relative rounded-full px-3 py-1.5 text-sm border transition',
                        'shadow-[0_10px_16px_-14px_rgba(0,0,0,0.35)]',
                        active
                          ? 'bg-gradient-to-b from-green-600 to-green-700 text-white border-green-600'
                          : 'bg-white/60 dark:bg-gray-900/45 text-gray-700 dark:text-gray-200 border-gray-200/70 dark:border-white/10 hover:bg-white/80 dark:hover:bg-gray-900/60'
                      ].join(' ')}
                    >
                      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                      <span className="relative">
                        {s.label} · {s.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Пошук за ім'ям, телефоном або ID"
                    className={`pl-10 ${softInput}`}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={softSelect}
                >
                  <option value="">Всі статуси</option>
                  <option value="pending">Очікує</option>
                  <option value="confirmed">Підтверджено</option>
                  <option value="processing">Обробляється</option>
                  <option value="shipped">Відправлено</option>
                  <option value="delivered">Доставлено</option>
                  <option value="cancelled">Скасовано</option>
                </select>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ArrowUpDown
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`pl-9 ${softSelect}`}
                    >
                      <option value="date_desc">Новіші спочатку</option>
                      <option value="date_asc">Старіші спочатку</option>
                      <option value="amount_desc">Сума: спадання</option>
                      <option value="amount_asc">Сума: зростання</option>
                    </select>
                  </div>
                  <button onClick={loadOrders} className={btnSoft} title="Оновити">
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {activeTab === 'regular' ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className={`${glassCard} ${insetHighlight} ${hoverLift} p-6`}
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          #{order.id.substring(0, 8)}
                        </h3>

                        <span
                          className={[
                            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                            statusInfo.pill,
                            'shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                          ].join(' ')}
                        >
                          <StatusIcon size={14} className="mr-1" />
                          {statusInfo.label}
                        </span>

                        <span className="ml-auto md:ml-0 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="min-w-0">
                          <span className="text-gray-600 dark:text-gray-400">Клієнт:</span>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {order.customerName}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <span className="text-gray-600 dark:text-gray-400">Телефон:</span>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {order.customerPhone}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Доставка/Оплата:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.deliveryMethod === 'nova_poshta' ? 'Нова Пошта' : 'Самовивіз'} ·{' '}
                            {order.paymentMethod === 'cash_on_delivery'
                              ? 'Накладений платіж'
                              : 'Оплата карткою'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-white/60 dark:bg-gray-900/45 border border-gray-200/70 dark:border-white/10 text-gray-700 dark:text-gray-200">
                          {order.deliveryMethod === 'nova_poshta' ? 'Нова Пошта' : 'Самовивіз'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-white/60 dark:bg-gray-900/45 border border-gray-200/70 dark:border-white/10 text-gray-700 dark:text-gray-200">
                          {order.paymentMethod === 'cash_on_delivery'
                            ? 'Накладений платіж'
                            : 'Оплата карткою'}
                        </span>
                        {order.notes && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/35 dark:to-yellow-900/10 border border-yellow-200/60 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-200">
                            Є примітка
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {order.totalAmount.toFixed(0)} грн
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items.length} товар(ів)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200/70 dark:border-white/10">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`${softSelect} flex-1`}
                      data-testid={`status-select-${order.id}`}
                    >
                      <option value="pending">Очікує</option>
                      <option value="confirmed">Підтверджено</option>
                      <option value="processing">Обробляється</option>
                      <option value="shipped">Відправлено</option>
                      <option value="delivered">Доставлено</option>
                      <option value="cancelled">Скасовано</option>
                    </select>

                    <button
                      onClick={() => openDetails(order)}
                      className={btnPrimary}
                      data-testid={`view-order-${order.id}`}
                    >
                      <Eye size={18} />
                      Деталі
                    </button>
                    
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-b from-red-600 to-red-700 text-white shadow-[0_14px_28px_-18px_rgba(220,38,38,0.75)] hover:from-red-500 hover:to-red-700 active:translate-y-[1px] transition"
                      data-testid={`delete-order-${order.id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className={`${glassCard} ${insetHighlight} p-10 text-center`}>
                <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-700 dark:text-gray-300">Замовлень не знайдено</p>
              </div>
            )}
          </div>
          ) : (
            /* Quick Orders List */
            <div className="space-y-4">
              {quickOrders
                .filter(qo => {
                  const searchLower = search.toLowerCase();
                  const matchesSearch = !search || 
                    qo.customerName?.toLowerCase().includes(searchLower) ||
                    qo.customerPhone?.includes(search) ||
                    qo.productName?.toLowerCase().includes(searchLower);
                  const matchesStatus = !statusFilter || qo.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .sort((a, b) => {
                  switch (sortBy) {
                    case 'date_asc': return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'amount_desc': return (b.price * b.quantity) - (a.price * a.quantity);
                    case 'amount_asc': return (a.price * a.quantity) - (b.price * b.quantity);
                    default: return new Date(b.createdAt) - new Date(a.createdAt);
                  }
                })
                .map((qo) => {
                  const statusInfo = getStatusInfo(qo.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={qo.id}
                      className={`${glassCard} ${insetHighlight} ${hoverLift} p-6`}
                      data-testid={`quick-order-card-${qo.id}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-orange-200 dark:border-orange-500/30 shadow-lg">
                          <img 
                            src={qo.productImage} 
                            alt={qo.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                              <Zap size={12} />
                              Швидке
                            </span>
                            
                            <span
                              className={[
                                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                statusInfo.pill,
                                'shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                              ].join(' ')}
                            >
                              <StatusIcon size={14} className="mr-1" />
                              {statusInfo.label}
                            </span>

                            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                              {new Date(qo.createdAt).toLocaleDateString('uk-UA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {qo.productName}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Клієнт:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{qo.customerName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Телефон:</span>
                              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {qo.customerPhone}
                                <a 
                                  href={`tel:${qo.customerPhone}`}
                                  className="text-green-600 hover:text-green-700"
                                  title="Зателефонувати"
                                >
                                  <Phone size={14} />
                                </a>
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Сума:</span>
                              <p className="font-bold text-green-700 dark:text-green-300">
                                {(qo.price * qo.quantity).toLocaleString()} грн
                                {qo.quantity > 1 && (
                                  <span className="ml-1 text-gray-500 text-xs font-normal">
                                    ({qo.quantity} шт × {qo.price.toLocaleString()} грн)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {qo.notes && (
                            <div className="mt-2 p-2 bg-gray-100/80 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Коментар:</span> {qo.notes}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <select
                            value={qo.status}
                            onChange={(e) => handleStatusChange(qo.id, e.target.value, true)}
                            className={`${softSelect} text-sm min-w-[150px]`}
                            data-testid={`quick-order-status-${qo.id}`}
                          >
                            <option value="pending">Очікує</option>
                            <option value="confirmed">Підтверджено</option>
                            <option value="processing">Обробляється</option>
                            <option value="shipped">Відправлено</option>
                            <option value="delivered">Доставлено</option>
                            <option value="cancelled">Скасовано</option>
                          </select>

                          <button
                            onClick={() => handleDeleteOrder(qo.id, true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-b from-red-600 to-red-700 text-white shadow-[0_14px_28px_-18px_rgba(220,38,38,0.75)] hover:from-red-500 hover:to-red-700 active:translate-y-[1px] transition text-sm"
                            data-testid={`delete-quick-order-${qo.id}`}
                          >
                            <Trash2 size={16} />
                            Видалити
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {quickOrders.length === 0 && (
                <div className={`${glassCard} ${insetHighlight} p-10 text-center`}>
                  <Zap className="mx-auto text-orange-400 mb-4" size={64} />
                  <p className="text-gray-700 dark:text-gray-300">Швидких замовлень ще немає</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Коли клієнти оформлять швидкі замовлення, вони з'являться тут
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Details Modal (3D/blur) */}
        {isDetailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55">
            <div className="absolute inset-0 backdrop-blur-sm" onClick={closeDetails} />
            <div className={`relative ${glassCard} ${insetHighlight} max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/55 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Замовлення #{selectedOrder.id.substring(0, 8)}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Створено {new Date(selectedOrder.createdAt).toLocaleString('uk-UA')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('ID замовлення', selectedOrder.id)}
                    className={btnSoft}
                  >
                    <Clipboard size={16} />
                    Copy ID
                  </button>
                  <button
                    onClick={closeDetails}
                    className="p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-900/60 border border-transparent hover:border-gray-200/70 dark:hover:border-white/10 transition"
                    aria-label="Close"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Інформація про клієнта
                  </h3>
                  <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/55 dark:bg-gray-900/35 backdrop-blur-md p-4 space-y-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">Ім'я:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">Телефон:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.customerPhone}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <a
                        href={`tel:${selectedOrder.customerPhone}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-b from-green-600 to-green-700 text-white shadow-[0_14px_28px_-18px_rgba(34,197,94,0.75)] hover:from-green-500 hover:to-green-700 active:translate-y-[1px] transition text-sm"
                      >
                        <Phone size={16} />
                        Зателефонувати
                      </a>
                      <button
                        onClick={() => handleCopy('Телефон', selectedOrder.customerPhone)}
                        className={btnSoft + ' text-sm'}
                      >
                        <Clipboard size={16} />
                        Скопіювати телефон
                      </button>
                    </div>

                    {selectedOrder.customerEmail && (
                      <div className="flex justify-between gap-3 pt-1">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedOrder.customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Доставка та оплата
                  </h3>
                  <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/55 dark:bg-gray-900/35 backdrop-blur-md p-4 space-y-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">Спосіб доставки:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.deliveryMethod === 'nova_poshta' ? 'Нова Пошта' : 'Самовивіз'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">Спосіб оплати:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.paymentMethod === 'cash_on_delivery'
                          ? 'Накладений платіж'
                          : 'Оплата карткою'}
                      </span>
                    </div>
                    {selectedOrder.deliveryAddress && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Адреса:</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {selectedOrder.deliveryAddress}
                        </p>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Примітки:</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Товари
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/55 dark:bg-gray-900/35 backdrop-blur-md p-4"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {item.productImage && (
                            <div className="relative">
                              <img
                                src={process.env.REACT_APP_BACKEND_URL + item.productImage}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-2xl ring-1 ring-white/60 dark:ring-white/10 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.6)]"
                              />
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.price} грн × {item.quantity} шт
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {(item.price * item.quantity).toFixed(0)} грн
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200/70 dark:border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      Загальна сума:
                    </span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {selectedOrder.totalAmount.toFixed(0)} грн
                    </span>
                  </div>
                </div>

                {/* Quick status change inside modal (nice UX) */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Статус:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className={`${softSelect} max-w-xs`}
                  >
                    <option value="pending">Очікує</option>
                    <option value="confirmed">Підтверджено</option>
                    <option value="processing">Обробляється</option>
                    <option value="shipped">Відправлено</option>
                    <option value="delivered">Доставлено</option>
                    <option value="cancelled">Скасовано</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
