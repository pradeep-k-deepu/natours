const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authController = require('../controllers/authController');
const Router = express.Router({ mergeParams: true });

Router.use(authController.protect);

Router.route('/')
  .get(reviewsController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewsController.setTourUser,
    reviewsController.createReview
  );

Router.route('/:id')
  .get(reviewsController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewsController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewsController.deleteReview
  );

module.exports = Router;
