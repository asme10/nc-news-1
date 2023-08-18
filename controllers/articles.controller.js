const {
  selectArticleById,
  getArticles,
  updateArticleVotes,
  getAllArticles,
  getArticlesByTopic,
  fetchArticleById,
  fetchArticleComments,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => {
      next(err);
    });
};

// All articles
exports.getAllArticles = (req, res, next) => {
  getArticles()
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

// Patch article votes
exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  if (typeof inc_votes !== "number") {
    return next({
      status: 400,
      msg: "Bad request: inc_votes should be a number",
    });
  }

  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by = "created_at", order = "desc" } = req.query;

  if (topic) {
    getArticlesByTopic(topic, sort_by, order)
      .then((articles) => {
        res.send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    getAllArticles(sort_by, order)
      .then((articles) => {
        res.send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      return fetchArticleComments(article_id).then((comments) => {
        article.comment_count = comments.length;
        res.status(200).send({ article });
      });
    })
    .catch(next);
};
