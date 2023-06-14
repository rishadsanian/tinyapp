///////////////////////////TINYAPP SERVER FILE/////////////////////////////////

//Modules, Packages and files required
const express = require("express");
const cookieParser = require("cookie-parser");

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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//USER DATABASE
const users = {};

//JSON DATAS

//url database in json format and route for .json urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//CURRENT USER can user object be defined here?
// let currentUser = {};
// let userID;

////////////////////////////////////////////////////////////////////////////////

////////////////////////////HELPER FUNCTIONS///////////////////////////////////

//generates a random short url string  //todo - refactor to single function with below
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

//to handle edgecases for ONLY when http:// is not added / checks for http and https

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
    if (user.email === email) {
      return users[user];
    }
    return null;
  }
};

///////////////////////////////////////////////////////////////////////////////

///////////////// URL DATA GET - POSTS RENDERS/REDIRECTS //////////////////////

// home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//------------------------------------------------------------------------------

// ./urls (urls_index.ejs)  - SHOW ALL URLS WITH BUTTONS TO EDIT OR DELETE

//route to urls ejs flie and return render based on the template vars
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//deletes an entry from urls_index page and urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//------------------------------------------------------------------------------

// ./urls/new (urls_new.ejs) CREATE NEW URLS WITH FORM TO SUBMIT

//routes to urlsnew view
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  // creates a new entry from the urls_new page.
  //TODO EDGECASE -> if long url already exist.
  //TODO EDGECASE -> adds http/https if not included - done
  const randomString = generateRandomString(urlDatabase);
  urlDatabase[randomString] = addHttpToURL(req.body.longURL);
  res.redirect(`/urls/${randomString}`); //redirects back to the urls/:id view
});

// ----------------------------------------------------------------------------

// ./urls/:id (urls_show.ejs) SHOWS LONG URL LINKS TO FOLLOW AND EDIT OPTION FOR UPDATE

//route to urls show ejs flie and return render based on the template vars
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

//redirects to long url when clicked from urls_show page.
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
  return;
});

//updates long url for an existing short url via the urlshow page's edit section
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = addHttpToURL(req.body.longURL);
  res.redirect(`/urls/${req.params.id}`); //redirects back to the same view
});

////////////////////////////////////////////////////////////////////////////////

///////////////// USER DATA GET - POSTS RENDERS/REDIRECTS //////////////////////

// ./login (page not made yet)

//sets cookie when user logs in
app.post("/login", (req, res) => {
  res.cookie("user_id");
  res.redirect(`/urls`); //redirects back to the same view
});

//deletes cookie when user logs out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`); //redirects back to the same view
});

// ./register USER REGISTRATION PAGE WITH USER EMAIL AND PASSWORD FORM

//redirects to long url when clicked from urls_show page.
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }; //todo add username
  res.render(`user_register`, templateVars);
});

//saves user settings in users object
app.post("/register", (req, res) => {
  //   If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (!req.body.email || !req.body.password) {
    console.log("no user");
  }

  const userID = "user" + generateRandomString(users);

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code.

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password, //todo hash for security
  };

  res.cookie("user_id", userID);
  res.redirect(`/urls`);
});

///////////////////////////////////////////////////////////////////////////////

//SERVER LISTENING  WHEN RUN

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

////////////////////////////////////////////////////////////////////////////////
