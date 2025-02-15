const getLogger = (route) => {
  return {
    info: (message, data = {}) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        route,
        message,
        ...data
      }));
    },
    error: (message, error = null, data = {}) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        route,
        message,
        error: error?.message || error,
        stack: error?.stack,
        ...data
      }));
    }
  };
};

export default getLogger;
