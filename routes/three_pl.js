const Joi = require("joi");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// Show all 3pl
router.get("/", async (req, res) => {
  db.query("SELECT * FROM `three_pl`", function (err, results) {
    res.send(results);
  });
});
// Show 3pl by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `three_pl` WHERE three_pl_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(404).send("The 3PL withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});
// Create 3PL
router.post("/", async (req, res) => {
  const { error } = validateThreepl(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `three_pl` where three_pl_name = ?",
    [req.body.three_pl_name],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate 3PL Found.");
      } else {
        db.query(
          "INSERT INTO `three_pl` (three_pl_name,three_pl_phone,three_pl_signature,is_active) VALUES(?,?,?,?)",
          [
            req.body.three_pl_name,
            req.body.three_pl_phone,
            req.body.three_pl_signature,
            req.body.is_active,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("3PL could not be Created");
            } else {
              res.send("3PL Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update 3PL by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `three_pl` where three_pl_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `three_pl` SET `three_pl_name` =? , `three_pl_phone` =?, `three_pl_signature` =?,`is_active` =? WHERE `three_pl_id` = ? ",
          [
            req.body.three_pl_name,
            req.body.three_pl_phone,
            req.body.three_pl_signature,
            req.body.is_active,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("3PL could not be Updated");
            } else {
              res.send("3PL Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The 3PL withe given ID could not be  Found.");
      }
    }
  );
});

// Delete 3PL by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `three_pl` where three_pl_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `three_pl`  WHERE `three_pl_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("3PL could not be Deleted");
            } else {
              res.send("3PL Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The 3PL withe given ID could not be  Found.");
      }
    }
  );
});

function validateThreepl(three_pl) {
  const schema = {
    three_pl_name: Joi.string().min(2).max(50).required(),
    three_pl_phone: Joi.string().min(2).max(50).required(),
    three_pl_signature: Joi.string().min(2).max(200).required(),
    is_active: Joi.number().required(),
  };
  return Joi.validate(three_pl, schema);
}

module.exports = router;
