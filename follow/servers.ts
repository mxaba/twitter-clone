import { FastifyInstance } from 'fastify';

function execRedis(fastify: FastifyInstance, method: string, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      args.push((err: Error | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
      (fastify.redis as any)[method].apply(fastify.redis, args);
    });
  }
  

function follow(fastify: FastifyInstance, meId: string, otherId: string): Promise<any> {
  return Promise.all([
    execRedis(fastify, 'zadd', [`following:${meId}`, Date.now(), otherId]),
    execRedis(fastify, 'zadd', [`followers:${otherId}`, Date.now(), meId]),
  ]);
}

function unfollow(fastify: FastifyInstance, meId: string, otherId: string): Promise<any> {
  return Promise.all([
    execRedis(fastify, 'zrem', [`following:${meId}`, otherId]),
    execRedis(fastify, 'zrem', [`followers:${otherId}`, meId]),
  ]);
}

function getFollowing(fastify: FastifyInstance, meId: string): Promise<any> {
  return execRedis(fastify, 'zrange', [`following:${meId}`, 0, -1]);
}

function getFollowers(fastify: FastifyInstance, otherId: string): Promise<any> {
  return execRedis(fastify, 'zrange', [`followers:${otherId}`, 0, -1]);
}

class FollowService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  follow(meId: string, otherId: string): Promise<any> {
    return follow(this.fastify, meId, otherId);
  }

  unfollow(meId: string, otherId: string): Promise<any> {
    return unfollow(this.fastify, meId, otherId);
  }

  getFollowing(meId: string): Promise<any> {
    return getFollowing(this.fastify, meId);
  }

  getFollowers(otherId: string): Promise<any> {
    return getFollowers(this.fastify, otherId);
  }
}

export default FollowService;
