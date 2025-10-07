import React, { useState } from 'react';
import { login } from '../../services/api';
import { setToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import Input from '../common/Input';
import Button from '../common/Button';

const Login = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(formData);
      setToken(data.token);
      toast.success(data.message, { id: 'login-success' });
      if (onSuccess) onSuccess(data.user);
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed', { id: 'login-error' });
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
        placeholder="Password"
        icon={FiLock}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Login
      </Button>
    </form>
  );
};

export default Login;
