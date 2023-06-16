///////////////////////////////////////////////////////////////////////////////
////                               TINYAPP                                 ////
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------//

//Modules, Packages and files required
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs"); //question
const morgan = require("morgan");
const methodOverride = require("method-override");

//Helper Functions for App
const {
  findUserByEmail,
  urlsForUser,
  generateRandomString,
  addHttpToURL,
  countUniqueVisitors,
} = require("./helpers");

//Helper Functions for Error Handling
const {
  handleUnauthenticatedUser,
  handleUnauthorizedAccess,
  handleInvalidUrl,
  handleInvalidCredentials,
} = require("./helpers");

////////////////////////////////////////////////////////////////////////////////

//Server
const app = express();
const PORT = 8080; // default port 8080

////////////////////////////////////////////////////////////////////////////////

//Middleware setup

app.set("view engine", "ejs"); //ejs setup as view engine
app.use(express.urlencoded({ extended: true })); //built in express encoding used for reading/parsing post body

// Security SALT for bcrypt and cookie session management
const salt = bcrypt.genSaltSync(10);
app.use(
  cookieSession({
    name: "session",
    keys: [salt, salt, salt],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

//nodemon - used to restart server on changes automatically

//Morgan status code checks
app.use(morgan("dev"));

app.use(methodOverride("_method")); //methodoverride for put and delete

///////////////////////////////////////////////////////////////////////////////

/////////////////////////OBJECTS and VARIABLES/////////////////////////////////

//APP DATABASE
const urlDatabase = {
  //database for urls
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "admin1",
    tracking: [],
    // countVisits: !this.tracking ? 0 : this.tracking.length,
    // countUniqueVisitors: () => {
    //   return countUniqueVisitors(this.tracking);
    // },
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "admin1",
    tracking: [],
    // countVisits: !this.tracking ? 0 : this.tracking.length,
    // countUniqueVisitors: () => {
    //   return countUniqueVisitors(this.tracking);
    // },
  },
};

//VISITORS DATABASE
const visitors = {};

//USER DATABASE
const users = {
  admin1: {
    id: "admin1",
    email: "admin@tinyapp.com",
    password: bcrypt.hashSync("test", salt),
  },
};

//JSON DATAS
//url database in json format and route for .json urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////////////////////////////////////////////////////////////////////////////////

//------------------------------------------------------------------------------
/////////////////////////////////////////////////////////////////// ./ HOMEPAGE
//------------------------------------------------------------------------------

//Redirects based on login status

app.get("/", (req, res) => {
  !req.session.userID ? res.redirect(`/login`) : res.redirect(`/urls`);
});

//------------------------------------------------------------------------------
//////////////////////// URL DATA ENDPOINTS GET/POST  //////////////////////////
//------------------------------------------------------------------------------

//////// ./urls (urls_index.ejs)  - SHOW ALL URLS WITH BUTTONS TO EDIT OR DELETE
//------------------------------------------------------------------------------

//route to urls ejs flie and return render based on the template vars
app.get("/urls", (req, res) => {
  //validate

  //Check if user is logged in
  if (!req.session.userID) return handleUnauthenticatedUser(req, res);

  //Routes to appropriate view
  const templateVars = {
    urls: urlsForUser(req.session.userID, urlDatabase), //
    user: users[req.session.userID],
  };

  res.render("urls_index", templateVars);
});

//------------------------------------------------------------------------------

//deletes an entry from urls_index page and urlDatabase

app.delete("/urls/:id", (req, res) => {
  //validate
  const userId = req.session.userID;
  const shortUrl = req.params.id;

  //Check if user is logged in.
  if (!userId) return handleUnauthenticatedUser(req, res);

  //Checks if url exists in database.
  if (!(shortUrl in urlDatabase)) return handleInvalidUrl(req, res);

  //Checks if user owns the url.
  const urlObj = urlDatabase[shortUrl];
  if (urlObj.userId !== userId) return handleUnauthorizedAccess(req, res);

  //Deletes the entry
  delete urlDatabase[shortUrl]; //could be made in to a function
  res.redirect("/urls");
});

//------------------------------------------------------------------------------

////////////////// ./urls/new (urls_new.ejs) CREATE NEW URLS WITH FORM TO SUBMIT
//------------------------------------------------------------------------------

//routes to urlsnew view
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.userID] };

  //check if user is logged in and route to appropriate view
  !templateVars.user
    ? res.redirect(`/login`)
    : res.render(`urls_new`, templateVars);
});

//------------------------------------------------------------------------------

// creates a new entry from the urls_new page.
app.post("/urls", (req, res) => {
  // Check if user is logged in
  if (!req.session.userID) return handleUnauthenticatedUser(req, res);

  //Generates short url and save urls to database.
  if (req.session.userID) {
    const randomString = generateRandomString(urlDatabase);
    urlDatabase[randomString] = {
      longURL: addHttpToURL(req.body.longURL),
      userId: req.session.userID,
      tracking: [],
      // countVisits: !this.tracking ? 0 : this.tracking.length,

      // countUniqueVisitors: () => {
      //   return countUniqueVisitors(this.tracking);
      // },
    };

    //Route to appropriate view
    res.redirect(`/urls/${randomString}`);
  }
});

// ----------------------------------------------------------------------------
///////// ./urls/:id (urls_show.ejs) SHOWS LONG URL LINKS TO FOLLOW AND EDIT OPTION FOR UPDATE
// ----------------------------------------------------------------------------

//route to urls show ejs flie and return render based on the template vars
app.get("/urls/:id", (req, res) => {
  //Validate

  const userId = req.session.userID;
  const shortUrl = req.params.id;

  //Check if user is logged in.
  if (!userId) return handleUnauthenticatedUser(req, res);

  //Checks if url exists in database.
  if (!(shortUrl in urlDatabase)) return handleInvalidUrl(req, res);

  //Checks if user owns the url.
  const urlObj = urlDatabase[shortUrl];
  if (urlObj.userId !== userId) return handleUnauthorizedAccess(req, res);

  //Compute analytics
  const countVisits = urlObj.tracking.length;
  const countUnique = countUniqueVisitors(urlObj.tracking);

  //Send to appropriate render view
  const templateVars = {
    id: shortUrl,
    longURL: urlDatabase[shortUrl].longURL,
    user: users[req.session.userID],
    countVisits: countVisits,
    countUnique: countUnique,
  };

  res.render("urls_show", templateVars);
});
// ----------------------------------------------------------------------------

//updates long url for an existing short url via the urlshow page's edit section
app.put("/urls/:id", (req, res) => {
  //validate

  const userId = req.session.userID;
  const shortUrl = req.params.id;

  //Check if user is logged in.
  if (!userId) return handleUnauthenticatedUser(req, res);

  //Checks if url exists in database.
  if (!(shortUrl in urlDatabase)) return handleInvalidUrl(req, res);

  //Checks if user owns the url.
  const urlObj = urlDatabase[shortUrl];
  if (urlObj.userId !== userId) return handleUnauthorizedAccess(req, res);

  //Update long url
  urlDatabase[req.params.id].longURL = addHttpToURL(req.body.longURL);
  res.redirect(`/urls/${req.params.id}`); //redirects back to the same view
});

// ----------------------------------------------------------------------------
////////////////////////////////// /u/:id REDIRECTS TO LONG URL FROM SHORT URL
// ----------------------------------------------------------------------------

app.get("/u/:id", (req, res) => {
  //validate
  const userId = req.session.userID;
  const shortUrl = req.params.id;
  const urlObj = urlDatabase[shortUrl];
  const longURL = urlObj.longURL;

  //check if the url exists in the database
  if (!(shortUrl in urlDatabase)) return handleInvalidUrl(req, res);

  //check if there is an existing visitor id cookie
  if (!req.session.visitorId) {
    //generate and set cookie
    req.session.visitorId = "visitor" + generateRandomString(visitors);
    //Enter new entry in visitor Database
    visitors[req.session.visitorId] = [];
  }

  const visitorId = req.session.visitorId;

  //If visitor is not the owner of short url
  if (urlObj.userId !== userId) {
    //register visitor activity in visitor Database
    visitors[visitorId].push({
      timestamp: new Date(),
      shortUrl: shortUrl,
    });

    //Add tracking information to URL Database
    urlObj.tracking.push({ visitorId: visitorId, timestamp: new Date() });
  }

  console.log(urlDatabase);

  //Redirect to long URL
  res.redirect(longURL);
  return;
});

////////////////////////////////////////////////////////////////////////////////

// ----------------------------------------------------------------------------
///////////////// USER DATA ENDPOINTS GET/POST ////////////////////////////////
// ----------------------------------------------------------------------------

//////////////////// ./register (user_register.ejs)  USER REGISTRATION PAGE    WITH USER EMAIL AND PASSWORD FORM
// ----------------------------------------------------------------------------

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.userID] };

  !templateVars.user
    ? res.render(`user_register`, templateVars)
    : res.redirect(`/urls`);
});

// ----------------------------------------------------------------------------

//saves user settings in users object
app.post("/register", (req, res) => {
  //validation

  //Check empty email or passwords
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email and password are required.");
  }

  //Check for duplicate emails for reg
  if (findUserByEmail(req.body.email, users) !== null) {
    return res.status(409).send("User already exists.");
  }

  //create new userId
  const userId = "user" + generateRandomString(users);

  //password security
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);

  //Save user to user database
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashedPassword, //todo hash for security
  };

  //Set cookies and redirect to /urls
  req.session.userID = userId;
  res.redirect(`/urls`);
});

// ----------------------------------------------------------------------------
// ./login (user_login.ejs) - ALLOWS USERS TO CREATE A NEW ACCOUNT WITH AN EMAIL AND PASSWORD FORM
// ----------------------------------------------------------------------------

//Login page view setup
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userID] };

  //Check if user already logged in
  !templateVars.user
    ? res.render(`user_login`, templateVars)
    : res.redirect(`/urls`);
});

// ----------------------------------------------------------------------------

app.post("/login", (req, res) => {
  //Validate

  //Check Email
  if (!findUserByEmail(req.body.email, users))
    return handleInvalidCredentials(req, res);

  //Lookup valid userid by email
  const userId = findUserByEmail(req.body.email, users);

  //Check Password
  if (!bcrypt.compareSync(req.body.password, users[userId].password))
    return handleInvalidCredentials(req, res);

  //Set cookie when user logs in and redirects to /urls
  req.session.userID = userId;
  res.redirect(`/urls`);
});

// ----------------------------------------------------------------------------

//////////////////// /logout DELETES COOKIES WHEN LOGOUT AND REDIRECT TO LOGIN
// ----------------------------------------------------------------------------

//Remove cookie and redirect to login.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

///////////////////////////////////////////////////////////////////////////////
////////////////////SERVER LISTENING  WHEN FILE RUN/////////////////////////////
// ----------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

////////////////////////////////////////////////////////////////////////////////
console.log(urlDatabase);
console.log(users);
