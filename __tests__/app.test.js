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

beforeEach(() => seed(testData));
afterAll(() => db.end());

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
