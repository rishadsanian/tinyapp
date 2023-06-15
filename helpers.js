////////////////////////////HELPER FUNCTIONS///////////////////////////////////

//function checks if an email exists in the user database and returns the full user object or null

const findUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return null;
};

//------------------------------------------------------------------------------

// function returns the URLs where the userID is equal to the id of the currently logged-in user.

const urlsForUser = (id, database) => {
  let output = {};
  for (const shortUrl in database) {
    if (database[shortUrl].userId === id) {
      output[shortUrl] = database[shortUrl].longURL;
    }
  }
  return output;
};

//-----------------------------------------------------------------------------

//function to handle edgecases for ONLY when http:// is not added / checks for http and https in long urls

const addHttpToURL = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  return url;
};

//------------------------------------------------------------------------------
//generates a random short url string  - used for generating short url and userid
const generateRandomString = (database) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }

  //EDGECASE if random string already exists in database
  if (database[randomString]) {
    generateRandomString(database);
  }

  return randomString;
};

//-----------------------------------------------------------------------------

//functions to handle 400s status codes

const handleUnauthenticatedUser = (req, res) => {
  return res
    .status(403)
    .send(
      `<html> <p style="font-size: larger"> Error 403: Unauthenticated User. You need to log in or create an account to view this page.</p> </html> \n`
    );
};

const handleInvalidCredentials = (req, res) => {
  return res
    .status(401)
    .send(
      `<html><p style="font-size: larger">Error 401: Unable to Authenticate. Invalid email or password</p></html>`
    );
};

const handleInvalidUrl = (req, res) => {
  return res
    .status(404)
    .send(
      `<html> <p style="font-size: larger"> Error 404: URL not found.</p> </html> \n`
    );
};

const handleUnauthorizedAccess = (req, res) => {
  return res
    .status(403)
    .send(
      `<html> <p style="font-size: larger"> Error 403: Unauthorized user.</p> </html> \n`
    );
};

///////////////////////////////////////////////////////////////////////////////
module.exports = {
  findUserByEmail,
  urlsForUser,
  generateRandomString,
  addHttpToURL,
  handleUnauthenticatedUser,
  handleUnauthorizedAccess,
  handleInvalidUrl,
  handleInvalidCredentials,
};
