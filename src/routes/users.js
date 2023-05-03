const { Router } = require("express");

const router = Router();

const pool = require("./db");

var bcrypt = require("bcrypt");

// router.post("/", (req, res) => {
//   userList.push(req.body);
//   res.send(201);
// });

router.post("/register", async (req, res) => {
  try {
    const { username, firstname, lastname, gender, birthdate, password } =
      req.body;
    // console.log(username, firstname, lastname, gender, birthdate, password);
    const checkPrev = await pool.query(`SELECT * FROM users WHERE uname = $1`, [
      username,
    ]);

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
  } catch (err) {
    console.error(err.message);
  }
});

router.use((req, res, next) => {
  if (req.session.user) {
    console.log("logged in");
    next();
  } else {
    console.log("not logged in");
    res.status(401).json({ message: "You don't have access to this feature" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        const filteredUsers = await pool.query(
          "SELECT * FROM users WHERE uid = $1",
          [parsedId]
        );
        // const filteredUsers = userList.filter((u) => u.id == parsedId);
        if (!isObjEmpty(filteredUsers)) {
          res.send(filteredUsers.rows[0]);
        } else res.sendStatus(404).json({ message: "No User with that ID" });
      } else res.send("Invalid User ID");
    } else {
      const allUsers = await pool.query("SELECT * FROM users");
      res.send(allUsers.rows);
    }
  } catch (err) {
    console.error(err.message);
  }
});

router.get("/:userid", async (req, res) => {
  console.log("this is for accessing user page");
  const username = req.params;
  // console.log(username.userid);
  // const uid = userList.find((u) => u.user === userid);
  const curuser = await pool.query("SELECT * FROM users WHERE uname = $1", [
    username.userid,
  ]);
  res.send(curuser.rows[0]);
});

function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

async function hashed(password) {
  const saltRounds = bcrypt.genSaltSync();
  const hash = await bcrypt.hash(password, saltRounds);
  // const matchCheck = await bcrypt.compare(password, hash);
  console.log(hash);
  // if (matchCheck) {
  //   console.log("Matches");
  // } else {
  //   console.log("Nope");
  // }
  return hash;
}

module.exports = router;
