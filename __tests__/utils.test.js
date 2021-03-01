const { getCategoryId } = require('../data/dataUtils.js');

describe('utils for data', () => {
  test('getCategoryId', async () => {
    const expectation = 1;
    const kitkat = {
      name: 'kit-kats',
      category: 'classic',
    };

    const categories = [
      {
        name: 'classic',
        id: 1,
      },
      {
        name: 'unique',
        id: 2,
      },
    ];

    const actual = getCategoryId(kitkat, categories);

    expect(actual).toEqual(expectation);
  });
});
