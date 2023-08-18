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
          expect(article).toHaveProperty("body");
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
          expect(article).toHaveProperty("body");
        });
      });
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
describe("DELETE /api/comments/:comment_id", () => {
  test("respond with status 204, no content and delete the comment by comment_idt", () => {
    return request(app).delete("/api/comments/10").expect(204);
  });

  test("respond with status 404 when the comment_id doesn't exist", () => {
    return request(app)
      .delete("/api/comments/987654321")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
      });
  });

  test("respond with status 400 when invalid id given by client", () => {
    return request(app)
      .delete("/api/comments/not-an-id")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

//  All users
describe("/users", () => {
  it("GET - returns a status 200 and a users object with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toBeArray();
        expect(body.users[0])
          .toHaveProperty("username")
          .and.toHaveProperty("avatar_url")
          .and.toHaveProperty("name");
      });
  });

  it("POST - returns a status 201 and the created user", () => {
    return request(app)
      .post("/api/users")
      .send({ username: "gummybears123" })
      .expect(201)
      .then(({ body }) => {

        expect(body.user).toHaveProperty("username").and.toHaveProperty("avatar_url").and.toHaveProperty("name");

        expect(body.user)
          .toHaveProperty("username")
          .and.toHaveProperty("avatar_url")
          .and.toHaveProperty("name");
      });
  });

  describe("/:username", () => {
    it("GET returns a status 200 and a user object when parametric username endpoint is accessed", () => {
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body }) => {
          expect(body.user.username).toBe("rogersop");
          expect(body.user).toHaveProperty("username").and.toHaveProperty("avatar_url").and.toHaveProperty("name");
          expect(body.user)
            .toHaveProperty("username")
            .and.toHaveProperty("avatar_url")
            .and.toHaveProperty("name");
        });
    });

    it("GET - returns a status 404 and a message, when the user tries to get data for a user which doesnt exist", () => {
      return request(app)
        .get("/api/users/chickendinosaur")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No user found for chickendinosaur");
        });
    });

    describe("INVALID METHODS", () => {
      it("Status:405", () => {
        const invalidMethods = ["patch", "post", "put", "delete"];
          return request(app)
            [method]("/api/users/:username")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).toBe("Method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });

  describe("INVALID METHODS", () => {
    it("Status:405", () => {
      const invalidMethods = ["patch", "put", "delete"];
        return request(app)
          [method]("/api/users")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).toBe("Method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
  });
});

describe("FEATURE: GET /api/articles (queries)", () => {
  test("responds with an array of article objects filtered by topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });

  test("responds with an array of article objects sorted by a valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("responds with an array of article objects sorted in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSorted({ ascending: true });
      });
  });

  test("responds with an array of all article objects when no query provided", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
      });
  });

  test("responds with status 400 for an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request: Invalid query syntax");
      });
  });
});
describe("FEATURE: /api/articles/:article_id (comment_count)", () => {
  it("responds with status 200 and includes comment_count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("comment_count");
        expect(typeof article.comment_count).toBe("number");
      });
  });
});
