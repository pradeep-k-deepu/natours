const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewsController');
const reviewRouter = require('./reviewRoute');
const Router = express.Router();

// Router.param('id', tourController.checkId);

Router.route('/top-5-cheap-tours').get(
  tourController.aliasTour,
  tourController.getAllTours
);

Router.route('/get-tour-stats').get(tourController.getTourStats);
Router.route('/get-monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithin
);

Router.get('/distance/:latlng/unit/:unit', tourController.calculateDistance);

Router.route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//mounting a router
Router.use('/:tourid/review', reviewRouter);

// Router.route('/:tourid/review').post(
//   authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview
// );

module.exports = Router;
