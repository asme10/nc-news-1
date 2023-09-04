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
const { response } = require("express");

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
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          created_at: expect.any(String),
          votes: 100,
          comment_count: expect.any(String),
        });
      });
  });

  test("404: responds with 404 for non-existent article", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Article not found");
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

  test("status:200 and responds with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        expect(Array.isArray(articles)).toEqual(true);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            votes: expect.any(Number),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            comment_count: expect.any(String),
          });
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

  // Get all comments for an article /api/articles/:article_id/comments
  describe("/api/articles/:article_id/comments", () => {
    test("responds with status 200 and an array of comments for a valid article_id", () => {
      return request(app).get("/api/articles/5/comments").expect(200);
    });

    test("GET /api/articles/:article_id/comments - responds with an array of comment objects, each with required properties", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body.comments;
          expect(comments).toBeInstanceOf(Array);
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
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

  // DELETE comments by comment_id
  describe("DELETE/api/comments/:comment_id", () => {
    test("status:204 and deletes comment by comment id", () => {
      return request(app)
        .delete("/api/comments/2")
        .expect(204)
        .then((res) => res.body);
    });
    test('status: 404 when there is an incorrect id and returns "Not found"', () => {
      return request(app)
        .delete("/api/comments/10000")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    test('status: 404 when there is an incorrect id and returns "Not found"', () => {
      return request(app)
        .delete("/api/comments/10000")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    test('status: 404 when there is an incorrect id and returns "Not found"', () => {
      return request(app)
        .delete("/api/comments/10000")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    test('status: 404 when there is an incorrect id and returns "Not found"', () => {
      return request(app)
        .delete("/api/comments/888888")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
  });

  //  All users
  describe("GET/api/users", () => {
    test("status:200 and responds with an array of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body.users)).toEqual(true);
          response.body.users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
            });
          });
        });
    });
  });

  describe("GET/api/users/:username", () => {
    test("status:200 responds with single user object with username equal to value requested in path", () => {
      return request(app)
        .get("/api/users/lurker")
        .expect(200)
        .then((response) => {
          expect(typeof response.body.user).toBe("object");
          expect(response.body.user).toMatchObject({
            username: "lurker",
            name: "do_nothing",
            avatar_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          });
        });
    });
    test("status: 404 responds with error message when user does not exist", () => {
      return request(app)
        .get("/api/users/billybob")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Path not found");
        });
    });
    test("status: 400 responds with error message when user does not exist", () => {
      return request(app)
        .get("/api/users/22222222")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });

  describe("FEATURE: /api/articles/:article_id (comment_count)", () => {
    test("responds with status 200 and includes comment_count property", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toHaveProperty("comment_count");
          const commentCount = parseInt(article.comment_count, 10);
          expect(typeof commentCount).toBe("number");
        });
    });
  });
});
