import { useState, useCallback } from 'react';
import { getUsers as apiGetUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '../models/apiModel.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchUsers = useCallback(async (page = 1, limit = 15) => {
    if (!user || user.role !== 'ADMIN') return;
    
    setLoading(true);
    try {
      const { users: fetchedUsers, totalCount } = await apiGetUsers(user.role, page, limit);
      setUsers(fetchedUsers);
      setTotalUsers(totalCount);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createUser = async (userData) => {
    try {
      await apiCreateUser(userData, user.role);
      await fetchUsers(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (username, userData) => {
    try {
      await apiUpdateUser(username, userData, user.role);
      await fetchUsers(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (username) => {
    try {
      await apiDeleteUser(username, user.role);
      await fetchUsers(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { users, totalUsers, currentPage, loading, error, fetchUsers, createUser, updateUser, deleteUser };
}
