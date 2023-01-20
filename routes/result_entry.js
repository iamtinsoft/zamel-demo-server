const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();

// // Show all sample entries
// router.get("/", async (req, res) => {
//   db.query("SELECT * FROM `sample_entry`", function (err, results) {
//     res.send(results);
//   });
// });

// // Show samples by id
// router.get("/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `sample_entry` WHERE `sample_entry_id` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Entry with the given ID could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// // Show samples by hub
// router.get("/hub/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `sample_entry` WHERE `hub_facility_id` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Entry with the given Hub could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// // Show samples by sending facility
// router.get("/sending_facility/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `sample_entry` WHERE `sending_facility_id` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Entry with the given Facility could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// // Show samples by receiving facility
// router.get("/receiving_facility/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `sample_entry` WHERE `receiving_facility_id` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Entry with the given Facility could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// Show samples by sample types
router.get("/result_entry/sample_type/:id", async (req, res) => {
  const receiving_facility_id = 0;
  db.query(
    "SELECT * FROM `sample_entry` WHERE `sample_type_id` = ?  AND `receiving_facility_id`  != ?",
    [req.params.id, receiving_facility_id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Entry with the given Sample could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// // Show samples by status
// router.get("/status/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `sample_entry` WHERE `sample_status` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Entry with the given status could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// // Create facility
// router.post("/", async (req, res) => {
//   const { error } = validateSampleEntry(req.body);

//   if (error) return res.status(400).send(error.details[0].message);
//   db.query(
//     "SELECT * FROM `sample_entry` where hub_facility_id = ? AND sending_facility_id = ?  AND sample_type_id =? AND sptp_id =?  AND date_sent =? AND time_sent =? AND temperature =?",
//     [
//       req.body.hub_facility_id,
//       req.body.sending_facility_id,
//       req.body.sample_type_id,
//       req.body.sptp_id,
//       req.body.date_sent,
//       req.body.time_sent,
//       req.body.temperature,
//     ],
//     function (err, results) {
//       if (results.length > 0) {
//         return res.status(400).send("Duplicate Entry Found.");
//       } else {
//         db.query(
//           "INSERT INTO `sample_entry` (hub_facility_id,sptp_id,date_sent,time_sent,sample_type_id,temperature,three_pl_id,sending_facility_id,sample_accepted,reasons_for_rejection,comments) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
//           [
//             req.body.hub_facility_id,
//             req.body.sptp_id,
//             req.body.date_sent,
//             req.body.time_sent,
//             req.body.sample_type_id,
//             req.body.temperature,
//             req.body.three_pl_id,
//             req.body.sending_facility_id,
//             req.body.sample_accepted,
//             req.body.reasons_for_rejection,
//             req.body.comments,
//           ],
//           function (err, results) {
//             if (err) {
//               console.log(err);
//               res.status(500).send("Entry could not be Created");
//             } else {
//               res.send("Entry Created Successfully");
//             }
//           }
//         );
//       }
//     }
//   );
// });

// // Delete samples by id
// router.delete("/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `sample_entry` where sample_entry_id = ?",
//     [req.params.id],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           "DELETE FROM `sample_entry`  WHERE `sample_entry_id` = ? ",
//           [req.params.id],
//           function (err, results) {
//             if (err) {
//               res.status(500).send("Sample could not be Deleted");
//             } else {
//               res.send("Sample Deleted Successfully");
//             }
//           }
//         );
//       } else {
//         return res
//           .status(400)
//           .send("The Sample with the given ID could not be  Found.");
//       }
//     }
//   );
// });

// function validateSampleEntry(entry) {
//   const schema = {
//     hub_facility_id: Joi.number().required(),
//     sptp_id: Joi.number().required(),
//     date_sent: Joi.string().min(2).max(50).required(),
//     time_sent: Joi.string().min(2).max(50).required(),
//     sample_type_id: Joi.number().required(),
//     temperature: Joi.string().min(1).max(50).required(),
//     three_pl_id: Joi.number().required(),
//     sending_facility_id: Joi.number().required(),
//     sample_accepted: Joi.string().min(2).max(50).required(),
//     reasons_for_rejection: Joi.string().allow(""),
//     comments: Joi.string().allow("").max(200),
//   };
//   return Joi.validate(entry, schema);
// }

module.exports = router;
