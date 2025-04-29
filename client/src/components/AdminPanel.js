import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axios';

const AdminPanel = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AdminPanel mounted with:', { 
      user, 
      token,
      isAdmin: user?.role === 'admin'
    });
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      console.log('User is not admin:', user);
      setLoading(false);
    }
  }, [user, token]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', token);
      const response = await axiosInstance.get('/admin/users');
      console.log('Users response:', response.data);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.error || 'You do not have permission to access this section');
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      console.log('Updating user role with token:', token);
      await axiosInstance.put(`/admin/users/${userId}`, {
        role: newRole
      });
      fetchUsers(); // Reload user list
    } catch (err) {
      console.error('Error updating user role:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error updating user role');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/admin/users/${userId}`);
        fetchUsers(); // Reload user list
      } catch (err) {
        console.error('Error deleting user:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Error deleting user');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-red-500">Access denied. Administrator privileges required.</div>;
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                    title="Delete user"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel; 