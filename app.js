const express = require("express");
const app = express();

const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controller");

const { getApi } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const {
  getUsers,
  getUserByUsername,
  getArticles,
} = require("./controllers/users.controller");
const {
  getArticleById,
  getAllArticles,
  patchArticleVotes,
  getArticlesByTopic,
} = require("./controllers/articles.controller");
const {
  getCommentsForArticle,
  postCommentByArticleId,
  removeCommentById,
} = require("./controllers/comments.controller");

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsForArticle);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticleVotes);
app.delete("/api/comments/:comment_id", removeCommentById);
app.get("/api/topics/:topic/articles", getArticlesByTopic);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = { app };
