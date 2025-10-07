import React from 'react';
import { Link } from 'react-router-dom';
import Login from '../components/Auth/Login';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bgLight">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-borderLight">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-textDark">Admin Login</h2>
          <p className="text-secondary">Enter your credentials to access the dashboard</p>
        </div>
        <Login />
        <div className="text-center">
          <p className="text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;