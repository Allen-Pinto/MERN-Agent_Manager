  import React from 'react';

  const Input = ({ type, placeholder, icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-borderLight rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
        {...props}
      />
    </div>
  );

  export default Input;
  