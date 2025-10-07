import React, { useState, useEffect } from 'react';
import Input from '../common/Input';  
import Button from '../common/Button';
import { createAgent, updateAgent } from '../../services/api';
import { toast } from 'react-toastify';

// Popular country codes
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
];

const AgentForm = ({ agent = null, onSuccess, onCancel, loading: propLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91', // Default to India
    mobile: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(propLoading);

  // Pre-fill for edit mode
  useEffect(() => {
    if (agent) {
      console.log('Editing agent:', agent);
      
      // Parse existing mobile number to split country code
      let countryCode = '+91';
      let mobile = agent.mobile || '';
      
      // Try to extract country code from existing mobile
      for (const cc of countryCodes) {
        if (mobile.startsWith(cc.code)) {
          countryCode = cc.code;
          mobile = mobile.substring(cc.code.length);
          break;
        }
      }
      
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        countryCode: countryCode,
        mobile: mobile,
        password: '',
      });
      setErrors({});
    } else {
      console.log('New agent form initialized');
      setFormData({ 
        name: '', 
        email: '', 
        countryCode: '+91',
        mobile: '', 
        password: '' 
      });
      setErrors({});
    }
  }, [agent]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    console.log('Validating form data:', formData);

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (formData.mobile.trim().length < 7) {
      newErrors.mobile = 'Mobile number must be at least 7 digits';
    } else if (!/^\d+$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile number should contain only digits';
    }

    if (!agent && !formData.password.trim()) {
      newErrors.password = 'Password is required for new agents';
    } else if (!agent && formData.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');

    if (!validateForm()) {
      console.log('Validation failed - submit blocked');
      return;
    }

    // Combine country code with mobile number
    const fullMobile = formData.countryCode + formData.mobile.trim();
    console.log('Full mobile number:', fullMobile);

    setLoading(true);
    setErrors({});

    try {
      let response;
      if (agent) {
        console.log('API: Updating agent ID:', agent._id);
        response = await updateAgent(agent._id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: fullMobile,
        });
        console.log('Update API success:', response);
      } else {
        console.log('API: Creating new agent');
        response = await createAgent({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: fullMobile,
          password: formData.password.trim(),
        });
        console.log('Create API success:', response);
      }

      // Let parent component show the success toast
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('API Error Details:', error);
      console.error('Response Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);

      const message = error.response?.data?.message || error.message || 'Failed to save agent. Please try again.';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <Input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange('name')}
          required
        />
        {errors.name && <p className="mt-1 text-xs text-red-500 ml-1">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div>
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange('email')}
          required
        />
        {errors.email && <p className="mt-1 text-xs text-red-500 ml-1">{errors.email}</p>}
      </div>

      {/* Mobile Field with Country Code Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </label>
        <div className="flex space-x-2">
          {/* Country Code Dropdown */}
          <select
            value={formData.countryCode}
            onChange={handleChange('countryCode')}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {countryCodes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.flag} {item.code}
              </option>
            ))}
          </select>
          
          {/* Mobile Number Input */}
          <Input
            type="tel"
            placeholder="1234567890"
            value={formData.mobile}
            onChange={handleChange('mobile')}
            className="flex-1"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 ml-1">
          Enter number without country code
        </p>
        {errors.mobile && <p className="mt-1 text-xs text-red-500 ml-1">{errors.mobile}</p>}
      </div>

      {/* Password Field - Only for new agents */}
      {!agent && (
        <div>
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange('password')}
            required
          />
          {errors.password && <p className="mt-1 text-xs text-red-500 ml-1">{errors.password}</p>}
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Submit & Cancel Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button 
          type="submit" 
          loading={loading} 
          className="flex-1" 
          disabled={loading}
        >
          {loading ? 'Saving...' : agent ? 'Update Agent' : 'Add Agent'}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AgentForm;