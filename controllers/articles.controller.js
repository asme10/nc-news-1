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
    .then((article) =>
      res.status(200).send({
        article,
      })
    )
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

exports.updateArticleVotes = (article_id, votes) => {
  return db("articles")
    .where({ article_id })
    .increment("votes", votes)
    .returning("*")
    .then((articles) => {
      if (articles.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return articles[0];
    });
};

exports.fetchArticleWithComments = (req, res, next) => {
  const articleId = req.params.article_id;

  fetchArticleById(articleId)
    .then((article) => {
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: `Article with ID ${articleId} not found`,
        });
      }

      return fetchArticleComments(articleId).then((comments) => {
        article.comment_count = comments.length;
        res.status(200).send({ article });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by = "created_at", order = "desc" } = req.query;

  if (topic) {
    // Use getArticlesByTopic function to fetch articles filtered by topic
    getArticlesByTopic(topic, sort_by, order)
      .then((articles) => {
        res.send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    // Use getAllArticles function to fetch all articles
    getAllArticles(sort_by, order)
      .then((articles) => {
        res.send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic, sort_by = "created_at", order = "desc" } = req.query;

  getArticlesByTopic(topic, sort_by, order)
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
