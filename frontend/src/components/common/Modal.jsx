import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-borderLight">
            <h3 className="text-lg font-semibold text-textDark">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-1 text-secondary hover:text-primary rounded-full hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
