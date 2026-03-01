const request = require('supertest');
const config = require('../../config/development');
const { assert } = require('chai');
let token;
let token2;

const login = (username, password) => {
  const user = { name: username || 'root', password: password || 'password' };
  return request(app)
    .post('/api/auth/signin')
    .send(user)
    .then(({ body: res }) => res.token);
};

describe('ENDPOINT: /api/graph/: Graph API', function () {
  const endpoint = '/api/graph';
  let publicId;
  let internalId, internalId2;
  it(`POST ${endpoint} - Should create a new graph`, async () => {
    token = await login();
    token2 = await login('anotherroot', 'password');
    await request(app)
      .post('/api/graph/')
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send({
        name: 'Test graph',
        nodes: [
          {
            id: 'n0',
            data: {
              test: 'hello',
              test2: 'whats up?'
            }
          },
          {
            id: 'n1'
          }
        ],
        edges: [
          {
            id: 'e0',
            source: 'n0',
            target: 'n1',
            data: {
              test: 'hmm',
              test2: 'thats weird'
            }
          }
        ]
      })
      .expect(200)
      .expect(({ body: res }) => {
        assert.isObject(res);
        assert.isString(res.name);
        assert.isArray(res.nodes);
        assert.isArray(res.edges);
        assert.isString(res.publicId);
        publicId = res.publicId;
        internalId = res.id;
      });
  });

  it(`PUT ${endpoint} - Should create a new graph revision`, async () => {
    await request(app)
      .put(`/api/graph/${publicId}`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send({
        name: 'Test graph 2',
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
        assert.isString(res.name);
        assert.isArray(res.nodes);
        assert.isArray(res.edges);
        assert.deepEqual(res.name, 'Test graph 2');
        assert.deepEqual(res.publicId, publicId);
        assert.notDeepEqual(res.id, internalId);
        internalId2 = res.id;
      });
  });

  it(`GET ${endpoint} - Should get graph by internal id`, async () => {
    await request(app)
      .get(`/api/graph/internal/${internalId}`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send()
      .expect(200)
      .expect(({ body: res }) => {
        assert.isObject(res);
        assert.isString(res.name);
        assert.isArray(res.nodes);
        assert.isArray(res.edges);
        assert.deepEqual(res.name, 'Test graph');
        assert.deepEqual(res.publicId, publicId);
        assert.deepEqual(res.id, internalId);
      });
  });

  it(`GET ${endpoint} - Should get latest revision`, async () => {
    await request(app)
      .get(`/api/graph/${publicId}/latest`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send()
      .expect(200)
      .expect(({ body: res }) => {
        assert.isObject(res);
        assert.isString(res.name);
        assert.isArray(res.nodes);
        assert.isArray(res.edges);
        assert.deepEqual(res.name, 'Test graph 2');
        assert.deepEqual(res.publicId, publicId);
        assert.deepEqual(res.id, internalId2);
      });
  });

  it(`GET ${endpoint} - Should get bulk revisions`, async () => {
    await request(app)
      .get(`/api/graph/${publicId}`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send()
      .expect(200)
      .expect(({ body: res }) => {
        assert.isArray(res);
        assert.strictEqual(res.length, 2);
      });
  });

  it(`GET ${endpoint} - Should search by tag`, async () => {
    await request(app)
      .post(`/api/graph/search/`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send({ tag: 'hello' })
      .expect(200)
      .expect(({ body: res }) => {
        assert.deepEqual(res[0].tags.includes('hello'), true);
      });
  });

  const addGraphs = async (token, parent) => {
    return new Promise(async (resolve, reject) => {
      await request(app)
        .post('/api/graph/')
        .set(config.jwt.headerName, `Bearer ${token}`)
        .send({
          name: `Test graph ${parent}`,
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
          ],
          data: {
            parentId: parent
          }
        })
        .expect(200)
        .expect(({ body: res }) => {
          assert.isObject(res);
          assert.isString(res.name);
          assert.isArray(res.nodes);
          assert.isArray(res.edges);
          resolve(res.publicId);
        });
    });
  };

  let forkedSubGraphId;

  it('GET /api/graph/:publicId/subgraphs - Should get subgraphs', async () => {
    const publicSubGraph = await addGraphs(token, publicId);
    await addGraphs(token, publicId);
    await addGraphs(token2, publicSubGraph);
    await addGraphs(token2, publicSubGraph);

    await request(app)
      .get(`/api/graph/${publicId}/subgraphs`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send()
      .expect(200)
      .expect(({ body: res }) => {
        assert.isArray(res);
        assert.strictEqual(res.length, 2);
        assert.strictEqual(res[1].forks, 2);
        assert.strictEqual(res[0].forks, 0);
        forkedSubGraphId = res[1].publicId;
      });
  });

  // get forked graphs
  it('GET /api/graph/:publicId/proposals - Should get proposal graphs', async () => {
    await request(app)
      .get(`/api/graph/${forkedSubGraphId}/proposals`)
      .set(config.jwt.headerName, `Bearer ${token}`)
      .send()
      .expect(200)
      .expect(({ body: res }) => {
        assert.isObject(res);
        assert.strictEqual(res.forks.length, 2);
      });
  });
});
