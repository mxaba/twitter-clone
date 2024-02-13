import { FastifyInstance } from 'fastify';

const PASSWORD = 'Test1234!!';

async function registerUsers(t: any, fastify: FastifyInstance, usernames: string[]): Promise<any[]> {
  return Promise.all(usernames.map(async (username) => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/user/register',
      headers: {
        'Content-type': 'application/json'
      },
      payload: JSON.stringify({
        username: username,
        password: PASSWORD
      })
    });
    t.equal(200, res.statusCode, res.payload);

    return JSON.parse(res.payload);
  }));
}

async function login(t: any, fastify: FastifyInstance, username: string): Promise<string> {
  const res = await fastify.inject({
    method: 'POST',
    url: '/api/user/login',
    headers: {
      'Content-type': 'application/json'
    },
    payload: JSON.stringify({
      username: username,
      password: PASSWORD
    })
  });
  t.equal(200, res.statusCode, res.payload);

  return JSON.parse(res.payload).jwt;
}

async function createTweet(t: any, fastify: FastifyInstance, jwt: string, text: string): Promise<void> {
  let res = await fastify.inject({
    method: 'POST',
    url: '/api/tweet',
    headers: {
      'Authorization': 'Bearer ' + jwt
    },
    payload: { text }
  });
  t.equal(res.statusCode, 204, res.payload);
}

async function follow(t: any, fastify: FastifyInstance, jwt: string, friendUserId: string): Promise<void> {
  const followMyFriendResponse = await fastify.inject({
    method: 'POST',
    url: '/api/follow/follow',
    headers: {
      'Authorization': 'Bearer ' + jwt
    },
    payload: {
      userId: friendUserId
    }
  });
  t.equal(204, followMyFriendResponse.statusCode, followMyFriendResponse.payload);
}

export {
  registerUsers,
  login,
  createTweet,
  follow
};
