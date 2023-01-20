const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const { generateAuthToken } = require("../helpers/token");
const { sendEmail } = require("./../helpers/email");
// Authorize users
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT u.user_id,u.first_name,u.last_name,u.email,u.phone_no,u.password,r.role_name,u.role_id,u.is_active,u.is_verified,u.created FROM `users` u JOIN roles r ON r.role_id = u.role_id AND u.email =?",
    [req.body.email],
    async function (err, results) {
      let fullName = "";
      if (results.length == 1) {
        const user = results[0];
        fullName = user.first_name + " " + user.last_name;
        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!validPassword)
          return res.status(400).send("Invalid email or password.");

        const token = generateAuthToken(user);
        sendEmail(
          req.body.email,
          "LOGIN NOTIFICATION",
          "Please note that a login activity happened",
          fullName
        );
        res.send(token);
      } else {
        return res.status(400).send("Invalid email or password.");
      }
    }
  );
});

function validateUser(user) {
  const schema = {
    email: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(user, schema);
}

module.exports = router;
