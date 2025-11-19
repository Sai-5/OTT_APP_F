import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import host from '../../api';
import Header from '../../components/header/Header';
import './style.scss';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('jwtToken') || document.cookie.split('; ').find(row => row.startsWith('jwtToken='))?.split('=')[1];
      if (!token) return;
      
      const response = await axios.get(`${host}/api/auth/users`, {
        headers: { 'auth-token': token }
      });
      
      if (response.data.status) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getFilteredAndSortedUsers = () => {
    let filteredUsers = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(
        user => user.username.toLowerCase().includes(term) || 
                user.email.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filterRole);
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredUsers;
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken') || document.cookie.split('; ').find(row => row.startsWith('jwtToken='))?.split('=')[1];
      if (!token) return;

      const response = await axios.delete(`${host}/api/auth/users/${userId}`, {
        headers: { 'auth-token': token }
      });

      if (response.data.status) {
        alert(response.data.msg);
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId)); // Remove from list immediately
      } else {
        alert(response.data.msg || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response && error.response.status === 404) {
        alert(error.response.data.msg || 'User not found');
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId)); // Remove from list if not found
      } else {
        alert('Error deleting user');
      }
    }
  };

  const displayUsers = getFilteredAndSortedUsers();

  return (
    <div className="admin-container">
      <Header />
      <div className="user-management">
        <div className="user-management__filters">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-group">
                  <label>Role:</label>
                  <select 
                    value={filterRole}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="role-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('username')} className="sortable">
                  Username {renderSortIcon('username')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {renderSortIcon('email')}
                </th>
                <th onClick={() => handleSort('role')} className="sortable">
                  Role {renderSortIcon('role')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.length > 0 ? (
                displayUsers.map(user => (
                  <tr key={user._id} className={user.role}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-icon" title="Edit User">
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete User"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-results">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <button className="btn" disabled>Previous</button>
          <span>Page 1 of 1</span>
          <button className="btn" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
