const { selectArticleById, getArticles } = require("../models/articles.model");

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
