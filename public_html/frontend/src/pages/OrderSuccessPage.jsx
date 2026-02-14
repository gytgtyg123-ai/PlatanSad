import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ReceiptText,
  X,
  ShieldCheck,
  Leaf,
  Sparkles,
  Copy,
  Check,
  QrCode,
  PartyPopper,
} from 'lucide-react';

const DURATION_SEC = 6;

// ---------- ORDER CODE GENERATOR ----------
const generateOrderCode = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PS-${yyyy}${mm}${dd}-${random}`;
};

const safeJsonStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj ?? '');
  }
};
// ----------------------------------------

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [mounted, setMounted] = useState(false);

  // countdown
  const [count, setCount] = useState(DURATION_SEC);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const timerRef = useRef(null);

  // copy UI
  const [copied, setCopied] = useState(false);

  // support/admin
  const [showSupport, setShowSupport] = useState(false);

  // local code stored
  const [localOrderCode, setLocalOrderCode] = useState('');

  // keys
  const orderKey = useMemo(() => {
    return orderId ? `ps_order_code_${String(orderId)}` : null;
  }, [orderId]);

  const lastKey = 'ps_order_code_last';

  // Load or create order code:
  // - If orderId exists: stable code per orderKey, and ALWAYS update lastKey with this code
  // - If orderId absent: ALWAYS generate a new code and overwrite lastKey
  useEffect(() => {
    setMounted(true);

    try {
      let code = '';

      if (orderKey) {
        const existing = localStorage.getItem(orderKey);
        if (existing) {
          code = existing;
        } else {
          code = generateOrderCode();
          localStorage.setItem(orderKey, code);
        }
        // ALWAYS update "last"
        localStorage.setItem(lastKey, code);
      } else {
        // No orderId => always new "last"
        code = generateOrderCode();
        localStorage.setItem(lastKey, code);
      }

      setLocalOrderCode(code);
    } catch {
      setLocalOrderCode(generateOrderCode());
    }
  }, [orderKey]);

  // Display:
  // - If backend orderId exists, show it, else show generated code
  const displayOrderId = useMemo(() => {
    return orderId ? String(orderId) : localOrderCode;
  }, [orderId, localOrderCode]);

  const supportPayload = useMemo(() => {
    const payload = {
      brand: 'PlatanSad',
      orderId: orderId ? String(orderId) : null,
      orderCode: localOrderCode || null,
      createdAt: new Date().toISOString(),
    };
    return safeJsonStringify(payload);
  }, [orderId, localOrderCode]);

  // QR image (no libs)
  const qrUrl = useMemo(() => {
    const data = encodeURIComponent(supportPayload);
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}`;
  }, [supportPayload]);

  // Countdown
  useEffect(() => {
    if (!autoEnabled) return;

    if (count <= 0) {
      navigate('/', { replace: true });
      return;
    }

    timerRef.current = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [count, autoEnabled, navigate]);

  const cancelAuto = () => {
    setAutoEnabled(false);
    timerRef.current && clearTimeout(timerRef.current);
  };

  const goHome = () => {
    cancelAuto();
    navigate('/');
  };

  const goCatalog = () => {
    cancelAuto();
    navigate('/catalog');
  };

  const copyToClipboard = async () => {
    const text = displayOrderId || '';
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const copyPayload = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(supportPayload);
      }
    } catch {}
  };

  // Lucide icon fallback (if PartyPopper not available in your lucide version)
  const ConfettiIcon = PartyPopper || Sparkles;

  return (
    <div className="bg-gray-50">
      <style>{`
        @keyframes osFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes osPop {
          0% { transform: scale(.85); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .os-card { animation: osFade .45s ease-out both; }
        .os-badge { animation: osPop .45s ease-out .05s both; }
      `}</style>

      <div className="min-h-[100dvh] flex items-center justify-center px-3 py-4 sm:px-6 sm:py-10">
        {/* ✅ card is relative so badge can be absolute */}
        <div
          className={`relative w-full max-w-[560px] bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden ${
            mounted ? 'os-card' : 'opacity-0'
          }`}
        >
          {/* ✅ TOP-RIGHT CONFETTI BADGE (Lucide SVG) */}
          <div
            className="os-badge absolute -top-3 -right-3 sm:-top-4 sm:-right-4
                       w-10 h-10 sm:w-12 sm:h-12
                       rounded-full flex items-center justify-center
                       bg-gradient-to-br from-yellow-200 to-amber-400
                       shadow-lg ring-4 ring-white"
            aria-hidden="true"
          >
            <ConfettiIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
          </div>

          {/* TOP */}
          <div className="p-4 sm:p-7">
            {/* Professional badge */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-800">
                    Замовлення прийнято
                  </span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="text-[11px] sm:text-xs text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Leaf className="w-3.5 h-3.5" />
                  Ми вже готуємо ваші рослини до відправки
                </div>
              </div>
            </div>

            <h1 className="mt-4 text-[20px] sm:text-2xl font-extrabold text-gray-900 leading-snug">
              Дякуємо за замовлення!
            </h1>

            <p className="mt-2 text-[13px] sm:text-base text-gray-600 leading-relaxed">
              Наш менеджер зв’яжеться з вами найближчим часом для підтвердження деталей доставки.
            </p>

            {/* Order ID + copy */}
            <div className="mt-3 flex items-stretch gap-2">
              <div className="flex-1 inline-flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-3 py-2 max-w-full min-w-0">
                <ReceiptText className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-[11px] sm:text-sm text-gray-600 shrink-0">
                  Номер:
                </span>
                <span className="text-[11px] sm:text-sm font-bold text-gray-900 break-all min-w-0">
                  {displayOrderId || '...'}
                </span>
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition
                           focus:outline-none focus:ring-4 focus:ring-gray-200"
                aria-label="Скопіювати номер замовлення"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-[12px] font-extrabold text-emerald-700">Скопійовано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-700" />
                    <span className="text-[12px] font-extrabold text-gray-900">Копіювати</span>
                  </>
                )}
              </button>
            </div>

            {/* Countdown + cancel */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-[12px] sm:text-sm text-gray-600">
                {autoEnabled ? (
                  <>
                    Перехід на головну через{' '}
                    <span className="font-extrabold text-gray-900">
                      {Math.max(0, count)}
                    </span>{' '}
                    сек
                  </>
                ) : (
                  <span className="font-medium text-gray-700">Автоперехід вимкнено</span>
                )}
              </div>

              <button
                onClick={cancelAuto}
                disabled={!autoEnabled}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-bold transition
                  ${
                    autoEnabled
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <X className="w-4 h-4" />
                Скасувати
              </button>
            </div>

            {/* Support/Admin QR toggle */}
            <button
              type="button"
              onClick={() => setShowSupport((v) => !v)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 py-3 font-extrabold text-[13px] sm:text-sm text-gray-900
                         active:scale-[0.99] transition focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              <QrCode className="w-5 h-5" />
              {showSupport ? 'Приховати QR для підтримки' : 'Показати QR для підтримки / admin'}
            </button>

            {showSupport && (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                  <div className="rounded-2xl bg-white border border-gray-200 p-2">
                    <img
                      src={qrUrl}
                      alt="QR код замовлення для підтримки"
                      className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-gray-900">
                      Для підтримки / admin
                    </div>
                    <div className="mt-1 text-xs text-gray-600 leading-relaxed">
                      QR містить службову інформацію (ID/код замовлення + час створення). “Останнє замовлення” в
                      localStorage оновлюється автоматично.
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] font-bold text-gray-700 mb-1">
                        Payload:
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-2 text-[10px] text-gray-700 break-all">
                        {supportPayload}
                      </div>

                      <button
                        type="button"
                        onClick={copyPayload}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition
                                   focus:outline-none focus:ring-4 focus:ring-gray-200 text-[12px] font-extrabold text-gray-900"
                      >
                        <Copy className="w-4 h-4" />
                        Скопіювати payload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="border-t border-gray-100 p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={goHome}
                className="w-full rounded-2xl bg-emerald-600 text-white py-3.5 font-extrabold
                           text-[14px] sm:text-base hover:bg-emerald-700 active:scale-[0.98] transition
                           focus:outline-none focus:ring-4 focus:ring-emerald-200"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  На головну
                </span>
              </button>

              <button
                onClick={goCatalog}
                className="w-full rounded-2xl bg-white border border-gray-200 text-gray-900 py-3.5 font-extrabold
                           text-[14px] sm:text-base hover:bg-gray-50 active:scale-[0.98] transition
                           focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Продовжити покупки
                </span>
              </button>
            </div>

            <div className="mt-3 text-center text-[11px] sm:text-xs text-gray-500">
              “Останнє замовлення” в localStorage оновлюється автоматично
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
