const request = require('supertest');
const config = require('../../config/development');
const { assert } = require('chai');

describe('ENDPOINT: /api/user/', function () {
  const endpoint = '/api/user/status';
  it(`POST ${endpoint} - Can't get status of the unauthorized user`, () => {
    return request(app)
      .post(endpoint)
      .expect(401)
      .expect({
        error: {
          message: 'No auth token'
        }
      });
  });

  it(`POST ${endpoint} - user status by token`, () => {
    const user = { name: 'root', password: 'password' };
    let token = '';
    return request(app)
      .post('/api/auth/signin')
      .send(user)
      .expect(200)
      .expect(({ body: res }) => {
        token = res.token;
      })
      .then(() =>
        request(app)
          .post(endpoint)
          .set(config.jwt.headerName, `Bearer ${token}`)
          .expect(200)
          .expect(({ body: responseUser }) => {
            assert.equal(responseUser.name, user.name);
            assert.equal(responseUser.status, 'active');
          })
      );
  });
});
