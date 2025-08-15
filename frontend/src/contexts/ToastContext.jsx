import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

let id = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((content, type = 'info') => {
    setToasts((prevToasts) => [...prevToasts, { id: id++, content, type }]);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} removeToast={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast, removeToast]);

  const toastColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative p-4 mb-4 text-white rounded-lg shadow-lg ${toastColors[toast.type]}`}
    >
      {toast.content}
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-1 right-1 text-white/50 hover:text-white"
      >
        &times;
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
