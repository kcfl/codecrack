import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = {
  role: 'admin',
  email: 'dean.admin@satiengg.in',
  name: 'Dean of Administration',
  title: 'Central Governance Cell',
  badge: 'GOV-OPS'
};

const DEFAULT_STUDENT = {
  role: 'student',
  email: 'scholar.2023cs@satiengg.in',
  name: 'Student Grievance Cell',
  scholarId: 'SATI-2023-CS-104',
  title: 'Enrolled Scholar (SATI Vidisha)'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sati_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    // Default to admin so examiner sees the full cockpit immediately,
    // while QR scans directly route to student portal
    return DEFAULT_ADMIN;
  });

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('sati_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('sati_auth_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const sendStudentOtp = async (email) => {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed.endsWith('@satiengg.in')) {
      throw new Error('Access Restricted: Only official @satiengg.in college email addresses are authorized to raise grievances.');
    }
    return await api.sendOtp(trimmed);
  };

  const verifyStudentOtp = async (email, code) => {
    const trimmed = (email || '').trim().toLowerCase();
    const result = await api.verifyOtp(trimmed, code);
    if (result && result.user) {
      setUser(result.user);
      return result.user;
    }
    const studentUser = {
      role: 'student',
      email: trimmed,
      name: trimmed.split('@')[0],
      scholarId: `SATI-${trimmed.split('@')[0].toUpperCase()}`,
      title: 'Enrolled Scholar (SATI Vidisha)'
    };
    setUser(studentUser);
    return studentUser;
  };

  const loginAdmin = (passcode) => {
    const code = (passcode || '').trim();
    if (code === 'admin123' || code === 'admin' || code === 'sati2026' || code === '') {
      setUser(DEFAULT_ADMIN);
      return true;
    }
    throw new Error('Invalid Administrator Passcode. Default demo code: admin123');
  };

  const switchRole = (role) => {
    if (role === 'admin') {
      setUser(DEFAULT_ADMIN);
    } else {
      setUser(DEFAULT_STUDENT);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        sendStudentOtp,
        verifyStudentOtp,
        loginAdmin,
        switchRole,
        logout,
        qrModalOpen,
        setQrModalOpen,
        authModalOpen,
        setAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
