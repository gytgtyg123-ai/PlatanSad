import api from './api';

export const liqpayApi = {
  // Create LiqPay checkout session
  createCheckout: async (orderId, amount, description, resultUrl, serverUrl) => {
    const params = new URLSearchParams({
      order_id: orderId,
      amount: amount.toString(),
      description: description || 'Оплата замовлення PlatanSad',
    });
    
    if (resultUrl) params.append('result_url', resultUrl);
    if (serverUrl) params.append('server_url', serverUrl);
    
    const response = await api.get(`/api/liqpay/create-checkout?${params.toString()}`);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/api/liqpay/status/${orderId}`);
    return response.data;
  },
};
