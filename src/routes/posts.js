const { Router } = require("express");

const router = Router();

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

module.exports = router;
