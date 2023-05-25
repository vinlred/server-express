const { Router } = require('express');

const router = Router();

const pool = require('./db');
const session = require('express-session');

// Get all message API
router.get('/', async (req, res) => {
  const allMessages = await pool.query(
    'SELECT * FROM messages WHERE deleted = FALSE AND edited = FALSE'
  );
  return res.send(allMessages.rows);
});

// Check for login session
router.use((req, res, next) => {
  if (req.session.user) {
    console.log('logged in');
    next();
  } else {
    console.log('not logged in');
    return res
      .status(401)
      .json({ message: "You don't have access to this feature" });
  }
});

// Get all of user's messages by user session
router.get('/mine', async (req, res) => {
  try {
    const { username } = req.session.user;
    const allMessages = await pool.query(
      'SELECT * FROM messages WHERE uname=$1 AND deleted = FALSE AND edited = FALSE',
      [username]
    );
    res.send(allMessages.rows);
    // res.status(201).json({ message: 'Post has been created successfully' });
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    const checkmes = await pool.query('SELECT * FROM messages WHERE mid = $1', [
      mid,
    ]);
    if (checkmes.rows.length == 0 || checkmes.rows[0].deleted) {
      console.log('Posts not found');
      return res.status(401).json({ message: 'Post not found' });
    }
    const curmes = await pool.query(
      'SELECT * FROM messages WHERE mid = $1 AND deleted = FALSE AND edited = FALSE',
      [mid]
    );
    const currep = await pool.query(
      'SELECT * FROM replies WHERE mid = $1 AND deleted = FALSE',
      [mid]
    );
    res.json({ message: curmes.rows, replies: currep.rows });
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/reply/mine', async (req, res) => {
  try {
    const { username } = req.session.user;
    console.log(username);
    const currep = await pool.query(
      'SELECT repid, mid, uname, created_at, messages FROM replies WHERE uname = $1 AND deleted = FALSE',
      [username]
    );

    res.send(currep.rows);
    console.log('berhasil ambil reply');
  } catch (err) {
    console.log(err.message);
  }
});

// Post Message API
router.post('/write', async (req, res) => {
  try {
    const { message } = req.body;
    const { username } = req.session.user;
    const newMessage = await pool.query(
      'INSERT INTO messages (uname, messages, deleted, edited) VALUES($1, $2, FALSE, FALSE)',
      [username, message]
    );
    return res
      .status(201)
      .json({ message: 'Post has been created successfully' });
  } catch (err) {
    console.log(err.message);
  }
});

router.post('/reply/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    const checkmes = await pool.query(
      'SELECT messages FROM messages WHERE mid = $1 AND deleted = FALSE AND edited = FALSE',
      [mid]
    );
    if (checkmes.rows.length == 0) {
      console.log('error in replying');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { message } = req.body;
    const { username } = req.session.user;
    await pool.query(
      'INSERT INTO replies (mid, uname, messages, deleted) VALUES($1, $2, $3, FALSE)',
      [mid, username, message]
    );
    return res
      .status(201)
      .json({ message: 'Reply has been created successfully' });
  } catch (err) {
    console.log(err.message);
  }
});

// router.get('/reply/:uname', async (req, res) => {
//   const { uname } = req.params;
//   const cekuser = await pool.query('SELECT * FROM users WHERE uname = $1', [
//     uname,
//   ]);
//   if (cekuser.rows.length == 0) {
//     return res.status(403).json({ message: 'User does not exist' });
//   }
//   const currep = await pool.query(
//     'SELECT repid, mid, uname, created_at, messages FROM replies WHERE uname = $1 AND deleted = FALSE',
//     [uname]
//   );
//   res.send(currep.rows);
// });

// Get Reply from message id
router.get('/reply/:mid', async (req, res) => {
  const { mid } = req.params;
  const currep = await pool.query(
    'SELECT repid, mid, uname, created_at, messages FROM replies WHERE mid = $1 AND deleted = FALSE',
    [mid]
  );
  res.send(currep.rows);
});

router.get('/delete/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    console.log(mid);
    const muser = await pool.query(
      'SELECT uname, deleted FROM messages WHERE mid = $1',
      [mid]
    );
    if (muser.rows.length == 0 || muser.rows[0].deleted) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.session.user.username != muser.rows[0].uname) {
      return res.status(401).json({ message: 'Unauthorized' });
    } else {
      await pool.query('UPDATE messages SET deleted = TRUE WHERE mid = $1', [
        mid,
      ]);
      await pool.query('UPDATE replies SET deleted = TRUE WHERE mid = $1', [
        mid,
      ]);
      return res
        .status(201)
        .json({ message: 'Post has been deleted successfully' });
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/reply/delete/:rid', async (req, res) => {
  try {
    const { rid } = req.params;
    console.log(rid);
    const ruser = await pool.query(
      'SELECT uname FROM replies WHERE repid = $1',
      [rid]
    );
    console.log(ruser.rows[0].uname);
    console.log(req.session.user.username);
    if (req.session.user.username != ruser.rows[0].uname) {
      return res.status(401).json({ message: 'Unauthorized' });
    } else {
      await pool.query('UPDATE replies SET deleted = TRUE WHERE repid = $1', [
        rid,
      ]);
      return res
        .status(201)
        .json({ message: 'Reply has been deleted successfully' });
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.post('/edit/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    console.log(mid);
    const muser = await pool.query(
      'SELECT uname, deleted, edited, messages, created_at  FROM messages WHERE mid = $1',
      [mid]
    );
    console.log(muser.rows[0]);
    if (
      muser.rows.length == 0 ||
      muser.rows[0].deleted ||
      muser.rows[0].edited ||
      req.session.user.username != muser.rows[0].uname
    ) {
      return res.status(401).json({ message: 'Unauthorized' });
    } else {
      await pool.query(
        'INSERT INTO messages (uname, created_at, messages, edited, deleted, newmid) VALUES($1, $2, $3, TRUE, FALSE, $4)',
        [
          muser.rows[0].uname,
          muser.rows[0].created_at,
          muser.rows[0].messages,
          mid,
        ]
      );
      const { message } = req.body;
      await pool.query(
        'UPDATE messages SET messages = $1, created_at = current_timestamp WHERE mid = $2',
        [message, mid]
      );
      return res.status(201).json({ message: 'Post successfully edited' });
    }
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
