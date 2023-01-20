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
const { sendWelcomeEmail } = require("./../helpers/email");

// Show all users
router.get("/", async (req, res) => {
  db.query(
    "SELECT u.user_id,u.first_name,u.last_name,u.email,u.phone_no,r.role_name,u.role_id,u.is_active,u.is_verified,u.created FROM `users` u JOIN roles r ON r.role_id = u.role_id",
    function (err, results) {
      res.send(results);
    }
  );
});
// Show users by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT u.user_id,u.first_name,u.last_name,u.email,u.phone_no,r.role_name,u.role_id,u.is_active,u.is_verified,u.created FROM `users` u JOIN roles r ON r.role_id = u.role_id AND u.user_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(404).send("The User withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});
// Create users
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  const salt = await bcrypt.genSalt(10);
  let cryptedPassword = await bcrypt.hash(req.body.password, salt);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `users` where email = ?",
    [req.body.email],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate User Found.");
      } else {
        db.query(
          "INSERT INTO `users` (first_name,last_name,email,phone_no,password,role_id) VALUES(?,?,?,?,?,?)",
          [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.phone_no,
            cryptedPassword,
            req.body.role_id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("User could not be Created");
            } else {
              let fullName = req.body.first_name + " " + req.body.last_name;
              let role = "";
              switch (req.body.role_id) {
                case "1":
                  role = "ADMINISTRATOR";
                  break;

                case "2":
                  role = "SAMPLE PICKUP PERSONNEL";
                  break;

                case "3":
                  role = "LABORATORY USER";
                  break;
                default:
                  break;
              }
              sendWelcomeEmail(
                req.body.email,
                "ACCOUNT CFREATION",
                "Please note that a login activity happened",
                fullName,
                role,
                req.body.password
              );
              // const user = {
              //   first_name: req.body.first_name,
              //   last_name: req.body.last_name,
              //   email: req.body.email,
              //   phone_no: req.body.phone_no,
              //   first_name: req.body.role_id,
              // };
              // const token = generateAuthToken(user);
              res.send("User Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update user by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `users` where user_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `users` SET `first_name` =? , `last_name` =?,`email` =?,`phone_no` =?,`role_id` =? WHERE `user_id` = ? ",
          [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.phone_no,
            req.body.role_id,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("User could not be Updated");
            } else {
              db.query(
                "SELECT u.user_id,u.first_name,u.last_name,u.email,u.phone_no,r.role_name,u.role_id,u.is_active,u.is_verified,u.created FROM `users` u JOIN roles r ON r.role_id = u.role_id AND u.user_id=?",
                [req.params.id],
                async function (err, results) {
                  if (results.length == 1) {
                    const user = results[0];
                    const token = generateAuthToken(user);
                    res.send(token);
                  } else {
                    return res.status(404).send("User Not Found.");
                  }
                }
              );
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

// Update user password by id
router.put("/update-password/:id", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  let cryptedPassword = await bcrypt.hash(req.body.password, salt);
  db.query(
    "SELECT * FROM `users` where user_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `users` SET `password` =? WHERE `user_id` = ? ",
          [cryptedPassword, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("User password could not be Updated");
            } else {
              res.send("User Password Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

// verify user  by id
router.put("/verify/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `users` where user_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `users` SET `is_verified` =? WHERE `user_id` = ? ",
          [req.body.verify, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("User  could not be Verified");
            } else {
              db.query(
                "SELECT u.user_id,u.first_name,u.last_name,u.email,u.phone_no,r.role_name,u.role_id,u.is_active,u.is_verified,u.created FROM `users` u JOIN roles r ON r.role_id = u.role_id AND u.user_id=?",
                [req.params.id],
                async function (err, results) {
                  if (results.length == 1) {
                    const user = results[0];
                    const token = generateAuthToken(user);
                    res.send(token);
                  } else {
                    return res.status(404).send("User Not Found.");
                  }
                }
              );
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

// activate user  by id
router.put("/activate/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `users` where user_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `users` SET `is_active` =? WHERE `user_id` = ? ",
          [req.body.activate, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("User  could not be Activated");
            } else {
              db.query(
                "SELECT u.user_id,u.first_name,u.last_name,u.email,u.phone_no,r.role_name,u.role_id,u.is_active,u.is_verified,u.created FROM `users` u JOIN roles r ON r.role_id = u.role_id AND u.user_id=?",
                [req.params.id],
                async function (err, results) {
                  if (results.length == 1) {
                    const user = results[0];
                    const token = generateAuthToken(user);
                    res.send(token);
                  } else {
                    return res.status(404).send("User Not Found.");
                  }
                }
              );
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

// Delete users by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `users` where user_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `users`  WHERE `user_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("User could not be Deleted");
            } else {
              res.send("User Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

function validateUser(user) {
  const schema = {
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).required(),
    phone_no: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(2).max(50).required(),
    role_id: Joi.number().required(),
  };
  return Joi.validate(user, schema);
}

module.exports = router;
