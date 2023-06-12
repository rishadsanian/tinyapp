const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //ejs setup
app.use(express.urlencoded({ extended: true })); //encoding


const urlDatabase = {
  //database for urls
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
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
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
