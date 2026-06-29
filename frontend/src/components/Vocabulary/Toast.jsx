import React, { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const icon = type === "success" ? "bi-check-circle" : type === "warning" ? "bi-exclamation-triangle" : "bi-x-circle";

  return (
    <div className={`learning-toast ${type}`}>
      <i className={`bi ${icon}`} />
      {message}
    </div>
  );
};

export default Toast;
