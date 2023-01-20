const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// Show all role_modules
router.get("/", async (req, res) => {
  db.query(
    "SELECT rm.role_module_id,rm.created,r.role_id,r.role_name,m.module_name,m.module_url,m.module_icon,m.module_app_url FROM roles r, modules m, role_modules rm WHERE  r.role_id = rm.role_id AND m.module_id = rm.module_id",
    function (err, results) {
      res.send(results);
    }
  );
});

// Show modules by role ID
router.get("/:role_id", async (req, res) => {
  db.query(
    "SELECT rm.role_module_id,rm.created,r.role_id,r.role_name,m.module_name,m.module_url,m.module_icon,m.module_app_url FROM roles r, modules m, role_modules rm WHERE r.role_id = ? AND r.role_id = rm.role_id AND m.module_id = rm.module_id ORDER BY m.module_name ASC",
    [req.params.role_id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Role Module withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create modules
router.post("/", async (req, res) => {
  const { error } = validateRoleModule(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `role_modules` where role_id = ? AND module_id = ?",
    [req.body.role_id, req.body.module_id],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Role Module Found.");
      } else {
        db.query(
          "INSERT INTO `role_modules` (role_id,module_id,is_active) VALUES(?,?,?)",
          [req.body.role_id, req.body.module_id, req.body.is_active],
          function (err, results) {
            if (err) {
              res.status(500).send("Role Module could not be Created");
            } else {
              res.send("Role Module Created Successfully");
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
    "SELECT * FROM `role_modules` where role_module_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `role_modules` SET `role_id` =?,`module_id`=?,`is_active` =? WHERE `role_module_id` = ? ",
          [
            req.body.role_id,
            req.body.module_id,
            req.body.is_active,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("Role Module could not be Updated");
            } else {
              res.send("Role Module Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Role Module withe given ID could not be  Found.");
      }
    }
  );
});

// Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `role_modules` where role_module_id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `role_modules`  WHERE `role_module_id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Role Module could not be Deleted");
            } else {
              res.send("Role Module Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Role Module withe given ID could not be  Found.");
      }
    }
  );
});

function validateRoleModule(module) {
  const schema = {
    role_id: Joi.number().required(),
    module_id: Joi.number().required(),
    is_active: Joi.number(),
  };
  return Joi.validate(module, schema);
}

module.exports = router;
