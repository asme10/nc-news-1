const db = require("../db/connection");

exports.readTopics = () => {
  const selectTopics = "SELECT * FROM topics";
  return db.query(selectTopics).then((topics) => {
    return topics.rows;
  });
};
