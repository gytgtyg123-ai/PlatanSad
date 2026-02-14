import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Star, Check, Trash2, Clock, CheckCircle, XCircle, MessageSquare, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const getAuthHeader = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/reviews`, {
        headers: getAuthHeader()
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Помилка завантаження відгуків');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.put(`${API_URL}/api/admin/reviews/${reviewId}/approve`, {}, {
        headers: getAuthHeader()
      });
      toast.success('Відгук схвалено');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Помилка схвалення відгуку');
    }
  };

  const rejectReview = async (reviewId) => {
    try {
      await axios.put(`${API_URL}/api/admin/reviews/${reviewId}/reject`, {}, {
        headers: getAuthHeader()
      });
      toast.success('Схвалення знято');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Помилка зняття схвалення');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/admin/reviews/${reviewId}`, {
        headers: getAuthHeader()
      });
      toast.success('Відгук видалено');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Помилка видалення відгуку');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.is_approved;
    if (filter === 'approved') return review.is_approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-emerald-600" />
              Відгуки клієнтів
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Керування відгуками та модерація
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Всього</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Очікують</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Схвалено</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          {[
            { key: 'all', label: 'Всі', count: reviews.length },
            { key: 'pending', label: 'Очікують', count: pendingCount },
            { key: 'approved', label: 'Схвалені', count: approvedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid={`filter-${tab.key}`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Немає відгуків для відображення</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border p-5 transition-all ${
                  review.is_approved
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
                }`}
                data-testid={`review-${review.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {review.author_name}
                          </p>
                          {review.author_city && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {review.author_city}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.is_approved
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {review.is_approved ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Схвалено
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            На модерації
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {review.text}
                    </p>

                    <p className="text-xs text-gray-400">
                      {formatDate(review.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!review.is_approved ? (
                      <button
                        onClick={() => approveReview(review.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                        data-testid={`approve-${review.id}`}
                      >
                        <Check className="w-4 h-4" />
                        Схвалити
                      </button>
                    ) : (
                      <button
                        onClick={() => rejectReview(review.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors"
                        data-testid={`reject-${review.id}`}
                      >
                        <XCircle className="w-4 h-4" />
                        Зняти
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                      data-testid={`delete-${review.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
