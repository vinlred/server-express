const { Router } = require("express");

const router = Router();

const pool = require("./db");

// Get all message API
router.get("/", async (req, res) => {
  const allMessages = await pool.query("SELECT * FROM messages");
  res.send(allMessages.rows);
});

// Check for login session
router.use((req, res, next) => {
  if (req.session.user) {
    console.log("logged in");
    next();
  } else {
    console.log("not logged in");
    res.status(401).json({ message: "You don't have access to this feature" });
  }
});

// Post Message API
router.post("/write", async (req, res) => {
  try {
    const { message } = req.body;
    const { username } = req.session.user;
    const newMessage = await pool.query(
      "INSERT INTO messages (uname, messages) VALUES($1, $2)",
      [username, message]
    );
    res.status(201).json({ message: "Post has been created successfully" });
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
