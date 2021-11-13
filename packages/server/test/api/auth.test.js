const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../../config/development');
const { assert } = require('chai');
const { ERROR_CODES } = require('../../config/constants');

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
      const { user, token } = res;
      assert.isString(token);
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
      .expect({
        error: {
          message: 'Username or email does not exist',
          code: ERROR_CODES.AUTH_USER_NOT_FOUND
        }
      });
  });

  it(`POST ${endpoint} - fails with wrong email`, () => {
    const user = { email: 'random@tdev.app', password: 'password' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(401)
      .expect({
        error: {
          message: 'Username or email does not exist',
          code: ERROR_CODES.AUTH_USER_NOT_FOUND
        }
      });
  });

  it(`POST ${endpoint} - fails with wrong name`, () => {
    const user = { name: 'root', password: 'wrongpassword' };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(401)
      .expect({
        error: {
          message: 'Password is incorrect',
          code: ERROR_CODES.AUTH_WRONG_PASSWORD
        }
      });
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

describe('ENDPOINT: POST /api/auth/facebook', () => {
  const endpoint = '/api/auth/facebook';

  // not possible to maintain the token in the test
  it(`POST ${endpoint} - facebook auth new user`, () => {
    const user = {
      email: 'root@ndev.app',
      first_name: 'Surname',
      last_name: 'Name',
      id: 'googleId',
      name: 'Surname Name',
      picture: {
        data: {
          url: 'https://facebook.picture',
          width: 100,
          height: 100,
          is_silhouette: false
        }
      }
    };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(({ body: data }) => {
        assert.equal(data.user.email, user.email);
        assert.equal(data.signedInWith, 'facebook');
        assert.isTrue(data.user.name.indexOf(user.name) !== -1);
      });
  });

  it(`POST ${endpoint} - facebook auth existing user`, () => {
    const user = {
      email: 'root@tdev.app',
      first_name: 'Surname',
      last_name: 'Name',
      id: 'googleId',
      name: 'Surname Name',
      picture: {
        data: {
          url: 'https://facebook.picture',
          width: 100,
          height: 100,
          is_silhouette: false
        }
      }
    };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(({ body: data }) => {
        assert.equal(data.user.email, user.email);
        assert.equal(data.signedInWith, 'facebook');
        assert.equal(data.user.name, 'root');
      });
  });
});

describe('ENDPOINT: POST /api/auth/google', () => {
  const endpoint = '/api/auth/google';

  it(`POST ${endpoint} - google auth new user`, () => {
    const user = {
      email: 'root@ndev.app',
      family_name: 'Surname',
      given_name: 'Name',
      id: 'googleId',
      locale: 'en-GB',
      name: 'Surname Name',
      picture: 'https://google.picture',
      verified_email: true
    };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(({ body: data }) => {
        assert.equal(data.user.email, user.email);
        assert.equal(data.signedInWith, 'google');
        assert.isTrue(data.user.name.indexOf(user.name) !== -1);
      });
  });

  it(`POST ${endpoint} - google auth existing user`, () => {
    const user = {
      email: 'root@tdev.app',
      family_name: 'Surname',
      given_name: 'Name',
      id: 'googleId',
      locale: 'en-GB',
      name: 'Surname Name',
      picture: 'https://google.picture',
      verified_email: true
    };
    return request(app)
      .post(endpoint)
      .send(user)
      .expect(({ body: data }) => {
        assert.equal(data.user.email, user.email);
        assert.equal(data.signedInWith, 'google');
        assert.equal(data.user.name, 'root');
      });
  });
});
