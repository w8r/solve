const request = require('supertest');

describe('ENDPOINT: /api/user/', function () {
  const endpoint = '/api/user/status';
  it(`POST ${endpoint} - Can't get status of the unauthorized user`, () => {
    return request(app)
      .post(endpoint)
      .expect(401)
      .expect({ message: 'Please login first' });
  });
});
