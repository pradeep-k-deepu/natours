const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const { findById, findByIdAndUpdate } = require('./../models/userModel');

const filter = (obj, ...allowedFields) => {
  //['name','email'] ==> allowedFields
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1. create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Not allowed to update password here... please use updatemypassword route',
        400
      )
    );
  }

  //2.filtering the unwanted fields from the req body... which are not allowed to update
  const filteredObj = filter(req.body, 'name', 'email');

  //3. update the user data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//don't use this route for password update
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.createUser = (req, res) => {
//   const id = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id }, req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// };
