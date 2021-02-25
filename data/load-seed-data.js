const client = require('../lib/client');
// import our seed data:
const kitkats = require('./kitkats.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {
  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map((user) => {
        return client.query(
          `
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]
        );
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      kitkats.map((kitkats) => {
        return client.query(
          `
                    INSERT INTO kitkats (name, description, is_flavored, size, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [
            kitkats.name,
            kitkats.description,
            kitkats.is_flavored,
            kitkats.size,
            kitkats.price,
            user.id,
          ]
        );
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
}
