const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();
const fs = require("fs");
const Users = require(path.resolve(__dirname, '../Users.json'));
let db = [];


app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '../views'));

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require('express-session');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false} ,
    cookie: { maxAge: 30 * 24 * 3600 * 1000 },
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

if (fs.existsSync('Users.json')) {
  const data = fs.readFileSync('Users.json');
  db = JSON.parse(data);
}

app.get("/home", (req, res) => {
  const username = req.session.username;
  res.render("index", { weather: null, error: null ,username: username });
});


// app.get("/", (req, res) => {
//   res.render("register", { weather: null, error: null });
// });


// app.post("/", (req, res, next) => {
//   let { username, email, password } = req.body;
//   if (!username || !email || !password) { return res.status(400).send("All fields are required.");}

//   const existingUser = db.find(user => user.email === email);
//   if (existingUser) {return res.status(400).send("User already exists with this email.");}

//   let user = {
//       id: new Date().getTime().toString().slice(5),
//       username: username,
//       email: email,
//       password: password
//   };
//   db.push(user);
//   fs.writeFile("Users.json", JSON.stringify(db), (err) => {
//       if (err) {return next(err); } 
//       else {res.redirect("login");}
//   });
// });

//Login 
app.get("/", (req, res) => {
  res.render("login", { weather: null, error: null });
});


app.post("/", (req, res) => {
  let { username, password } = req.body;
  let database = Users;
  if (!username || !password) {
      return res.status(400).send("All fields are required.");
  }
  let index = database.findIndex((elm) => elm.username.toLowerCase() == username.toLowerCase());
  if(index >= 0){
    if(database[index].password == password){
      req.session.username = database[index].username;
      res.redirect("/home");
    }
    else{
      res.send("Wrong Password");
    }
  }
  else{
    res.send("User Not Found");
  }
  // const foundUser = db.find(user => user.username === username && user.password === password);

  // if (foundUser) {
  //   req.session.username = foundUser.username;
  //   res.redirect("/home");
  // } else {
  //     res.status(401).send("Invalid credentials. Please try again.");
  // }
});



// Api Fetach
app.get("/weather", async (req, res) => {
  const city = req.query.city;  
  let username = req.session.username;
  const apiKey = "7e27156b2e8131e10937932a2a1a7abe";
  const APIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  let weather;
  let error = null;
  try {
    const response = await axios.get(APIUrl);
    weather = response.data;
  } catch (error) { 
    weather = null;
    error = "Error, Please try again";
  }
  
  res.render("index", { weather, error ,username});
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port http://localhost:${port}`);
});
