const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// Show all roles
router.get("/", async (req, res) => {
  db.query("SELECT * FROM `roles`", function (err, results) {
    res.send(results);
  });
});

// Show roles by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `roles` WHERE `role_id` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(400).send("The Role withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create roles
router.post("/", async (req, res) => {
  const { error } = validateRole(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `roles` where role_name = ?",
    [req.body.role_name],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Role Found.");
      } else {
        db.query(
          "INSERT INTO `roles` (role_name) VALUES(?)",
          [req.body.role_name],
          function (err, results) {
            if (err) {
              res.status(500).send("Role could not be Created");
            } else {
              res.send("Role Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update roles by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `roles` where role_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `roles` SET `role_name` =? WHERE `role_id` = ? ",
          [req.body.role_name, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Record could not be Updated");
            } else {
              res.send("Role Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Role withe given ID could not be  Found.");
      }
    }
  );
});

// Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `roles` where role_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `roles`  WHERE `role_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Record could not be Deleted");
            } else {
              res.send("Role Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Role withe given ID could not be  Found.");
      }
    }
  );
});

function validateRole(role) {
  const schema = {
    role_name: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
