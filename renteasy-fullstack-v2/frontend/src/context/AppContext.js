// src/context/AppContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_PROPERTIES, INITIAL_AUDIT, INITIAL_TENANTS_ALL } from '../data/mockData';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [page, setPage] = useState('welcome');
  const [selectedPropId, setSelectedPropId] = useState(null);
  const [adminSection, setAdminSection] = useState('overview');
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT);
  const [allTenants, setAllTenants] = useState(INITIAL_TENANTS_ALL);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, data }
  const [darkMode] = useState(true); // always dark for this design

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addAudit = useCallback((action, detail, icon = '📋') => {
    setAuditLog(prev => [{
      id: Date.now(), time: 'Just now', action, detail, icon, type: 'general'
    }, ...prev].slice(0, 50));
  }, []);

  const addProperty = useCallback((propData) => {
    const newProp = {
      ...propData,
      id: Date.now(),
      rooms: [], tenants: [], maintenance: [], payments: [], expenses: [],
      monthlyRevenue: [0,0,0,0,0,0],
      occupied: 0, vacant: parseInt(propData.totalUnits)||0,
      maintenance_count: 0, pendingDues: 0,
      monthlyIncome: 0,
    };
    setProperties(prev => [...prev, newProp]);
    addAudit('Property created', `${propData.name} added`, '🏢');
    notify(`Property "${propData.name}" added successfully!`);
  }, [addAudit, notify]);

  const updateProperty = useCallback((id, updates) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addRoom = useCallback((propId, roomData) => {
    setProperties(prev => prev.map(p => {
      if (p.id !== propId) return p;
      const room = { ...roomData, id: Date.now() };
      const newVacant = (p.vacant || 0) + (room.status === 'Vacant' ? 1 : 0);
      return { ...p, rooms: [...(p.rooms||[]), room], totalUnits: (p.totalUnits||0)+1, vacant: newVacant };
    }));
    addAudit('Room added', `Unit ${roomData.unit} added`, '🚪');
    notify('Room added successfully!');
  }, [addAudit, notify]);

  const addTenant = useCallback((propId, tenantData) => {
    const t = { ...tenantData, id: Date.now(), paidThisMonth: false };
    setProperties(prev => prev.map(p => {
      if (p.id !== propId) return p;
      const rooms = (p.rooms||[]).map(r => r.unit === tenantData.unit ? { ...r, status: 'Occupied', tenant: tenantData.name } : r);
      return { ...p, tenants: [...(p.tenants||[]), t], occupied: (p.occupied||0)+1, vacant: Math.max(0,(p.vacant||0)-1), rooms };
    }));
    setAllTenants(prev => [...prev, { ...t, property: properties.find(p=>p.id===propId)?.name }]);
    addAudit('Tenant added', `${tenantData.name} → ${tenantData.unit}`, '👤');
    notify(`${tenantData.name} onboarded!`);
  }, [addAudit, notify, properties]);

  const recordPayment = useCallback((propId, paymentData) => {
    setProperties(prev => prev.map(p => {
      if (p.id !== propId) return p;
      const payment = { ...paymentData, id: Date.now(), date: new Date().toISOString().slice(0,10), txnId: 'TXN'+Math.random().toString(36).substr(2,8).toUpperCase() };
      const tenants = (p.tenants||[]).map(t => t.id === paymentData.tenantId ? { ...t, paidThisMonth: true } : t);
      return { ...p, payments: [...(p.payments||[]), payment], tenants };
    }));
    addAudit('Rent paid', `₹${paymentData.amount?.toLocaleString('en-IN')} via ${paymentData.method}`, '💳');
    notify('Payment recorded! Receipt generated.');
  }, [addAudit, notify]);

  const openProperty = useCallback((id) => {
    setSelectedPropId(id);
    setPage('property');
  }, []);

  const value = {
    page, setPage, selectedPropId, openProperty,
    adminSection, setAdminSection,
    properties, addProperty, updateProperty,
    addRoom, addTenant, recordPayment,
    auditLog, allTenants,
    toast, notify,
    modal, setModal,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
