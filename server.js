const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION SHTTING DOWN...');
  console.log(err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DATABASE CONNECTION IS SUCCESSFULL'));

const port = process.env.PORT;
const server = app.listen(port, (req, res) => {
  console.log(`listening on the port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
