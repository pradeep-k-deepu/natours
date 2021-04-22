const express = require('express');
const pug = require('pug');
const path = require('path');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./Routes/tourRoute');
const userRouter = require('./Routes/userRoute');
const reviewRouter = require('./Routes/reviewRoute');
const viewRouter = require('./Routes/viewRoute');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/globalErrorController');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//global middlewares

//serving the static files
app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
app.use(helmet());

//body parser, get the data from the req.body
app.use(express.json());

//sets the limit to the api, [request from the same IP]
let limiter = rateLimit({
  max: process.env.API_REQUEST_LIMIT,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP... please try after an hour',
});

app.use('/api', limiter);

//simply a test middleware
app.use((req, res, next) => {
  req.createdAt = new Date().toISOString();
  // console.log(req.headers);
  next();
});

//data sanitization against NOSQL injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

//preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//mounting the routers

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`canot get ${req.originalUrl} on this sever`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`canot get ${req.originalUrl} on this sever`, 404));
});

app.use(globalErrorController);

module.exports = app;
