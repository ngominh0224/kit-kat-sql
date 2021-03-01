const client = require('../lib/client');
// import our seed data:
const { kitkats } = require('./kitkats.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');
const { getCategoryId } = require('../data/dataUtils.js');

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

    const reponses = await Promise.all(
      categoriesData.map((category) => {
        return client.query(
          `
                      INSERT INTO categories (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [category.name]
        );
      })
    );

    const user = users[0].rows[0];

    const categories = reponses.map(({ rows }) => rows[0]);

    await Promise.all(
      kitkats.map((kitkats) => {
        const categoryId = getCategoryId(kitkats, categories);

        return client.query(
          `
                    INSERT INTO kitkats (name, description,
                    category_id, is_flavored, size, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
          [
            kitkats.name,
            kitkats.description,
            categoryId,
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
