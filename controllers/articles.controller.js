const { selectArticleById } = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: "Not found" });
      } else {
        res.status(500).send({ msg: "Internal Server Error" });
      }
    });
};
