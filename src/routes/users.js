const { Router } = require("express");

const router = Router();

const pool = require("./db");

var bcrypt = require("bcrypt");

// router.post("/", (req, res) => {
//   userList.push(req.body);
//   res.send(201);
// });

// Register API
router.post("/register", async (req, res) => {
  try {
    if (req.session.user) {
      res.status(401).json({ message: "You are already logged in" });
    } else {
      console.log("Registering New User");
      const { username, firstname, lastname, gender, birthdate, password } =
        req.body;
      // console.log(username, firstname, lastname, gender, birthdate, password);
      const checkPrev = await pool.query(
        `SELECT * FROM users WHERE uname = $1`,
        [username]
      );

      if (checkPrev.rows.length != 0) {
        return res.status(400).json({
          error: "Username already exist",
        });
      } else {
        const hashedPass = await hashed(password);
        const newUser = await pool.query(
          "INSERT INTO users (uname, pass, fname, lname, gender, date_of_birth) VALUES($1, $2, $3, $4, $5, $6)",
          [username, hashedPass, firstname, lastname, gender, birthdate]
        );
        res.status(201).json({ message: "User Created Successfully" });
        // res.sendStatus(201);
      }
    }
  } catch (err) {
    console.error(err.message);
  }
});

// Check for Login Session
router.use((req, res, next) => {
  if (req.session.user) {
    console.log("logged in");
    next();
  } else {
    console.log("not logged in");
    res
      .status(401)
      .json({ message: "You don't have access to this feature, Please login" });
  }
});

router.post("/", (req, res) => {
  res.status(200).json({ message: "To create a post, go to /api/posts/write" });
});

// Get all Users or Process Query "/api/users?id=N, N is id number on DB"
router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        const filteredUsers = await pool.query(
          "SELECT uid, uname, fname, lname, gender, date_of_birth FROM users WHERE uid = $1",
          [parsedId]
        );
        // const filteredUsers = userList.filter((u) => u.id == parsedId);
        if (!isObjEmpty(filteredUsers)) {
          res.send(filteredUsers.rows[0]);
        } else res.sendStatus(404).json({ message: "No User with that ID" });
      } else res.send("Invalid User ID");
    } else {
      const allUsers = await pool.query(
        "SELECT uid, uname, fname, lname, gender, date_of_birth FROM users"
      );
      res.send(allUsers.rows);
    }
  } catch (err) {
    console.error(err.message);
  }
});

// Get user based on username
router.get("/:userid", async (req, res) => {
  console.log("this is for accessing user page");
  const username = req.params;
  // console.log(username.userid);
  const cekuser = await pool.query("SELECT * FROM users WHERE uname = $1", [
    username.userid,
  ]);
  if (cekuser.rows.length == 0) {
    return res.status(403).json({ message: "User does not exist" });
  }
  const curuser = await pool.query(
    "SELECT uid, uname, fname, lname, gender, date_of_birth FROM users WHERE uname = $1",
    [username.userid]
  );
  const curmes = await pool.query(
    "SELECT mid, created_at, messages FROM messages WHERE uname = $1",
    [username.userid]
  );
  // res.send(curuser.rows[0]);
  // res.send(curmes.rows[0]);
  res.json({ user: curuser.rows[0], message: curmes.rows });
});

// Extra function
// Check null
function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// Hashing function
async function hashed(password) {
  const saltRounds = bcrypt.genSaltSync();
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

module.exports = router;
