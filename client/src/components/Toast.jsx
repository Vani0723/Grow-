import React, { useEffect } from 'react';

const Toast = ({ message, onClose }) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast" role="alert">
      <div className="toast-content">
        {message}
        <button className="toast-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};

export default Toast;
