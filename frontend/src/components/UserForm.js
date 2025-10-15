import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './UserForm.css';

const UserForm = ({ user, onSave, onCancel, syncEnabled = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || ''
      });
    } else {
      setFormData({
        name: '',
        age: ''
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 0 || formData.age > 150) {
      newErrors.age = 'Age must be a number between 0 and 150';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        age: parseInt(formData.age)
      };

      if (user) {
        // Update existing user
        await userAPI.updateUser(user._id, userData, syncEnabled);
      } else {
        // Create new user
        await userAPI.createUser(userData, syncEnabled);
      }
      
      onSave && onSave();
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ submit: 'Failed to save user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-container">
      <h2>{user ? 'Edit User' : 'Create New User'}</h2>
      
      <div className="sync-status-indicator">
        <span className={`sync-badge ${syncEnabled ? 'sync-on' : 'sync-off'}`}>
          {syncEnabled ? '🔄 Sync ON - Will sync to MongoDB' : '💾 Sync OFF - Local storage only'}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Enter user name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? 'error' : ''}
            placeholder="Enter user age"
            min="0"
            max="150"
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
