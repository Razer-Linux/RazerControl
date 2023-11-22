import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const reportError = useCallback((error) => {
    // Log the error or send it to a logging service
    console.error(error);
    // Set the error state
    setError(error);
  }, []);

  return { error, reportError };
};
