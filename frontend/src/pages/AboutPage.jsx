import React, { useState, useEffect } from 'react';
import { TreePine, Award, Users, Star, Send, MapPin, Quote, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AboutPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    author_city: '',
    rating: 5,
    text: ''
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!formData.author_name.trim()) {
      toast.error("Введіть ваше ім'я");
      return;
    }
    if (formData.text.trim().length < 10) {
      toast.error('Відгук повинен містити мінімум 10 символів');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/reviews`, formData);
      toast.success('Дякуємо за відгук! Він з\'явиться після модерації.');
      setFormData({ author_name: '', author_city: '', rating: 5, text: '' });
      setShowForm(false);
    } catch (error) {
      toast.error('Помилка відправки відгуку');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { icon: <TreePine className="w-8 h-8" />, value: '20+', label: 'Років досвіду' },
    { icon: <Award className="w-8 h-8" />, value: '1000+', label: 'Нівакі сформовано' },
    { icon: <Users className="w-8 h-8" />, value: '500+', label: 'Задоволених клієнтів' },
  ];

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Compact Hero */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="about-title">
            Про Нас
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Ми — PlatanSad, розсадник декоративних і хвойних рослин з багаторічним досвідом.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-4 text-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-green-500 mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About Content - Compact */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Спеціалізуємося на вирощуванні туй, хвойних та формованих дерев (нівакі), приділяючи увагу кожній рослині — від посадки до сформованої крони.
              Ми допомагаємо створювати сади, які виглядають красиво сьогодні і тішать роками.
            </p>
            <p className="text-gray-600 leading-relaxed">
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Якість</h3>
              <p className="text-sm text-gray-600">Вирощуємо правильно</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Підтримка</h3>
              <p className="text-sm text-gray-600">Завжди на зв'язку</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Досвід</h3>
              <p className="text-sm text-gray-600">20+ років роботи</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Асортимент</h3>
              <p className="text-sm text-gray-600">100+ видів рослин</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Відгуки клієнтів</h2>
              <p className="text-gray-500">Що кажуть про нас наші клієнти</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-600/30"
              data-testid="write-review-btn"
            >
              <Send className="w-4 h-4" />
              Написати відгук
            </button>
          </div>

          {/* Review Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Залиште ваш відгук</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ваше ім'я <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      placeholder="Олександр"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      data-testid="review-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Місто
                    </label>
                    <input
                      type="text"
                      value={formData.author_city}
                      onChange={(e) => setFormData({ ...formData, author_city: e.target.value })}
                      placeholder="Київ"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      data-testid="review-city-input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Оцінка
                  </label>
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ваш відгук <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Розкажіть про ваш досвід..."
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    data-testid="review-text-input"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    data-testid="submit-review-btn"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Відправка...' : 'Відправити'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Grid */}
          {loadingReviews ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 group"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                      {review.author_city && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {review.author_city}
                        </p>
                      )}
                    </div>
                    <Quote className="w-8 h-8 text-green-100 group-hover:text-green-200 transition-colors" />
                  </div>
                  
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed line-clamp-4">
                    {review.text}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Поки немає відгуків</p>
              <p className="text-sm text-gray-400">Станьте першим, хто залишить відгук!</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AboutPage;