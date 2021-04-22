const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // get the tour data
  const tours = await Tour.find();

  //build template and then render it
  res.status(200).render('overview', {
    tours,
    title: 'All Tours',
  });
});

exports.getTour = catchAsync(async (req, res) => {
  //get the tour by slug
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  //build template and render it
  res.status(200).render('tour', {
    tour,
    title: tour.name,
  });
});
