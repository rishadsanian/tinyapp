const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //ejs setup
app.use(express.urlencoded({ extended: true })); //encoding used for readying post body

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //routes to urlsnew view
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  //route to urls show ejs flie and return render based on the template vars
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString(urlDatabase);
  urlDatabase[randomString] = req.body.longURL; // Log the POST request body to the console

  //route to urls show ejs flie and return render based on the template vars
  const templateVars = {
    id: randomString,
    longURL: urlDatabase[randomString],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
  return;
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
