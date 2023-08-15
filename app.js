const express = require("express");
const app = express();

const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controller");

const { getTopics } = require("./controllers/topics.controller");
const { getApi } = require("./controllers/api.controller");

app.get("/api", getApi);
app.get("/api/topics", getTopics);

module.exports = { app };
