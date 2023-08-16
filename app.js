const express = require("express");
const app = express();

const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controller");

const { getApi } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const { getArticleById } = require("./controllers/articles.controller");

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = { app };
