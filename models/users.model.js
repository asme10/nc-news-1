const db = require("../db/connection");

exports.fetchUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1;", [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No user found for ${username}`,
        });
      } else {
        return { user: rows[0] };
      }
    });
};

exports.addNewUser = ({ username, avatar_url, name }) => {
  return db
    .query(
      "INSERT INTO users (username, avatar_url, name) VALUES ($1, $2, $3) RETURNING *;",
      [
        username,
        avatar_url || "http://avatarurlhere.com/avatar.jpg",
        name || "Name Of The User",
      ]
    )
    .then(({ rows }) => {
      return { user: rows[0] };
    });
};

exports.fetchAllUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return { users: rows };
  });
};
