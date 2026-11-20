const env = require('../config/env');

module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  else if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.type === 'entity.too.large') { status = 413; message = 'Request too large'; }

  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 && env.isProd ? 'Something went wrong' : message,
  });
};
