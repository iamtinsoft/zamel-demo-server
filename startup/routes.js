const express = require("express");
const roles = require("../routes/roles");
const modules = require("../routes/modules");
const role_modules = require("../routes/role_modules");
const users = require("../routes/users");
const auth = require("../routes/auth");
const states = require("../routes/state_lga");
const sample_types = require("../routes/sample_types");
const facilities = require("../routes/facilities");
const three_pl = require("../routes/three_pl");
const sample_entry = require("../routes/sample_entry");
const error = require("../middleware/error");
module.exports = function (app) {
  app.use(express.json());
  app.use("/api/roles", roles);
  app.use("/api/modules", modules);
  app.use("/api/role_modules", role_modules);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/states", states);
  app.use("/api/sample_types", sample_types);
  app.use("/api/facilities", facilities);
  app.use("/api/three_pl", three_pl);
  app.use("/api/sample_entry", sample_entry);
  app.use(error);
};
