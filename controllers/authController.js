const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendMail = require('./../utils/sendMail');
const { hostname } = require('os');

const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //hide the password field from the user data
  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1. check if email and password exists
  if (!email || !password) {
    return next(new AppError('Missing email or password', 400));
  }
  //2. check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  //3. if everything is OK... send token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1.getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in... Please login to get access', 401)
    );
  }

  //2. verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist... please login again',
        401
      )
    );
  }

  //4.check if user change the password after the token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        'User has changed the password... please login with new password',
        401
      )
    );
  }

  req.user = currentUser;
  //GRANT ACCESS TO PROTECTED ROUTES
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not allowed to delete a tour...', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. get the user based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email', '404'));
  }
  //2. generate token
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3.send it to the user's email
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${token}`;
    const message = `If u forgot your password... please make a patch request with the password and confirm password with this url : ${resetUrl}`;

    const options = {
      email: req.body.email,
      subject: 'Password reset token (valid for 10 min)',
      message,
    };

    await sendMail(options);

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'there is a problem in sending a mail... please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('The token has expired', 400));

  //2. if there is  user then the token has not expired, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3. set passwordChangedAt property
  //middleware (save) will do this task... as we coded.

  //4. log in user, send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get the user
  const user = await User.findById(req.user.id).select('+password');
  //2. check the user old password is correct
  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError('Your current password you entered was incorrect', 401)
    );
  }
  //3. if so, then update the password with the new one
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4. log in user , send the jwt
  createSendToken(user, 200, res);
});
