const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  //1. create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2. defining email options
  const emailOptions = {
    from: 'Pradeep.k <pradeepbillgates333@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3. actually send a mail
  await transporter.sendMail(emailOptions);
};

module.exports = sendMail;
