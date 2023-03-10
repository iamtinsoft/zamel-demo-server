const config = require("config");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
let mailHost = process.env.mail_host;
let mailPort = process.env.mail_port;
let mailUser = process.env.mail_user;
let mailPassword = process.env.mail_password;

const transport = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  auth: {
    user: mailUser,
    pass: mailPassword,
  },
});

const sendEmail = async (receiver, subject, content, user) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  ejs.renderFile(
    __dirname + "/templates/loginNotification.ejs",
    { receiver, content, timezone, time, date, user },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: mailUser,
          to: receiver,
          subject: subject,
          html: data,
        };

        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
        });
      }
    }
  );
};

const sendWelcomeEmail = async (
  receiver,
  subject,
  content,
  user,
  role,
  password
) => {
  // const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // const time = new Date().toLocaleTimeString();
  // const date = new Date().toLocaleDateString();
  ejs.renderFile(
    __dirname + "/templates/welcomeNotification.ejs",
    { receiver, content, user, role, password },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: mailUser,
          to: receiver,
          subject: subject,
          html: data,
        };

        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
        });
      }
    }
  );
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
};
