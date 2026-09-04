export const getStocks = async (query) => {
  const url = query ? `/api/stocks?q=${encodeURIComponent(query)}` : '/api/stocks';
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch stocks');
  const { data } = await response.json();
  return data;
};

export const getStockBySymbol = async (symbol) => {
  const response = await fetch(`/api/stocks/${symbol}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch stock');
  const { data } = await response.json();
  return data;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getWatchlist = async () => {
  const response = await fetch('/api/watchlist', {
    headers: { ...getAuthHeaders() },
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch watchlist');
  }
  const { data } = await response.json();
  return data;
};

export const addStock = async (stock) => {
  const response = await fetch('/api/watchlist/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    credentials: 'include',
    body: JSON.stringify(stock),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add stock');
  }
  const { data } = await response.json();
  return data;
};

export const removeStock = async (symbol) => {
  const response = await fetch(`/api/watchlist/remove/${symbol}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to remove stock');
  }
  const { data } = await response.json();
  return data;
};

export const reorderWatchlist = async (orderedSymbols) => {
  const response = await fetch('/api/watchlist/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    credentials: 'include',
    body: JSON.stringify({ orderedSymbols }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to reorder watchlist');
  }
  const { data } = await response.json();
  return data;
};
// Health check
export const getHealth = async () => {
  const response = await fetch('/api/health', { credentials: 'include' });
  if (!response.ok) throw new Error('Health check failed');
  const resData = await response.json();
  return resData.data || resData;
};

// Auth API
export const register = async (name, email, password) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const refresh = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Refresh failed');
  return data;
};

export const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Logout failed');
  return data;
};

export const me = async (accessToken) => {
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch user');
  return data.data || data;
};

export const getSignificantChanges = async () => {
  const response = await fetch('/api/watchlist/significant', {
    headers: { ...getAuthHeaders() },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch significant changes');
  const { data } = await response.json();
  return data;
};

export const getWatchlistSummary = async () => {
  const response = await fetch('/api/watchlist/summary', {
    headers: { ...getAuthHeaders() },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch watchlist summary');
  const { data } = await response.json();
  return data;
};

export const getNews = async (symbols = []) => {
  const query = Array.isArray(symbols) && symbols.length > 0 ? `?symbols=${encodeURIComponent(symbols.join(','))}` : '';
  const response = await fetch(`/api/news${query}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch news');
  const { data } = await response.json();
  return data;
};

export const simulateMarketTick = async () => {
  const response = await fetch('/api/watchlist/tick', { method: 'POST', credentials: 'include' });
  if (!response.ok) throw new Error('Failed to simulate market tick');
  return await response.json();
};

export const recordVisitSnapshot = async () => {
  const response = await fetch('/api/watchlist/snapshot', {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to record snapshot');
  return await response.json();
};
