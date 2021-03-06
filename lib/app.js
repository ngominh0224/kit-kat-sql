const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route.
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`,
  });
});

app.get('/kitkats', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT
      kitkats.id,
      kitkats.name,
      kitkats.description,
      categories.name as category,
      kitkats.is_flavored,
      kitkats.size,
      kitkats.price,
      kitkats.category_id,
      kitkats.owner_id
    FROM kitkats
    JOIN categories
    ON kitkats.category_id = categories.id`);

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const data = await client.query('SELECT * from categories');

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/kitkats/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const data = await client.query(
      `
        SELECT
        kitkats.id,
        kitkats.name,
        kitkats.description,
        categories.name as category,
        kitkats.is_flavored,
        kitkats.size,
        kitkats.price,
        kitkats.owner_id
      FROM kitkats
      JOIN categories
      ON kitkats.category_id = categories.id
      WHERE kitkats.id=$1`,
      [id]
    );

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/kitkats', async (req, res) => {
  try {
    const data = await client.query(
      `insert into kitkats (name, description, category_id, is_flavored, size, price, owner_id)
    values ($1, $2, $3, $4, $5, $6, $7)
    returning *`,
      [
        req.body.name,
        req.body.description,
        req.body.category_id,
        req.body.is_flavored,
        req.body.size,
        req.body.price,
        1,
      ]
    );

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/kitkats/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await client.query(
      `
    UPDATE kitkats
    SET name = $1, description = $2, category_id = $3, is_flavored = $4, size = $5, price = $6
    WHERE id=$7
    returning *;
    `,
      [
        req.body.name,
        req.body.description,
        req.body.category_id,
        req.body.is_flavored,
        req.body.size,
        req.body.price,
        id,
      ]
    );
    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/kitkats/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(
      'delete from kitkats where id=$1 returning *',
      [id]
    );

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
