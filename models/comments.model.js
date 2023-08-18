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
      return rows[0];
    });
};
exports.deleteCommentById = (comment_id) => {
  return db
    .query(
      `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;
  `,
      [comment_id]
    )
    .then((comment) => {
      if (comment.rows.length === 0) {
        return null;
      }
      return comment.rows[0];
    });
};
