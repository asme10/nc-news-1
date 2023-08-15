const { readTopics } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  readTopics()
    .then((rows) => {
      res.status(200).send(rows);
    })
    .catch((err) => {
      next(err);
    });
};
