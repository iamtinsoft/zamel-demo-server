const express = require("express");
const { getStateLgas, getStates } = require("../data/stateLga");
const router = express.Router();
router.get("/", async (req, res) => {
  let states = getStates();
  res.send(states);
});
router.get("/:name", async (req, res) => {
  let states = getStateLgas(req.params.name);
  res.send(states.lgas);
});
module.exports = router;
