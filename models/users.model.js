const db = require("../db/connection");

exports.selectUsers = () => {
  return db.query(`SELECT username FROM users;`).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" });
    }
    return result.rows;
  });
};

exports.selectUserByUsername = (username) => {
  if (Number(username)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `
    SELECT * FROM users
    WHERE username = $1;
    `,
      [username]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Path not found" });
      } else {
        return result.rows[0];
      }
    });
};

exports.selectArticles = (topic, sort_by = "created_at", order = "desc") => {
  return db
    .query(
      `
    SELECT *
    FROM articles
    ${topic ? "WHERE topic = $1" : ""}
    ORDER BY ${sort_by} ${order};
    `,
      [topic]
    )
    .then((result) => {
      return result.rows;
    });
};
