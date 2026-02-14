import api from './api';

// Get public settings
export const getPublicSettings = async () => {
  try {
    const response = await api.get('/api/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching public settings:', error);
    throw error;
  }
};

// Get admin settings
export const getAdminSettings = async (token) => {
  try {
    const response = await api.get('/api/admin/site-settings', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
};

// Save admin settings
export const saveAdminSettings = async (settingsData, token) => {
  try {
    const response = await api.post('/api/admin/site-settings', 
      { settings_data: settingsData },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving admin settings:', error);
    throw error;
  }
};
