const { assert } = require("chai");

const { findUserByEmail, urlsForUser, addHttpToURL } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testDatabase = {
  //database for urls
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "userRandomID" },
  oinNIO: { longURL: "http://www.microsoft.com", userId: "user2RandomID" },
  "09V09D": { longURL: "http://www.amazon.com", userId: "user2RandomID" },
};

describe("findUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepStrictEqual(user, expectedUserID);
  });
  it("should return a null when email does not exist in database", function () {
    const user = findUserByEmail("user3@example.com", testUsers);
    const expectedUserID = null;
    assert.deepStrictEqual(user, expectedUserID);
  });
});

describe("urlsForUser", function () {
  it("should return an object with short urls and their corresponding long url made by a specific user id", function () {
    const urls = urlsForUser("userRandomID", testDatabase);
    const expectedUrls = {
      b2xVn2: "http://www.lighthouselabs.ca",
      "9sm5xK": "http://www.google.com",
    };
    assert.deepStrictEqual(urls, expectedUrls);
  });
  it("should return empty object for a lookup with a non-existent valid email", function () {
    const user = urlsForUser("Non-Existent-User", testDatabase);
    const expectedUrls = {};
    assert.deepStrictEqual(user, expectedUrls);
  });
});

describe("addHttpToURL", function () {
  it("should return http:// added to a non-http url.", function () {
    const input = addHttpToURL("yahoo.ca");
    const output = "http://yahoo.ca";
    assert.deepStrictEqual(input, output);
  });
  it("should not change a http:// or https:// url", function () {
    const input = addHttpToURL("https://google.ca");
    const output = "https://google.ca";
    assert.deepStrictEqual(input, output);
  });
});
