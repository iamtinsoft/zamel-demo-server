const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// Show all facilities
router.get("/", async (req, res) => {
  db.query("SELECT * FROM `facility`", function (err, results) {
    res.send(results);
  });
});

// Show facility by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `facility` WHERE `facility_id` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Facility with the given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Show facility by state
router.get("/state/:state", async (req, res) => {
  db.query(
    "SELECT * FROM `facility` WHERE `facility_state` = ? ",
    [req.params.state],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Facility with the given State could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Show facility by state and lga
router.get("/:state/:lga", async (req, res) => {
  console.log(req.params.state, req.params.lga);
  db.query(
    "SELECT * FROM `facility` WHERE `facility_state` = ?  AND `facility_lga` =?",
    [req.params.state, req.params.lga],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send(
            "The Facility with the given State and LGA could not be  Found."
          );
      } else {
        res.send(results);
      }
    }
  );
});

// Create facility
router.post("/", async (req, res) => {
  const { error } = validateFacility(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `facility` where facility_name = ? AND facility_lga = ?  AND facility_state =?",
    [req.body.facility_name, req.body.facility_lga, req.body.facility_state],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Facility Found.");
      } else {
        db.query(
          "INSERT INTO `facility` (facility_name,facility_code,facility_state,facility_lga,is_active) VALUES(?,?,?,?,?)",
          [
            req.body.facility_name,
            req.body.facility_code,
            req.body.facility_state,
            req.body.facility_lga,
            req.body.is_active,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("Facility could not be Created");
            } else {
              res.send("Facility Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update facility by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `facility` where facility_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `facility` SET `facility_name` =?,`facility_code`=?,`facility_state`=?,`facility_lga` =?,`is_active` =? WHERE `facility_id` = ? ",
          [
            req.body.facility_name,
            req.body.facility_code,
            req.body.facility_state,
            req.body.facility_lga,
            req.body.is_active,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("Facility could not be Updated");
            } else {
              res.send("Facility Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Module withe given ID could not be  Found.");
      }
    }
  );
});

// Delete facility by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `facility` where facility_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `facility`  WHERE `facility_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Facility could not be Deleted");
            } else {
              res.send("Facility Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Facility with the given ID could not be  Found.");
      }
    }
  );
});

function validateFacility(facility) {
  const schema = {
    facility_name: Joi.string().min(2).max(50).required(),
    facility_code: Joi.string().min(2).max(50).required(),
    facility_state: Joi.string().min(2).max(50).required(),
    facility_lga: Joi.string().min(2).max(50).required(),
    is_active: Joi.number(),
  };
  return Joi.validate(facility, schema);
}

module.exports = router;
