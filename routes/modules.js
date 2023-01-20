const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// Show all modules
router.get("/", async (req, res) => {
  db.query("SELECT * FROM `modules`", function (err, results) {
    res.send(results);
  });
});

// Show modules by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `modules` WHERE `module_id` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(400).send("The Module withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create modules
router.post("/", async (req, res) => {
  const { error } = validateModule(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `modules` where module_name = ?",
    [req.body.module_name],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Module Found.");
      } else {
        db.query(
          "INSERT INTO `modules` (module_name,module_url,module_icon,module_app_url,is_active) VALUES(?,?,?,?,?)",
          [
            req.body.module_name,
            req.body.module_url,
            req.body.module_icon,
            req.body.module_app_url,
            req.body.is_active,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("Module could not be Created");
            } else {
              res.send("Module Created Successfully");
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
    "SELECT * FROM `modules` where module_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `modules` SET `module_name` =?,`module_url`=?,`module_icon`=?,`module_app_url` =?,`is_active` =? WHERE `module_id` = ? ",
          [
            req.body.module_name,
            req.body.module_url,
            req.body.module_icon,
            req.body.module_app_url,
            req.body.is_active,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("Module could not be Updated");
            } else {
              res.send("Module Updated Successfully");
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

// Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `modules` where module_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `modules`  WHERE `module_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Module could not be Deleted");
            } else {
              res.send("Module Deleted Successfully");
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

function validateModule(module) {
  const schema = {
    module_name: Joi.string().min(2).max(50).required(),
    module_url: Joi.string().min(2).max(50).required(),
    module_icon: Joi.string().min(2).max(50).required(),
    module_app_url: Joi.string().min(2).max(50).required(),
    is_active: Joi.number(),
  };
  return Joi.validate(module, schema);
}

module.exports = router;
