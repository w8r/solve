const request = require('supertest');

describe('ENDPOINT: GET /api/status', function () {
  const endpoint = '/api/status';
  it(`GET ${endpoint} - Health check succeeded`, () => {
    return request(app).get(endpoint).expect(200).expect({ status: 'alive' });
  });
});
