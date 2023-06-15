///////////////////////////TINYAPP SERVER FILE/////////////////////////////////

//////////////////////////////todo wishlist////////////////////////////////////
/*
error message html view withheader message and back button/link
-function to generate error messages based on status code
all post security - stop making new users if not authorized
long url duplicate per user
copy shorturl from urlshow
*/
//////////////////////////////////////////////////////////////////////////////

//Modules, Packages and files required
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
////////////////////////////////////////////////////////////////////////////////

//server
const app = express();
const PORT = 8080; // default port 8080

////////////////////////////////////////////////////////////////////////////////

//middleware
app.set("view engine", "ejs"); //ejs setup as view engine
app.use(express.urlencoded({ extended: true })); //built in express encoding used for reading/parsing post body
app.use(cookieParser()); //cookieParser set to use as encoding for cookies
//nodemon - used to restart server on changes automatically
// todo setup morgan and use

///////////////////////////////////////////////////////////////////////////////

/////////////////////////OBJECTS and VARIABLES/////////////////////////////////

//USER DATABASE

//APP DATABASE
const urlDatabase = {
  //database for urls
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "admin1" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "admin1" },
};

//USER DATABASE
const users = {
  admin1: {
    id: "admin1",
    email: "admin@tinyapp.com",
    password: bcrypt.hashSync("test", 10),
  },
};

//JSON DATAS
//url database in json format and route for .json urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////////////////////////////////////////////////////////////////////////////////

////////////////////////////HELPER FUNCTIONS///////////////////////////////////

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

//------------------------------------------------------------------------------

//function to handle edgecases for ONLY when http:// is not added / checks for http and https in long urls

const addHttpToURL = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  return url;
};

//------------------------------------------------------------------------------

//function checks if an email exists in the user database and returns the full user object or null

const findUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

//------------------------------------------------------------------------------

// function returns the URLs where the userID is equal to the id of the currently logged-in user.

const urlsForUser = (id) => {
  let output = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userId === id) {
      output[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return output;
};

//------------------------------------------------------------------------------

//functions to handle 400s status codes

//users

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
  if (!Object.keys(urlsForUser(req.cookies.user_id)).includes(req.params.id)) {
    return res
      .status(403)
      .send(
        `<html> <p style="font-size: larger"> Error 403: Unauthorized user.</p> </html> \n`
      );
  }
};

///////////////////////////////////////////////////////////////////////////////

//////// ./ HOMEPAGE REDIRECTS TO URLS IF LOGGED IN OR LOGIN PAGE IF NOT////////

app.get("/", (req, res) => {
  !req.cookies.user_id ? res.redirect(`/login`) : res.redirect(`/urls`);
});

//////////////////////// URL DATA ENDPOINTS GET/POST  //////////////////////////

// ./urls (urls_index.ejs)  - SHOW ALL URLS WITH BUTTONS TO EDIT OR DELETE

//route to urls ejs flie and return render based on the template vars
app.get("/urls", (req, res) => {
  //validate
  if (!req.cookies.user_id) return handleUnauthenticatedUser(req, res);

  const templateVars = {
    urls: urlsForUser(req.cookies.user_id), //
    user: users[req.cookies.user_id],
  };

  res.render("urls_index", templateVars);
});

//deletes an entry from urls_index page and urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  //validate
  if (!req.cookies.user_id) return handleUnauthenticatedUser(req, res);
  if (!(req.params.id in urlDatabase)) return handleInvalidUrl(req, res);
  if (!Object.keys(urlsForUser(req.cookies.user_id)).includes(req.params.id))
    return handleUnauthorizedAccess(req, res);

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//------------------------------------------------------------------------------

// ./urls/new (urls_new.ejs) CREATE NEW URLS WITH FORM TO SUBMIT

//routes to urlsnew view
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };

  !templateVars.user
    ? res.redirect(`/login`)
    : res.render(`urls_new`, templateVars);
});
app.post("/urls", (req, res) => {
  // creates a new entry from the urls_new page.

  if (!req.cookies.user_id) return handleUnauthenticatedUser(req, res);

  if (req.cookies.user_id) {
    const randomString = generateRandomString(urlDatabase);
    urlDatabase[randomString] = {
      longURL: addHttpToURL(req.body.longURL),
      userId: req.cookies.user_id,
    }; //adds http
    res.redirect(`/urls/${randomString}`);
  } //redirects back to the urls/:id view
});

// ----------------------------------------------------------------------------

// ./urls/:id (urls_show.ejs) SHOWS LONG URL LINKS TO FOLLOW AND EDIT OPTION FOR UPDATE

//route to urls show ejs flie and return render based on the template vars
app.get("/urls/:id", (req, res) => {
  //Validate
  if (!req.cookies.user_id) return handleUnauthenticatedUser(req, res);
  if (!(req.params.id in urlDatabase)) return handleInvalidUrl(req, res);
  if (!Object.keys(urlsForUser(req.cookies.user_id)).includes(req.params.id))
    return handleUnauthorizedAccess(req, res);

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id],
  };

  res.render("urls_show", templateVars);
});

//updates long url for an existing short url via the urlshow page's edit section
app.post("/urls/:id", (req, res) => {
  //validate
  if (!req.cookies.user_id) return handleUnauthenticatedUser(req, res);
  if (!(req.params.id in urlDatabase)) return handleInvalidUrl(req, res);
  if (!Object.keys(urlsForUser(req.cookies.user_id)).includes(req.params.id))
    return handleUnauthorizedAccess(req, res);

  urlDatabase[req.params.id].longURL = addHttpToURL(req.body.longURL);
  res.redirect(`/urls/${req.params.id}`); //redirects back to the same view
});

// ----------------------------------------------------------------------------

// /u/:id REDIRECTS TO LONG URL FROM SHORT URL

app.get("/u/:id", (req, res) => {
  //validate
  if (!(req.params.id in urlDatabase)) return handleInvalidUrl(req, res);

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
  return;
});

////////////////////////////////////////////////////////////////////////////////

///////////////// USER DATA ENDPOINTS GET/POST //////////////////////

// ./register (user_register.ejs)  USER REGISTRATION PAGE WITH USER EMAIL AND PASSWORD FORM

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };

  !templateVars.user
    ? res.render(`user_register`, templateVars)
    : res.redirect(`/urls`);
});

//saves user settings in users object
app.post("/register", (req, res) => {
  //validation

  //Check empty email or passwords
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email and password are required.");
  }

  //Check for duplicate emails for reg
  if (findUserByEmail(req.body.email) !== null) {
    return res.status(409).send("User already exists.");
  }

  //create new user
  const userId = "user" + generateRandomString(users);

  //password security
  const password = req.body.password; // found in the req.body object
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashedPassword, //todo hash for security
  };

  //Set cookies and redirect to /urls
  res.cookie("user_id", userId);
  console.log("User Database", users);
  res.redirect(`/urls`);
});

// ----------------------------------------------------------------------------

// ./login (user_login.ejs) - ALLOWS USERS TO CREATE A NEW ACCOUNT WITH AN EMAIL AND PASSWORD FORM

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };

  !templateVars.user
    ? res.render(`user_login`, templateVars)
    : res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  //Validate

  //Check Email
  if (!findUserByEmail(req.body.email))
    return handleInvalidCredentials(req, res);

  //Lookup valid userid by email
  const userId = findUserByEmail(req.body.email).id;

  //Check Password
  if (!bcrypt.compareSync(req.body.password, users[userId].password))
    return handleInvalidCredentials(req, res);

  //Set cookie when user logs in and redirects to /urls
  res.cookie("user_id", userId);
  res.redirect(`/urls`);
});

// ----------------------------------------------------------------------------

// /logout DELETES COOKIES WHEN LOGOUT AND REDIRECT TO LOGIN

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
});

///////////////////////////////////////////////////////////////////////////////

//SERVER LISTENING  WHEN FILE RUN

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

console.log(users);
console.log(urlDatabase);

////////////////////////////////////////////////////////////////////////////////
