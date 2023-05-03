const { Router } = require("express");

const router = Router();

const pool = require("./db");

router.use((req, res, next) => {
  if (req.session.user) {
    console.log("logged in");
    next();
  } else {
    console.log("not logged in");
    res.status(401).json({ message: "You don't have access to this feature" });
  }
});

router.get("/", (req, res) => {
  console.log(req.session.user);
  res.status(200).json({ message: "You have access to post" });
});

router.post("/write", async (req, res) => {
  try {
    const { username, message, timestamp } = req.body;
    const newMessage = await pool.query(
      "INSERT INTO users (uname, messages, postTime) VALUES($1, $2, $3)",
      [username, message, timestamp]
    );
    res.status(201).json({ message: "Post has been created successfully" });
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
