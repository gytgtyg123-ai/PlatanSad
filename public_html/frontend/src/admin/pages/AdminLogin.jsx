import React, { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Lock, User, Leaf, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const AdminLogin = () => {
  const { login } = useAdminAuth();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Новий фон - розсадник рослин
  const bgUrl = useMemo(
    () => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    []
  );

  useEffect(() => {
    setMounted(true);

    const onMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setParallax({
        x: clamp(dx * 15, -15, 15),
        y: clamp(dy * 15, -15, 15),
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(credentials.username, credentials.password);
    if (!result.success) toast.error(result.error || 'Помилка входу');

    setLoading(false);
  };

  const bgStyle = {
    backgroundImage: `url(${bgUrl})`,
    transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.08)`,
  };

  const cardStyle = {
    transform: `translate3d(${-parallax.x * 0.4}px, ${-parallax.y * 0.4}px, 0)`,
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 bg-center bg-cover transition-transform duration-300 ease-out will-change-transform"
        style={bgStyle}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-black/70 to-green-900/80" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            <Leaf
              className="text-green-400/20"
              size={12 + Math.random() * 20}
              style={{ transform: `rotate(${Math.random() * 360}deg)` }}
            />
          </div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div
        className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px] animate-pulse-slow"
        style={{ transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)` }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-green-400/15 blur-[80px] animate-pulse-slow"
        style={{ 
          transform: `translate3d(${-parallax.x * 0.6}px, ${-parallax.y * 0.6}px, 0)`,
          animationDelay: '1s'
        }}
      />

      {/* Login Card */}
      <div className="relative max-w-md w-full z-10">
        <div
          className={`
            relative overflow-hidden
            bg-white/10 backdrop-blur-2xl rounded-3xl
            border border-white/20
            shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]
            p-8 md:p-10
            transition-all duration-700 ease-out will-change-transform
            ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
          `}
          style={cardStyle}
        >
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10 pointer-events-none" />
          
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Logo */}
          <div className="text-center mb-8 relative">
            <div
              className={`
                inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5
                bg-gradient-to-br from-emerald-500 to-green-600
                shadow-lg shadow-emerald-500/30
                transition-all duration-700 ease-out
                ${mounted ? 'scale-100 rotate-0' : 'scale-75 rotate-12'}
              `}
            >
              <Leaf className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              PlatanSad
            </h1>
            <div className="flex items-center justify-center gap-2 text-emerald-300/80">
              <Sparkles size={16} />
              <span className="text-sm font-medium">Адмін Панель</span>
              <Sparkles size={16} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="group">
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Логін
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-400 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="
                    w-full pl-12 pr-4 py-4 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/30
                    outline-none
                    focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                    transition-all duration-300
                  "
                  placeholder="admin"
                  required
                  autoComplete="username"
                  data-testid="admin-username-input"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-400 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="
                    w-full pl-12 pr-4 py-4 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/30
                    outline-none
                    focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                    transition-all duration-300
                  "
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                relative w-full overflow-hidden rounded-xl
                bg-gradient-to-r from-emerald-500 to-green-600
                hover:from-emerald-400 hover:to-green-500
                text-white font-bold py-4 px-6
                shadow-lg shadow-emerald-500/30
                hover:shadow-xl hover:shadow-emerald-500/40
                hover:-translate-y-0.5
                active:translate-y-0
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                transition-all duration-300
                group
              "
              data-testid="admin-login-btn"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 overflow-hidden">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </span>
              
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Вхід...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Увійти в систему
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Bottom decoration */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              🌿 ПРИЄМНОГО КОРИСТУВАННЯ 🌿
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.6; }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;