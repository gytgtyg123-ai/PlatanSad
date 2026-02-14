import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllOrders } from '../admin/api/adminApi';

// Генеруємо приємний звук сповіщення через Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Створюємо приємну мелодію з трьох нот
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - мажорний акорд
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Плавне наростання та затухання для приємного звучання
      const startTime = audioContext.currentTime + (index * 0.15);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
    
    // Додатковий "дзвіночок" для приємності
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime); // C6
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.8);
    }, 450);
    
  } catch (error) {
    console.log('Audio not available:', error);
  }
};

// Ключ для зберігання ID переглянутих замовлень в localStorage
const VIEWED_ORDERS_KEY = 'platansad_viewed_orders';

const getViewedOrders = () => {
  try {
    const stored = localStorage.getItem(VIEWED_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const markOrderAsViewed = (orderId) => {
  try {
    const viewed = getViewedOrders();
    if (!viewed.includes(orderId)) {
      viewed.push(orderId);
      // Зберігаємо тільки останні 100 ID
      const trimmed = viewed.slice(-100);
      localStorage.setItem(VIEWED_ORDERS_KEY, JSON.stringify(trimmed));
    }
  } catch (e) {
    console.error('Error saving viewed order:', e);
  }
};

export const useNewOrderNotification = (pollInterval = 60000) => {
  const [newOrder, setNewOrder] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const lastOrdersRef = useRef([]);
  const isFirstLoadRef = useRef(true);
  const hasPlayedInitialSound = useRef(false);

  const checkNewOrders = useCallback(async () => {
    try {
      const orders = await getAllOrders();
      const viewedOrders = getViewedOrders();
      
      // Знаходимо замовлення зі статусом pending які ще не переглянуті
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const unseenPendingOrders = pendingOrders.filter(o => !viewedOrders.includes(o.id));
      
      setPendingOrdersCount(pendingOrders.length);
      
      if (isFirstLoadRef.current) {
        // Перший завантаження - якщо є непереглянуті pending замовлення, показуємо сповіщення
        lastOrdersRef.current = orders.map(o => o.id);
        isFirstLoadRef.current = false;
        
        if (unseenPendingOrders.length > 0 && !hasPlayedInitialSound.current) {
          const latestPending = unseenPendingOrders[0];
          setNewOrder(latestPending);
          setShowPopup(true);
          playNotificationSound();
          hasPlayedInitialSound.current = true;
          
          setTimeout(() => {
            setShowPopup(false);
          }, 10000);
        }
        return;
      }
      
      // Перевіряємо чи є нові замовлення (після першого завантаження)
      const currentIds = orders.map(o => o.id);
      const newOrders = orders.filter(o => !lastOrdersRef.current.includes(o.id));
      
      if (newOrders.length > 0) {
        // Є нове замовлення!
        const latestOrder = newOrders[0];
        setNewOrder(latestOrder);
        setShowPopup(true);
        playNotificationSound();
        
        setTimeout(() => {
          setShowPopup(false);
        }, 10000);
      }
      
      lastOrdersRef.current = currentIds;
    } catch (error) {
      console.error('Error checking new orders:', error);
    }
  }, []);

  useEffect(() => {
    // Перша перевірка
    checkNewOrders();
    
    // Polling кожну хвилину
    const interval = setInterval(checkNewOrders, pollInterval);
    
    return () => clearInterval(interval);
  }, [checkNewOrders, pollInterval]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    // Позначаємо замовлення як переглянуте при закритті попапу
    if (newOrder) {
      markOrderAsViewed(newOrder.id);
    }
  }, [newOrder]);

  return { newOrder, showPopup, closePopup, pendingOrdersCount };
};

export default useNewOrderNotification;
