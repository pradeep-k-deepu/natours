const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/"(.*?)"/g);
  const message = `Duplicate field value ${value}... Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError('Invalid token... Please logIn again', 401);

const handleJwtExpireError = () =>
  new AppError('Your token was expired... please login again', 401);
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong...',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      err = handleCastError(err);
    }
    if (err.name === 'MongoError') {
      err = handleDuplicateFields(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidationError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      err = handleJwtError();
    }
    if (err.name === 'TokenExpiredError') {
      err = handleJwtExpireError();
    }
    sendErrorProd(err, res);
  }
};
