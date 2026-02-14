import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  getOrdersStats,
  getOrdersChart,
  getOrdersByStatus,
  getTopCustomers
} from '../api/adminApi';
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const AdminOrdersStats = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState(7);
  const [errors, setErrors] = useState([]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const results = await Promise.allSettled([
        getOrdersStats(),
        getOrdersChart(chartPeriod),
        getOrdersByStatus(),
        getTopCustomers(10)
      ]);

      const [statsRes, chartRes, statusRes, customersRes] = results;

      const newErrors = [];

      if (statsRes.status === 'fulfilled') setStats(statsRes.value || null);
      else {
        console.error('getOrdersStats error:', statsRes.reason);
        setStats(null);
        newErrors.push('Не вдалося завантажити загальні показники.');
      }

      if (chartRes.status === 'fulfilled') setChartData(Array.isArray(chartRes.value) ? chartRes.value : []);
      else {
        console.error('getOrdersChart error:', chartRes.reason);
        setChartData([]);
        newErrors.push('Не вдалося завантажити графік.');
      }

      if (statusRes.status === 'fulfilled') setStatusData(Array.isArray(statusRes.value) ? statusRes.value : []);
      else {
        console.error('getOrdersByStatus error:', statusRes.reason);
        setStatusData([]);
        newErrors.push('Не вдалося завантажити розподіл статусів.');
      }

      if (customersRes.status === 'fulfilled') setTopCustomers(Array.isArray(customersRes.value) ? customersRes.value : []);
      else {
        console.error('getTopCustomers error:', customersRes.reason);
        setTopCustomers([]);
        newErrors.push('Не вдалося завантажити топ клієнтів.');
      }

      if (newErrors.length) {
        setErrors(newErrors);
        toast.error('Статистика завантажилась частково.');
      }
    } catch (e) {
      console.error(e);
      setErrors(['Невідома помилка завантаження статистики.']);
      toast.error('Помилка завантаження статистики');
      setStats(null);
      setChartData([]);
      setStatusData([]);
      setTopCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [chartPeriod]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const statCards = useMemo(() => {
    const s = stats || {};
    return [
      { title: 'Всього замовлень', value: safeNum(s.totalOrders), icon: ShoppingCart, bg: 'bg-blue-100 dark:bg-blue-900/30', tc: 'text-blue-600 dark:text-blue-400' },
      { title: 'Виконано', value: safeNum(s.completedOrders), icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/30', tc: 'text-green-600 dark:text-green-400' },
      { title: 'В обробці', value: safeNum(s.pendingOrders), icon: Clock, bg: 'bg-orange-100 dark:bg-orange-900/30', tc: 'text-orange-600 dark:text-orange-400' },
      { title: 'Скасовано', value: safeNum(s.cancelledOrders), icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', tc: 'text-red-600 dark:text-red-400' },
      { title: 'Загальний дохід', value: `${safeNum(s.totalRevenue).toFixed(0)} грн`, icon: DollarSign, bg: 'bg-purple-100 dark:bg-purple-900/30', tc: 'text-purple-600 dark:text-purple-400' },
      { title: 'Середній чек', value: `${safeNum(s.averageOrderValue).toFixed(0)} грн`, icon: TrendingUp, bg: 'bg-indigo-100 dark:bg-indigo-900/30', tc: 'text-indigo-600 dark:text-indigo-400' },
      { title: 'Замовлень сьогодні', value: safeNum(s.todayOrders), icon: Calendar, bg: 'bg-cyan-100 dark:bg-cyan-900/30', tc: 'text-cyan-600 dark:text-cyan-400' },
      { title: 'Дохід сьогодні', value: `${safeNum(s.todayRevenue).toFixed(0)} грн`, icon: DollarSign, bg: 'bg-teal-100 dark:bg-teal-900/30', tc: 'text-teal-600 dark:text-teal-400' }
    ];
  }, [stats]);

  const statusColors = useMemo(() => ({
    pending: { bg: 'bg-yellow-500', label: 'Очікує' },
    confirmed: { bg: 'bg-blue-500', label: 'Підтверджено' },
    processing: { bg: 'bg-purple-500', label: 'Обробляється' },
    shipped: { bg: 'bg-indigo-500', label: 'Відправлено' },
    delivered: { bg: 'bg-green-500', label: 'Доставлено' },
    cancelled: { bg: 'bg-red-500', label: 'Скасовано' }
  }), []);

  const maxOrders = useMemo(() => {
    const m = Math.max(...(chartData || []).map(d => safeNum(d.orders)), 0);
    return m > 0 ? m : 1;
  }, [chartData]);

  const hasAnyData = useMemo(() => {
    return Boolean(stats) || chartData.length > 0 || statusData.length > 0 || topCustomers.length > 0;
  }, [stats, chartData, statusData, topCustomers]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Статистика замовлень</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Детальна аналітика та звіти по замовленнях</p>
          </div>

          <button
            onClick={loadAllData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <RefreshCcw size={18} />
            Оновити
          </button>
        </div>

        {errors.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-700 dark:text-yellow-300 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Є проблеми з завантаженням статистики
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-yellow-800/90 dark:text-yellow-200/90 space-y-1">
                  {errors.map((e, idx) => <li key={idx}>{e}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
          </div>
        )}

        {!loading && !hasAnyData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Дані статистики відсутні або API не відповідає.
            </p>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{s.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{s.value}</p>
                      </div>
                      <div className={`${s.bg} p-3 rounded-lg`}>
                        <Icon className={s.tc} size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Динаміка замовлень</h2>
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={7}>7 днів</option>
                    <option value={14}>14 днів</option>
                    <option value={30}>30 днів</option>
                  </select>
                </div>

                {chartData.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">Немає даних для графіка.</div>
                ) : (
                  <div className="space-y-4">
                    {chartData.map((item, idx) => {
                      const orders = safeNum(item.orders);
                      const revenue = safeNum(item.revenue);
                      const label = item.date
                        ? new Date(item.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
                        : `День ${idx + 1}`;
                      const percentage = (orders / maxOrders) * 100;

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{orders} зам.</span>
                              <span className="text-sm text-green-600 dark:text-green-400">{revenue.toFixed(0)} грн</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Розподіл за статусами</h2>

                {statusData.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">Немає даних по статусах.</div>
                ) : (
                  <div className="space-y-4">
                    {statusData.map((item, idx) => {
                      const info = statusColors[item.status];
                      const count = safeNum(item.count);
                      const perc = safeNum(item.percentage);
                      if (!info || count === 0) return null;

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{info.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{perc.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className={`${info.bg} h-3 rounded-full transition-all`} style={{ width: `${Math.max(0, Math.min(100, perc))}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-green-600 dark:text-green-400" size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Топ клієнтів</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ім'я</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Телефон</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Замовлень</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Всього витрачено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((c, idx) => (
                      <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{c.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{c.phone}</td>
                        <td className="py-4 px-4 text-sm text-right font-medium text-gray-900 dark:text-white">{safeNum(c.totalOrders)}</td>
                        <td className="py-4 px-4 text-sm text-right font-bold text-green-600 dark:text-green-400">{safeNum(c.totalSpent).toFixed(0)} грн</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {topCustomers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">Поки що немає даних про клієнтів</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersStats;

