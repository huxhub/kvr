import { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function useUserAdmin() {
  const { users, totalUsers, currentPage, fetchUsers, createUser, updateUser, deleteUser, loading } = useUsers();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', username: '', role: '', branch: '', email: '', password: '' });
  const [originalUsername, setOriginalUsername] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isReadOnly = user?.role !== 'ADMIN';
  
  useEffect(() => {
    fetchUsers(1, 15);
  }, [fetchUsers]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!originalUsername;
    
    const result = isEdit ? await updateUser(originalUsername, formData) : await createUser(formData);
    
    if (result.success) {
      showToast('Success', isEdit ? 'User updated successfully' : 'User created successfully');
      setFormData({ name: '', username: '', role: '', branch: '', email: '', password: '' });
      setOriginalUsername('');
      setIsDrawerOpen(false);
    } else {
      showToast('Error', result.error, 'error');
    }
  };

  const handleDelete = async (username) => {
    if (window.confirm(`Delete user ${username}?`)) {
      const result = await deleteUser(username);
      if (result.success) showToast('Success', 'User deleted');
      else showToast('Error', result.error, 'error');
    }
  };

  const handleEdit = (userToEdit) => {
    setFormData({ ...userToEdit, email: userToEdit.email || '', password: '' });
    setOriginalUsername(userToEdit.username);
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ name: '', username: '', role: '', branch: '', email: '', password: '' });
    setOriginalUsername('');
    setIsDrawerOpen(true);
  };

  return {
    users,
    totalUsers,
    currentPage,
    fetchUsers,
    loading,
    formData,
    setFormData,
    originalUsername,
    isDrawerOpen,
    setIsDrawerOpen,
    isReadOnly,
    handleChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleAddNew
  };
}
