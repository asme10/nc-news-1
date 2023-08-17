const { getCommentsByArticleId } = require("../models/comments.model");

exports.getCommentsForArticle = (req, res, next) => {
  const { article_id } = req.params;

  getCommentsByArticleId(article_id)
    .then((comments) => {
      if (comments.length === 0) {
        return res.status(404).send({ msg: "Not found" });
      }
      res.send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
