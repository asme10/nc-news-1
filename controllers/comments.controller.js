const {
  getCommentsByArticleId,
  addCommentToArticle,
} = require("../models/comments.model");

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

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const commentObj = req.body;

  addCommentToArticle(commentObj, article_id)
    .then((comment) => {
      res.status(201).send({ comment });


    })
    .catch((err) => {
      next(err);
    });
};
