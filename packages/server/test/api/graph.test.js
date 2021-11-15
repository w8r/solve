const request = require('supertest');
const config = require('../../config/development');
const { assert } = require('chai');

const login = () => {
  const user = { name: 'root', password: 'password' };
  return request(app)
    .post('/api/auth/signin')
    .send(user)
    .then(({ body: res }) => res.token);
};

describe('ENDPOINT: PUT /api/graphs/new', function () {
  const endpoint = '/api/graph';

  it(`POST ${endpoint} - Should create a new graph`, () => {
    return login().then((token) => {
      return request(app)
        .put('/api/graph/new')
        .set(config.jwt.headerName, `Bearer ${token}`)
        .send({
          nodes: [
            {
              id: 'n0'
            },
            {
              id: 'n1'
            }
          ],
          edges: [
            {
              id: 'e0',
              source: 'n0',
              target: 'n1'
            }
          ]
        })
        .expect(200)
        .expect(({ body: res }) => {
          assert.isObject(res);
          assert.isString(res.graph);
        });
    });
  });
});
