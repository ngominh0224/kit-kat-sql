const client = require('../lib/client');
const { kitkats } = require('./kitkats.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');
const { getCategoryId } = require('./dataUtils.js');

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

    const responses = await Promise.all(
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

    const categories = responses.map(({ rows }) => rows[0]);

    await Promise.all(
      kitkats.map((kitkat) => {
        const categoryId = getCategoryId(kitkats, categories);

        return client.query(
          `
                    INSERT INTO kitkats (name, description,
                    category_id, is_flavored, size, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
          [
            kitkat.name,
            kitkat.description,
            categoryId,
            kitkat.is_flavored,
            kitkat.size,
            kitkat.price,
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
