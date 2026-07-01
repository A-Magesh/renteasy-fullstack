// src/utils/api.js — All API calls to Express backend
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Token helpers ────────────────────────────────────────────────
export const getToken    = () => localStorage.getItem('re_token');
export const setToken    = (t) => localStorage.setItem('re_token', t);
export const removeToken = () => localStorage.removeItem('re_token');

// ── Base fetcher ─────────────────────────────────────────────────
const req = async (method, path, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API error');
  return data;
};

// ── Auth API ─────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password) => req('POST', '/auth/login', { email, password }),
  register: (body)            => req('POST', '/auth/register', body),
  me:       ()                => req('GET',  '/auth/me'),
  updatePassword: (body)      => req('PUT',  '/auth/password', body),
  users:    ()                => req('GET',  '/auth/users'),
};

// ── Properties API ───────────────────────────────────────────────
export const propertyAPI = {
  list:   ()      => req('GET',    '/properties'),
  get:    (id)    => req('GET',    `/properties/${id}`),
  create: (body)  => req('POST',   '/properties', body),
  update: (id, b) => req('PUT',    `/properties/${id}`, b),
  delete: (id)    => req('DELETE', `/properties/${id}`),
  stats:  (id)    => req('GET',    `/properties/${id}/stats`),
};

// ── Rooms API ────────────────────────────────────────────────────
export const roomAPI = {
  list:   (q={}) => req('GET',    '/rooms?' + new URLSearchParams(q).toString()),
  get:    (id)   => req('GET',    `/rooms/${id}`),
  create: (b)    => req('POST',   '/rooms', b),
  update: (id,b) => req('PUT',    `/rooms/${id}`, b),
  delete: (id)   => req('DELETE', `/rooms/${id}`),
};

// ── Tenants API ──────────────────────────────────────────────────
export const tenantAPI = {
  list:       (q={})   => req('GET',    '/tenants?' + new URLSearchParams(q).toString()),
  get:        (id)     => req('GET',    `/tenants/${id}`),
  create:     (b)      => req('POST',   '/tenants', b),
  update:     (id,b)   => req('PUT',    `/tenants/${id}`, b),
  vacate:     (id,b)   => req('DELETE', `/tenants/${id}`, b),
  feedback:   (id,b)   => req('POST',   `/tenants/${id}/feedback`, b),
  docUpload:  (id,b)   => req('POST',   `/tenants/${id}/documents`, b),
};

// ── Payments API ─────────────────────────────────────────────────
export const paymentAPI = {
  list:        (q={})  => req('GET',  '/payments?' + new URLSearchParams(q).toString()),
  summary:     (q={})  => req('GET',  '/payments/summary?' + new URLSearchParams(q).toString()),
  get:         (id)    => req('GET',  `/payments/${id}`),
  create:      (b)     => req('POST', '/payments', b),
  update:      (id,b)  => req('PUT',  `/payments/${id}`, b),
  delete:      (id)    => req('DELETE',`/payments/${id}`),
  sendReminders: ()    => req('POST', '/payments/send-reminders'),
};

// ── Maintenance API ──────────────────────────────────────────────
export const maintenanceAPI = {
  list:   (q={})   => req('GET',    '/maintenance?' + new URLSearchParams(q).toString()),
  get:    (id)     => req('GET',    `/maintenance/${id}`),
  create: (b)      => req('POST',   '/maintenance', b),
  update: (id,b)   => req('PUT',    `/maintenance/${id}`, b),
  delete: (id)     => req('DELETE', `/maintenance/${id}`),
};

// ── Visitors API ─────────────────────────────────────────────────
export const visitorAPI = {
  list:     (q={}) => req('GET',  '/visitors?' + new URLSearchParams(q).toString()),
  create:   (b)    => req('POST', '/visitors', b),
  checkout: (id)   => req('PUT',  `/visitors/${id}/checkout`),
  delete:   (id)   => req('DELETE',`/visitors/${id}`),
};

// ── Expenses API ─────────────────────────────────────────────────
export const expenseAPI = {
  list:   (q={}) => req('GET',    '/expenses?' + new URLSearchParams(q).toString()),
  totals: (q={}) => req('GET',    '/expenses/totals?' + new URLSearchParams(q).toString()),
  create: (b)    => req('POST',   '/expenses', b),
  update: (id,b) => req('PUT',    `/expenses/${id}`, b),
  delete: (id)   => req('DELETE', `/expenses/${id}`),
};

// ── Dashboard API ────────────────────────────────────────────────
export const dashboardAPI = {
  summary: () => req('GET', '/dashboard'),
};

// ── Reports API ──────────────────────────────────────────────────
export const reportAPI = {
  overview:        (q={}) => req('GET', '/reports/overview?' + new URLSearchParams(q).toString()),
  monthlyRevenue:  (q={}) => req('GET', '/reports/monthly-revenue?' + new URLSearchParams(q).toString()),
  revenueByProp:   (q={}) => req('GET', '/reports/revenue-by-property?' + new URLSearchParams(q).toString()),
  pendingDues:     ()     => req('GET', '/reports/pending-dues'),
  expenseSummary:  (q={}) => req('GET', '/reports/expense-summary?' + new URLSearchParams(q).toString()),
};

// ── Audit API ────────────────────────────────────────────────────
export const auditAPI = {
  list: (q={}) => req('GET', '/audit?' + new URLSearchParams(q).toString()),
};

// ── Notifications API ─────────────────────────────────────────────
export const notifAPI = {
  list:   ()   => req('GET', '/notifications'),
  markRead:(id)=> req('PUT', `/notifications/${id}/read`),
};

// ── Health check ─────────────────────────────────────────────────
export const healthCheck = () => req('GET', '/health');

// ── Utility formatters ────────────────────────────────────────────
export const fmtINR  = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 100000) return '₹' + (n/100000).toFixed(1) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
};
export const fmtFull = (n) => '₹' + Math.round(n||0).toLocaleString('en-IN');
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
