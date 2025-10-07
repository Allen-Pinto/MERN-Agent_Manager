import React from 'react';
import { Link } from 'react-router-dom';
import Register from '../components/Auth/Register';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bgLight">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-borderLight">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-textDark">Create Account</h2>
          <p className="text-secondary">Register to access the dashboard</p>
        </div>
        <Register />
        <div className="text-center">
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;