import api from './api';

const persistSession = (data) => {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  persistSession(data);
  return data.user;
};

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  persistSession(data);
  return data.user;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/update-profile', payload);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const changePassword = async (payload) => {
  const { data } = await api.put('/auth/change-password', payload);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.put(`/auth/reset-password/${token}`, { password });
  persistSession(data);
  return data.user;
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};
