const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //ejs setup
app.use(express.urlencoded({ extended: true })); //encoding used for reading post body

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
  //to handle edgecases when http:// is not added
  //use - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
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
  // creates a new entry from the urls_new page.
  //TODO EDGECASE -> if long url already exist.
  //TODO EDGECASE -> adds http/https if not included - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith --need to test
  const randomString = generateRandomString(urlDatabase);
  urlDatabase[randomString] = addHttpToURL(req.body.longURL);

  //route to urls show ejs flie and return render based on the template vars

  res.redirect(`/urls/${randomString}`); // changed from res - urls show to redirect
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

  res.redirect(`/urls/${req.params.id}`); //changed from res - urls show to redirect
});

app.listen(PORT, () => {
  //server listening
  console.log(`Example app listening on port ${PORT}!`);
});
