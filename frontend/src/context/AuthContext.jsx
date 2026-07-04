import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, getSessionUser, logoutUser } from '../models/apiModel.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Restoring session on mount

  // On app load, check if a session cookie already exists (page refresh)
  useEffect(() => {
    async function restoreSession() {
      try {
        const sessionUser = await getSessionUser();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (_) {
        // No active session — stay logged out
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const userData = await apiLogin(username, password);
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (_) {
      // Ignore errors — clear local state regardless
    } finally {
      setUser(null);
    }
  };

  // Patch local user state (e.g. after display name update)
  const updateUserProfile = (patch) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserProfile, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
