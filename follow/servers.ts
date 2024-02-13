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

class FollowService {
    private fastify: FastifyInstance;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    async follow(meId: string, otherId: string): Promise<void> {
        await Promise.all([
            execRedis(this.fastify, 'zadd', [`following:${meId}`, Date.now(), otherId]),
            execRedis(this.fastify, 'zadd', [`followers:${otherId}`, Date.now(), meId]),
        ]);
    }

    async unfollow(meId: string, otherId: string): Promise<void> {
        await Promise.all([
            execRedis(this.fastify, 'zrem', [`following:${meId}`, otherId]),
            execRedis(this.fastify, 'zrem', [`followers:${otherId}`, meId]),
        ]);
    }

    async getFollowing(meId: string): Promise<string[]> {
        return execRedis(this.fastify, 'zrange', [`following:${meId}`, 0, -1]);
    }

    async getFollowers(otherId: string): Promise<string[]> {
        return execRedis(this.fastify, 'zrange', [`followers:${otherId}`, 0, -1]);
    }
}

export default FollowService;
