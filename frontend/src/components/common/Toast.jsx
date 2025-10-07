import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (msg, type = 'info') => {
  toast[type](msg);
};

const Toast = () => <ToastContainer position="top-right" autoClose={2000} />;
export default Toast;
