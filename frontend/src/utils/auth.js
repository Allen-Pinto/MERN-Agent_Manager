import { jwtDecode } from 'jwt-decode';  // Named import (not default)

const TOKEN_KEY = 'token';

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // Check expiry
  } catch {
    return false;
  }
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};
