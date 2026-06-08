import { useState } from 'react';
import SimpleAlert from './SimpleAlert';

// Alert Manager Hook
export const useSimpleAlert = () => {
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type, title, message, options = {}) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message,
      ...options
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  const showSuccess = (title, message) => showAlert('success', title, message);
  const showError = (title, message) => showAlert('error', title, message);
  const showWarning = (title, message) => showAlert('warning', title, message);
  const showInfo = (title, message) => showAlert('info', title, message);

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AlertComponent: () => (
      <SimpleAlert
        {...alert}
        onClose={hideAlert}
      />
    )
  };
};
