const request = require('supertest');
const config = require('../../config/development');
const { assert } = require('chai');

const noTokenError = {
  error: {
    message: 'No auth token'
  }
};

describe('ENDPOINT: POST /api/user/status', function () {
  const endpoint = '/api/user/status';
  it(`POST ${endpoint} - Can't get status of the unauthorized user`, () => {
    return request(app).post(endpoint).expect(401).expect(noTokenError);
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

describe('ENDPOINT: POST /api/user/reset-password', function () {
  const endpoint = '/api/user/reset-password';
  it(`POST ${endpoint} - request password reset - wrong email`, () => {
    return request(app)
      .post('/api/user/reset-password')
      .send({ email: 'john@tdev.app' })
      .expect(400)
      .expect(({ body: res }) => {
        assert.deepEqual(res.error, {
          message: 'User with this email does not exist',
          code: 'auth/user-not-found'
        });
      });
  });

  it(`POST ${endpoint} - request password reset - correct user`, () => {
    return request(app)
      .post('/api/user/reset-password')
      .send({ email: 'another-user@tdev.app' })
      .expect(200)
      .expect(({ body: res }) => {
        assert.deepEqual(res, { message: 'Email sent', success: true });
      });
  });

  it(`POST ${endpoint} - password reset - wrong user`, () => {
    return request(app)
      .post('/api/user/reset-password')
      .send({
        token: 'reset-password-tokeN',
        password: 'new-password',
        passwordRepeat: 'new-password'
      })
      .expect(400)
      .expect(({ body: res }) => {
        assert.deepEqual(res.error, {
          message: "User not found or didn't request password reset",
          code: 'auth/user-not-found'
        });
      });
  });

  it(`POST ${endpoint} - password reset - correct user`, () => {
    return request(app)
      .post('/api/user/reset-password')
      .send({
        token: 'reset-password-token',
        password: 'new-password',
        passwordRepeat: 'new-password'
      })
      .expect(200)
      .expect(({ body: res }) => {
        assert.deepEqual(res, { message: 'Password changed', success: true });
      });
  });
});

describe('ENDPOINT: POST /api/user/graphs', () => {
  const endpoint = '/api/user/graphs';

  it('POST /api/user/graphs - get user graphs - unauthorized', () => {
    return request(app)
      .post(endpoint)
      .expect(401)
      .expect(({ body: response }) => {
        assert.deepEqual(response, noTokenError);
      });
  });

  it('POST /api/user/graphs - get user graphs', () => {
    const user = { name: 'root', password: 'password' };
    let token = '';
    return request(app)
      .post('/api/auth/signin')
      .send(user)
      .expect(200)
      .expect(({ body: res }) => (token = res.token))
      .then(() =>
        request(app)
          .post(endpoint)
          .set(config.jwt.headerName, `Bearer ${token}`)
          .expect(200)
          .expect(({ body: response }) => {
            assert.deepEqual(response, []);
          })
      );
  });
});
