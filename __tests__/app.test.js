require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async (done) => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app).post('/auth/signup').send({
        email: 'jon@user.com',
        password: '1234',
      });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll((done) => {
      return client.end(done);
    });

    test('returns kitkats', async () => {
      const expectation = [
        {
          id: 1,
          name: 'Kit-Kat',
          description: 'Milk Chocolate Wafers',
          category: 'classic',
          is_flavored: false,
          size: 'Regular',
          price: 1,
          owner_id: 1,
        },
        {
          id: 2,
          name: 'King-Size-Kit-Kat',
          description: 'Milk Chocolate Wafers',
          category: 'classic',
          is_flavored: false,
          size: 'King',
          price: 2,
          owner_id: 1,
        },
        {
          id: 3,
          name: 'Dark-Kit-Kat',
          description: 'Dark Chocolate Wafers',
          category: 'unique',
          is_flavored: true,
          size: 'Regular',
          price: 1,
          owner_id: 1,
        },
        {
          id: 4,
          name: 'King-Size-Dark-Kit-Kat',
          description: 'Dark Chocolate Wafers',
          category: 'unique',
          is_flavored: true,
          size: 'King',
          price: 2,
          owner_id: 1,
        },
        {
          id: 5,
          name: 'Matcha Kit-Kat',
          description: 'Matcha Chocolate Wafers',
          category: 'unique',
          is_flavored: true,
          size: 'Regular',
          price: 1,
          owner_id: 1,
        },
        {
          id: 6,
          name: 'Matcha Kit-Kat',
          description: 'Matcha Chocolate Wafers',
          category: 'unique',
          is_flavored: true,
          size: 'King',
          price: 2,
          owner_id: 1,
        },
      ];

      const data = await fakeRequest(app)
        .get('/kitkats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns the first data item', async () => {
      const expectation = {
        id: 1,
        name: 'Kit-Kat',
        description: 'Milk Chocolate Wafers',
        category: 'classic',
        is_flavored: false,
        size: 'Regular',
        price: 1,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .get('/kitkats/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

test('creates new kit-kat and new kit-kat is in our list', async () => {
      const newKitKat = {
        name: 'Strawberry Kit-Kat',
        description: 'Strawberry chocolate wafers',
        category: 'unique',
        is_flavored: true,
        size: 'regular',
        price: 1
      };

      const expectedKitKat = {
        ...newKitKat,
        id: 7,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/kitkats')
        .send(newKitKat)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedKitKat);

      const allKitKats = await fakeRequest(app)
        .get('/kitkats')
        .expect('Content-Type', /json/)
        .expect(200);

      const strawberryKitKat = allKitKats.body.find(kitkat => kitkat.name === 'Strawberry Kit-Kat')

      expect(strawberryKitKat).toEqual(expectedKitKat);
    });
  });
});
