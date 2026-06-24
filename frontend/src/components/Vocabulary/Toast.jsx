import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className={`fixed bottom-6 right-6 ${bg} text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-3 animate-fade-in z-50`}>
      <span>{type === 'success' ? '✅' : '⚠️'}</span>
      {message}
    </div>
  );
};

export default Toast;
