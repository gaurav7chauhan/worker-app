import crypto from 'crypto';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    // ✔ Server keeps running ✔ No crash ✔ No downtime
    return next(err);
  }

  const status = err.status || 500;
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  console.error({
    requestId,
    status,
    message: err.message,
    stack: err.stack,
  });

  res.status(status).json({
    error: {
      message: status >= 500 ? 'Internal server error' : err.message,
    },
    requestId,
  });
};
