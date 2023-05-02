const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const pool = require("./db");
const usersRoute = require("./routes/users");
const postsRoute = require("./routes/posts");
const authsRoute = require("./routes/auth");

const app = express();
const PORT = 8080;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  session({
    secret: "ASJHDAKJKJFAPSIDAWKFA",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/auth", authsRoute);

app.get("/", (req, res) => {
  res.send("owob home page");
});

app.listen(PORT, () => {
  console.log(`Running Server on Port ${PORT} at ${new Date()}`);
});
