import React from 'react';

const Button = ({ 
  type = 'button', 
  variant = 'primary',
  size = 'md',  
  className = '', 
  leftIcon, 
  rightIcon, 
  children, 
  loading = false, 
  disabled = false, 
  onClick, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-white border border-borderLight text-secondary hover:bg-gray-50 focus:ring-secondary',
    danger: 'bg-error text-red-900 hover:bg-red-50 focus:ring-red-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving...</span>
        </div>
      ) : (
        <>
          {leftIcon && <span className={`mr-2 ${iconSize}`}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={`ml-2 ${iconSize}`}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
