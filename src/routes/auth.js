const { Router, request } = require("express");

const router = Router();

const pool = require("./db");

var bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const checkUser = await pool.query("SELECT * FROM users WHERE uname = $1", [
      username,
    ]);
    if (checkUser.rows.length == 0) {
      return res.status(400).json({ error: "Username Not Found" });
    }
    console.log(`Username: ${username} Found`);
    const dbPass = await pool.query("SELECT pass FROM users where uname = $1", [
      username,
    ]);
    const hashedPass = dbPass.rows[0].pass;
    const matchCheck = await bcrypt.compare(password, hashedPass);
    if (matchCheck) {
      console.log("Matches, Logged In");
      if (req.session.user) {
        res
          .status(401)
          .json({ message: "There is already an account logged in" });
      } else {
        req.session.user = {
          username,
        };
        req.session.cookie.maxAge = 3600000 * 24;
        // res.send(req.session);
        res.status(202).json({ message: "Logged In" });
      }
    } else {
      console.log("Nope");
      res.status(401).json({ message: "Wrong Password" });
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

module.exports = router;
