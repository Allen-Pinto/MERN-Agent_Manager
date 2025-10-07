import React, { useState } from 'react';
import { register } from '../../services/api';
import { setToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const Register = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', { id: 'password-mismatch' });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters', { id: 'password-length' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await register({
        email: formData.email,
        password: formData.password
      });
      setToken(data.token);
      toast.success(data.message || 'Registration successful!', { id: 'register-success' });
      if (onSuccess) onSuccess(data.user);
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed', { id: 'register-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        placeholder="Email"
        icon={FiMail}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        type="password"
        placeholder="Password (min 6 characters)"
        icon={FiLock}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        icon={FiLock}
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Register
      </Button>
    </form>
  );
};

export default Register;