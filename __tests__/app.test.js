const { app } = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/development-data/index.js");
const endpoints = require("../endpoints.json");
const toBeSorted = require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

// Api
describe("/api", () => {
  test("should provide documentation for all available endpoints", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(endpoints);
      });
  });
});

// Topics
describe("/api/topics", () => {
  test("GET:200 status code of 200", () => {
    return request(app).get("/api/topics").expect(200);
  });

  test("responds with an array of topic objects, each of which should have the properties of slug, and description ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body;
        expect(topics).toHaveLength(3);

        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
          expect(Object.keys(topic)).toEqual(
            expect.arrayContaining(["slug", "description"])
          );
        });
      });
  });
});

// Articles/:article_id
describe("GET /api/articles/:article_id", () => {
  test("200: response with 200 statusCode", () => {
    return request(app).get("/api/articles/1").expect(200);
  });

  test("responds with an article object with the expected properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article[0]).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("404: responds with 404 for non-existent article", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
      });
  });
  test("400: responds with 400 for non-existent article", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

// Articles with comment_count
describe("/api/articles", () => {
  test("GET:200 status code of 200", () => {
    return request(app).get("/api/articles").expect(200);
  });

  test("responds with an articles array of article objects properties: author, title, article_id, topic, created_at, votes, article_img_url, comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
        });
      });
  });

  test("respond with an articles array sorted by created_at in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSorted({ key: "created_at", descending: true });
      });
  });

  test("respond with an articles array without the body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
});

// Get all comments for an article /api/articles/:article_id/comments
describe("/api/articles/:article_id/comments", () => {
  test("responds with status 200 and an array of comments for a valid article_id", () => {
    return request(app).get("/api/articles/5/comments").expect(200);
  });

  test("responds with an array of comment objects, each with required properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(Object.keys(comment)).toEqual(
            expect.arrayContaining([
              "comment_id",
              "votes",
              "created_at",
              "author",
              "body",
            ])
          );
        });
      });
  });

  test("responds with status 404 when the requested article does not exist", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });

  test("responds with status 400 bad request when article_id is not a valid ID", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

// POST  comments into article
describe("POST /api/articles/:article_id/comments", () => {
  test("POST - responds with a status 201 and the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .expect(201)
      .send({
        username: "icellusedkars",
        body: "Hello there, this is my first comment",
      })
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty(
          "comment_id",
          "author",
          "article_id",
          "votes",
          "created_at",
          "body"
        );
        expect(comment.author).toEqual("icellusedkars");
      });
  });

  test("POST - ignores unnecessary properties and responds with the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .expect(201)
      .send({
        username: "icellusedkars",
        body: "This is a new comment.",
        unnecessaryProperty: "This should be ignored",
      })
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("author", "icellusedkars");
      });
  });

  test("POST - responds with 400 for invalid article_id", () => {
    return request(app)
      .post("/api/articles/not-an-id/comments")
      .expect(400)
      .send({
        username: "icellusedkars",
        body: "This is a new comment.",
      })
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("POST - responds with 404 for non-existent article_id", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .expect(404)
      .send({
        username: "icellusedkars",
        body: "This is a new comment.",
      })
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
      });
  });

  test("POST - responds with 400 for missing required fields", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .expect(400)
      .send({
        username: "icellusedkars",
      })
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request: Missing required field(s)");
      });
  });

  test("POST - responds with 404 for username that does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .expect(404)
      .send({
        username: "nonexistentuser",
        body: "This is a new comment.",
      })
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
      });
  });
});

// PATCH article by article_id
describe("PATCH /api/articles/:article_id", () => {
  test("PATCH - responds with the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 10 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("votes", 110);
      });
  });

  test("PATCH - responds with 404 for non-existent article_id", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 10 })
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Article with article_id 9999 not found");
      });
  });

  test("PATCH - responds with 400 for invalid inc_votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "invalid" })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request: inc_votes should be a number");
      });
  });
});
