const mongoose = require('mongoose');
const slugify = require('slugify');
// const Review = require('./reviewModel');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A Tour must have a name'],
      minlength: [10, 'A Tour name must be at least 10 characters'],
      maxlength: [
        40,
        'A Tour name must be less than or equal to 40 characters',
      ],
    },
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    discountPrice: {
      type: Number,
      // validate: {
      //   validator: function (val) {
      //     return val < this.price;
      //   },
      //   message: 'A Discount price must lesser than the regular price',
      // },
      validate: [
        function (val) {
          return val < this.price;
        },
        'A Discount price must lesser than the regular price',
      ],
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a GroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A difficulty have only: [EASY MEDIUM DIFFICULTY] values',
      },
    },

    rating: {
      type: Number,
      default: 4.7,
      min: [1, 'A ratingAverage must be greater or equal than 1'],
      max: [5, 'A ratingAverage must be less than or equal to 5'],
    },

    ratingsAverage: {
      type: Number,
      default: 0,
      set: (val) => Math.round(val),
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    summary: {
      type: String,
    },

    description: {
      type: String,
    },

    imageCover: String,

    images: [String],
    startDates: [Date],

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.post('save', function (doc, next) {
  next();
});

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
