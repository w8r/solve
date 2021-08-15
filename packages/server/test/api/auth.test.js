const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../../config/development');
const { assert } = require('chai');

const createTestPayloadValidation = (endpoint) => {
  return (payload, statusCode, response) => {
    return request(app)
      .post(endpoint)
      .send(payload)
      .expect(statusCode)
      .expect(response);
  };
};

const createJwtToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    algorithm: config.jwt.algorithm
  });
};

const decodeJwtToken = (jwtToken) => {
  return jwt.verify(jwtToken, config.jwt.secret);
};

describe('ENDPOINT: POST /api/auth/signup', function () {
  const endpoint = '/api/auth/signup';
  const testValidation = createTestPayloadValidation(endpoint);

  it(`POST ${endpoint} - Email required`, () => {
    const payload = {
      name: 'john',
      password: 'qweasdzxc'
    };

    return testValidation(payload, 400, {
      email: 'Email field is required',
      password2: 'Confirm password field is required'
    });
  });

  it(`POST ${endpoint} - Password2 is missing missmatch`, () => {
    const payload = {
      email: 'john@tdev.app',
      password: 'qweasdzxc'
    };

    return testValidation(payload, 400, {
      password2: 'Confirm password field is required'
    });
  });

  it(`POST ${endpoint} - Password2 is missmatch`, () => {
    const payload = {
      email: 'john@tdev.app',
      password: 'qweasdzxc',
      password2: 'qweasdzxcd'
    };

    return testValidation(payload, 400, {
      password2: 'Passwords must match'
    });
  });

  it(`POST ${endpoint} - Password required`, () => {
    const payload = {
      name: 'john',
      email: 'john@tdev.app'
    };

    return testValidation(payload, 400, {
      password: 'Password must be at least 6 characters',
      password2: 'Confirm password field is required'
    });
  });

  it(`POST ${endpoint} - Password2 required`, () => {
    const payload = {
      name: 'john',
      email: 'john@tdev.app',
      password: 'qweasdzxc'
    };

    return testValidation(payload, 400, {
      password2: 'Confirm password field is required'
    });
  });

  it(`POST ${endpoint} - Success`, () => {
    const name = 'john';
    const email = 'john@tdev.app';
    const payload = {
      name,
      email,
      password: 'qweasdzxc',
      password2: 'qweasdzxc'
    };

    return testValidation(payload, 200, ({ body: res }) => {
      const { success, user } = res;
      assert.isTrue(success);
      assert.isObject(user);
      assert.equal(user.name, name);
      assert.equal(user.email, email);
      assert.isString(user.uuid);
    });
  });
});

describe('ENDPOINT: POST /api/auth/signin', () => {
  const endpoint = '/api/auth/signin';

  it(`POST ${endpoint} - fails with wrong name`, () => {
    const user = { name: 'random', password: 'password' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(401)
      .expect({ error: { message: 'Username or email does not exist' } });
  });

  it(`POST ${endpoint} - fails with wrong email`, () => {
    const user = { email: 'random@tdev.app', password: 'password' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(401)
      .expect({ error: { message: 'Username or email does not exist' } });
  });

  it(`POST ${endpoint} - fails with wrong name`, () => {
    const user = { name: 'root', password: 'wrongpassword' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(401)
      .expect({ error: { message: 'Password is incorrect' } });
  });

  it(`POST ${endpoint} - Success with name/pass`, () => {
    const user = { name: 'root', password: 'password' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(200)
      .expect(({ body: res }) => {
        assert.isString(res.token);
        assert.equal(res.signedInWith, 'local');
        assert.equal(res.user.name, user.name);
      });
  });

  it(`POST ${endpoint} - Success with email/pass`, () => {
    const user = { email: 'root@tdev.app', password: 'password' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(200)
      .expect(({ body: res }) => {
        assert.isString(res.token);
        assert.equal(res.signedInWith, 'local');
        assert.equal(res.user.email, user.email);
      });
  });
});
