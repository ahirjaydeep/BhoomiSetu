"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { app, auth, db } from '@/lib/firebase/client';
import { api } from '@/lib/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCitizenParcel, setActiveCitizenParcel] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
        if (data && data.length > 0) {
          // Default to Central Ministry / DoLR Officer
          setCurrentUser(data[0]);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const switchUser = (userId) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const loginAsCitizen = (citizenData, matchedParcel = null) => {
    const citizenUser = {
      id: citizenData.id || `CITIZEN-${Date.now().toString().slice(-4)}`,
      name: citizenData.name || 'Project-Affected Landowner',
      role: 'CITIZEN_LANDOWNER',
      roleTitle: 'Landowner / PAF Beneficiary',
      designation: 'Project-Affected Landowner (PAF)',
      department: 'Citizen / Farmer Portal',
      jurisdiction: citizenData.jurisdiction || (matchedParcel ? `Khasra ${matchedParcel.khasraNo}, ${matchedParcel.village}` : 'Punjab / National'),
      phone: citizenData.phone || '+91 98721-33412',
      aadhaarMasked: citizenData.aadhaarMasked || (citizenData.aadhaar ? `XXXX-XXXX-${citizenData.aadhaar.slice(-4)}` : 'XXXX-XXXX-8421'),
      khasraNo: citizenData.khasraNo || matchedParcel?.khasraNo || '142/3/1',
      avatar: citizenData.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      permissions: ['VIEW_OWN_KHASRA', 'CHECK_DBT_PAYOUT', 'FILE_SEC15_OBJECTION', 'DOWNLOAD_FORM16_CERTIFICATE']
    };
    setCurrentUser(citizenUser);
    if (matchedParcel) {
      setActiveCitizenParcel(matchedParcel);
    }
    return citizenUser;
  };

  const hasPermission = (permissionKey) => {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permissionKey);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        switchUser,
        loginAsCitizen,
        activeCitizenParcel,
        setActiveCitizenParcel,
        hasPermission,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

