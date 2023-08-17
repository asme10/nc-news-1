const db = require("../db/connection");

exports.getCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
    SELECT *
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: "Requested article does not exist",
        });
      }
      return rows;
    });
};

exports.addCommentToArticle = (commentObj, article_id) => {
  const { username, body } = commentObj;

  return db
    .query(
      `INSERT INTO comments (author, body, article_id )
    VALUES ($1, $2, $3)
    RETURNING *;`,
      [username, body, article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: "Requested Id does not exist",
        });
      }
      return rows[0];
    });
};
