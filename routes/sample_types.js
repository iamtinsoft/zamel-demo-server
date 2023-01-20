const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// Show all sample types
router.get("/", async (req, res) => {
  db.query("SELECT * FROM `sample_types`", function (err, results) {
    res.send(results);
  });
});

// Show sample type by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `sample_types` WHERE `sample_type_id` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Sample Type withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create sample type
router.post("/", async (req, res) => {
  const { error } = validateSampleType(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `sample_types` where sample_name = ?",
    [req.body.sample_name],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Sample Type Found.");
      } else {
        db.query(
          "INSERT INTO `sample_types` (sample_name) VALUES(?)",
          [req.body.sample_name],
          function (err, results) {
            if (err) {
              res.status(500).send("Sample Type could not be Created");
            } else {
              res.send("Sample Type Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update sample type by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `sample_types` where sample_type_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `sample_types` SET `sample_name` =? WHERE `sample_type_id` = ? ",
          [req.body.sample_name, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Record could not be Updated");
            } else {
              res.send("Sample  Type Updated Successfully");
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

// Delete sample type by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `sample_types` where sample_type_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `sample_types`  WHERE `sample_type_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Record could not be Deleted");
            } else {
              res.send("Sample Type Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Sample Type with the given ID could not be  Found.");
      }
    }
  );
});

function validateSampleType(sample_type) {
  const schema = {
    sample_name: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(sample_type, schema);
}

module.exports = router;
