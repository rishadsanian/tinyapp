const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
//middleware

//nodemon - used
// todo setup morgan and use

//View Engine - EJS
app.set("view engine", "ejs"); //ejs setup
app.use(express.urlencoded({ extended: true })); //encoding used for reading/parsing post body
app.use(cookieParser()); //cookieParser set to use

const urlDatabase = {
  //database for urls
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = (urlDatabase) => {
  //generates short url string
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }

  if (urlDatabase[randomString]) {
    //EDGECASE if random string already exists
    generateRandomString();
  }

  return randomString;
};

const addHttpToURL = (url) => {
  //to handle edgecases ONLY when http:// is not added
  //use - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    //checks for http:// and https://
    url = "http://" + url;
  }
  return url;
};

app.get("/", (req, res) => {
  // home page
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  //url database in json format
  //route for .json urls
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  //route to urls ejs flie and return render based on the template vars
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //routes to urlsnew view
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //route to urls show ejs flie and return render based on the template vars
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // creates a new entry from the urls_new page.
  //TODO EDGECASE -> if long url already exist.
  //TODO EDGECASE -> adds http/https if not included - done
  const randomString = generateRandomString(urlDatabase);
  urlDatabase[randomString] = addHttpToURL(req.body.longURL);

  res.redirect(`/urls/${randomString}`); //redirects back to the same view
});

app.get("/u/:id", (req, res) => {
  //redirects to long url when clicked from urls_show page.
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
  return;
});

app.post("/urls/:id/delete", (req, res) => {
  //deletes an entry from urls_index page and urlDatabase
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  //updates long url for an existing short url via the urlshow page's edit section
  urlDatabase[req.params.id] = addHttpToURL(req.body.longURL);
  //console.log(urlDatabase);

  res.redirect(`/urls/${req.params.id}`); //redirects back to the same view
});

app.post("/login", (req, res) => {
  //sets cookie when username logs in
  res.cookie("username", req.body.username);
  res.redirect(`/urls`); //redirects back to the same view
});

app.post("/logout", (req, res) => {
  //sets cookie when username logs in
  res.clearCookie("username");
  res.redirect(`/urls`); //redirects back to the same view
});

app.get("/register", (req, res) => {
  //redirects to long url when clicked from urls_show page.
  // const longURL = urlDatabase[req.params.id];
  const templateVars = { username: req.cookies["username"] };
  res.render(`user_register`, templateVars);
  return;
});

app.listen(PORT, () => {
  //server listening
  console.log(`Example app listening on port ${PORT}!`);
});
