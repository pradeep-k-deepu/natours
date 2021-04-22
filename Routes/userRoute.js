const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const Router = express.Router();

Router.post('/signup', authController.signUp);
Router.post('/login', authController.logIn);
Router.post('/forgotpassword', authController.forgotPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);

Router.use(authController.protect);

Router.get('/me', userController.getMe, userController.getUser);

Router.patch('/updatemypassword', authController.updatePassword);
Router.patch('/updateme', userController.updateMe);
Router.delete('/deleteme', userController.deleteMe);

Router.use(authController.restrictTo('admin'));

Router.route('/').get(userController.getAllUsers);
Router.route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = Router;
